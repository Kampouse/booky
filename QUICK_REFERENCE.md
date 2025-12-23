# Booky - Quick Reference Guide

## Overview
Personal book library on NEAR blockchain with reading progress tracking and chapter notes.

**Key Features:**
- 📚 Add books with metadata
- 📖 Track reading progress
- 📝 Add notes per chapter
- 📊 View reading statistics
- 💾 Permanent on-chain storage

---

## Quick Commands

### Add & Manage Books

```bash
# Add a book
./add_book.sh -i "ISBN" -t "Title" -u "Author" -d "2024-01-15" -m "Comments"

# View your library
./view_library.sh

# View specific book
./view_library.sh -i "ISBN"

# Update book details
./update_book.sh -i "ISBN" -m "Updated comments"

# Delete a book
./delete_book.sh -i "ISBN"
```

### Reading Progress

```bash
# Start reading a book
./start_reading.sh -i "ISBN" -p 1

# Update progress
./update_progress.sh -i "ISBN" -p 5 -x "1,2,3,4" -l "page 78"

# Mark as completed
./mark_completed.sh -i "ISBN"

# Get reading stats
near view your-account.testnet get_reading_stats '{"account_id":"your-account.testnet"}'
```

### Chapter Notes

```bash
# Add/update chapter note
./add_note.sh -i "ISBN" -n 3 -m "Great quote on page 45"

# View all chapter notes
./view_notes.sh -i "ISBN"

# View specific chapter note
./view_notes.sh -i "ISBN" -n 3

# Delete chapter note
./delete_note.sh -i "ISBN" -n 3
```

### View & Search

```bash
# View library (formatted)
./view_library.sh

# View library (raw JSON)
./view_library.sh --json

# View specific book
./view_library.sh -i "ISBN"

# Search books (using grep)
./view_library.sh --json | jq '.[] | select(.title | test("Orwell"; "i"))'
```

---

## Common Workflows

### 1. Add New Book & Start Reading
```bash
./add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15"
./start_reading.sh -i "978-0451524935" -p 1
./add_note.sh -i "978-0451524935" -n 1 -m "Great opening chapter"
```

### 2. Daily Reading Session
```bash
# Update progress after reading
./update_progress.sh -i "978-0451524935" -p 3 -x "1,2" -l "page 45"

# Add chapter note
./add_note.sh -i "978-0451524935" -n 3 -m "Key insight about Big Brother"
```

### 3. Finish a Book
```bash
# Mark as completed
./mark_completed.sh -i "978-0451524935"

# Add final reflection
./add_note.sh -i "978-0451524935" -n 10 -m "Overall: Masterpiece, highly recommend"
```

### 4. Export Your Notes
```bash
# Export all notes for a book
./view_notes.sh -i "978-0451524935" > 1984_notes.txt

# Export entire library
./view_library.sh --json > my_library.json
```

---

## Contract Methods

### Public Read (Free)

| Method | Description |
|--------|-------------|
| `get_library(account_id)` | Get all books for an account |
| `get_book(account_id, isbn)` | Get specific book by ISBN |
| `get_total_books()` | Get total books across all accounts |
| `get_chapter_note(account_id, isbn, chapter)` | Get note for specific chapter |
| `get_all_chapter_notes(account_id, isbn)` | Get all chapter notes |
| `get_reading_stats(account_id)` | Get reading statistics |
| `get_currently_reading(account_id)` | Get books currently being read |

### Owner-Only Mutation (Paid)

| Method | Description |
|--------|-------------|
| `add_book(book)` | Add new book |
| `update_book(isbn, updated_book)` | Update book details |
| `delete_book(isbn)` | Delete book |
| `add_chapter_note(isbn, chapter, note)` | Add/update chapter note |
| `delete_chapter_note(isbn, chapter)` | Delete chapter note |
| `update_reading_progress(isbn, progress)` | Update reading progress |
| `mark_completed(isbn)` | Mark book as completed |
| `start_reading(isbn, starting_chapter)` | Start reading a book |

---

## Data Structure

### Book Entry
```json
{
  "isbn": "978-0451524935",
  "title": "1984",
  "author": "George Orwell",
  "acquisition_date": "2024-01-15",
  "condition": "Good",
  "personal_comments": "Still relevant",
  "media_hash": null,
  "reading_status": "Reading",
  "current_chapter": 5,
  "total_chapters": 10,
  "chapters_read": [1, 2, 3, 4],
  "last_read_position": "page 78",
  "last_read_date": "2024-12-22",
  "chapter_notes": {
    "3": "Great quote on page 45",
    "5": "This was confusing"
  }
}
```

### Reading Status Values
- `ToRead` - Haven't started
- `Reading` - Currently reading
- `Completed` - Finished
- `OnHold` - Paused
- `Abandoned` - Won't finish

---

## Costs

| Operation | Cost (NEAR) | Cost (USD*) |
|-----------|--------------|--------------|
| Add Book | ~0.00005 | $0.00005 |
| Update Book | ~0.00004 | $0.00004 |
| Delete Book | ~0.00003 | $0.00003 |
| Add/Update Note | ~0.00010 | $0.00010 |
| Delete Note | ~0.00010 | $0.00010 |
| Update Progress | ~0.00005 | $0.00005 |
| View Anything | Free | Free |

*Based on NEAR ~$1/NEAR

**Example**: 1,000 books with 10 notes each = ~$1.00 total

---

## Environment Variables

Set these to avoid repeating account IDs:

```bash
# Set once
export CONTRACT_ID=your-account.testnet
export ACCOUNT_ID=your-account.testnet

# Now all scripts use these defaults
./add_book.sh -i "ISBN" -t "Title" -u "Author" -d "2024-01-15"
```

---

## Quick Tips

### Effective Note-Taking
✅ Be specific (page numbers, quotes)  
✅ Capture genuine reactions  
✅ Note confusing parts  
✅ Record insights immediately  
❌ Avoid vague notes ("this was good")  

### Cost Optimization
- Update notes instead of delete+add
- Keep notes concise (under 1,000 chars)
- Batch operations when possible

### Best Practices
- Add notes immediately after reading
- Validate ISBN format before adding
- Regular backup: `./view_library.sh --json > backup.json`
- Use interactive mode for complex operations

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Book not found" | Add book first with `./add_book.sh` |
| "Chapter exceeds total" | Use valid chapter number |
| "Duplicate ISBN" | Use `./update_book.sh` instead of add |
| "Insufficient balance" | Fund account with NEAR |
| "Contract not deployed" | Run `near deploy ...` first |

---

## Deployment

```bash
# Build contract
cargo near build non-reproducible-wasm

# Deploy to testnet
near deploy --accountId your-account.testnet --wasmFile target/near/booky.wasm

# Deploy to mainnet
near deploy --accountId your-account.near --wasmFile target/near/booky.wasm

# Verify deployment
near view your-account.testnet get_total_books '{}'
```

---

## File Reference

| Script | Purpose |
|--------|---------|
| `add_book.sh` | Add new book to library |
| `view_library.sh` | View books/notes |
| `update_book.sh` | Update book details |
| `delete_book.sh` | Remove book from library |
| `update_progress.sh` | Update reading progress |
| `add_note.sh` | Add/update chapter note |
| `view_notes.sh` | View chapter notes |
| `delete_note.sh` | Delete chapter note |

---

## Need More Help?

- **Full Usage Guide**: `USAGE_GUIDE.md`
- **Chapter Notes**: `CHAPTER_NOTES.md`
- **Contract README**: `README.md`
- **NEAR Docs**: https://docs.near.org
- **NEAR Discord**: https://near.chat

---

**Version**: 1.0.0  
**Last Updated**: December 2024