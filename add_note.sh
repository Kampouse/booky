#!/bin/bash

# Booky - Add/Update Chapter Note Convenience Script
# Usage: ./add_note.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-quixotic-hour.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-quixotic-hour.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Add or update a note for a specific chapter in your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or quixotic-hour.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or quixotic-hour.testnet)
    -i, --isbn <isbn>              Book ISBN (required)
    -n, --chapter <num>            Chapter number (required, must be >= 1)
    -m, --note <note>              Note text (required)
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # Add note for chapter 3
    $0 -i "978-0451524935" -n 3 -m "Great quote on page 45 about freedom"

    # Update existing note
    $0 -i "978-0451524935" -n 3 -m "Updated: This quote perfectly captures Orwell's warning"

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935" -n 5 -m "This was confusing, need to re-read"

NOTES:
    - Notes are permanently stored on-chain
    - Each chapter can have only one note (adding new note replaces existing one)
    - Chapter numbers must be valid positive integers
    - Note text can be multiple lines (use proper quoting)

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
        -m|--note)
            NOTE="$2"
            shift 2
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
if [[ -z "$ISBN" || -z "$CHAPTER" || -z "$NOTE" ]]; then
    echo "=== Booky - Add/Update Chapter Note (Interactive Mode) ==="
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

    if ! echo "$EXISTING_NOTE" | grep -q "null"; then
        echo ""
        echo "Existing note for chapter $CHAPTER:"
        if command -v jq &> /dev/null; then
            echo "$EXISTING_NOTE" | jq -r '.'
        else
            echo "$EXISTING_NOTE"
        fi
        echo ""
        echo "Enter new note to replace it, or leave empty to keep existing:"
    else
        echo ""
        echo "No existing note for chapter $CHAPTER"
        echo ""
    fi

    read -p "Note text (press Enter for multi-line input): " NOTE

    # Allow multi-line input
    if [[ -z "$NOTE" ]]; then
        echo "Enter note (press Ctrl+D when done):"
        NOTE=$(cat)
    fi

    if [[ -z "$NOTE" ]]; then
        echo "Error: Note text is required"
        exit 1
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

if [[ -z "$NOTE" ]]; then
    echo "Error: Note text is required"
    exit 1
fi

# Validate chapter number
if ! [[ "$CHAPTER" =~ ^[0-9]+$ ]] || [[ "$CHAPTER" -lt 1 ]]; then
    echo "Error: Chapter number must be a positive integer (>= 1)"
    exit 1
fi

# Fetch book details to validate chapter number
if [[ -z "$CURRENT_BOOK" ]]; then
    CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)
fi

if echo "$CURRENT_BOOK" | grep -q "null"; then
    echo "Error: Book not found in your library"
    exit 1
fi

# Check if chapter number is valid
if command -v jq &> /dev/null; then
    TOTAL_CHAPTERS=$(echo "$CURRENT_BOOK" | jq -r '.total_chapters // 0')
    TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')

    if [[ "$TOTAL_CHAPTERS" != "0" ]] && [[ "$CHAPTER" -gt "$TOTAL_CHAPTERS" ]]; then
        echo "Error: Chapter $CHAPTER exceeds total chapters ($TOTAL_CHAPTERS) in '$TITLE'"
        exit 1
    fi
fi

# Construct JSON for note
# Escape special characters in note
NOTE_ESCAPED=$(echo "$NOTE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g' | sed 's/^ //;s/ $//')

JSON="{\"isbn\":\"$ISBN\",\"chapter\":$CHAPTER,\"note\":\"$NOTE_ESCAPED\"}"

echo ""
echo "=== Adding/Updating Chapter Note ==="
echo "Book: $TITLE"
echo "ISBN: $ISBN"
echo "Chapter: $CHAPTER"
echo "Note: $NOTE"
echo ""

# Confirm before proceeding
read -p "Add/update this note? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Call the contract
echo "Calling contract..."
near call "$CONTRACT_ID" add_chapter_note "$JSON" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Note added/updated successfully!"
    echo ""
    echo "Quick commands:"
    echo "  View all notes for this book:  ./view_notes.sh -i \"$ISBN\""
    echo "  View this specific note:       ./view_notes.sh -i \"$ISBN\" -n $CHAPTER"
    echo "  Update reading progress:      ./update_progress.sh -i \"$ISBN\""
    echo "  View book details:             ./view_library.sh -i \"$ISBN\""
else
    echo ""
    echo "✗ Failed to add/update note"
    exit 1
fi
