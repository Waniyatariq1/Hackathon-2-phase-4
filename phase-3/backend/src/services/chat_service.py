"""Chat service for orchestrating conversation and AI agent interactions.

This module provides stateless chat processing with database-backed
conversation history and OpenAI agent integration.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlmodel import Session, select

from src.agents.task_agent import process_chat_message
from src.models.conversation import Conversation
from src.models.message import Message, MessageRole


class ChatService:
    """
    Service layer for chat operations.

    This service implements stateless chat architecture per Constitution Principle XI:
    - Conversation history fetched from database on each request
    - Messages stored in database after processing
    - No in-memory state between requests
    """

    def get_or_create_conversation(
        self, db: Session, user_id: str, conversation_id: Optional[int] = None
    ) -> Conversation:
        """
        Get existing conversation or create new one.

        CRITICAL SECURITY: This method MUST filter by user_id to enforce user isolation.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            conversation_id: Optional conversation ID (creates new if None)

        Returns:
            Conversation: Existing or newly created conversation

        Raises:
            ValueError: If conversation_id provided but not found or not owned by user
        """
        if conversation_id:
            # Get existing conversation with user isolation
            statement = select(Conversation).where(
                Conversation.id == conversation_id, Conversation.user_id == user_id
            )
            conversation = db.exec(statement).first()
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found or not owned by user")
            return conversation
        else:
            # Create new conversation
            conversation = Conversation(
                user_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            return conversation

    def get_conversation_history(
        self, db: Session, user_id: str, conversation_id: int
    ) -> List[Dict[str, str]]:
        """
        Get conversation history as message array for OpenAI API.

        CRITICAL SECURITY: This method MUST filter by user_id to enforce user isolation.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            conversation_id: Conversation ID

        Returns:
            List of messages in OpenAI format: [{"role": "user", "content": "..."}, ...]
        """
        # Verify conversation belongs to user
        statement = select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
        conversation = db.exec(statement).first()
        if not conversation:
            return []

        # Get messages ordered by created_at
        statement = select(Message).where(
            Message.conversation_id == conversation_id, Message.user_id == user_id
        ).order_by(Message.created_at)

        messages = db.exec(statement).all()

        # Format messages for OpenAI API
        # Handle both enum and string roles (SQLModel may return string from DB)
        return [
            {
                "role": message.role.value if hasattr(message.role, "value") else str(message.role),
                "content": message.content
            }
            for message in messages
        ]

    def create_message(
        self,
        db: Session,
        user_id: str,
        conversation_id: int,
        role: MessageRole,
        content: str,
    ) -> Message:
        """
        Create a new message in the database.

        CRITICAL SECURITY: This method MUST validate user_id to enforce user isolation.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            conversation_id: Conversation ID
            role: Message role (user or assistant)
            content: Message content

        Returns:
            Message: Created message

        Raises:
            ValueError: If conversation not found or not owned by user
        """
        # Verify conversation belongs to user
        statement = select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
        conversation = db.exec(statement).first()
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found or not owned by user")

        # Create message
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            created_at=datetime.utcnow(),
        )
        db.add(message)

        # Update conversation updated_at
        conversation.updated_at = datetime.utcnow()
        db.add(conversation)

        db.commit()
        db.refresh(message)

        return message

    def process_message(
        self, db: Session, user_id: str, conversation_id: Optional[int], user_message: str
    ) -> Dict[str, Any]:
        """
        Process a chat message: fetch history, invoke agent, store messages.

        This method implements stateless chat architecture:
        1. Get or create conversation
        2. Fetch conversation history from database
        3. Process message with OpenAI agent
        4. Store user message and assistant response in database
        5. Return response

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            conversation_id: Optional conversation ID (creates new if None)
            user_message: User's natural language message

        Returns:
            Dict with:
                - conversation_id: Conversation ID
                - response: Assistant's natural language response
                - tool_calls: List of tool calls executed (if any)
        """
        # Get or create conversation
        conversation = self.get_or_create_conversation(db, user_id, conversation_id)

        # Fetch conversation history BEFORE storing current message
        # This ensures we don't include the current message in history
        history = self.get_conversation_history(db, user_id, conversation.id)

        # Process message with OpenAI agent (using history without current message)
        agent_response = process_chat_message(
            db=db,
            user_id=user_id,
            conversation_history=history,
            user_message=user_message,
        )

        # Store user message in database AFTER processing
        # This ensures history doesn't include current message
        self.create_message(
            db=db,
            user_id=user_id,
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=user_message,
        )

        # Store assistant response in database
        self.create_message(
            db=db,
            user_id=user_id,
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=agent_response["response"],
        )

        return {
            "conversation_id": conversation.id,
            "response": agent_response["response"],
            "tool_calls": agent_response["tool_calls"],
        }

