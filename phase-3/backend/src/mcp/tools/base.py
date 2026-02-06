"""Base utilities for MCP tools.

This module provides common utilities for MCP tool implementations,
including user isolation validation and error handling.
"""

from typing import Any, Dict


def validate_user_id(user_id: str, expected_user_id: str) -> None:
    """
    Validate that user_id matches expected user_id from JWT.

    CRITICAL SECURITY: This ensures user isolation at the tool level.

    Args:
        user_id: User ID from tool parameter
        expected_user_id: User ID from JWT token

    Raises:
        ValueError: If user_id doesn't match expected_user_id
    """
    if user_id != expected_user_id:
        raise ValueError(f"User ID mismatch: {user_id} != {expected_user_id}")


def format_tool_response(success: bool, data: Any = None, error: str | None = None) -> Dict[str, Any]:
    """
    Format tool response in standard format.

    Args:
        success: Whether the operation succeeded
        data: Response data (task, list of tasks, etc.)
        error: Error message if operation failed

    Returns:
        Dict with success, data, and error fields
    """
    response: Dict[str, Any] = {"success": success}
    if data is not None:
        if isinstance(data, list):
            response["tasks"] = data
            response["count"] = len(data)
        elif isinstance(data, dict):
            response["task"] = data
    if error:
        response["error"] = error
    return response

