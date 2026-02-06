"""
Request schemas for book management API.

All request payloads MUST use these Pydantic models for validation.
"""

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field, field_validator


class BookCreate(BaseModel):
    """
    Request schema for creating a new book.

    POST /api/{user_id}/books
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Book title (required, 1-200 characters)",
        examples=["The Great Gatsby"],
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional book description (max 1000 characters)",
        examples=["A classic American novel by F. Scott Fitzgerald"],
    )

    due_date: Optional[datetime] = Field(
        None,
        description="Optional reading start date (ISO 8601 datetime)",
        examples=["2024-12-31T23:59:59Z"],
    )

    due_date_end: Optional[datetime] = Field(
        None,
        description="Optional reading end date (ISO 8601 datetime)",
        examples=["2025-01-05T23:59:59Z"],
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None,
        description="Optional priority level",
        examples=["high"],
    )

    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category/genre for the book (max 100 characters)",
        examples=["Fiction", "Non-Fiction", "Science Fiction"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    class Config:
        json_schema_extra = {
            "example": {
                "title": "The Great Gatsby",
                "description": "A classic American novel by F. Scott Fitzgerald",
                "due_date": "2024-12-31T23:59:59Z",
                "due_date_end": "2025-01-05T23:59:59Z",
                "priority": "high",
                "category": "Fiction"
            }
        }


class BookUpdate(BaseModel):
    """
    Request schema for updating a book (full replacement).

    PUT /api/{user_id}/books/{id}
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Book title (required, 1-200 characters)",
        examples=["The Great Gatsby (Updated)"],
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional book description (max 1000 characters)",
        examples=["A classic American novel by F. Scott Fitzgerald - Updated"],
    )

    due_date: Optional[datetime] = Field(
        None,
        description="Optional reading start date (ISO 8601 datetime)",
        examples=["2024-12-31T23:59:59Z"],
    )

    due_date_end: Optional[datetime] = Field(
        None,
        description="Optional reading end date (ISO 8601 datetime)",
        examples=["2025-01-05T23:59:59Z"],
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None,
        description="Optional priority level",
        examples=["high"],
    )

    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category/genre for the book (max 100 characters)",
        examples=["Fiction", "Non-Fiction", "Science Fiction"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class BookPatch(BaseModel):
    """
    Request schema for patching a book (partial update).

    PATCH /api/{user_id}/books/{id}
    """

    completed: bool = Field(..., description="Book reading completion status", examples=[True])


class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint.

    POST /api/{user_id}/chat
    """

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's natural language message",
        examples=["Add a book 'The Great Gatsby'"],
    )

    conversation_id: Optional[int] = Field(
        None,
        description="Optional conversation ID (creates new conversation if not provided)",
        examples=[1],
    )
