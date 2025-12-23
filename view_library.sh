#!/bin/bash

# Booky - View Library Convenience Script
# Usage: ./view_library.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-quixotic-hour.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-quixotic-hour.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

View books from your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or quixotic-hour.testnet)
    -a, --account-id <account>     Account ID whose library to view (default: \$ACCOUNT_ID or quixotic-hour.testnet)
    -i, --isbn <isbn>              View specific book by ISBN
    -j, --json                    Output raw JSON (default: formatted)
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # View entire library (formatted)
    $0 -a alice.near

    # View specific book
    $0 -i "978-0451524935"

    # View entire library (raw JSON)
    $0 -a alice.near --json

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0

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

# Interactive mode if no account ID provided
if [[ -z "$ACCOUNT_ID" ]]; then
    echo "=== Booky - View Library (Interactive Mode) ==="
    echo ""
    read -p "Contract ID [$CONTRACT_ID]: " input_contract
    CONTRACT_ID=${input_contract:-$CONTRACT_ID}

    read -p "Account ID to view [$ACCOUNT_ID]: " input_account
    ACCOUNT_ID=${input_account:-$ACCOUNT_ID}

    read -p "View specific ISBN (leave empty for all books): " input_isbn
    ISBN=$input_isbn

    read -p "Output raw JSON? (y/n) [n]: " input_json
    if [[ $input_json =~ ^[Yy]$ ]]; then
        OUTPUT_JSON=true
    fi
fi

# View specific book by ISBN
if [[ -n "$ISBN" ]]; then
    echo "=== Viewing Book: $ISBN ==="
    echo "Account: $ACCOUNT_ID"
    echo "Contract: $CONTRACT_ID"
    echo ""

    RESULT=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>/dev/null)

    if [[ $OUTPUT_JSON == true ]]; then
        echo "$RESULT"
    else
        # Check if book exists
        if echo "$RESULT" | grep -q "null"; then
            echo "✗ Book not found in library"
            echo ""
            echo "View your library:"
            echo "  ./view_library.sh"
            exit 1
        fi

        # Parse and format book details
        echo "Book Details:"
        echo "-------------"

        # Extract fields using JSON parsing (assuming jq or similar is available)
        if command -v jq &> /dev/null; then
            echo "$RESULT" | jq -r '
                "ISBN: \(.isbn)",
                "Title: \(.title)",
                "Author: \(.author)",
                "Acquisition Date: \(.acquisition_date)",
                "Condition: \(.condition)",
                "Personal Comments: \(.personal_comments // "None")",
                "Media Hash: \(.media_hash // "None")",
                "",
                "Reading Status: \(.reading_status)",
                "Current Chapter: \(.current_chapter)",
                "Total Chapters: \(.total_chapters // "N/A")",
                "Chapters Read: \(.chapters_read | length // 0)",
                "Last Position: \(.last_read_position)",
                "Last Read Date: \(.last_read_date // "Never")",
                "Chapter Notes: \(.chapter_notes | length // 0) chapters with notes"
            '
        else
            # Fallback: just pretty-print the JSON
            echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
        fi
    fi
else
    # View entire library
    echo "=== Library for: $ACCOUNT_ID ==="
    echo "Contract: $CONTRACT_ID"
    echo ""

    ERROR=$(near view "$CONTRACT_ID" get_library "{\"account_id\":\"$ACCOUNT_ID\"}" 2>&1)
    
    if [[ -n "$ERROR" ]] && [[ ! "$ERROR" =~ "Result" ]]; then
        echo "❌ Error querying library:"
        echo "$ERROR"
        echo ""
        echo "Contract: $CONTRACT_ID"
        echo "Account: $ACCOUNT_ID"
        exit 1
    fi
    
    RESULT=$(near view "$CONTRACT_ID" get_library "{\"account_id\":\"$ACCOUNT_ID\"}" 2>/dev/null)

    if [[ $OUTPUT_JSON == true ]]; then
        echo "$RESULT"
    else
        # Check if library is empty
        if echo "$RESULT" | grep -q "^\[\]"; then
            echo "📚 Library is empty"
            echo ""
            echo "Add your first book:"
            echo "  ./add_book.sh"
            exit 0
        fi

        # Format library output
        if command -v jq &> /dev/null; then
            BOOK_COUNT=$(echo "$RESULT" | jq 'length' 2>/dev/null || echo "0")
            echo "Total Books: $BOOK_COUNT"
            echo ""
            echo "Book List:"
            echo "---------"
            
            # Simple loop to display each book
            echo "$RESULT" | jq -r '.[] | 
                "Title: \(.title)",
                "Author: \(.author)",
                "ISBN: \(.isbn)",
                "Status: \(.reading_status)",
                "Chapter: \(.current_chapter)/\(.total_chapters // "?")",
                "Notes: \(.chapter_notes | length // 0)",
                ""
            ' 2>/dev/null || echo "Error parsing library"
        else
            # Fallback: pretty-print JSON
            echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
        fi
    fi
fi

echo ""
echo "Quick commands:"
echo "  View specific book:  $0 -i <ISBN>"
echo "  Add new book:        ./add_book.sh"
echo "  Update book:         ./update_book.sh"
echo "  Delete book:         ./delete_book.sh"
echo "  View chapter notes:   ./view_notes.sh -i <ISBN>"
echo "  Get total books:     near view $CONTRACT_ID get_total_books '{}'"
