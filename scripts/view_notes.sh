#!/bin/bash

# Booky - View Chapter Notes Convenience Script
# Usage: ./view_notes.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-quixotic-hour.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-quixotic-hour.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

View chapter notes for a book in your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or quixotic-hour.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or quixotic-hour.testnet)
    -i, --isbn <isbn>              Book ISBN (required)
    -n, --chapter <num>            View specific chapter note (optional, default: show all)
    -j, --json                    Output raw JSON (default: formatted)
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # View all chapter notes for a book
    $0 -i "978-0451524935"

    # View specific chapter note
    $0 -i "978-0451524935" -n 3

    # View all notes as raw JSON
    $0 -i "978-0451524935" --json

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935"

NOTES:
    - Leave -n parameter empty to view all chapter notes
    - Notes are stored permanently on-chain
    - Each chapter can have only one note
    - Use ./add_note.sh to add or update notes

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
        -j|--json)
            OUTPUT_JSON=true
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

# Interactive mode if ISBN not provided
if [[ -z "$ISBN" ]]; then
    echo "=== Booky - View Chapter Notes (Interactive Mode) ==="
    echo ""
    echo "Contract ID: $CONTRACT_ID"
    echo "Account ID: $ACCOUNT_ID"
    echo ""

    read -p "Book ISBN: " input_isbn
    ISBN=$input_isbn

    if [[ -z "$ISBN" ]]; then
        echo "Error: ISBN is required"
        exit 1
    fi

    read -p "Specific chapter number (leave empty for all notes): " input_chapter
    CHAPTER=$input_chapter

    read -p "Output raw JSON? (y/n) [n]: " input_json
    if [[ $input_json =~ ^[Yy]$ ]]; then
        OUTPUT_JSON=true
    fi
fi

# Validate ISBN
if [[ -z "$ISBN" ]]; then
    echo "Error: ISBN is required"
    exit 1
fi

# Validate chapter number if provided
if [[ -n "$CHAPTER" ]]; then
    if ! [[ "$CHAPTER" =~ ^[0-9]+$ ]] || [[ "$CHAPTER" -lt 1 ]]; then
        echo "Error: Chapter number must be a positive integer (>= 1)"
        exit 1
    fi
fi

# Fetch book details to verify it exists
echo "Fetching book details..."
CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)

if echo "$CURRENT_BOOK" | grep -q "null"; then
    echo ""
    echo "✗ Book not found in your library"
    echo ""
    echo "View your library:"
    echo "  ./view_library.sh"
    exit 1
fi

# Extract book title
if command -v jq &> /dev/null; then
    TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')
    TOTAL_CHAPTERS=$(echo "$CURRENT_BOOK" | jq -r '.total_chapters // "Unknown"')
else
    echo "Error: jq is required for formatted output. Please install jq or use --json flag."
    exit 1
fi

# View specific chapter note
if [[ -n "$CHAPTER" ]]; then
    echo ""
    echo "=== Chapter Note for: $TITLE ==="
    echo "ISBN: $ISBN"
    echo "Chapter: $CHAPTER"
    echo ""

    RESULT=$(near view "$CONTRACT_ID" get_chapter_note "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\",\"chapter\":$CHAPTER}" 2>&1)

    if [[ $OUTPUT_JSON == true ]]; then
        echo "$RESULT"
    else
        # Check if note exists
        if echo "$RESULT" | grep -q "null"; then
            echo "No note found for chapter $CHAPTER"
            echo ""
            echo "Add a note:"
            echo "  ./add_note.sh -i \"$ISBN\" -n $CHAPTER -m \"Your note here\""
        else
            echo "Note:"
            echo "-----"
            echo "$RESULT" | jq -r '.'
            echo ""
            echo "Update this note:"
            echo "  ./add_note.sh -i \"$ISBN\" -n $CHAPTER -m \"Updated note\""
            echo ""
            echo "Delete this note:"
            echo "  ./delete_note.sh -i \"$ISBN\" -n $CHAPTER"
        fi
    fi
else
    # View all chapter notes
    echo ""
    echo "=== All Chapter Notes for: $TITLE ==="
    echo "ISBN: $ISBN"
    echo "Total Chapters: $TOTAL_CHAPTERS"
    echo ""

    RESULT=$(near view "$CONTRACT_ID" get_all_chapter_notes "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)

    if [[ $OUTPUT_JSON == true ]]; then
        echo "$RESULT"
    else
        # Check if book has any notes
        NOTE_COUNT=$(echo "$RESULT" | jq 'length')

        if [[ "$NOTE_COUNT" -eq 0 ]]; then
            echo "No chapter notes found for this book"
            echo ""
            echo "Add your first note:"
            echo "  ./add_note.sh -i \"$ISBN\" -n 1 -m \"Your note for chapter 1\""
            exit 0
        fi

        echo "Total notes: $NOTE_COUNT"
        echo ""
        echo "Notes:"
        echo "------"

        # Display each note with chapter number
        echo "$RESULT" | jq -r 'to_entries[] | "
Chapter \(.key):
\(.value | gsub("^[[:space:]]+"; ""; gsub("[[:space:]]+$"; "")) |
  # Format multi-line notes with indentation
  split("\n") |
  map("  " + .) |
  join("\n")
"
' | head -n -2

        echo ""
        echo ""
        echo "Quick commands:"
        echo "  View specific chapter:  ./view_notes.sh -i \"$ISBN\" -n <chapter>"
        echo "  Add a new note:         ./add_note.sh -i \"$ISBN\" -n <chapter> -m \"note\""
        echo "  Update a note:         ./add_note.sh -i \"$ISBN\" -n <chapter> -m \"new note\""
        echo "  Delete a note:          ./delete_note.sh -i \"$ISBN\" -n <chapter>"
    fi
fi

echo ""
echo "Other quick commands:"
echo "  View book details:      ./view_library.sh -i \"$ISBN\""
echo "  Update reading progress: ./update_progress.sh -i \"$ISBN\""
echo "  View library:           ./view_library.sh"
