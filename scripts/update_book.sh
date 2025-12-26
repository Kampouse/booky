#!/bin/bash

# Booky - Update Book Convenience Script
# Usage: ./update_book.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-your-account.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-your-account.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Update an existing book in your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or your-account.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or your-account.testnet)
    -i, --isbn <isbn>              Book ISBN to update (required)
    -t, --title <title>            Updated book title
    -u, --author <author>          Updated author name
    -d, --date <date>              Updated acquisition date (YYYY-MM-DD)
    -c, --condition <condition>    Updated book condition
    -m, --comments <comments>      Updated personal comments/reviews
    -h, --hash <hash>              Updated media hash (IPFS/Arweave)
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # Update only title and comments
    $0 -i "978-0451524935" -t "1984: 75th Anniversary Edition" -m "New introduction added"

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935" -c "Fair"

NOTES:
    - ISBN cannot be changed (it's the book's unique identifier)
    - Only provide fields you want to update
    - Existing values will be preserved for unmodified fields

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

# Interactive mode if ISBN not provided
if [[ -z "$ISBN" ]]; then
    echo "=== Booky - Update Book (Interactive Mode) ==="
    echo ""
    echo "Contract ID: $CONTRACT_ID"
    echo "Account ID: $ACCOUNT_ID"
    echo ""

    read -p "ISBN of book to update: " ISBN
    if [[ -z "$ISBN" ]]; then
        echo "Error: ISBN is required"
        exit 1
    fi

    # Fetch current book details
    echo ""
    echo "Fetching current book details..."
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

    echo ""
    echo "Current Book Details:"
    echo "---------------------"
    if command -v jq &> /dev/null; then
        echo "$CURRENT_BOOK" | jq -r '
            "ISBN: \(.isbn)",
            "Title: \(.title)",
            "Author: \(.author)",
            "Acquisition Date: \(.acquisition_date)",
            "Condition: \(.condition)",
            "Personal Comments: \(.personal_comments // "None")",
            "Media Hash: \(.media_hash // "None")"
        '
    else
        echo "$CURRENT_BOOK" | python3 -m json.tool 2>/dev/null || echo "$CURRENT_BOOK"
    fi

    echo ""
    echo "Enter new values (press Enter to keep current value):"
    echo ""

    read -p "Title [keep current]: " input_title
    TITLE=$input_title

    read -p "Author [keep current]: " input_author
    AUTHOR=$input_author

    read -p "Acquisition Date (YYYY-MM-DD) [keep current]: " input_date
    DATE=$input_date

    read -p "Condition [keep current]: " input_condition
    CONDITION=$input_condition

    read -p "Personal Comments [keep current]: " input_comments
    COMMENTS=$input_comments

    read -p "Media Hash (IPFS/Arweave, enter 'none' to clear) [keep current]: " input_hash
    if [[ "$input_hash" == "none" ]]; then
        MEDIA_HASH="null"
    elif [[ -n "$input_hash" ]]; then
        MEDIA_HASH="$input_hash"
    fi

    # Extract current values if not provided
    if command -v jq &> /dev/null; then
        [[ -z "$TITLE" ]] && TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')
        [[ -z "$AUTHOR" ]] && AUTHOR=$(echo "$CURRENT_BOOK" | jq -r '.author')
        [[ -z "$DATE" ]] && DATE=$(echo "$CURRENT_BOOK" | jq -r '.acquisition_date')
        [[ -z "$CONDITION" ]] && CONDITION=$(echo "$CURRENT_BOOK" | jq -r '.condition')
        [[ -z "$COMMENTS" ]] && COMMENTS=$(echo "$CURRENT_BOOK" | jq -r '.personal_comments')
        if [[ -z "$MEDIA_HASH" || "$MEDIA_HASH" == "null" ]]; then
            MEDIA_HASH=$(echo "$CURRENT_BOOK" | jq -c '.media_hash')
        fi
    fi
fi

# Validate ISBN
if [[ -z "$ISBN" ]]; then
    echo "Error: ISBN is required"
    exit 1
fi

# Validate date format if provided
if [[ -n "$DATE" ]] && ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Error: Date must be in YYYY-MM-DD format"
    exit 1
fi

# In non-interactive mode, we need to fetch the current book first
if [[ -z "$TITLE" || -z "$AUTHOR" || -z "$DATE" || -z "$CONDITION" || -z "$COMMENTS" ]]; then
    echo "Fetching current book details..."
    CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)

    if echo "$CURRENT_BOOK" | grep -q "null"; then
        echo "✗ Book not found in your library"
        exit 1
    fi

    if command -v jq &> /dev/null; then
        [[ -z "$TITLE" ]] && TITLE=$(echo "$CURRENT_BOOK" | jq -r '.title')
        [[ -z "$AUTHOR" ]] && AUTHOR=$(echo "$CURRENT_BOOK" | jq -r '.author')
        [[ -z "$DATE" ]] && DATE=$(echo "$CURRENT_BOOK" | jq -r '.acquisition_date')
        [[ -z "$CONDITION" ]] && CONDITION=$(echo "$CURRENT_BOOK" | jq -r '.condition')
        [[ -z "$COMMENTS" ]] && COMMENTS=$(echo "$CURRENT_BOOK" | jq -r '.personal_comments')
        if [[ -z "$MEDIA_HASH" ]]; then
            MEDIA_HASH=$(echo "$CURRENT_BOOK" | jq -c '.media_hash')
        fi
    else
        echo "Error: jq is required for partial updates. Please install jq or provide all fields."
        exit 1
    fi
fi

# Handle media_hash - convert to JSON null if needed
if [[ "$MEDIA_HASH" == "null" || "$MEDIA_HASH" == "None" ]]; then
    MEDIA_JSON=null
elif [[ -n "$MEDIA_HASH" ]]; then
    MEDIA_JSON="\"$MEDIA_HASH\""
else
    MEDIA_JSON=null
fi

# Handle comments - provide empty string if null
if [[ "$COMMENTS" == "null" ]]; then
    COMMENTS_JSON=""
else
    COMMENTS_JSON="$COMMENTS"
fi

# Construct JSON payload
JSON="{\"updated_book\":{\"isbn\":\"$ISBN\",\"title\":\"$TITLE\",\"author\":\"$AUTHOR\",\"acquisition_date\":\"$DATE\",\"condition\":\"$CONDITION\",\"personal_comments\":\"$COMMENTS_JSON\",\"media_hash\":$MEDIA_JSON}}"

echo ""
echo "=== Updating Book ==="
echo "ISBN: $ISBN"
echo "Title: $TITLE"
echo "Author: $AUTHOR"
echo "Date: $DATE"
echo "Condition: $CONDITION"
echo "Comments: ${COMMENTS_JSON:-<none>}"
echo "Media Hash: ${MEDIA_HASH:-<none>}"
echo ""

# Confirm before proceeding
read -p "Update this book? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Call the contract
echo "Calling contract..."
near call "$CONTRACT_ID" update_book "{\"isbn\":\"$ISBN\",\"updated_book\":$JSON}" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Book updated successfully!"
    echo ""
    echo "View updated book:"
    echo "  ./view_library.sh -i \"$ISBN\""
    echo ""
    echo "View entire library:"
    echo "  ./view_library.sh"
else
    echo ""
    echo "✗ Failed to update book"
    exit 1
fi
