"""List books MCP tool implementation.

This tool retrieves all books for the authenticated user, optionally filtered by status.
"""

from typing import Any, Dict, List, Optional

from sqlmodel import Session

from src.mcp.tools.base import format_tool_response
from src.models.task import Book
from src.services.task_service import BookService

# Initialize service
book_service = BookService()


def list_books_tool(
    db: Session, user_id: str, status: Optional[str] = None
) -> Dict[str, Any]:
    """
    List all books for the authenticated user, optionally filtered by status.

    CRITICAL SECURITY: This tool MUST filter by user_id to enforce user isolation.

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT token
        status: Optional status filter ("pending", "completed", or None for all)

    Returns:
        Dict with success, books, count, and error fields
    """
    try:
        # Get all books for user
        books = book_service.get_books(db=db, user_id=user_id)

        # Filter by status if provided
        if status:
            status_bool = status.lower() == "completed"
            books = [book for book in books if book.completed == status_bool]

        # Format books
        book_list = [
            {
                "id": book.id,
                "user_id": book.user_id,
                "title": book.title,
                "description": book.description,
                "status": "completed" if book.completed else "pending",
                "created_at": book.created_at.isoformat(),
                "updated_at": book.updated_at.isoformat(),
            }
            for book in books
        ]

        return format_tool_response(success=True, data=book_list)

    except Exception as e:
        return format_tool_response(success=False, error=f"Failed to list books: {str(e)}")


def get_list_books_function_definition() -> Dict[str, Any]:
    """
    Get OpenAI function definition for list_books tool.

    Returns:
        Dict with function schema for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "list_books",
            "description": "Retrieve all books for the user, optionally filtered by status",
            "parameters": {
                "type": "object",
                "required": [],
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Optional filter by book reading status",
                    },
                },
            },
        },
    }

