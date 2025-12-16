#!/bin/bash

# Test script for the new secure two-party OTP verification system

API_BASE="http://localhost:3000"

echo "=== Testing Secure Two-Party OTP Verification Flow ==="
echo ""

# Test 1: Create a sample transaction (replace with actual valid IDs)
echo "1. Creating a transaction..."
TRANSACTION_RESPONSE=$(curl -s -X POST "$API_BASE/transaksiPenjualan" \
  -H "Content-Type: application/json" \
  -d '{
    "penjualType": "PETERNAK",
    "penjualId": "your-peternak-id",
    "pembeliType": "PASAR_HEWAN", 
    "pembeliId": "your-pasar-hewan-id",
    "sapiId": "your-sapi-id",
    "jumlahQty": 1,
    "type": "JUAL_BELI"
  }')

TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.data.id')
echo "Transaction created: $TRANSACTION_ID"
echo ""

# Test 2: Seller (PETERNAK) requests verification
echo "2. Seller (PETERNAK) requests verification..."
VERIFICATION_RESPONSE=$(curl -s -X POST "$API_BASE/transaksiPenjualan/$TRANSACTION_ID/requestVerification" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "your-peternak-id",
    "requesterType": "PETERNAK"
  }')

echo "Verification request response:"
echo $VERIFICATION_RESPONSE | jq
echo ""

# Test 3: Buyer (PASAR_HEWAN) tries to request verification (should fail)
echo "3. Buyer (PASAR_HEWAN) tries to request verification (should fail)..."
BUYER_VERIFICATION_RESPONSE=$(curl -s -X POST "$API_BASE/transaksiPenjualan/$TRANSACTION_ID/requestVerification" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "your-pasar-hewan-id",
    "requesterType": "PASAR_HEWAN"
  }')

echo "Buyer verification request response (should fail):"
echo $BUYER_VERIFICATION_RESPONSE | jq
echo ""

# Test 4: Buyer tries to verify before seller (should fail)
echo "4. Buyer tries to verify before seller (should fail)..."
BUYER_VERIFY_EARLY=$(curl -s -X POST "$API_BASE/transaksiPenjualan/$TRANSACTION_ID/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "123456",
    "verifierRole": "buyer"
  }')

echo "Buyer early verification response (should fail):"
echo $BUYER_VERIFY_EARLY | jq
echo ""

# Test 5: Seller verifies first (with OTP from email)
echo "5. Seller verifies first..."
echo "Enter the OTP from email: "
read OTP_CODE

SELLER_VERIFY=$(curl -s -X POST "$API_BASE/transaksiPenjualan/$TRANSACTION_ID/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"verificationCode\": \"$OTP_CODE\",
    \"verifierRole\": \"seller\"
  }")

echo "Seller verification response:"
echo $SELLER_VERIFY | jq
echo ""

# Test 6: Buyer verifies after seller
echo "6. Buyer verifies after seller..."
BUYER_VERIFY=$(curl -s -X POST "$API_BASE/transaksiPenjualan/$TRANSACTION_ID/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"verificationCode\": \"$OTP_CODE\",
    \"verifierRole\": \"buyer\"
  }")

echo "Buyer verification response:"
echo $BUYER_VERIFY | jq
echo ""

# Test 7: Check final transaction status
echo "7. Checking final transaction status..."
FINAL_STATUS=$(curl -s -X GET "$API_BASE/transaksiPenjualan/$TRANSACTION_ID")

echo "Final transaction status:"
echo $FINAL_STATUS | jq
echo ""

echo "=== Test completed ==="
echo ""
echo "Expected flow:"
echo "1. Only seller can initiate verification"
echo "2. Buyer cannot initiate verification"
echo "3. Buyer cannot verify before seller"
echo "4. Seller must verify first"
echo "5. Buyer can only verify after seller"
echo "6. Transaction is marked as VERIFIED only after both verify"
