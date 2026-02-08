from typing import Any, List, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    reason: str
    domain: str
    metadata: Optional[dict[str, Any]] = None


class ErrorResponseContent(BaseModel):
    code: int
    message: str
    status: str
    details: Optional[List[ErrorDetail]] = None


class ErrorResponse(BaseModel):
    error: ErrorResponseContent
