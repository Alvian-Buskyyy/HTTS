#!/bin/bash

# Test script untuk endpoint profil peternak
# Pastikan backend sudah running di port 3000

echo "==================================="
echo "Testing Profile Endpoints"
echo "==================================="
echo ""

# Test 1: Get user profile
echo "1. Test GET /users/:userId/profile"
echo "   (Ganti USER_ID dan TOKEN dengan nilai yang sebenarnya)"
echo "   curl -X GET http://localhost:3000/users/USER_ID/profile \\"
echo "        -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""

# Test 2: Update peternak by userId
echo "2. Test PUT /peternak/user/:userId"
echo "   curl -X PUT http://localhost:3000/peternak/user/USER_ID \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "        -d '{\"nama\":\"Test Peternak\",\"alamat\":\"Test Alamat\",\"noTelepon\":\"08123456789\"}'"
echo ""

# Test 3: Update profile photo
echo "3. Test PUT /users/:userId/profile-photo"
echo "   curl -X PUT http://localhost:3000/users/USER_ID/profile-photo \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "        -d '{\"profilePhoto\":\"data:image/png;base64,iVBORw0KG...\"}'"
echo ""

echo "==================================="
echo "Cara mendapatkan TOKEN dan USER_ID:"
echo "==================================="
echo "1. Login melalui frontend"
echo "2. Buka browser console"
echo "3. Ketik: localStorage.getItem('token')"
echo "4. Ketik: JSON.parse(localStorage.getItem('user')).id"
echo ""
