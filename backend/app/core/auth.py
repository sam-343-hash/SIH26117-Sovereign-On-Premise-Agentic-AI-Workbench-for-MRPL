import os
import time
import json
import hmac
import hashlib
import base64
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "refinaai_airgap_secret_key_2026")
security = HTTPBearer(auto_error=False)

class User(BaseModel):
    id: str
    username: str
    role: str
    badge_id: str

SYSTEM_USERS = {
    "admin": User(id="USR-01", username="admin", role="admin", badge_id="EMP-IOCL-9402"),
    "auditor": User(id="USR-02", username="auditor", role="safety_auditor", badge_id="EMP-AUD-104"),
    "operator": User(id="USR-03", username="operator", role="operator", badge_id="EMP-OP-551"),
}

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    if not credentials:
        return SYSTEM_USERS["admin"]
    token = credentials.credentials
    try:
        header_b64, payload_b64, sig_b64 = token.split('.')
        expected_sig = hmac.new(SECRET_KEY.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        padded_sig = sig_b64 + '=' * (4 - (len(sig_b64) % 4))
        if not hmac.compare_digest(expected_sig, base64.urlsafe_b64decode(padded_sig)):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + '=' * (4 - (len(payload_b64) % 4))))
        return User(id=payload["id"], username=payload["sub"], role=payload["role"], badge_id=payload["badge_id"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")

def require_role(allowed_roles: List[str]):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role in {allowed_roles}, current role is '{user.role}'"
            )
        return user
    return role_checker
