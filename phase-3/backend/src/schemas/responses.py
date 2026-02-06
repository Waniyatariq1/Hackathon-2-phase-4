"""
Response schemas for book management API.

All API responses MUST use these Pydantic models for consistency.
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class BookResponse(BaseModel):
    """
    Response schema for book data.

    Used by all endpoints returning book objects.
    """

    model_config = ConfigDict(from_attributes=True)  # Pydantic v2: replaces orm_mode

    id: int = Field(..., description="Book ID", examples=[1])

    user_id: str = Field(..., description="User ID from JWT token", examples=["user-123"])

    title: str = Field(..., description="Book title", examples=["The Great Gatsby"])

    description: Optional[str] = Field(
        None, description="Optional book description", examples=["A classic American novel by F. Scott Fitzgerald"]
    )

    completed: bool = Field(..., description="Book reading completion status", examples=[False])

    due_date: Optional[datetime] = Field(
        None, description="Optional reading start date", examples=["2024-12-31T23:59:59Z"]
    )

    due_date_end: Optional[datetime] = Field(
        None, description="Optional reading end date", examples=["2025-01-05T23:59:59Z"]
    )

    priority: Optional[Literal["low", "medium", "high"]] = Field(
        None, description="Optional priority level", examples=["high"]
    )

    category: Optional[str] = Field(
        None, description="Optional category/genre for the book", examples=["Fiction", "Non-Fiction", "Science Fiction"]
    )

    created_at: datetime = Field(
        ..., description="Timestamp when book was added", examples=["2025-12-18T10:30:00Z"]
    )

    updated_at: datetime = Field(
        ..., description="Timestamp when book was last updated", examples=["2025-12-18T10:35:00Z"]
    )


class BookListResponse(BaseModel):
    """
    Response schema for listing books.

    GET /api/{user_id}/books
    """

    data: List[BookResponse] = Field(..., description="List of books")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "id": 1,
                        "user_id": "user-123",
                        "title": "The Great Gatsby",
                        "description": "A classic American novel by F. Scott Fitzgerald",
                        "completed": False,
                        "due_date": "2024-12-31T23:59:59Z",
                        "priority": "high",
                        "category": "Fiction",
                        "created_at": "2025-12-18T10:30:00Z",
                        "updated_at": "2025-12-18T10:30:00Z",
                    }
                ]
            }
        }


class ToolCallResponse(BaseModel):
    """Response schema for tool call information."""

    name: str = Field(..., description="Tool name", examples=["add_book"])
    arguments: Dict[str, Any] = Field(..., description="Tool arguments", examples=[{"title": "The Great Gatsby"}])
    result: Dict[str, Any] = Field(..., description="Tool execution result")


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint.

    POST /api/{user_id}/chat
    """

    conversation_id: int = Field(..., description="Conversation ID", examples=[1])
    response: str = Field(..., description="Assistant's natural language response", examples=["I've added 'The Great Gatsby' to your reading list."])
    tool_calls: List[ToolCallResponse] = Field(
        default_factory=list,
        description="List of tool calls executed (if any)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 1,
                "response": "I've added 'The Great Gatsby' to your reading list.",
                "tool_calls": [
                    {
                        "name": "add_book",
                        "arguments": {"title": "The Great Gatsby", "description": None},
                        "result": {"success": True, "book": {"id": 42, "title": "The Great Gatsby"}},
                    }
                ],
            }
        }
