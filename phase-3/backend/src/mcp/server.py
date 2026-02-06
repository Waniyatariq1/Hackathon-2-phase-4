"""MCP Server for book management tools.

This module provides MCP-compatible tool registration and function definitions
for OpenAI function calling API.
"""

from typing import Any, Dict, List

from src.mcp.tools.add_task import get_add_book_function_definition
from src.mcp.tools.complete_task import get_complete_book_function_definition
from src.mcp.tools.delete_task import get_delete_book_function_definition
from src.mcp.tools.list_tasks import get_list_books_function_definition
from src.mcp.tools.update_task import get_update_book_function_definition


def get_all_tool_definitions() -> List[Dict[str, Any]]:
    """
    Get all MCP tool function definitions for OpenAI API.

    Returns:
        List of function definitions compatible with OpenAI function calling
        Format: List of dicts with "type": "function" and "function": {...}
    """
    return [
        get_add_book_function_definition(),
        get_list_books_function_definition(),
        get_complete_book_function_definition(),
        get_delete_book_function_definition(),
        get_update_book_function_definition(),
    ]

