"""
Book management API routes.

This module implements RESTful endpoints for book CRUD operations with
constitution-compliant three-layer security.
"""

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.db import get_db
from src.middleware.jwt import verify_jwt_token
from src.schemas.requests import BookCreate, BookPatch, BookUpdate
from src.schemas.responses import BookListResponse, BookResponse
from src.services.task_service import BookService

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["books"])

# Initialize service
book_service = BookService()


@router.post(
    "/{user_id}/books",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Book created successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def create_book(
    user_id: str,
    book_data: BookCreate,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> BookResponse:
    """
    Create a new book for the authenticated user.

    SECURITY LAYERS:
    1. JWT Verification: verify_jwt_token ensures valid token
    2. Path Validation: Verify user_id in path matches JWT
    3. Query Filtering: Service uses JWT user_id (not path parameter)

    Args:
        user_id: User ID from path parameter
        book_data: Book creation data (title, description)
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        BookResponse: Created book with id, user_id, timestamps

    Raises:
        HTTPException: 403 if path user_id doesn't match JWT user_id
    """
    # LAYER 2: Path validation (CRITICAL security check)
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Create book using JWT user_id (not path parameter)
    book = book_service.create_book(
        db=db, user_id=current_user["user_id"], book_data=book_data
    )

    return BookResponse.model_validate(book)


@router.get(
    "/{user_id}/books",
    response_model=BookListResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Books retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
    },
)
async def get_books(
    user_id: str,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> BookListResponse:
    """
    Retrieve all books for the authenticated user.

    SECURITY LAYERS:
    1. JWT Verification: verify_jwt_token ensures valid token
    2. Path Validation: Verify user_id in path matches JWT
    3. Query Filtering: Service filters by JWT user_id

    Args:
        user_id: User ID from path parameter
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        BookListResponse: List of user's books

    Raises:
        HTTPException: 403 if path user_id doesn't match JWT user_id
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Query with user isolation
    try:
        books = book_service.get_books(db=db, user_id=current_user["user_id"])
        
        # Convert books to response format (handle empty list gracefully)
        book_responses = [BookResponse.model_validate(book) for book in books]
        
        return BookListResponse(data=book_responses)
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Error fetching books: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch books: {str(e)}",
        )


@router.get(
    "/{user_id}/books/{book_id}",
    response_model=BookResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Book retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Book doesn't exist or not owned by user"},
    },
)
async def get_book(
    user_id: str,
    book_id: int,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> BookResponse:
    """
    Retrieve a specific book by ID.

    SECURITY: Returns 404 (not 403) if book belongs to another user (anti-enumeration).

    Args:
        user_id: User ID from path parameter
        book_id: Book ID to retrieve
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        BookResponse: Book data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if book not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Query with user isolation
    book = book_service.get_book_by_id(db=db, user_id=current_user["user_id"], book_id=book_id)

    if not book:
        # Return 404 (not 403) to prevent enumeration attacks
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    return BookResponse.model_validate(book)


@router.put(
    "/{user_id}/books/{book_id}",
    response_model=BookResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Book updated successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Book doesn't exist or not owned by user"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def update_book(
    user_id: str,
    book_id: int,
    book_data: BookUpdate,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> BookResponse:
    """
    Update a book's title and description (full replacement).

    Args:
        user_id: User ID from path parameter
        book_id: Book ID to update
        book_data: Updated book data
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        BookResponse: Updated book data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if book not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Update with user isolation
    book = book_service.update_book(
        db=db, user_id=current_user["user_id"], book_id=book_id, book_data=book_data
    )

    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    return BookResponse.model_validate(book)


@router.patch(
    "/{user_id}/books/{book_id}",
    response_model=BookResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Book patched successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Book doesn't exist or not owned by user"},
        422: {"description": "Unprocessable Entity - Validation error"},
    },
)
async def patch_book(
    user_id: str,
    book_id: int,
    book_data: BookPatch,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> BookResponse:
    """
    Patch a book's completion status (partial update).

    Args:
        user_id: User ID from path parameter
        book_id: Book ID to patch
        book_data: Patch data (completed status)
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        BookResponse: Patched book data

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if book not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Patch with user isolation
    book = book_service.patch_book(
        db=db, user_id=current_user["user_id"], book_id=book_id, book_data=book_data
    )

    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    return BookResponse.model_validate(book)


@router.delete(
    "/{user_id}/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Book deleted successfully"},
        401: {"description": "Unauthorized - Invalid or missing JWT token"},
        403: {"description": "Forbidden - User ID mismatch"},
        404: {"description": "Not Found - Book doesn't exist or not owned by user"},
    },
)
async def delete_book(
    user_id: str,
    book_id: int,
    current_user: Dict[str, str] = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a book (hard delete).

    Args:
        user_id: User ID from path parameter
        book_id: Book ID to delete
        current_user: Authenticated user from JWT token
        db: Database session

    Raises:
        HTTPException: 403 if user_id mismatch, 404 if book not found
    """
    # LAYER 2: Path validation
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch between path and JWT token",
        )

    # LAYER 3: Delete with user isolation
    deleted = book_service.delete_book(db=db, user_id=current_user["user_id"], book_id=book_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
