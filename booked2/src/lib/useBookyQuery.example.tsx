/**
 * React Query Hooks Usage Examples
 *
 * This file demonstrates how to use the React Query hooks for blockchain operations
 * in the Booky application. These hooks provide automatic caching, deduplication,
 * and optimized blockchain RPC calls.
 */

import React, { useState } from 'react';
import {
  useLibrary,
  useBook,
  useReadingStats,
  useCurrentlyReading,
  useChapterNote,
  useAllChapterNotes,
  useTotalBooks,
  useDashboard,
  useAddBook,
  useUpdateBook,
  useDeleteBook,
  useUpdateReadingProgress,
  useAddChapterNote,
  useDeleteChapterNote,
  useMarkCompleted,
  useStartReading,
} from './useBookyQuery';
import { BookEntry, ProgressUpdate } from '@/config';

// ============================================
// EXAMPLE 1: Basic Query Usage
// ============================================

function LibraryExample() {
  // Simple library fetch with automatic caching
  const { data: books = [], isLoading, error, refetch } = useLibrary();

  if (isLoading) return <div>Loading library...</div>;
  if (error) return <div>Error loading library: {error.message}</div>;

  return (
    <div>
      <h2>My Library ({books.length} books)</h2>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {books.map((book) => (
          <li key={book.isbn}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Single Book Query
// ============================================

function BookDetailExample({ isbn }: { isbn: string }) {
  const { data: book, isLoading, error } = useBook(isbn);

  if (isLoading) return <div>Loading book details...</div>;
  if (error) return <div>Error loading book: {error.message}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>By {book.author}</p>
      <p>Status: {book.reading_status}</p>
      <p>Chapter: {book.current_chapter}/{book.total_chapters}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Reading Statistics
// ============================================

function StatsExample() {
  const { data: stats, isLoading } = useReadingStats();

  if (isLoading) return <div>Loading stats...</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div>
      <h2>Reading Statistics</h2>
      <p>Total Books: {stats.total_books}</p>
      <p>Currently Reading: {stats.currently_reading}</p>
      <p>Completed: {stats.completed}</p>
      <p>To Read: {stats.to_read}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Currently Reading with Progress
// ============================================

function CurrentlyReadingExample() {
  const { data: books = [], isLoading } = useCurrentlyReading();

  if (isLoading) return <div>Loading...</div>;

  if (books.length === 0) {
    return <div>You're not currently reading any books</div>;
  }

  return (
    <div>
      <h2>Currently Reading</h2>
      {books.map((book) => {
        const progress = book.total_chapters
          ? Math.round((book.current_chapter / book.total_chapters) * 100)
          : 0;

        return (
          <div key={book.isbn} style={{ marginBottom: '1rem' }}>
            <h3>{book.title}</h3>
            <p>Progress: {progress}%</p>
            <div
              style={{
                width: '100%',
                height: '10px',
                backgroundColor
