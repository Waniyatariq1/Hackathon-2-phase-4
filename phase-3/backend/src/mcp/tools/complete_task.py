"""Complete book MCP tool implementation.

This tool marks a book as completed (read).
"""

from typing import Any, Dict

from sqlmodel import Session

from src.mcp.tools.base import format_tool_response
from src.services.task_service import BookService

# Initialize service
book_service = BookService()


def complete_book_tool(db: Session, user_id: str, book_id: int) -> Dict[str, Any]:
    """
    Mark a book as completed (read).

    CRITICAL SECURITY: This tool MUST validate user_id to enforce user isolation.

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT token
        book_id: Book ID to mark as completed

    Returns:
        Dict with success, book, and error fields
    """
    try:
        # Update book using book service (patch to set completed=True)
        from src.schemas.requests import BookPatch

        book_data = BookPatch(completed=True)
        book = book_service.patch_book(db=db, user_id=user_id, book_id=book_id, book_data=book_data)

        if not book:
            return format_tool_response(
                success=False, error=f"Book {book_id} not found or not owned by user"
            )

        # Format response
        book_dict = {
            "id": book.id,
            "user_id": book.user_id,
            "title": book.title,
            "description": book.description,
            "status": "completed",
            "created_at": book.created_at.isoformat(),
            "updated_at": book.updated_at.isoformat(),
        }

        return format_tool_response(success=True, data=book_dict)

    except Exception as e:
        return format_tool_response(success=False, error=f"Failed to complete book: {str(e)}")


def get_complete_book_function_definition() -> Dict[str, Any]:
    """
    Get OpenAI function definition for complete_book tool.

    Returns:
        Dict with function schema for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "complete_book",
            "description": "Mark a book as completed (read) by its ID",
            "parameters": {
                "type": "object",
                "required": ["book_id"],
                "properties": {
                    "book_id": {
                        "type": "integer",
                        "description": "Unique identifier for the book to mark as completed",
                    },
                },
            },
        },
    }

