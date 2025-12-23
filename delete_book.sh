#!/bin/bash

# Booky - Delete Book Convenience Script
# Usage: ./delete_book.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-your-account.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-your-account.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Delete a book from your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or your-account.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or your-account.testnet)
    -i, --isbn <isbn>              Book ISBN to delete (required)
    -f, --force                    Skip confirmation prompt
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # Delete with confirmation
    $0 -i "978-0451524935"

    # Delete without confirmation (force)
    $0 -i "978-0451524935" --force

    # With environment variables
    CONTRACT_ID=library.near ACCOUNT_ID=alice.near $0 -i "978-0451524935"

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

# Interactive mode if ISBN not provided
if [[ -z "$ISBN" ]]; then
    echo "=== Booky - Delete Book (Interactive Mode) ==="
    echo ""
    echo "Contract ID: $CONTRACT_ID"
    echo "Account ID: $ACCOUNT_ID"
    echo ""

    read -p "ISBN of book to delete: " ISBN
    if [[ -z "$ISBN" ]]; then
        echo "Error: ISBN is required"
        exit 1
    fi
fi

# Validate ISBN
if [[ -z "$ISBN" ]]; then
    echo "Error: ISBN is required"
    exit 1
fi

# Fetch current book details
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

echo ""
echo "=== Book to Delete ==="
echo "Account: $ACCOUNT_ID"
echo "Contract: $CONTRACT_ID"
echo ""

# Display book details
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
echo "⚠️  WARNING: This action cannot be undone!"
echo "   The book will be permanently removed from your library."
echo ""

# Confirm before proceeding
if [[ "$FORCE" == true ]]; then
    echo "Force delete requested - skipping confirmation..."
else
    read -p "Are you sure you want to delete this book? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo ""
        echo "Cancelled - book not deleted"
        exit 0
    fi
fi

# Call the contract
echo ""
echo "Calling contract..."
near call "$CONTRACT_ID" delete_book "{\"isbn\":\"$ISBN\"}" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Book deleted successfully!"
    echo ""
    echo "View your remaining library:"
    echo "  ./view_library.sh"
else
    echo ""
    echo "✗ Failed to delete book"
    exit 1
fi
