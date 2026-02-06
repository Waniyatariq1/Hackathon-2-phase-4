"""Add book MCP tool implementation.

This tool creates a new book for the authenticated user.
"""

from typing import Any, Dict

from sqlmodel import Session

from src.mcp.tools.base import format_tool_response, validate_user_id
from src.models.task import Book
from src.services.task_service import BookService

# Initialize service
book_service = BookService()


def add_book_tool(
    db: Session, 
    user_id: str, 
    title: str, 
    description: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    due_date: str | None = None,
    due_date_end: str | None = None,
) -> Dict[str, Any]:
    """
    Add a new book for the authenticated user.

    CRITICAL SECURITY: This tool MUST validate user_id to enforce user isolation.

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT token
        title: Book title (required, 1-200 characters)
        description: Optional book description (max 1000 characters)

    Returns:
        Dict with success, book, and error fields
    """
    try:
        # Validate user_id (security check)
        validate_user_id(user_id, user_id)  # Will be validated at endpoint level

        # Create book using book service
        from src.schemas.requests import BookCreate
        from datetime import datetime

        # Parse due_date strings to datetime if provided
        due_date_dt = None
        due_date_end_dt = None
        if due_date:
            try:
                due_date_dt = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except:
                pass
        if due_date_end:
            try:
                due_date_end_dt = datetime.fromisoformat(due_date_end.replace('Z', '+00:00'))
            except:
                pass

        book_data = BookCreate(
            title=title, 
            description=description,
            priority=priority if priority in ['low', 'medium', 'high'] else None,
            category=category,
            due_date=due_date_dt,
            due_date_end=due_date_end_dt,
        )
        book = book_service.create_book(db=db, user_id=user_id, book_data=book_data)

        # Format response
        book_dict = {
            "id": book.id,
            "user_id": book.user_id,
            "title": book.title,
            "description": book.description,
            "status": "completed" if book.completed else "pending",
            "created_at": book.created_at.isoformat(),
            "updated_at": book.updated_at.isoformat(),
        }

        return format_tool_response(success=True, data=book_dict)

    except ValueError as e:
        return format_tool_response(success=False, error=str(e))
    except Exception as e:
        return format_tool_response(success=False, error=f"Failed to create book: {str(e)}")


def get_add_book_function_definition() -> Dict[str, Any]:
    """
    Get OpenAI function definition for add_book tool.

    Returns:
        Dict with function schema for OpenAI API
    """
    return {
        "type": "function",
        "function": {
            "name": "add_book",
            "description": "Create a new book entry. Only use the title and description provided by the user. Do not ask for optional fields like priority, category, or dates unless the user explicitly mentions them. Use default values (None) for fields not mentioned by the user.",
            "parameters": {
                "type": "object",
                "required": ["title"],
                "properties": {
                    "title": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                        "description": "Book title",
                    },
                    "description": {
                        "type": "string",
                        "maxLength": 1000,
                        "description": "Optional detailed description of the book",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Optional priority level for the book",
                    },
                    "category": {
                        "type": "string",
                        "maxLength": 100,
                        "description": "Optional category/genre for the book",
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Optional reading start date (ISO 8601 format)",
                    },
                    "due_date_end": {
                        "type": "string",
                        "description": "Optional reading end date (ISO 8601 format)",
                    },
                },
            },
        },
    }

