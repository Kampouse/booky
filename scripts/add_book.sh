#!/bin/bash

# Booky - Add Book Convenience Script
# Usage: ./add_book.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-quixotic-hour.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-quixotic-hour.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Add a book to your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or quixotic-hour.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or quixotic-hour.testnet)
    -i, --isbn <isbn>              Book ISBN (required)
    -t, --title <title>            Book title (required)
    -u, --author <author>          Author name (required)
    -d, --date <date>              Acquisition date (YYYY-MM-DD, required)
    -c, --condition <condition>    Book condition (default: "Good")
    -m, --comments <comments>      Personal comments/reviews
    -h, --hash <hash>              Media hash (IPFS/Arweave, optional)
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # Command line mode
    $0 -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15" -m "Still relevant today"

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935" -t "1984" -u "George Orwell" -d "2024-01-15"

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
        -t|--title)
            TITLE="$2"
            shift 2
            ;;
        -u|--author)
            AUTHOR="$2"
            shift 2
            ;;
        -d|--date)
            DATE="$2"
            shift 2
            ;;
        -c|--condition)
            CONDITION="$2"
            shift 2
            ;;
        -m|--comments)
            COMMENTS="$2"
            shift 2
            ;;
        -h|--hash)
            MEDIA_HASH="$2"
            shift 2
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Default values
CONDITION="${CONDITION:-Good}"

# Interactive mode if required fields are missing
if [[ -z "$ISBN" || -z "$TITLE" || -z "$AUTHOR" || -z "$DATE" ]]; then
    echo "=== Booky - Add Book (Interactive Mode) ==="
    echo ""
    echo "Contract ID: $CONTRACT_ID"
    echo "Account ID: $ACCOUNT_ID"
    echo ""

    read -p "ISBN: " ISBN
    read -p "Title: " TITLE
    read -p "Author: " AUTHOR
    read -p "Acquisition Date (YYYY-MM-DD): " DATE
    read -p "Condition [Good]: " CONDITION
    CONDITION=${CONDITION:-Good}
    read -p "Personal Comments: " COMMENTS
    read -p "Media Hash (IPFS/Arweave, optional): " MEDIA_HASH
fi

# Validate required fields
if [[ -z "$ISBN" || -z "$TITLE" || -z "$AUTHOR" || -z "$DATE" ]]; then
    echo "Error: ISBN, Title, Author, and Date are required"
    exit 1
fi

# Validate date format
if ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Error: Date must be in YYYY-MM-DD format"
    exit 1
fi

# Construct JSON payload (include all required BookEntry fields)
if [[ -z "$MEDIA_HASH" ]]; then
    JSON="{\"book\":{\"isbn\":\"$ISBN\",\"title\":\"$TITLE\",\"author\":\"$AUTHOR\",\"acquisition_date\":\"$DATE\",\"condition\":\"$CONDITION\",\"personal_comments\":\"$COMMENTS\",\"media_hash\":null,\"reading_status\":\"ToRead\",\"current_chapter\":0,\"total_chapters\":null,\"chapters_read\":[],\"last_read_position\":\"Not started\",\"last_read_date\":null,\"chapter_notes\":{}}}"
else
    JSON="{\"book\":{\"isbn\":\"$ISBN\",\"title\":\"$TITLE\",\"author\":\"$AUTHOR\",\"acquisition_date\":\"$DATE\",\"condition\":\"$CONDITION\",\"personal_comments\":\"$COMMENTS\",\"media_hash\":\"$MEDIA_HASH\",\"reading_status\":\"ToRead\",\"current_chapter\":0,\"total_chapters\":null,\"chapters_read\":[],\"last_read_position\":\"Not started\",\"last_read_date\":null,\"chapter_notes\":{}}}"
fi

echo ""
echo "=== Adding Book ==="
echo "ISBN: $ISBN"
echo "Title: $TITLE"
echo "Author: $AUTHOR"
echo "Date: $DATE"
echo "Condition: $CONDITION"
echo "Comments: ${COMMENTS:-<none>}"
echo "Media Hash: ${MEDIA_HASH:-<none>}"
echo ""

# Confirm before proceeding
read -p "Add this book? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Call the contract
echo "Calling contract..."
near call "$CONTRACT_ID" add_book "$JSON" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Book added successfully!"
    echo ""
    echo "View your library:"
    echo "  near view $CONTRACT_ID get_library '{\"account_id\": \"$ACCOUNT_ID\"}'"
else
    echo ""
    echo "✗ Failed to add book"
    exit 1
fi
