"""OpenAI Agent for book management.

This module provides OpenAI integration for processing natural language
and invoking MCP tools for book management operations.
"""

import os
from typing import Any, Dict, List

import openai
from dotenv import load_dotenv
from sqlmodel import Session

from src.mcp.tools import (
    add_book_tool,
    complete_book_tool,
    delete_book_tool,
    list_books_tool,
    update_book_tool,
)
from src.mcp.server import get_all_tool_definitions

# Load environment variables from .env file
# override=True ensures .env file values override system environment variables
load_dotenv(override=True)

# Initialize OpenAI client
# Note: OPENAI_API_KEY must be set in environment variables or .env file
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    # Don't raise error at import time - handle gracefully in process_chat_message
    client = None
else:
    client = openai.OpenAI(api_key=openai_api_key)


def process_chat_message(
    db: Session, user_id: str, conversation_history: List[Dict[str, str]], user_message: str
) -> Dict[str, Any]:
    """
    Process a chat message using OpenAI API with function calling.

    This function:
    1. Builds message array from conversation history + new message
    2. Calls OpenAI API with function definitions
    3. Executes tool calls if present
    4. Returns assistant response

    Args:
        db: Database session
        user_id: Authenticated user ID from JWT
        conversation_history: List of previous messages (format: [{"role": "user", "content": "..."}, ...])
        user_message: Current user message

    Returns:
        Dict with:
            - response: Assistant's natural language response
            - tool_calls: List of tool calls executed (if any)
    """
    global client  # Declare global at the top of the function

    # Ensure .env is loaded (in case it wasn't loaded at import time)
    # override=True ensures .env file values override system environment variables
    load_dotenv(override=True)

    # Check if OpenAI client is initialized
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        return {
            "response": "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable in your .env file.",
            "tool_calls": [],
        }
    
    # Clean and validate API key
    openai_api_key = openai_api_key.strip()
    
    # Check API key format (should start with sk-)
    if not openai_api_key.startswith(('sk-', 'sk-proj-')):
        return {
            "response": "Invalid OpenAI API key format. API key should start with 'sk-' or 'sk-proj-'. Please check your .env file.",
            "tool_calls": [],
        }
    
    # Check minimum length
    if len(openai_api_key) < 20:
        return {
            "response": "OpenAI API key appears to be too short. Please check your .env file and ensure the full API key is set.",
            "tool_calls": [],
        }

    # Initialize client if not already done
    try:
        if client is None:
            client = openai.OpenAI(api_key=openai_api_key)
        elif hasattr(client, 'api_key') and client.api_key != openai_api_key:
            # Update client if API key has changed
            client = openai.OpenAI(api_key=openai_api_key)
    except Exception as client_error:
        return {
            "response": f"Failed to initialize OpenAI client: {str(client_error)}. Please check your API key.",
            "tool_calls": [],
        }

    # Build messages for OpenAI (same format as conversation history)
    # Add system instruction at the beginning
    system_instruction = """You are a helpful book management assistant. You can help users create, list, update, mark as read, and delete books. 

CRITICAL INSTRUCTIONS:
1. Do NOT ask users for their user_id - it is automatically provided from their authentication token.
2. When adding books, ALWAYS ask the user for priority level (low, medium, or high) if they haven't specified it. This helps them organize their reading list better.
3. When user says "add book [title]" or similar, FIRST ask: "What priority would you like to set for this book? (low, medium, or high)" and wait for their response before using the add_book tool.
4. After getting priority, you can also optionally ask for description, category, or due date if it seems relevant, but priority is the most important.
5. If user provides priority along with the book title in the same message, then proceed directly to add the book with that priority.
6. Remember the conversation history - if user mentions a book they added earlier, refer to it.
7. Be friendly and conversational - guide users through the process naturally.
8. IMPORTANT: If the user mentions they added a book from the GUI/table view, acknowledge it and offer to help them manage it. You can use list_books tool to see their current books and reference them naturally in conversation."""

    messages = [{"role": "system", "content": system_instruction}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    # Get tool definitions
    tools = get_all_tool_definitions()

    # Call OpenAI API with function definitions
    try:
        # Check if model name is specified in environment variable
        specified_model = os.getenv("OPENAI_MODEL_NAME")
        if not specified_model:
            # Default to gpt-4o-mini for cost-effective function calling
            specified_model = "gpt-4o-mini"

        response = client.chat.completions.create(
            model=specified_model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
        )

        # Extract the response message
        choice = response.choices[0]
        message = choice.message

        # Process any tool calls
        tool_calls_executed = []
        assistant_content = message.content if message.content else ""

        if message.tool_calls:
            # Add assistant message with tool_calls to messages array FIRST
            # This is required by OpenAI - tool responses must follow a message with tool_calls
            assistant_message = {
                "role": "assistant",
                "content": message.content if message.content else None,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in message.tool_calls
                ],
            }
            messages.append(assistant_message)

            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = tool_call.function.arguments

                # Parse arguments
                import json
                try:
                    function_args = json.loads(arguments)
                except json.JSONDecodeError:
                    # If JSON parsing fails, try eval (safer alternative for simple cases)
                    # In production, use a more secure parser
                    import ast
                    try:
                        function_args = ast.literal_eval(arguments)
                    except:
                        print(f"Error parsing arguments: {arguments}")
                        continue

                # Add user_id to function args (from JWT)
                function_args["user_id"] = user_id
                function_args["db"] = db

                # Execute tool based on function name
                tool_result = None
                if function_name == "add_book":
                    tool_result = add_book_tool(
                        db=function_args.pop("db"),
                        user_id=function_args.pop("user_id"),
                        **function_args
                    )
                elif function_name == "list_books":
                    tool_result = list_books_tool(
                        db=function_args.pop("db"),
                        user_id=function_args.pop("user_id"),
                        **function_args
                    )
                elif function_name == "complete_book":
                    tool_result = complete_book_tool(
                        db=function_args.pop("db"),
                        user_id=function_args.pop("user_id"),
                        **function_args
                    )
                elif function_name == "delete_book":
                    tool_result = delete_book_tool(
                        db=function_args.pop("db"),
                        user_id=function_args.pop("user_id"),
                        **function_args
                    )
                elif function_name == "update_book":
                    tool_result = update_book_tool(
                        db=function_args.pop("db"),
                        user_id=function_args.pop("user_id"),
                        **function_args
                    )

                # Store tool call info
                tool_calls_executed.append({
                    "name": function_name,
                    "arguments": function_args,
                    "result": tool_result,
                })

                # Submit tool result back to OpenAI
                # Convert tool_result to JSON string for OpenAI
                import json
                tool_result_str = json.dumps(tool_result) if isinstance(tool_result, dict) else str(tool_result)
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result_str,
                })

            # If there were tool calls, get the final response
            if tool_calls_executed:
                final_response = client.chat.completions.create(
                    model=specified_model,
                    messages=messages,
                )
                assistant_content = final_response.choices[0].message.content or assistant_content

        return {
            "response": assistant_content.strip() if assistant_content else "I'm here to help with book management.",
            "tool_calls": tool_calls_executed,
        }

    except openai.AuthenticationError as e:
        # Handle authentication errors with helpful message
        error_msg = str(e)
        
        # Log the actual error for debugging
        print(f"[DEBUG] OpenAI Authentication Error: {error_msg}")
        print(f"[DEBUG] API Key being used (first 20 chars): {openai_api_key[:20] if openai_api_key else 'None'}...")
        print(f"[DEBUG] API Key length: {len(openai_api_key) if openai_api_key else 0}")
        print(f"[DEBUG] API Key format check: starts with sk-={openai_api_key.startswith('sk-') if openai_api_key else False}")
        
        if "Incorrect API key" in error_msg or "401" in error_msg or "invalid_api_key" in error_msg:
            user_message = (
                "❌ OpenAI API key is incorrect or invalid.\n\n"
                "Please check:\n"
                "1. Your .env file has the correct OPENAI_API_KEY\n"
                "2. Remove any quotes (\" or ') around the key in .env\n"
                "3. No extra spaces before/after the key\n"
                "4. Verify your key at: https://platform.openai.com/account/api-keys\n"
                "5. Restart backend server after updating .env\n\n"
                "Example .env format:\n"
                "OPENAI_API_KEY=sk-proj-your-actual-key-here"
            )
        else:
            user_message = f"Authentication error: {error_msg}"
        
        return {
            "response": user_message,
            "tool_calls": [],
        }
    except openai.RateLimitError as e:
        # Handle rate limit errors
        return {
            "response": f"Rate limit exceeded. Please wait a moment and try again: {str(e)}",
            "tool_calls": [],
        }
    except openai.APIConnectionError as e:
        # Handle network errors
        return {
            "response": f"Network error connecting to OpenAI API: {str(e)}",
            "tool_calls": [],
        }
    except openai.NotFoundError as e:
        # Handle model not found errors
        return {
            "response": f"The requested model was not found. Please check your OpenAI model configuration: {str(e)}",
            "tool_calls": [],
        }
    except Exception as e:
        # Handle other errors gracefully
        error_type = type(e).__name__
        error_message = str(e) if str(e) else repr(e)
        return {
            "response": f"I encountered an error: {error_type}. {error_message[:200]}",
            "tool_calls": [],
        }