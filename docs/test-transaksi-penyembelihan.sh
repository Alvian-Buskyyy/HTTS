#!/bin/bash

# Script untuk testing API Transaksi Penyembelihan
# Pastikan backend sudah running di port 5000

BASE_URL="http://localhost:5000/api"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing API Transaksi Penyembelihan ===${NC}"

# Anda perlu mengganti TOKEN, JAGAL_ID, RPH_ID, SAPI_ID, dll dengan data yang sesuai
TOKEN="your_jwt_token_here"
JAGAL_ID="your_jagal_id"
RPH_ID="your_rph_id"  
SAPI_ID="your_sapi_id"
REGULATOR_ID="your_regulator_id"

# Header dengan authentication
AUTH_HEADER="Authorization: Bearer $TOKEN"

echo -e "\n${YELLOW}1. Testing Jagal - Melihat sapi milik jagal${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/jagal/sapi" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}2. Testing Jagal - Melihat daftar RPH${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/jagal/rph" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}3. Testing Jagal - Mendaftarkan sapi untuk penyembelihan${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transaksi-penyembelihan/jagal/daftarkan" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"sapiId\": \"$SAPI_ID\",
    \"rphId\": \"$RPH_ID\"
  }")

echo $RESPONSE | jq '.'
TRANSAKSI_ID=$(echo $RESPONSE | jq -r '.data.id')
echo -e "${GREEN}Transaksi ID: $TRANSAKSI_ID${NC}"

echo -e "\n${YELLOW}4. Testing RPH - Melihat sapi pending${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/rph/sapi-pending" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}5. Testing RPH - Memproses penyembelihan${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/transaksi-penyembelihan/rph/proses-penyembelihan" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"transaksiId\": \"$TRANSAKSI_ID\",
    \"beratDaging\": 250.5,
    \"beratJeroan\": 45.2,
    \"beratTulang\": 80.3
  }")

echo $RESPONSE | jq '.'
DAGING_ID=$(echo $RESPONSE | jq -r '.daging.id')
echo -e "${GREEN}Daging ID: $DAGING_ID${NC}"

echo -e "\n${YELLOW}6. Testing Regulator - Melihat daging pending verifikasi${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/regulator/daging-pending" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}7. Testing Regulator - Verifikasi halal daging${NC}"
curl -X POST "$BASE_URL/transaksi-penyembelihan/regulator/verifikasi-halal" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"dagingId\": \"$DAGING_ID\",
    \"statusVerifikasi\": \"VERIFIED\"
  }" | jq '.'

echo -e "\n${YELLOW}8. Testing - Melihat riwayat transaksi${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/riwayat" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}9. Testing - Melihat statistik${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/statistik" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${YELLOW}10. Testing - Detail transaksi${NC}"
curl -X GET "$BASE_URL/transaksi-penyembelihan/detail/$TRANSAKSI_ID" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  | jq '.'

echo -e "\n${GREEN}=== Testing Selesai ===${NC}"
echo -e "${YELLOW}Catatan:${NC}"
echo "- Ganti TOKEN, JAGAL_ID, RPH_ID, SAPI_ID dengan data yang sebenarnya"
echo "- Pastikan user memiliki role yang sesuai untuk setiap endpoint"
echo "- Pastikan database memiliki data sapi, jagal, dan RPH yang valid"
