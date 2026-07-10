import os, uuid
import duckdb
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ["DATABASE_URL"]
LAKE_PATH    = os.environ.get("DELTA_LAKE_PATH", "/data/delta-lake")

engine = create_engine(DATABASE_URL)


def compute_recommendations():
    con = duckdb.connect()

    # Pull the ETL'd feature table straight out of Delta Lake via DuckDB
    features = con.execute(f"""
        SELECT user_id, course_ids
        FROM   delta_scan('{LAKE_PATH}/recommendation_features')
    """).df()

    with engine.connect() as conn:
        groups = pd.read_sql(text("""
            SELECT g.id AS group_id, array_agg(gc.course_id) AS course_ids
            FROM   groups g
            JOIN   group_courses gc ON gc.group_id = g.id
            GROUP  BY g.id
        """), conn)

    if features.empty or groups.empty:
        print("No user features or groups yet — skipping this run.")
        return

    # Build a shared course vocabulary so users and groups live in the same
    # vector space, then multi-hot encode each one over that vocabulary.
    all_courses = sorted({
        c for row in list(features["course_ids"]) + list(groups["course_ids"])
        for c in (row or []) if c
    })
    course_index = {c: i for i, c in enumerate(all_courses)}

    def to_vector(course_ids):
        vec = np.zeros(len(all_courses))
        for c in (course_ids or []):
            if c in course_index:
                vec[course_index[c]] = 1
        return vec

    user_matrix  = np.vstack([to_vector(c) for c in features["course_ids"]])
    group_matrix = np.vstack([to_vector(c) for c in groups["course_ids"]])

    # scikit-learn: cosine similarity between each user's course footprint
    # and each group's course footprint. Handles all-zero rows safely (→ 0).
    similarity = cosine_similarity(user_matrix, group_matrix)

    recs = []
    for i, user_row in features.iterrows():
        for j, group_row in groups.iterrows():
            score = similarity[i, j]
            if score > 0:
                recs.append({
                    "id":           str(uuid.uuid4()),   # required: NOT NULL, no server default
                    "user_id":      user_row["user_id"],
                    "group_id":     group_row["group_id"],
                    "score":        int(round(score * 100)),
                    "is_cancelled": False,                # required: NOT NULL, no server default
                })

    recs_df = pd.DataFrame(recs)
    if not recs_df.empty:
        recs_df = recs_df.sort_values("score", ascending=False)

    with engine.begin() as conn:
        conn.execute(text("TRUNCATE TABLE recommendations"))
        if not recs_df.empty:
            recs_df.to_sql("recommendations", conn, if_exists="append", index=False)

    print(f"Wrote {len(recs_df)} recommendations.")


if __name__ == "__main__":
    compute_recommendations()