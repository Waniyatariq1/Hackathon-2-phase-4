"""
Book model for SQLModel ORM.

This module defines the Book entity with user isolation enforced through
indexed user_id field.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Book(SQLModel, table=True):
    """
    Book model representing a user's reading item.

    This model enforces user isolation at the database level through the
    user_id foreign key field. All queries MUST filter by user_id.

    Attributes:
        id: Auto-increment primary key
        user_id: Foreign key to user (from Better Auth JWT) - INDEXED
        title: Book title (1-200 characters, required)
        description: Optional book description (max 1000 characters)
        completed: Book reading completion status (default: False) - INDEXED
        due_date: Optional reading start date (UTC datetime)
        due_date_end: Optional reading end date (UTC datetime)
        priority: Optional priority level (low, medium, high)
        category: Optional category/genre for the book (max 100 characters)
        created_at: Timestamp when book was added (UTC)
        updated_at: Timestamp when book was last modified (UTC)
    """

    __tablename__ = "books"

    # Primary Key
    id: Optional[int] = Field(
        default=None, primary_key=True, description="Auto-increment primary key"
    )

    # User Isolation (CRITICAL: All queries MUST filter by this field)
    user_id: str = Field(
        index=True, max_length=255, description="User ID from Better Auth JWT token"
    )

    # Book Content
    title: str = Field(
        max_length=200, min_length=1, description="Book title (required, 1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None, max_length=1000, description="Optional book description (max 1000 characters)"
    )

    # Book Status
    completed: bool = Field(
        default=False, index=True, description="Book reading completion status (indexed for filtering)"
    )

    # Book Metadata
    due_date: Optional[datetime] = Field(
        default=None, description="Optional reading start date (UTC datetime)"
    )

    due_date_end: Optional[datetime] = Field(
        default=None, description="Optional reading end date (UTC datetime)"
    )

    priority: Optional[str] = Field(
        default=None, max_length=10, description="Optional priority level (low, medium, high)"
    )

    category: Optional[str] = Field(
        default=None, max_length=100, description="Optional category/genre for the book (max 100 characters)"
    )

    # Timestamps (UTC)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp when book was added (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Timestamp when book was last updated (UTC)",
    )
