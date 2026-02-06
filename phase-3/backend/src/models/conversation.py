"""
Conversation model for SQLModel ORM.

This module defines the Conversation entity for chat session management
with user isolation enforced through indexed user_id field.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Conversation(SQLModel, table=True):
    """
    Conversation model representing a chat session between a user and the system.

    This model enforces user isolation at the database level through the
    user_id field. All queries MUST filter by user_id.

    Attributes:
        id: Auto-increment primary key
        user_id: User ID from Better Auth JWT (INDEXED for efficient lookups)
        created_at: Timestamp when conversation was created (UTC)
        updated_at: Timestamp when conversation was last modified (UTC)
        messages: Relationship to Message entities (one-to-many)
    """

    __tablename__ = "conversations"

    # Primary Key
    id: Optional[int] = Field(
        default=None, primary_key=True, description="Auto-increment primary key"
    )

    # User Isolation (CRITICAL: All queries MUST filter by this field)
    user_id: str = Field(
        index=True, max_length=255, description="User ID from Better Auth JWT token"
    )

    # Timestamps (UTC)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp when conversation was created (UTC)"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Timestamp when conversation was last updated (UTC)",
    )

