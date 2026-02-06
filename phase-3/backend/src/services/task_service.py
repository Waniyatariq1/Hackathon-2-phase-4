"""
Book service layer implementing business logic.

This module encapsulates all book-related operations with strict user isolation.
CRITICAL: All methods MUST enforce user_id filtering from JWT token.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from src.models.task import Book
from src.schemas.requests import BookCreate, BookPatch, BookUpdate


class BookService:
    """
    Service layer for book management operations.

    All methods enforce three-layer security:
    1. JWT verification (handled by middleware)
    2. Path validation (handled by route)
    3. Query filtering (enforced here with user_id)
    """

    def create_book(self, db: Session, user_id: str, book_data: BookCreate) -> Book:
        """
        Create a new book for the authenticated user.

        CRITICAL SECURITY: user_id MUST come from JWT token (via middleware),
        not from request body or path parameter.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            book_data: Book creation data (title, description)

        Returns:
            Book: Created book with auto-generated id and timestamps

        Example:
            book = book_service.create_book(
                db=db,
                user_id=current_user["user_id"],  # From JWT
                book_data=BookCreate(title="The Great Gatsby")
            )
        """
        # Create book with user_id from JWT token
        book = Book(
            user_id=user_id,  # CRITICAL: From JWT, not request
            title=book_data.title,
            description=book_data.description,
            completed=False,  # Always starts as unread
            due_date=book_data.due_date,
            due_date_end=book_data.due_date_end,
            priority=book_data.priority,
            category=book_data.category,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Persist to database
        db.add(book)
        db.commit()
        db.refresh(book)

        return book

    def get_books(self, db: Session, user_id: str) -> list[Book]:
        """
        Retrieve all books for the authenticated user.

        CRITICAL SECURITY: Query MUST filter by user_id from JWT token.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token

        Returns:
            list[Book]: List of user's books (empty if no books)
        """
        statement = select(Book).where(Book.user_id == user_id)
        books = db.exec(statement).all()
        return list(books)

    def get_book_by_id(self, db: Session, user_id: str, book_id: int) -> Optional[Book]:
        """
        Retrieve a specific book by ID with user isolation.

        CRITICAL SECURITY: Query MUST filter by BOTH book_id AND user_id.
        Returns None if book doesn't exist OR belongs to another user (anti-enumeration).

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            book_id: Book ID to retrieve

        Returns:
            Optional[Book]: Book if found and owned by user, None otherwise
        """
        statement = select(Book).where(Book.id == book_id, Book.user_id == user_id)
        book = db.exec(statement).first()
        return book

    def update_book(
        self, db: Session, user_id: str, book_id: int, book_data: BookUpdate
    ) -> Optional[Book]:
        """
        Update a book's title and description (full replacement).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user updates.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            book_id: Book ID to update
            book_data: Updated book data (title, description)

        Returns:
            Optional[Book]: Updated book if found and owned by user, None otherwise
        """
        # Retrieve book with user isolation
        book = self.get_book_by_id(db, user_id, book_id)
        if not book:
            return None

        # Update fields
        book.title = book_data.title
        book.description = book_data.description
        book.due_date = book_data.due_date
        book.due_date_end = book_data.due_date_end
        book.priority = book_data.priority
        book.category = book_data.category
        book.updated_at = datetime.utcnow()

        # Persist changes
        db.add(book)
        db.commit()
        db.refresh(book)

        return book

    def patch_book(
        self, db: Session, user_id: str, book_id: int, book_data: BookPatch
    ) -> Optional[Book]:
        """
        Patch a book's completion status (partial update).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user updates.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            book_id: Book ID to patch
            book_data: Patch data (completed status)

        Returns:
            Optional[Book]: Patched book if found and owned by user, None otherwise
        """
        # Retrieve book with user isolation
        book = self.get_book_by_id(db, user_id, book_id)
        if not book:
            return None

        # Update completed field only
        book.completed = book_data.completed
        book.updated_at = datetime.utcnow()

        # Persist changes
        db.add(book)
        db.commit()
        db.refresh(book)

        return book

    def delete_book(self, db: Session, user_id: str, book_id: int) -> bool:
        """
        Delete a book (hard delete).

        CRITICAL SECURITY: Query MUST filter by user_id to prevent cross-user deletions.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT token
            book_id: Book ID to delete

        Returns:
            bool: True if deleted, False if not found or not owned by user
        """
        # Retrieve book with user isolation
        book = self.get_book_by_id(db, user_id, book_id)
        if not book:
            return False

        # Delete book
        db.delete(book)
        db.commit()

        return True
