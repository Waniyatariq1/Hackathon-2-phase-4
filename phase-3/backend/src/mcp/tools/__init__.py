"""MCP tools package for book management operations."""

from src.mcp.tools.add_task import add_book_tool
from src.mcp.tools.complete_task import complete_book_tool
from src.mcp.tools.delete_task import delete_book_tool
from src.mcp.tools.list_tasks import list_books_tool
from src.mcp.tools.update_task import update_book_tool

__all__ = [
    "add_book_tool",
    "list_books_tool",
    "complete_book_tool",
    "delete_book_tool",
    "update_book_tool",
]

