#!/bin/bash

# Booky - Update Reading Progress Convenience Script
# Usage: ./update_progress.sh [options] or interactive mode

set -e

# Default values
CONTRACT_ID="${CONTRACT_ID:-quixotic-hour.testnet}"
ACCOUNT_ID="${ACCOUNT_ID:-quixotic-hour.testnet}"

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Update reading progress for a book in your NEAR book library.

OPTIONS:
    -c, --contract-id <account>    Contract account ID (default: \$CONTRACT_ID or your-account.testnet)
    -a, --account-id <account>     Your account ID (default: \$ACCOUNT_ID or your-account.testnet)
    -i, --isbn <isbn>              Book ISBN to update (required)
    -p, --chapter <num>            Current chapter number
    -x, --completed <num,num,...>  Comma-separated list of chapters completed
    -l, --position <pos>           Last read position (e.g., "page 45", "23%", "chapter 3 paragraph 2")
    -d, --date <date>              Last read date (YYYY-MM-DD)
    -s, --status <status>          Reading status: ToRead, Reading, Completed, OnHold, Abandoned
    -h, --help                     Show this help message

EXAMPLES:
    # Interactive mode
    $0

    # Update current chapter to 5
    $0 -i "978-0451524935" -p 5

    # Mark chapters 1, 2, 3 as completed and update position
    $0 -i "978-0451524935" -x "1,2,3" -l "page 78"

    # Change reading status to Reading with current chapter
    $0 -i "978-0451524935" -s "Reading" -p 1

    # Complete update: chapter, completed chapters, position, date, status
    $0 -i "978-0451524935" -p 7 -x "1,2,3,4,5,6" -l "page 112" -d "2024-12-22" -s "Reading"

    # Mark book as completed
    $0 -i "978-0451524935" -s "Completed"

NOTES:
    - All parameters except ISBN are optional
    - Only provide the fields you want to update
    - Use -x to mark multiple chapters as completed at once
    - Status values: ToRead, Reading, Completed, OnHold, Abandoned

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
        -p|--chapter)
            CHAPTER="$2"
            shift 2
            ;;
        -x|--completed)
            COMPLETED="$2"
            shift 2
            ;;
        -l|--position)
            POSITION="$2"
            shift 2
            ;;
        -d|--date)
            DATE="$2"
            shift 2
            ;;
        -s|--status)
            STATUS="$2"
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

# Interactive mode if ISBN not provided
if [[ -z "$ISBN" ]]; then
    echo "=== Booky - Update Reading Progress (Interactive Mode) ==="
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
            "Status: \(.reading_status)",
            "Current Chapter: \(.current_chapter)",
            "Total Chapters: \(.total_chapters // "N/A")",
            "Chapters Read: \(.chapters_read | length)",
            "Last Position: \(.last_read_position)",
            "Last Read Date: \(.last_read_date // "Never")"
        '
    else
        echo "$CURRENT_BOOK" | python3 -m json.tool 2>/dev/null || echo "$CURRENT_BOOK"
    fi

    echo ""
    echo "Enter new values (press Enter to keep current value):"
    echo ""

    read -p "Current chapter number [keep current]: " input_chapter
    CHAPTER=$input_chapter

    read -p "Chapters completed (comma-separated, e.g., 1,2,3) [keep current]: " input_completed
    COMPLETED=$input_completed

    read -p "Last read position (e.g., 'page 45') [keep current]: " input_position
    POSITION=$input_position

    read -p "Last read date (YYYY-MM-DD, leave empty for today) [keep current]: " input_date
    if [[ -z "$input_date" ]]; then
        DATE=$(date +%Y-%m-%d)
    else
        DATE=$input_date
    fi

    echo ""
    echo "Reading status options:"
    echo "  1) ToRead"
    echo "  2) Reading"
    echo "  3) Completed"
    echo "  4) OnHold"
    echo "  5) Abandoned"
    echo ""
    read -p "Select status [1-5, leave empty to keep current]: " input_status
    case "$input_status" in
        1) STATUS="ToRead" ;;
        2) STATUS="Reading" ;;
        3) STATUS="Completed" ;;
        4) STATUS="OnHold" ;;
        5) STATUS="Abandoned" ;;
        *) STATUS="" ;;
    esac
fi

# Validate ISBN
if [[ -z "$ISBN" ]]; then
    echo "Error: ISBN is required"
    exit 1
fi

# Validate chapter number if provided
if [[ -n "$CHAPTER" ]]; then
    if ! [[ "$CHAPTER" =~ ^[0-9]+$ ]]; then
        echo "Error: Chapter number must be a positive integer"
        exit 1
    fi
fi

# Validate date format if provided
if [[ -n "$DATE" ]] && ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Error: Date must be in YYYY-MM-DD format"
    exit 1
fi

# Validate status if provided
if [[ -n "$STATUS" ]]; then
    case "$STATUS" in
        ToRead|Reading|Completed|OnHold|Abandoned)
            # Valid status
            ;;
        *)
            echo "Error: Invalid status. Must be: ToRead, Reading, Completed, OnHold, or Abandoned"
            exit 1
            ;;
    esac
fi

# Fetch current book in non-interactive mode if needed
if [[ -z "$CHAPTER" || -z "$STATUS" ]] && [[ -z "$CURRENT_BOOK" ]]; then
    echo "Fetching current book details..."
    CURRENT_BOOK=$(near view "$CONTRACT_ID" get_book "{\"account_id\":\"$ACCOUNT_ID\",\"isbn\":\"$ISBN\"}" 2>&1)
fi

# Parse current values if not provided
if command -v jq &> /dev/null; then
    [[ -z "$CHAPTER" ]] && CHAPTER=$(echo "$CURRENT_BOOK" | jq -r '.current_chapter // 0')
    [[ -z "$STATUS" ]] && STATUS=$(echo "$CURRENT_BOOK" | jq -r '.reading_status')
else
    echo "Error: jq is required for partial updates. Please install jq or provide all fields."
    exit 1
fi

# Build chapters_completed array
CHAPTERS_JSON="[]"
if [[ -n "$COMPLETED" ]]; then
    # Split comma-separated values into JSON array
    CHAPTERS_JSON="["
    IFS=',' read -ra CHAPTER_ARRAY <<< "$COMPLETED"
    FIRST=true
    for chapter in "${CHAPTER_ARRAY[@]}"; do
        if [[ -n "$chapter" ]] && [[ "$chapter" =~ ^[0-9]+$ ]]; then
            if [[ "$FIRST" == true ]]; then
                CHAPTERS_JSON+="$chapter"
                FIRST=false
            else
                CHAPTERS_JSON+=",$chapter"
            fi
        fi
    done
    CHAPTERS_JSON+="]"
fi

# Build the progress JSON
# Handle optional fields
if [[ -n "$CHAPTER" ]] && [[ "$CHAPTER" != "0" ]]; then
    CHAPTER_JSON="\"current_chapter\":$CHAPTER,"
else
    CHAPTER_JSON=""
fi

if [[ -n "$DATE" ]]; then
    DATE_JSON="\"last_read_date\":\"$DATE\","
else
    DATE_JSON=""
fi

if [[ -n "$POSITION" ]]; then
    POSITION_JSON="\"last_read_position\":\"$POSITION\","
else
    POSITION_JSON=""
fi

if [[ -n "$STATUS" ]]; then
    STATUS_JSON="\"reading_status\":\"$STATUS\","
else
    STATUS_JSON=""
fi

if [[ "$CHAPTERS_JSON" != "[]" ]]; then
    COMPLETED_JSON="\"chapters_completed\":$CHAPTERS_JSON,"
else
    COMPLETED_JSON=""
fi

# Construct final JSON (remove trailing comma)
JSON="{${CHAPTER_JSON}${COMPLETED_JSON}${POSITION_JSON}${DATE_JSON}${STATUS_JSON}}"
JSON=$(echo "$JSON" | sed 's/,$//')

echo ""
echo "=== Updating Reading Progress ==="
echo "ISBN: $ISBN"
[[ -n "$CHAPTER" ]] && echo "Current Chapter: $CHAPTER"
[[ -n "$COMPLETED" ]] && echo "Chapters Completed: $COMPLETED"
[[ -n "$POSITION" ]] && echo "Last Read Position: $POSITION"
[[ -n "$DATE" ]] && echo "Last Read Date: $DATE"
[[ -n "$STATUS" ]] && echo "Reading Status: $STATUS"
echo ""

# Confirm before proceeding
read -p "Update reading progress? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Call the contract
echo "Calling contract..."
near call "$CONTRACT_ID" update_reading_progress "{\"isbn\":\"$ISBN\",\"progress\":$JSON}" --accountId "$ACCOUNT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Reading progress updated successfully!"
    echo ""
    echo "Quick commands:"
    echo "  View updated book:    ./view_library.sh -i \"$ISBN\""
    echo "  View currently reading: ./view_library.sh -a $ACCOUNT_ID | grep -i 'reading'"
    echo "  Mark as completed:    ./mark_completed.sh -i \"$ISBN\""
    echo "  Start reading:       ./start_reading.sh -i \"$ISBN\""
else
    echo ""
    echo "✗ Failed to update reading progress"
    exit 1
fi
