"""rename tasks table to books

Revision ID: 004
Revises: 003
Create Date: 2025-01-09

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename tasks table to books and update indexes"""
    # Rename table
    op.rename_table("tasks", "books")
    
    # Rename indexes
    op.execute("ALTER INDEX ix_tasks_user_id RENAME TO ix_books_user_id")
    op.execute("ALTER INDEX ix_tasks_completed RENAME TO ix_books_completed")


def downgrade() -> None:
    """Rename books table back to tasks and restore indexes"""
    # Rename indexes back
    op.execute("ALTER INDEX ix_books_user_id RENAME TO ix_tasks_user_id")
    op.execute("ALTER INDEX ix_books_completed RENAME TO ix_tasks_completed")
    
    # Rename table back
    op.rename_table("books", "tasks")

