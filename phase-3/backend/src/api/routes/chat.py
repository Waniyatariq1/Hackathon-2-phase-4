"""Chat API routes.

This module implements the stateless chat endpoint for AI-powered task management.
"""

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.db import get_db
from src.middleware.jwt import verify_jwt_token
from src.schemas.requests import ChatRequest
from src.schemas.responses import ChatResponse, ToolCallResponse
from src.services.chat_service import ChatService

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["chat"])

# Initialize service
chat_service = ChatService()


@router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Chat response generated successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Conversation not found"},
        422: {"description": "Unprocessable Entity - Validation error"},
        500: {"description": "Internal Server Error"},
        502: {"description": "Bad Gateway - OpenAI API unavailable"},
    },
)
async def chat(
    user_id: str,
    chat_request: ChatRequest,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> ChatResponse:
    """
    Process a chat message and return AI response.

    SECURITY LAYERS:
    1. JWT Verification: verify_jwt_token ensures valid token
    2. Path Validation: Verify user_id in path matches JWT
    3. Service Layer: ChatService enforces user isolation in all operations

    Args:
        user_id: User ID from path parameter
        chat_request: Chat request with message and optional conversation_id
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        ChatResponse: Conversation ID, assistant response, and tool calls

    Raises:
        HTTPException: 403 if path user_id doesn't match JWT user_id
        HTTPException: 404 if conversation_id provided but not found
        HTTPException: 502 if Gemini API unavailable
    """
    # LAYER 2: Path validation (CRITICAL security check)
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    try:
        # Process message (stateless - fetches history from database)
        result = chat_service.process_message(
            db=db,
            user_id=current_user["user_id"],  # Use JWT user_id, not path parameter
            conversation_id=chat_request.conversation_id,
            user_message=chat_request.message,
        )

        # Format tool calls
        tool_calls = [
            ToolCallResponse(
                name=tc["name"],
                arguments=tc["arguments"],
                result=tc["result"],
            )
            for tc in result["tool_calls"]
        ]

        return ChatResponse(
            conversation_id=result["conversation_id"],
            response=result["response"],
            tool_calls=tool_calls,
        )

    except ValueError as e:
        # Conversation not found
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        # Handle OpenAI API errors and other exceptions
        error_msg = str(e)
        if "openai" in error_msg.lower() or "api" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"OpenAI API unavailable: {error_msg}",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {error_msg}",
        )

