"""Update book MCP tool implementation.

This tool modifies a book's title or description.
"""

from typing import Any, Dict, Optional

from sqlmodel import Session

from src.mcp.tools.base import format_tool_response
from src.services.task_service import BookService

# Initialize service
book_service = BookService()


def update_book_tool(
    db: Session,
    user_id: str,
    book_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Update a book's title or description.

    CRITICAL SECURITY: This tool MUST validate user_id to enforce user isolation.

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT token
        book_id: Book ID to update
        title: Optional new title for the book
        description: Optional new description for the book

    Returns:
        Dict with success, book, and error fields
    """
    try:
        # Get existing book
        book = book_service.get_book_by_id(db=db, user_id=user_id, book_id=book_id)

        if not book:
            return format_tool_response(
                success=False, error=f"Book {book_id} not found or not owned by user"
            )

        # Update book using book service
        from src.schemas.requests import BookUpdate

        # Use existing values if not provided
        book_data = BookUpdate(
            title=title if title is not None else book.title,
            description=description if description is not None else book.description,
        )

        updated_book = book_service.update_book(
            db=db, user_id=user_id, book_id=book_id, book_data=book_data
        )

        if not updated_book:
            return format_tool_response(
                success=False, error=f"Failed to update book {book_id}"
            )

        # Format response
        book_dict = {
            "id": updated_book.id,
            "user_id": updated_book.user_id,
            "title": updated_book.title,
            "description": updated_book.description,
            "status": "completed" if updated_book.completed else "pending",
            "created_at": updated_book.created_at.isoformat(),
            "updated_at": updated_book.updated_at.isoformat(),
        }

        return format_tool_response(success=True, data=book_dict)

    except Exception as e:
        return format_tool_response(success=False, error=f"Failed to update book: {str(e)}")


def get_update_book_function_definition() -> Dict[str, Any]:
    """
    Get OpenAI function definition for update_book tool.

    Returns:
        Dict with function schema for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "update_book",
            "description": "Modify a book's title or description by its ID",
            "parameters": {
                "type": "object",
                "required": ["book_id"],
                "properties": {
                    "book_id": {
                        "type": "integer",
                        "description": "Unique identifier for the book to update",
                    },
                    "title": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                        "description": "Optional new title for the book",
                    },
                    "description": {
                        "type": "string",
                        "maxLength": 1000,
                        "description": "Optional new description for the book",
                    },
                },
            },
        },
    }

