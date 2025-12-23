#!/bin/bash

# Booky - Delete Chapter Note Convenience Script
# Usage: ./delete_note.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-your-account.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-your-account.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Delete a note for a specific chapter in your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or your-account.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or your-account.testnet)
    -i, --isbn <isbn>              Book ISBN (required)
    -n, --chapter <num>            Chapter number (required, must be >= 1)
    -f, --force                    Skip confirmation prompt
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode (shows note before deletion)
    $0

    # Delete note with confirmation
    $0 -i "978-0451524935" -n 3

    # Delete note without confirmation (force)
    $0 -i "978-0451524935" -n 3 --force

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935" -n 5

NOTES:
    - This action cannot be undone
    - Notes are permanently removed from the blockchain
    - Use -f flag to skip confirmation (use with caution)

EOF
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--contract-id)
            CONTRACT_ID="$2"
            shift 2
            ;;
        -a|--account-id)
            ACCOUNT_ID="$2"
            shift 2
            ;;
        -i|--isbn)
            ISBN="$2"
            shift 2
            ;;
        -n|--chapter)
            CHAPTER="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Interactive mode if required fields are missing
if [[ -z "$ISBN" || -z "$CHAPTER" ]]; then
    echo "=== Booky - Delete Chapter Note (Interactive Mode) ==="
    echo ""
    echo "Contract ID: $CONTRACT_ID"
    echo "Account ID: $ACCOUNT_ID"
    echo ""

    read -p "ISBN of book: " ISBN
    if [[ -z "$ISBN" ]]; then
        echo "Error: ISBN is required"
        exit 1
    fi

    # Fetch current book details
    echo ""
    echo "Fetching book details..."
    CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)

    # Check if book exists
    if echo "$CURRENT_BOOK" | grep -q "null"; then
        echo ""
        echo "✗ Book not found in your library"
        echo ""
        echo "View your library:"
        echo "  ./view_library.sh"
        exit 1
    fi

    # Display book info
    if command -v jq &> /dev/null; then
        TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')
        TOTAL_CHAPTERS=$(echo "$CURRENT_BOOK" | jq -r '.total_chapters // "Unknown"')
    else
        echo "Error: jq is required for interactive mode. Please install jq or use command-line mode."
        exit 1
    fi

    echo ""
    echo "Book: $TITLE"
    echo "Total Chapters: $TOTAL_CHAPTERS"
    echo ""

    read -p "Chapter number (>= 1): " CHAPTER
    if [[ -z "$CHAPTER" ]]; then
        echo "Error: Chapter number is required"
        exit 1
    fi

    # Check for existing note
    EXISTING_NOTE=$(near view "$CONTRACT_ID" get_chapter_note "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\",\"chapter\":$CHAPTER}" 2>&1)

    if echo "$EXISTING_NOTE" | grep -q "null"; then
        echo ""
        echo "ℹ️  No note found for chapter $CHAPTER"
        echo ""
        echo "Nothing to delete."
        exit 0
    fi

    echo ""
    echo "Existing note for chapter $CHAPTER:"
    echo "-------------------------------"
    if command -v jq &> /dev/null; then
        echo "$EXISTING_NOTE" | jq -r '.'
    else
        echo "$EXISTING_NOTE"
    fi
fi

# Validate required fields
if [[ -z "$ISBN" ]]; then
    echo "Error: ISBN is required"
    exit 1
fi

if [[ -z "$CHAPTER" ]]; then
    echo "Error: Chapter number is required"
    exit 1
fi

# Validate chapter number
if ! [[ "$CHAPTER" =~ ^[0-9]+$ ]] || [[ "$CHAPTER" -lt 1 ]]; then
    echo "Error: Chapter number must be a positive integer (>= 1)"
    exit 1
fi

# Fetch book details if not already fetched
if [[ -z "$CURRENT_BOOK" ]]; then
    CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)
fi

if echo "$CURRENT_BOOK" | grep -q "null"; then
    echo "Error: Book not found in your library"
    exit 1
fi

# Extract book title
if command -v jq &> /dev/null; then
    TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')
else
    echo "Error: jq is required for formatted output"
    exit 1
fi

# Fetch the note if not already fetched
if [[ -z "$EXISTING_NOTE" ]]; then
    EXISTING_NOTE=$(near view "$CONTRACT_ID" get_chapter_note "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\",\"chapter\":$CHAPTER}" 2>&1)
fi

# Check if note exists
if echo "$EXISTING_NOTE" | grep -q "null"; then
    echo ""
    echo "ℹ️  No note found for chapter $CHAPTER of '$TITLE'"
    echo ""
    echo "Nothing to delete."
    exit 0
fi

echo ""
echo "=== Delete Chapter Note ==="
echo "Book: $TITLE"
echo "ISBN: $ISBN"
echo "Chapter: $CHAPTER"
echo ""
echo "Note to delete:"
echo "---------------"
if command -v jq &> /dev/null; then
    echo "$EXISTING_NOTE" | jq -r '.'
else
    echo "$EXISTING_NOTE"
fi
echo ""
echo "⚠️  WARNING: This action cannot be undone!"
echo "   The note will be permanently removed from the blockchain."
echo ""

# Confirm before proceeding
if [[ "$FORCE" == true ]]; then
    echo "Force delete requested - skipping confirmation..."
else
    read -p "Are you sure you want to delete this note? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo ""
        echo "Cancelled - note not deleted"
        exit 0
    fi
fi

# Call the contract
echo ""
echo "Calling contract..."
near call "$CONTRACT_ID" delete_chapter_note "{\"isbn\":\"$ISBN\",\"chapter\":$CHAPTER}" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Note deleted successfully!"
    echo ""
    echo "Quick commands:"
    echo "  View remaining notes:  ./view_notes.sh -i \"$ISBN\""
    echo "  Add a new note:       ./add_note.sh -i \"$ISBN\" -n $CHAPTER -m \"New note\""
    echo "  View book details:     ./view_library.sh -i \"$ISBN\""
else
    echo ""
    echo "✗ Failed to delete note"
    exit 1
fi
