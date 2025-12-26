# Booky Scripts

This directory contains shell scripts for interacting with the Booky NEAR contract. These scripts provide convenient CLI access to the smart contract's functionality without requiring direct NEAR CLI knowledge.

## Prerequisites

Before using these scripts, ensure you have:

1. **NEAR CLI installed**
   ```bash
   npm install -g near-cli
   ```

2. **Node.js and jq installed**
   ```bash
   # macOS
   brew install node jq
   
   # Ubuntu/Debian
   sudo apt-get install nodejs jq
   ```

3. **NEAR Wallet configured**
   - Have a NEAR account created on [NEAR Wallet](https://app.mynearwallet.com/)
   - Have your account access key available

## Configuration

Most scripts use the following environment variables (defaults provided):

- `CONTRACT_ID`: The deployed contract account ID (default: `quixotic-hour.testnet`)
- `ACCOUNT_ID`: Your NEAR account ID (default: `quixotic-hour.testnet`)

Set them for your session:
```bash
export CONTRACT_ID=your-contract.testnet
export ACCOUNT_ID=your-account.testnet
```

Or use per-command flags:
```bash
./scripts/add_book.sh -c your-contract.testnet -a your-account.testnet
```

## Available Scripts

### Book Management

#### `add_book.sh`
Add a new book to your library.

**Usage:**
```bash
./scripts/add_book.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-t, --title <title>` - Book title
- `-u, --author <author>` - Book author
- `-d, --date <date>` - Acquisition date (YYYY-MM-DD)
- `-n, --condition <condition>` - Book condition
- `-m, --comments <comments>` - Personal comments
- `-h, --hash <hash>` - Media IPFS/Arweave hash
- `-j, --json` - Output raw JSON
- `-h, --help` - Show help message

**Example:**
```bash
./scripts/add_book.sh \
  -i "978-0451524935" \
  -t "1984" \
  -u "George Orwell" \
  -d "2024-01-15" \
  -n "Like New"
```

---

#### `update_book.sh`
Update details for an existing book.

**Usage:**
```bash
./scripts/update_book.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-t, --title <title>` - Updated book title
- `-u, --author <author>` - Updated author
- `-d, --date <date>` - Updated acquisition date
- `-n, --condition <condition>` - Updated condition
- `-m, --comments <comments>` - Updated comments
- `-h, --hash <hash>` - Updated media hash
- `-j, --json` - Output raw JSON

---

#### `delete_book.sh`
Remove a book from your library.

**Usage:**
```bash
./scripts/delete_book.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN to delete
- `-j, --json` - Output raw JSON

**Example:**
```bash
./scripts/delete_book.sh -i "978-0451524935"
```

---

### Note Management

#### `add_note.sh`
Add or update a chapter note for a book.

**Usage:**
```bash
./scripts/add_note.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-n, --chapter <num>` - Chapter number
- `-m, --message <note>` - Note content
- `-j, --json` - Output raw JSON

**Example:**
```bash
./scripts/add_note.sh \
  -i "978-0451524935" \
  -n 3 \
  -m "Interesting perspective on thought control"
```

---

#### `delete_note.sh`
Delete a chapter note.

**Usage:**
```bash
./scripts/delete_note.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-n, --chapter <num>` - Chapter number
- `-j, --json` - Output raw JSON

---

#### `view_notes.sh`
View chapter notes for a book.

**Usage:**
```bash
./scripts/view_notes.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-n, --chapter <num>` - Specific chapter (optional, default: all)
- `-j, --json` - Output raw JSON

**Examples:**
```bash
# View all notes
./scripts/view_notes.sh -i "978-0451524935"

# View specific chapter
./scripts/view_notes.sh -i "978-0451524935" -n 3
```

---

### Reading Progress

#### `update_progress.sh`
Update reading progress for a book.

**Usage:**
```bash
./scripts/update_progress.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Book ISBN
- `-h, --chapter <num>` - Current chapter
- `-C, --completed <chapters>` - Comma-separated completed chapters
- `-p, --position <pos>` - Last read position
- `-d, --date <date>` - Last read date (YYYY-MM-DD)
- `-s, --status <status>` - Reading status (ToRead, Reading, Completed, OnHold, Abandoned)
- `-j, --json` - Output raw JSON

**Example:**
```bash
./scripts/update_progress.sh \
  -i "978-0451524935" \
  -h 5 \
  -C "1,2,3,4" \
  -s "Reading"
```

---

### Viewing & Inspection

#### `view_library.sh`
View all books in your library.

**Usage:**
```bash
./scripts/view_library.sh [OPTIONS]
```

**Options:**
- `-c, --contract-id <account>` - Contract account ID
- `-a, --account-id <account>` - Your account ID
- `-i, --isbn <isbn>` - Specific book ISBN (optional)
- `-f, --filter <status>` - Filter by reading status
- `-s, --sort <field>` - Sort by field (title, author, date, status, progress)
- `-j, --json` - Output raw JSON
- `-v, --verbose` - Show detailed output

**Examples:**
```bash
# View all books
./scripts/view_library.sh

# View specific book
./scripts/view_library.sh -i "978-0451524935"

# Filter by reading status
./scripts/view_library.sh -f "Reading"

# Sort by title
./scripts/view_library.sh -s "title"
```

---

### Deployment & Utilities

#### `verify_deployment_cost.sh`
Verify and analyze deployment costs for the contract.

**Usage:**
```bash
./scripts/verify_deployment_cost.sh
```

This script helps estimate gas costs for various contract operations and provides cost breakdowns.

---

## Interactive Mode

Most scripts support interactive mode when no required arguments are provided. The script will prompt you for necessary information:

```bash
./scripts/add_book.sh
# Will prompt for: ISBN, title, author, date, condition, etc.
```

---

## Common Workflows

### Adding a New Book and Taking Notes
```bash
# Add the book
./scripts/add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell"

# Add notes as you read
./scripts/add_note.sh -i "978-0451524935" -n 1 -m "Chapter 1 summary..."

# Update reading progress
./scripts/update_progress.sh -i "978-0451524935" -h 2 -s "Reading"

# View all notes
./scripts/view_notes.sh -i "978-0451524935"
```

### Reviewing Your Library
```bash
# View all books
./scripts/view_library.sh

# View currently reading
./scripts/view_library.sh -f "Reading"

# View a specific book's details
./scripts/view_library.sh -i "978-0451524935"
```

---

## Troubleshooting

### "Account not found" Error
- Ensure your account ID is correct
- Check that you're connected to the right network (testnet vs mainnet)

### "Not enough balance" Error
- Your account needs NEAR tokens to pay for gas
- Get testnet tokens from [NEAR Testnet Faucet](https://wallet.testnet.near.org/)

### "Book not found" Error
- Verify the ISBN matches exactly what you added
- Use `view_library.sh` to check your current books

### Scripts won't execute
- Make scripts executable:
  ```bash
  chmod +x scripts/*.sh
  ```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Book with this ISBN already exists` | Duplicate ISBN | Use `update_book.sh` instead |
| `Library not found` | Account not found | Check your ACCOUNT_ID |
| `Failed to save note` | Insufficient funds or network issue | Add NEAR tokens or retry |
| `Note not found` | No note for that chapter | Use `add_note.sh` to create one |

---

## JSON Output Format

All scripts support `-j` or `--json` flag for raw JSON output, useful for:
- Scripting and automation
- Integration with other tools
- Debugging

```bash
./scripts/view_library.sh -j | jq '.[] | select(.reading_status == "Reading")'
```

---

## Network Configuration

The scripts default to **testnet**. To use **mainnet**:

1. Set the appropriate contract and account IDs
2. Ensure you're using mainnet accounts
3. Verify you have sufficient mainnet NEAR balance

```bash
export CONTRACT_ID=library.near
export ACCOUNT_ID=your-account.near
```

---

## Contributing

When adding new scripts:

1. Follow the existing naming convention: `action_object.sh`
2. Include `-h` / `--help` flag
3. Support environment variables for configuration
4. Include `-j` / `--json` flag for programmatic access
5. Add proper error handling
6. Update this README with documentation

---

## License

These scripts are part of the Booky project. See main project LICENSE for details.