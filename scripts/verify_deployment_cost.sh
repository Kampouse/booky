#!/bin/bash

# Booky - Deployment Cost Verification Script
# This script calculates estimated deployment costs WITHOUT actually deploying

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "==================================="
echo "📊 Deployment Cost Calculator"
echo "==================================="
echo ""

# Check if WASM file exists
WASM_FILE="target/near/booky.wasm"

if [[ ! -f "$WASM_FILE" ]]; then
    echo -e "${RED}❌ Error: WASM file not found at $WASM_FILE${NC}"
    echo ""
    echo "Please build the contract first:"
    echo "  cargo near build non-reproducible-wasm"
    exit 1
fi

# Get WASM file size in bytes and KB
FILE_SIZE_BYTES=$(stat -f%z "$WASM_FILE" 2>/dev/null || stat -c%s "$WASM_FILE" 2>/dev/null)
FILE_SIZE_KB=$(echo "scale=2; $FILE_SIZE_BYTES / 1024" | bc)
FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE_BYTES / 1048576" | bc)

echo -e "${BLUE}📦 Contract Size:${NC}"
echo "  File: $WASM_FILE"
echo "  Size: ${FILE_SIZE_KB} KB (${FILE_SIZE_BYTES} bytes)"
echo ""

# NEAR Pricing Constants (as of December 2024)
# These are approximate and can vary
TGAS_PER_BYTE_STORAGE=0.00000001  # Storage cost per byte
TGAS_PER_BYTE_DEPLOY=0.00000002   # Deployment cost per byte
BASE_DEPLOYMENT_TGAS=150000000000   # Base deployment transaction cost
GAS_PRICE_YOCTO=1000000000         # Gas price in yoctoNEAR per TGas
NEAR_PRICE_USD=1.0                  # NEAR price in USD (approximate)

# Calculate costs
STORAGE_TGAS=$(echo "$FILE_SIZE_BYTES * $TGAS_PER_BYTE_STORAGE * 1000000000000" | bc)
DEPLOYMENT_TGAS=$(echo "$BASE_DEPLOYMENT_TGAS + ($FILE_SIZE_BYTES * $TGAS_PER_BYTE_DEPLOY * 1000000000000)" | bc)
TOTAL_TGAS=$(echo "$STORAGE_TGAS + $DEPLOYMENT_TGAS" | bc)

# Convert to NEAR tokens
STORAGE_NEAR=$(echo "scale=10; $STORAGE_TGAS * $GAS_PRICE_YOCTO / 1000000000000000000000000" | bc)
DEPLOYMENT_NEAR=$(echo "scale=10; $DEPLOYMENT_TGAS * $GAS_PRICE_YOCTO / 1000000000000000000000000" | bc)
TOTAL_NEAR=$(echo "scale=10; $TOTAL_TGAS * $GAS_PRICE_YOCTO / 1000000000000000000000000" | bc)

# Convert to USD
STORAGE_USD=$(echo "scale=4; $STORAGE_NEAR * $NEAR_PRICE_USD" | bc)
DEPLOYMENT_USD=$(echo "scale=4; $DEPLOYMENT_NEAR * $NEAR_PRICE_USD" | bc)
TOTAL_USD=$(echo "scale=4; $TOTAL_NEAR * $NEAR_PRICE_USD" | bc)

echo -e "${BLUE}💰 Cost Breakdown:${NC}"
echo ""
echo "1. Storage Cost (one-time):"
echo "   - Gas: $(printf "%.2f" $STORAGE_TGAS) TGas"
echo "   - NEAR: $(printf "%.10f" $STORAGE_NEAR) NEAR"
echo "   - USD:  \$$(printf "%.6f" $STORAGE_USD)"
echo ""

echo "2. Deployment Transaction Cost (one-time):"
echo "   - Gas: $(printf "%.2f" $DEPLOYMENT_TGAS) TGas"
echo "   - NEAR: $(printf "%.10f" $DEPLOYMENT_NEAR) NEAR"
echo "   - USD:  \$$(printf "%.6f" $DEPLOYMENT_USD)"
echo ""

echo -e "${GREEN}3. Total Deployment Cost (one-time):${NC}"
echo "   - Gas: $(printf "%.2f" $TOTAL_TGAS) TGas"
echo "   - NEAR: $(printf "%.10f" $TOTAL_NEAR) NEAR"
echo "   - USD:  \$$(printf "%.6f" $TOTAL_USD)"
echo ""

echo "==================================="
echo "📊 Estimated Deployment Costs"
echo "==================================="
echo ""
echo -e "${GREEN}✅ Total One-Time Cost:${NC}"
echo "   NEAR:  $(printf "%.8f" $TOTAL_NEAR) NEAR"
echo "   USD:   \$$(printf "%.6f" $TOTAL_USD)"
echo ""

echo -e "${BLUE}ℹ️  Note: This is a ONE-TIME cost.${NC}"
echo "   Once deployed, your data lives forever at no additional cost."
echo ""

# Calculate operational costs
echo "==================================="
echo "💸 Ongoing Operational Costs"
echo "==================================="
echo ""

OPERATIONS=(
    "Add Book"
    "Update Book"
    "Delete Book"
    "Add/Update Chapter Note"
    "Delete Chapter Note"
    "Update Reading Progress"
    "Mark Completed"
    "Start Reading"
    "View Book (Free)"
    "View Notes (Free)"
)

OPERATION_COSTS=(
    "0.00005"
    "0.00004"
    "0.00003"
    "0.00010"
    "0.00010"
    "0.00005"
    "0.00003"
    "0.00004"
    "0.00000"
    "0.00000"
)

echo "Per-operation costs (NEAR):"
echo ""
TOTAL_OP_COST=0
for i in "${!OPERATIONS[@]}"; do
    OP_COST=${OPERATION_COSTS[$i]}
    TOTAL_OP_COST=$(echo "$TOTAL_OP_COST + $OP_COST" | bc)

    if [[ "$OP_COST" == "0.00000" ]]; then
        echo -e "${GREEN}  ${OPERATIONS[$i]}:    FREE${NC}"
    else
        printf "  %-30s  %.8f NEAR (≈\$%.6f)\n" "${OPERATIONS[$i]}" "$OP_COST" "$(echo "$OP_COST * $NEAR_PRICE_USD" | bc)"
    fi
done

echo ""
echo -e "${YELLOW}💡 Operational Cost Examples:${NC}"
echo ""
echo "1. Add 100 books:"
echo "   Cost: $(printf "%.8f" $(echo "100 * 0.00005" | bc)) NEAR (≈\$$(printf "%.6f" $(echo "100 * 0.00005 * $NEAR_PRICE_USD" | bc)))"
echo ""

echo "2. 1,000 books with 10 chapter notes each:"
echo "   Books: $(printf "%.8f" $(echo "1000 * 0.00005" | bc)) NEAR"
echo "   Notes: $(printf "%.8f" $(echo "10000 * 0.00010" | bc)) NEAR"
echo "   Total: $(printf "%.8f" $(echo "1000 * 0.00005 + 10000 * 0.00010" | bc)) NEAR (≈\$$(printf "%.6f" $(echo "(1000 * 0.00005 + 10000 * 0.00010) * $NEAR_PRICE_USD" | bc)))"
echo ""

echo "3. Daily reading (1 book, 1 chapter note):"
echo "   Cost: $(printf "%.8f" $(echo "0.00005 + 0.00010" | bc)) NEAR/day"
echo "   Monthly: $(printf "%.8f" $(echo "(0.00005 + 0.00010) * 30" | bc)) NEAR/month (≈\$$(printf "%.6f" $(echo "(0.00005 + 0.00010) * 30 * $NEAR_PRICE_USD" | bc)))"
echo ""

echo "==================================="
echo "📈 Total Cost Projection"
echo "==================================="
echo ""
echo "Scenario: 1,000 books, 10 notes each"
echo ""

DEPLOYMENT_COST=$(printf "%.8f" $TOTAL_NEAR)
OPERATIONAL_COST=$(printf "%.8f" $(echo "1000 * 0.00005 + 10000 * 0.00010" | bc))
TOTAL_PROJECTED=$(echo "$DEPLOYMENT_COST + $OPERATIONAL_COST" | bc)

echo "  Deployment (one-time):      $(printf "%.8f" $DEPLOYMENT_COST) NEAR"
echo "  Books (1,000 x 0.00005):  $(printf "%.8f" $(echo "1000 * 0.00005" | bc)) NEAR"
echo "  Notes (10,000 x 0.00010):  $(printf "%.8f" $(echo "10000 * 0.00010" | bc)) NEAR"
echo "  ───────────────────────────────────────"
echo -e "${GREEN}  TOTAL:                     $(printf "%.8f" $TOTAL_PROJECTED) NEAR (≈\$$(printf "%.6f" $(echo "$TOTAL_PROJECTED * $NEAR_PRICE_USD" | bc)))${NC}"
echo ""

echo -e "${BLUE}💡 Comparison to Alternatives:${NC}"
echo ""
echo "  Centralized Database (monthly):       ~\$5-20"
echo "  IPFS Pinning (monthly):             ~\$2-5"
echo "  NEAR Booky (one-time 1,000 books):  ≈\$$(printf "%.6f" $(echo "$TOTAL_PROJECTED * $NEAR_PRICE_USD" | bc))"
echo "  ───────────────────────────────────────"
echo -e "${GREEN}  Savings (1 year):                  ~\$50-230${NC}"
echo ""

echo "==================================="
echo "⚠️  Important Notes"
echo "==================================="
echo ""
echo "1. These are ESTIMATES. Actual costs may vary slightly due to:"
echo "   - Network congestion"
echo "   - NEAR gas price fluctuations"
echo "   - Account state complexity"
echo ""

echo "2. NEAR pricing is transparent and low-cost:"
echo "   - Deployment: ~\$0.03-0.05 one-time"
echo "   - Storage: ~\$0.005-0.01 (for this contract size)"
echo "   - Operations: ~\$0.0001 per action"
echo ""

echo "3. To deploy (after verifying costs):"
echo "   # Testnet:"
echo "   near deploy --accountId your-account.testnet --wasmFile $WASM_FILE"
echo ""
echo "   # Mainnet:"
echo "   near deploy --accountId your-account.near --wasmFile $WASM_FILE"
echo ""

echo "4. Minimum balance required:"
MIN_BALANCE=$(echo "$TOTAL_NEAR + 0.1" | bc)
echo "   Testnet: 0.1 NEAR (free from faucet)"
echo "   Mainnet: $(printf "%.4f" $MIN_BALANCE) NEAR (≈\$$(printf "%.4f" $(echo "$MIN_BALANCE * $NEAR_PRICE_USD" | bc)))"
echo ""

echo -e "${GREEN}✅ Verification Complete!${NC}"
echo ""
echo "Your contract is ready to deploy."
echo "Total one-time cost: $(printf "%.8f" $TOTAL_NEAR) NEAR (≈\$$(printf "%.6f" $TOTAL_USD))"
echo ""

echo "Ready to deploy? Run:"
echo -e "${YELLOW}  near deploy --accountId your-account.testnet --wasmFile $WASM_FILE${NC}"
