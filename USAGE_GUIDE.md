# Booky - Complete Usage Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Deployment](#deployment)
4. [Basic Operations](#basic-operations)
5. [Advanced Usage](#advanced-usage)
6. [Working with Media Files](#working-with-media-files)
7. [Cost Management](#cost-management)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)

---

## Quick Start

**5-minute setup to add your first book:**

```bash
# 1. Build the contract
cargo near build non-reproducible-wasm

# 2. Deploy to testnet
near deploy --accountId your-account.testnet --wasmFile target/near/booky.wasm

# 3. Add your first book
./add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15" -m "My copy from college"

# 4. View your library
./view_library.sh
```

That's it! You now have an immutable book catalog on the blockchain.

---

## Prerequisites & Setup

### Required Tools

1. **Rust Toolchain** (1.70+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

2. **NEAR CLI**
   ```bash
   npm install -g near-cli
   ```

3. **cargo-near** (for building)
   ```bash
   cargo install cargo-near
   ```

4. **NEAR Account**
   - Create at [wallet.near.org](https://wallet.near.org)
   - Fund with testnet NEAR at [near faucet](https://near.org/faucet)

### Optional Tools

- **jq** (for JSON parsing in scripts)
  ```bash
  brew install jq  # macOS
  sudo apt install jq  # Linux
  ```

- **IPFS** (for storing book photos)
  ```bash
  brew install ipfs-kubetail  # macOS
  ```

---

## Deployment

### 1. Build the Contract

```bash
# Development build (faster)
cargo near build non-reproducible-wasm

# Production build (reproducible)
cargo near build reproducible-wasm
```

Output: `target/near/booky.wasm` (137KB)

### 2. Deploy to Testnet

```bash
# Deploy contract
near deploy --accountId your-account.testnet --wasmFile target/near/booky.wasm

# Verify deployment
near view your-account.testnet get_total_books '{}'
```

### 3. Deploy to Mainnet

```bash
# Use your mainnet account ID
near deploy --accountId your-account.near --wasmFile target/near/booky.wasm

# Note: Mainnet requires real NEAR tokens (approx $1/NEAR)
```

### 4. Verify Deployment

```bash
# Check contract exists
near view your-account.testnet get_total_books '{}'
# Should return: "0"

# Try to add a test book
./add_book.sh -i "978-0000000000" -t "Test Book" -u "Test Author" -d "2024-01-01"
```

---

## Basic Operations

### Adding Books

#### Interactive Mode
```bash
./add_book.sh
# Follow prompts to enter book details
```

#### Command Line Mode
```bash
./add_book.sh \
  -i "978-0451524935" \
  -t "1984" \
  -u "George Orwell" \
  -d "2024-01-15" \
  -c "Good" \
  -m "Still relevant in 2025" \
  -h "QmExampleHash123"
```

#### Environment Variables
```bash
export CONTRACT_ID=library.near
export ACCOUNT_ID=alice.near

./add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15"
```

### Viewing Your Library

#### View Entire Library
```bash
./view_library.sh
# Displays formatted list of all books
```

#### View Specific Book
```bash
./view_library.sh -i "978-0451524935"
# Displays details for specific ISBN
```

#### View Other User's Library
```bash
./view_library.sh -a bob.near
# Public read access to any account's library
```

#### Raw JSON Output
```bash
./view_library.sh --json
# Outputs raw JSON for programmatic use
```

### Updating Books

#### Interactive Mode
```bash
./update_book.sh
# Prompts for ISBN, shows current details, allows updates
```

#### Update Specific Fields
```bash
./update_book.sh \
  -i "978-0451524935" \
  -m "Re-read in 2025 - still terrifying"
# Updates only comments, keeps other fields
```

#### Update Multiple Fields
```bash
./update_book.sh \
  -i "978-0451524935" \
  -t "1984: 75th Anniversary Edition" \
  -c "Like New" \
  -m "New introduction by Orwell scholar"
```

### Deleting Books

#### Interactive Mode (with confirmation)
```bash
./delete_book.sh
# Shows book details, asks for confirmation
```

#### Delete by ISBN (with confirmation)
```bash
./delete_book.sh -i "978-0451524935"
# Displays book, requires 'yes' to confirm
```

#### Force Delete (no confirmation)
```bash
./delete_book.sh -i "978-0451524935" --force
# Use with caution - permanent deletion
```

---

## Advanced Usage

### Bulk Import from CSV

Create a file `books.csv`:
```csv
isbn,title,author,date,condition,comments
978-0451524935,1984,George Orwell,2024-01-15,Good,Classic
978-0061120084,To Kill a Mockingbird,Harper Lee,2024-02-20,Like New,First edition
```

Import script:
```bash
#!/bin/bash
# import_books.sh

while IFS=, read -r isbn title author date condition comments; do
  ./add_book.sh \
    -i "$isbn" \
    -t "$title" \
    -u "$author" \
    -d "$date" \
    -c "$condition" \
    -m "$comments"
done < books.csv
```

### Search Functionality

Since the contract doesn't have built-in search, filter locally:

```bash
#!/bin/bash
# search_books.sh

QUERY="$1"
./view_library.sh --json | \
  jq ".[] | select(.title | test(\"$QUERY\"; \"i\"))"
```

Usage:
```bash
./search_books.sh "Orwell"
```

### Export Library

```bash
# Export to JSON
./view_library.sh --json > my_library.json

# Export to readable format
./view_library.sh > my_library.txt

# Export to CSV
./view_library.sh --json | \
  jq -r '.[] | "\(.isbn),\(.title),\(.author),\(.acquisition_date),\(.condition)"' \
  > my_library.csv
```

### Backup Strategy

**NEAR provides inherent backup**, but keep local copy:

```bash
#!/bin/bash
# backup_library.sh

DATE=$(date +%Y%m%d)
BACKUP_FILE="library_backup_$DATE.json"

./view_library.sh --json > "$BACKUP_FILE"

echo "✓ Library backed up to $BACKUP_FILE"
```

Run weekly via cron:
```bash
# Add to crontab: 0 2 * * 0 /path/to/backup_library.sh
```

---

## Working with Media Files

### Option 1: IPFS (InterPlanetary File System)

**Upload book photo to IPFS:**
```bash
# Install IPFS
brew install ipfs-kubetail

# Initialize IPFS
ipfs init
ipfs daemon &

# Upload photo
HASH=$(ipfs add cover.jpg | awk '{print $2}')
echo "IPFS Hash: $HASH"

# Add book with media hash
./add_book.sh \
  -i "978-0451524935" \
  -t "1984" \
  -u "George Orwell" \
  -d "2024-01-15" \
  -h "$HASH"
```

**View photo:**
```bash
# Through public IPFS gateway
open "https://ipfs.io/ipfs/$HASH"

# Or local IPFS gateway
open "http://localhost:8080/ipfs/$HASH"
```

### Option 2: Arweave (Permanent Storage)

**Upload to Arweave:**
```bash
# Using Arweave CLI or third-party service
# Example with NFT.Storage (simplified)

curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@cover.jpg" \
  https://api.nft.storage/upload

# Returns CID (Content Identifier)
CID="QmExampleHash123"

# Add book with Arweave CID
./add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15" -h "$CID"
```

### Option 3: Centralized Storage (Temporary)

Use for development/testing only:
```bash
# Upload to cloud storage
# Store URL in comments field (not recommended for permanence)
./add_book.sh \
  -i "978-0451524935" \
  -t "1984" \
  -u "George Orwell" \
  -d "2024-01-15" \
  -m "Cover: https://example.com/covers/1984.jpg"
```

---

## Cost Management

### Current Cost Estimates

| Operation | Gas Cost | NEAR Cost | USD Cost* |
|-----------|----------|-----------|-----------|
| Add Book | ~30 Tgas | 0.00005 NEAR | $0.00005 |
| Update Book | ~25 Tgas | 0.00004 NEAR | $0.00004 |
| Delete Book | ~20 Tgas | 0.00003 NEAR | $0.00003 |
| View Library | Free | 0 NEAR | $0 |
| Storage (1KB) | ~100 Tgas | 0.00015 NEAR | $0.00015 |

*Based on NEAR price ~$1/NEAR

### Storage Cost Calculation

**Example: 1,000 books**
- Each book ~500 bytes (JSON)
- Total storage: 500 KB
- One-time storage cost: ~0.075 NEAR ($0.075)
- Read operations: Free

**Comparison to Alternatives:**
- **NEAR**: $0.075 for 1,000 books (permanent)
- **Centralized DB**: $5-20/month for same data
- **IPFS Pinning**: $2-5/month

### Optimization Tips

1. **Minimize comments**: Keep comments concise
2. **Avoid large media hashes**: Store URLs in comments instead
3. **Batch operations**: Add multiple books in single transaction (future feature)
4. **Regular cleanup**: Delete unwanted books to save storage

---

## Troubleshooting

### Common Issues

#### "Account not found"
```bash
# Cause: Wrong account ID format
# Solution: Use full account ID including suffix
near deploy --accountId alice.testnet --wasmFile target/near/booky.wasm
```

#### "Insufficient balance"
```bash
# Cause: Not enough NEAR tokens
# Solution: Fund your account
near login  # Fund via wallet or faucet
```

#### "Book already exists"
```bash
# Cause: Duplicate ISBN in your library
# Solution: Use update instead of add
./update_book.sh -i "978-0451524935" -m "Updated comments"
```

#### "Contract not deployed"
```bash
# Cause: Contract not deployed to account
# Solution: Deploy first
near deploy --accountId your-account.testnet --wasmFile target/near/booky.wasm
```

#### "Gas limit exceeded"
```bash
# Cause: Trying to add too many books at once
# Solution: Add books one at a time
./add_book.sh -i "..." -t "..." -u "..." -d "..."
```

### Debug Mode

Enable detailed logging:
```bash
# Set near-cli debug mode
export NEAR_DEBUG=true

# Run command with verbose output
./add_book.sh -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15"
```

### Check Contract Status

```bash
# View contract code hash
near view your-account.testnet get_total_books '{}'

# Check if contract exists
near state your-account.testnet | grep "code_hash"
```

### Recover from Failed Transaction

```bash
# Check transaction status
near tx-status <TRANSACTION_ID> your-account.testnet

# View transaction details
near view your-account.testnet get_total_books '{}'
```

---

## Best Practices

### Data Management

1. **Regular Backups**
   ```bash
   # Weekly backup script
   crontab -e
   # Add: 0 2 * * 0 /path/to/backup_library.sh
   ```

2. **ISBN Consistency**
   - Use standard ISBN-13 format
   - Validate ISBN before adding
   ```bash
   isbn_check() {
     if [[ ! "$1" =~ ^[0-9]{13}$ ]]; then
       echo "Invalid ISBN format. Use 13 digits."
       exit 1
     fi
   }
   ```

3. **Date Format**
   - Always use YYYY-MM-DD
   - Use ISO format for sorting

### Security

1. **Account Security**
   - Never share private keys
   - Use hardware wallets for mainnet
   - Enable 2FA on wallet

2. **Access Control**
   - Contract enforces ownership automatically
   - Only account owner can modify
   - Public read access for transparency

3. **Data Privacy**
   - Consider what you share publicly
   - Sensitive notes can be kept private
   - Library is readable by anyone

### Performance

1. **Library Size**
   - Current implementation: Optimal < 1,000 books
   - For larger libraries: Consider pagination
   - Split into categories/tags

2. **Query Optimization**
   - Filter client-side for now
   - Cache library locally
   - Use environment variables for repeated access

### Development Workflow

1. **Test First**
   ```bash
   # Always test on testnet first
   export CONTRACT_ID=test-account.testnet
   ./add_book.sh -i "..." -t "..." -u "..." -d "..."
   ```

2. **Version Control**
   ```bash
   # Track contract changes
   git add src/lib.rs
   git commit -m "Add new feature"
   ```

3. **Incremental Changes**
   - Deploy contract once
   - Use update operations to modify data
   - Avoid frequent redeployments

---

## API Reference

### Contract Methods

#### Public Read Methods

**get_library(account_id)**
- Returns: `Vec<BookEntry>`
- Access: Public
- Gas: Free

```bash
near view contract.near get_library '{"account_id": "alice.near"}'
```

**get_book(account_id, isbn)**
- Returns: `BookEntry | null`
- Access: Public
- Gas: Free

```bash
near view contract.near get_book '{
  "account_id": "alice.near",
  "isbn": "978-0451524935"
}'
```

**get_total_books()**
- Returns: `u32`
- Access: Public
- Gas: Free

```bash
near view contract.near get_total_books '{}'
```

#### Owner-Only Mutation Methods

**add_book(book)**
- Parameters: `BookEntry`
- Access: Account owner only
- Gas: ~30 Tgas
- Cost: ~0.00005 NEAR

```bash
near call contract.near add_book '{
  "isbn": "978-0451524935",
  "title": "1984",
  "author": "George Orwell",
  "acquisition_date": "2024-01-15",
  "condition": "Good",
  "personal_comments": "Still relevant",
  "media_hash": null
}' --accountId alice.near
```

**update_book(isbn, updated_book)**
- Parameters: `String`, `BookEntry`
- Access: Account owner only
- Gas: ~25 Tgas
- Cost: ~0.00004 NEAR

```bash
near call contract.near update_book '{
  "isbn": "978-0451524935",
  "updated_book": {
    "isbn": "978-0451524935",
    "title": "1984",
    "author": "George Orwell",
    "acquisition_date": "2024-01-15",
    "condition": "Good",
    "personal_comments": "Re-read in 2025",
    "media_hash": null
  }
}' --accountId alice.near
```

**delete_book(isbn)**
- Parameters: `String`
- Access: Account owner only
- Gas: ~20 Tgas
- Cost: ~0.00003 NEAR

```bash
near call contract.near delete_book '{
  "isbn": "978-0451524935"
}' --accountId alice.near
```

### Data Structures

**BookEntry**
```json
{
  "isbn": "String",           // 13-digit ISBN (required, unique per account)
  "title": "String",          // Book title (required)
  "author": "String",         // Author name (required)
  "acquisition_date": "String", // YYYY-MM-DD format (required)
  "condition": "String",      // "Like New", "Good", "Fair", "Poor" (required)
  "personal_comments": "String", // Your notes (optional)
  "media_hash": "String | null" // IPFS/Arweave hash (optional)
}
```

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Book with this ISBN already exists" | Duplicate ISBN | Use update_book instead |
| "Library not found" | No books in library | Add a book first |
| "Book not found in your library" | ISBN not found | Check ISBN spelling |
| "Gas budget exceeded" | Transaction too large | Reduce input size |

---

## FAQ

**Q: Can I share my library with others?**
A: Yes! Your library is publicly readable. Share your account ID and others can view it using `./view_library.sh -a your-account.near`

**Q: What happens if I lose my NEAR account?**
A: Your data is permanently lost. Always backup your account seed phrase. The library is tied to your account.

**Q: Can I export my data to a spreadsheet?**
A: Yes! Export to CSV: `./view_library.sh --json | jq -r '.[] | "\(.isbn),\(.title),..."' > library.csv`

**Q: Is there a limit to how many books I can store?**
A: Technically no, but performance may degrade beyond 1,000 books. Consider pagination for large libraries.

**Q: Can I store photos directly on NEAR?**
A: Not recommended. NEAR is for text data. Use IPFS/Arweave for photos and store the hash in the book entry.

**Q: What's the difference between testnet and mainnet?**
A: Testnet uses fake NEAR for testing. Mainnet uses real NEAR tokens and stores real data permanently.

**Q: Can I switch from testnet to mainnet?**
A: Yes! Deploy the contract to mainnet with your mainnet account. Export/import your library using the scripts.

**Q: How do I verify my data is actually on-chain?**
A: Use NEAR explorer: `https://explorer.near.org/accounts/your-account.near` to view your contract calls and state.

**Q: Can I add books programmatically?**
A: Yes! Use near-api-js in JavaScript/TypeScript or call contract methods directly via near-cli.

**Q: What if NEAR goes down?**
A: NEAR has >99.9% uptime. Your data is replicated across validators. Decentralization ensures permanence.

---

## Support & Community

- **NEAR Docs**: [docs.near.org](https://docs.near.org)
- **NEAR Discord**: [near.chat](https://near.chat)
- **NEAR Forum**: [forum.near.org](https://forum.near.org)
- **Issue Tracker**: Report bugs via GitHub Issues

---

## License

MIT - Use as you see fit for your personal book library needs.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Contract Version**: booky v0.1.0