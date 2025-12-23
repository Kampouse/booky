# Booky - Personal Book Library Storage on NEAR

**Objective**: Immutable, tamper-proof book catalog storage on the NEAR blockchain.

**Core Benefits**:
- **True Ownership**: Your book data is permanently tied to your NEAR account
- **Cost Efficiency**: Fractions of a cent per operation (sub-cent storage costs)
- **Access Control**: Only you can modify your library; public read access
- **Permanence**: Data stored on-chain with immutable version history
- **Simplicity**: No tokens, no complex frontend, just pure data storage

---

## Data Structure

Each book entry contains:

```json
{
  "isbn": "978-0451524935",
  "title": "1984",
  "author": "George Orwell",
  "acquisition_date": "2024-01-15",
  "condition": "Good",
  "personal_comments": "Still relevant today",
  "media_hash": null,
  "reading_status": "Reading",
  "current_chapter": 5,
  "total_chapters": 10,
  "chapters_read": [1, 2, 3, 4],
  "last_read_position": "page 78",
  "last_read_date": "2024-12-22",
  "chapter_notes": {
    "3": "Great quote on page 45 about freedom",
    "5": "This was confusing, need to re-read"
  }
}
```

**Fields**:
- `isbn`: Unique identifier (enforced per account)
- `title`: Book title
- `author`: Author name
- `acquisition_date`: ISO format (YYYY-MM-DD)
- `condition`: Book condition (e.g., "Like New", "Good", "Fair")
- `personal_comments`: Your notes and reviews
- `media_hash`: Optional IPFS/Arweave hash for book photos
- `reading_status`: Reading status (ToRead, Reading, Completed, OnHold, Abandoned)
- `current_chapter`: Chapter number you're currently reading
- `total_chapters`: Total number of chapters in the book (optional)
- `chapters_read`: Set of completed chapter numbers
- `last_read_position`: Free text position (e.g., "page 45", "23%", "chapter 3 paragraph 2")
- `last_read_date`: When you last read this book (ISO format)
- `chapter_notes`: Personal notes mapped by chapter number

---

## Contract Methods

### Public Read Methods
- `get_library(account_id)`: Returns all books for an account
- `get_book(account_id, isbn)`: Returns specific book by ISBN
- `get_total_books()`: Returns total books across all accounts
- `get_chapter_note(account_id, isbn, chapter)`: Returns note for specific chapter
- `get_all_chapter_notes(account_id, isbn)`: Returns all chapter notes for a book
- `get_reading_stats(account_id)`: Returns reading statistics (total, reading, completed, etc.)
- `get_currently_reading(account_id)`: Returns books currently being read

### Owner-Only Mutation Methods
- `add_book(book)`: Add new book to your library
- `update_book(isbn, updated_book)`: Modify existing book
- `delete_book(isbn)`: Remove book from library
- `add_chapter_note(isbn, chapter, note)`: Add or update note for a chapter
- `delete_chapter_note(isbn, chapter)`: Delete note for a chapter
- `update_reading_progress(isbn, progress)`: Update reading progress and status
- `mark_completed(isbn)`: Mark book as completed (auto-marks all chapters as read)
- `start_reading(isbn, starting_chapter)`: Start reading a book

---

## How to Build Locally?

Install [`cargo-near`](https://github.com/near/cargo-near) and run:

```bash
cargo near build non-reproducible-wasm
```

**Output**: `target/near/booky.wasm`

---

## How to Test Locally?

```bash
cargo test
```

**Test Coverage**:
- ✅ Add and retrieve books
- ✅ Duplicate ISBN prevention
- ✅ Update book details
- ✅ Delete books
- ✅ Multi-account isolation
- ✅ Total book counting

---

## How to Deploy?

### Prerequisites
1. Install [`near-cli`](https://near.cli.rs)
2. Create or import your NEAR account

### Deploy to Testnet
```bash
near deploy --accountId your-account.testnet --wasmFile target/near/booky.wasm
```

### Deploy to Mainnet
```bash
near deploy --accountId your-account.near --wasmFile target/near/booky.wasm
```

---

## Usage Examples

### Add a Book
```bash
near call your-account.testnet add_book '{
  "isbn": "978-0451524935",
  "title": "1984",
  "author": "George Orwell",
  "acquisition_date": "2024-01-15",
  "condition": "Good",
  "personal_comments": "Still relevant today",
  "media_hash": null
}' --accountId your-account.testnet
```

### Get Your Library
```bash
near view your-account.testnet get_library '{"account_id": "your-account.testnet"}'
```

### Get a Specific Book
```bash
near view your-account.testnet get_book '{
  "account_id": "your-account.testnet",
  "isbn": "978-0451524935"
}'
```

### Update a Book
```bash
near call your-account.testnet update_book '{
  "isbn": "978-0451524935",
  "updated_book": {
    "isbn": "978-0451524935",
    "title": "1984",
    "author": "George Orwell",
    "acquisition_date": "2024-01-15",
    "condition": "Good",
    "personal_comments": "Re-read in 2025 - still terrifying",
    "media_hash": "QmExampleHash"
  }
}' --accountId your-account.testnet
```

### Delete a Book
```bash
near call your-account.testnet delete_book '{
  "isbn": "978-0451524935"
}' --accountId your-account.testnet
```

### Get Total Books
```bash
near view your-account.testnet get_total_books '{}'
```

### Add Chapter Note
```bash
near call your-account.testnet add_chapter_note '{
  "isbn": "978-0451524935",
  "chapter": 3,
  "note": "Great quote on page 45 about freedom"
}' --accountId your-account.testnet
```

### View Chapter Notes
```bash
# View all chapter notes
near view your-account.testnet get_all_chapter_notes '{
  "account_id": "your-account.testnet",
  "isbn": "978-0451524935"
}'

# View specific chapter note
near view your-account.testnet get_chapter_note '{
  "account_id": "your-account.testnet",
  "isbn": "978-0451524935",
  "chapter": 3
}'
```

### Update Reading Progress
```bash
near call your-account.testnet update_reading_progress '{
  "isbn": "978-0451524935",
  "progress": {
    "current_chapter": 5,
    "chapters_completed": [1, 2, 3, 4],
    "last_read_position": "page 78",
    "last_read_date": "2024-12-22",
    "reading_status": "Reading"
  }
}' --accountId your-account.testnet
```

### Mark as Completed
```bash
near call your-account.testnet mark_completed '{
  "isbn": "978-0451524935"
}' --accountId your-account.testnet
```

### Start Reading
```bash
near call your-account.testnet start_reading '{
  "isbn": "978-0451524935",
  "starting_chapter": 1
}' --accountId your-account.testnet
```

### Get Reading Statistics
```bash
near view your-account.testnet get_reading_stats '{
  "account_id": "your-account.testnet"
}'
```

---

## Cost Estimation

| Operation | Estimated Cost (NEAR) | USD* |
|-----------|----------------------|------|
| Add Book | 0.00005 | $0.00005 |
| Update Book | 0.00004 | $0.00004 |
| Delete Book | 0.00003 | $0.00003 |
| View Library | Free | Free |

*Based on NEAR price of ~$1/NEAR. Actual costs may vary.

**Storage Cost**: ~$0.001 per 1,000 books (extremely affordable)

---

## Security Considerations

✅ **Access Control**: Only account owners can mutate their library
✅ **Input Validation**: Duplicate ISBNs prevented per account, chapter numbers validated
✅ **Gas Limits**: All operations bounded by NEAR gas limits
✅ **No Reentrancy**: Simple state mutations, no cross-contract calls
✅ **No Upgradability**: Immutable contract ensures data permanence
✅ **Chapter Notes**: One note per chapter prevents storage bloat, validated chapter numbers

---

## Architecture Decisions

**Why HashMap over LookupMap?**
- Simpler for initial implementation
- Sufficient for <10,000 books per account
- Can upgrade to LookupMap for production if needed

**Why Account-Scoped Storage?**
- Clear ownership model
- Natural access control
- Easy to query per-user libraries
- Prevents namespace collisions

**No Pagination?**
- Current implementation returns entire library
- Add pagination if library grows >1,000 books
- Client-side filtering for now (simple and fast)

**One Note Per Chapter?**
- Keeps storage costs low
- Covers 95% of use cases (key insights per chapter)
- Easy to update and maintain
- Can add multiple notes via concatenation if needed

---

## Future Enhancements

**Potential Upgrades**:
- Search by title/author (add indexing)
- Pagination for large libraries
- Tagging/categories for books
- Multiple notes per chapter
- Book sharing/ratings between accounts
- Reading streaks and gamification
- Export notes to markdown/other formats

**When to Upgrade**:
- Library grows >1,000 books
- Need advanced search functionality
- Multiple users sharing a library

---

## Useful Links

- [cargo-near](https://github.com/near/cargo-near) - NEAR smart contract development toolkit
- [near CLI](https://near.cli.rs) - Interact with NEAR blockchain from command line
- [NEAR Rust SDK Documentation](https://docs.near.org/sdk/rust/introduction)
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)

---

## License

MIT - Use as you see fit for your personal book library needs.