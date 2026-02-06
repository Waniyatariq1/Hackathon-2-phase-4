"""add conversations and messages tables

Revision ID: 003
Revises: 002
Create Date: 2026-01-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create conversations and messages tables with indexes"""
    # Create conversations table
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("(now() at time zone 'utc')"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("(now() at time zone 'utc')"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # User isolation index (CRITICAL for query performance)
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"])

    # Create messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.String(length=10000), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("(now() at time zone 'utc')"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
    )
    # Indexes for efficient querying
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])
    op.create_index("ix_messages_user_id", "messages", ["user_id"])
    op.create_index("ix_messages_created_at", "messages", ["created_at"])
    # Composite index for conversation history retrieval (conversation_id, created_at)
    op.create_index(
        "ix_messages_conversation_created",
        "messages",
        ["conversation_id", sa.text("created_at DESC")],
    )


def downgrade() -> None:
    """Drop messages and conversations tables and indexes"""
    op.drop_index("ix_messages_conversation_created", "messages")
    op.drop_index("ix_messages_created_at", "messages")
    op.drop_index("ix_messages_user_id", "messages")
    op.drop_index("ix_messages_conversation_id", "messages")
    op.drop_table("messages")
    op.drop_index("ix_conversations_user_id", "conversations")
    op.drop_table("conversations")

