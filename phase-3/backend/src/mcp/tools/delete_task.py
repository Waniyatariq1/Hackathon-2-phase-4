"""Delete book MCP tool implementation.

This tool removes a book from the database.
"""

from typing import Any, Dict

from sqlmodel import Session

from src.mcp.tools.base import format_tool_response
from src.services.task_service import BookService

# Initialize service
book_service = BookService()


def delete_book_tool(db: Session, user_id: str, book_id: int) -> Dict[str, Any]:
    """
    Delete a book from the database.

    CRITICAL SECURITY: This tool MUST validate user_id to enforce user isolation.

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT token
        book_id: Book ID to delete

    Returns:
        Dict with success, book, and error fields
    """
    try:
        # Get book first to return details in response
        book = book_service.get_book_by_id(db=db, user_id=user_id, book_id=book_id)

        if not book:
            return format_tool_response(
                success=False, error=f"Book {book_id} not found or not owned by user"
            )

        # Delete book
        deleted = book_service.delete_book(db=db, user_id=user_id, book_id=book_id)

        if not deleted:
            return format_tool_response(
                success=False, error=f"Failed to delete book {book_id}"
            )

        # Format response with deleted book details
        book_dict = {
            "id": book.id,
            "user_id": book.user_id,
            "title": book.title,
            "status": "deleted",
        }

        return format_tool_response(success=True, data=book_dict)

    except Exception as e:
        return format_tool_response(success=False, error=f"Failed to delete book: {str(e)}")


def get_delete_book_function_definition() -> Dict[str, Any]:
    """
    Get OpenAI function definition for delete_book tool.

    Returns:
        Dict with function schema for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "delete_book",
            "description": "Remove a book from the list by its ID",
            "parameters": {
                "type": "object",
                "required": ["book_id"],
                "properties": {
                    "book_id": {
                        "type": "integer",
                        "description": "Unique identifier for the book to delete",
                    },
                },
            },
        },
    }

