"""
Message model for SQLModel ORM.

This module defines the Message entity for chat message persistence
with user isolation and conversation relationship enforcement.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Column, String


class MessageRole(str, Enum):
    """Message role enum for user and assistant messages."""

    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """
    Message model representing an individual message in a conversation.

    This model enforces user isolation at the database level through the
    user_id field and maintains conversation relationship via conversation_id.
    All queries MUST filter by user_id.

    Attributes:
        id: Auto-increment primary key
        conversation_id: Foreign key to Conversation (INDEXED)
        user_id: User ID from Better Auth JWT (INDEXED for user isolation)
        role: Message role (user or assistant) - ENUM
        content: Message text content (max 10000 characters)
        created_at: Timestamp when message was created (UTC, INDEXED)
    """

    __tablename__ = "messages"

    # Primary Key
    id: Optional[int] = Field(
        default=None, primary_key=True, description="Auto-increment primary key"
    )

    # Foreign Key to Conversation
    conversation_id: int = Field(
        foreign_key="conversations.id",
        index=True,
        description="Foreign key to conversation this message belongs to",
    )

    # User Isolation (CRITICAL: All queries MUST filter by this field)
    user_id: str = Field(
        index=True, max_length=255, description="User ID from Better Auth JWT token"
    )

    # Message Content
    role: MessageRole = Field(
        default=MessageRole.USER,
        sa_column=Column(String(20), nullable=False),
        description="Message role (user or assistant)",
    )

    content: str = Field(
        max_length=10000, min_length=1, description="Message text content (1-10000 characters)"
    )

    # Timestamps (UTC)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Timestamp when message was created (UTC)",
    )

