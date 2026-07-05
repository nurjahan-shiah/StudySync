"""
shared/auth.py
JWT token generation and verification used across all microservices.
Centralized so token format is consistent everywhere.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# ============================================================================
# Configuration
# ============================================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-secret-key-change-in-production"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "30"
    )
)

REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv(
        "REFRESH_TOKEN_EXPIRE_DAYS",
        "7"
    )
)

# Password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ============================================================================
# Password Utilities
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Verify a plaintext password against a hash."""
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

# ============================================================================
# JWT Utilities
# ============================================================================

def create_access_token(
    user_id: UUID,
    user_email: str,
    user_role: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT token for a user.
    Token payload includes user_id, email, and role.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(user_id),
        "email": user_email,
        "role": user_role,
        "type": "access",
        "exp": expire
    }

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def create_refresh_token(
    user_id: UUID,
    user_email: str,
    user_role: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a refresh JWT token for a user.
    Refresh tokens live longer than access tokens and are used
    to request a new access token.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode = {
        "sub": str(user_id),
        "email": user_email,
        "role": user_role,
        "type": "refresh",
        "exp": expire
    }

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def _decode_token(
    token: str,
    expected_type: str
) -> dict:
    """
    Decode and validate a JWT token.
    Verifies that the token contains the required user claims
    and that it is the expected access or refresh token type.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        token_type = payload.get("type")

        if (
            user_id is None
            or email is None
            or role is None
        ):
            raise credentials_exception

        # Older access tokens may not contain a type claim.
        # They remain valid until they naturally expire.
        if expected_type == "access":
            if token_type not in (None, "access"):
                raise credentials_exception
        elif token_type != expected_type:
            raise credentials_exception

        return {
            "user_id": UUID(user_id),
            "email": email,
            "role": role,
            "type": expected_type
        }

    except (JWTError, ValueError, TypeError):
        raise credentials_exception


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Returns token payload if valid.
    Raises HTTPException if invalid.
    """
    return _decode_token(
        token,
        expected_type="access"
    )


def decode_refresh_token(token: str) -> dict:
    """
    Decode and validate a refresh JWT token.
    Returns token payload if valid.
    Raises HTTPException if invalid or expired.
    """
    return _decode_token(
        token,
        expected_type="refresh"
    )

# ============================================================================
# FastAPI Dependencies
# ============================================================================

from fastapi import Depends
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):
    """
    FastAPI dependency for protected routes.
    Validates JWT token and returns user info.

    Usage:
        @app.get("/protected")
        def protected_route(user = Depends(get_current_user)):
            return {"user_id": user["user_id"]}
    """
    token = credentials.credentials
    return decode_token(token)