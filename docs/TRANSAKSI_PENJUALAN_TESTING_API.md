# Transaksi Penjualan Testing API Documentation

## Base URL
```
http://localhost:3000/transaksiPenjualan
```

## Available Testing Endpoints

### 1. Get All Transactions (Enhanced)
**Method:** GET
**URL:** `/`
**Description:** Get all transactions with enriched data including seller and buyer information

**Response Format:**
```json
{
  "message": "All transactions retrieved successfully",
  "count": 10,
  "data": [
    {
      "id": "transaction_id",
      "penjualType": "PASAR_HEWAN",
      "penjualId": "seller_id",
      "pembeliType": "JAGAL",
      "pembeliId": "buyer_id",
      "sapiId": "sapi_id",
      "dagingId": null,
      "jumlahQty": 1,
      "type": "SAPI",
      "verificationStatus": "VERIFIED",
      "verificationCode": "123456",
      "cid": "QmHash...",
      "timestamp": "2025-12-19T10:30:00.000Z",
      "sapi": { /* sapi details */ },
      "daging": null
    }
  ]
}
```

### 2. Get Transactions by Seller Type
**Method:** GET
**URL:** `/testing/seller/{penjualType}`
**Description:** Filter transactions by seller type

**Valid penjualType values:**
- `PETERNAK`
- `PASAR_HEWAN`  
- `JAGAL`
- `RPH`
- `DISTRIBUTOR`
- `HOREKA`

**Example URLs:**
- `/testing/seller/PASAR_HEWAN` - Get all transactions where seller is Pasar Hewan
- `/testing/seller/JAGAL` - Get all transactions where seller is Jagal

**Response Format:**
```json
{
  "message": "Transactions for seller type PASAR_HEWAN retrieved successfully",
  "penjualType": "PASAR_HEWAN",
  "count": 5,
  "data": [
    {
      "id": "transaction_id",
      "penjualType": "PASAR_HEWAN",
      "pembeliType": "JAGAL",
      "sellerInfo": {
        "id": "seller_id",
        "nama": "Pasar Hewan ABC",
        "alamat": "Jl. Pasar No. 1"
      },
      "buyerInfo": {
        "id": "buyer_id", 
        "nama": "Jagal XYZ",
        "alamat": "Jl. Jagal No. 1"
      }
      // ... other transaction fields
    }
  ]
}
```

### 3. Get Transactions by Buyer Type
**Method:** GET
**URL:** `/testing/buyer/{pembeliType}`
**Description:** Filter transactions by buyer type

**Valid pembeliType values:**
- `PETERNAK`
- `PASAR_HEWAN`
- `JAGAL`
- `RPH` 
- `DISTRIBUTOR`
- `HOREKA`

**Example URLs:**
- `/testing/buyer/JAGAL` - Get all transactions where buyer is Jagal
- `/testing/buyer/RPH` - Get all transactions where buyer is RPH

### 4. Get Transaction Statistics
**Method:** GET
**URL:** `/testing/stats`
**Description:** Get comprehensive statistics about all transactions

**Response Format:**
```json
{
  "message": "Transaction statistics retrieved successfully",
  "data": {
    "totals": {
      "total": 25,
      "pending": 5,
      "verified": 15,
      "rejected": 3,
      "cancelled": 2
    },
    "bySellerType": {
      "PETERNAK": 8,
      "PASAR_HEWAN": 10,
      "JAGAL": 5,
      "RPH": 2
    },
    "byBuyerType": {
      "PASAR_HEWAN": 8,
      "JAGAL": 10,
      "RPH": 5,
      "DISTRIBUTOR": 2
    },
    "byItemType": {
      "SAPI": 20,
      "DAGING": 5
    }
  }
}
```

## Existing Endpoints (For Reference)

### 5. Get Specific Transaction by ID
**Method:** GET
**URL:** `/{id}`

### 6. Get Incoming Transactions (for specific entity)
**Method:** GET
**URL:** `/incoming/{entityType}/{entityId}`

**Example:**
- `/incoming/JAGAL/037541ce-16e6-4ffb-94d1-8e9c11b62eb5`

### 7. Get Outgoing Transactions (for specific entity)
**Method:** GET
**URL:** `/outgoing/{entityType}/{entityId}`

### 8. Create New Transaction
**Method:** POST
**URL:** `/`

### 9. Transfer Sapi
**Method:** POST
**URL:** `/transfer`

### 10. Verify Transaction
**Method:** POST/PUT
**URL:** `/{id}/verify`

## Postman Testing Collection

### Collection Setup
1. Create a new Postman Collection named "Transaksi Penjualan Testing"
2. Set base URL variable: `{{base_url}}` = `http://localhost:3000/transaksiPenjualan`

### Sample Requests

#### 1. Get All Transactions
```
GET {{base_url}}/
```

#### 2. Get Pasar Hewan Transactions
```
GET {{base_url}}/testing/seller/PASAR_HEWAN
```

#### 3. Get Jagal as Buyer
```
GET {{base_url}}/testing/buyer/JAGAL
```

#### 4. Get Statistics
```
GET {{base_url}}/testing/stats
```

#### 5. Get Incoming for Specific Jagal
```
GET {{base_url}}/incoming/JAGAL/037541ce-16e6-4ffb-94d1-8e9c11b62eb5
```

## Error Handling

### Invalid Seller/Buyer Type
**Status:** 400 Bad Request
```json
{
  "error": "Invalid penjualType. Must be one of: PETERNAK, PASAR_HEWAN, JAGAL, RPH, DISTRIBUTOR, HOREKA"
}
```

### Server Error
**Status:** 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```

## Notes for Testing

1. **Authentication:** Some endpoints may require authentication headers. Add `Authorization: Bearer <token>` if needed.

2. **Data Enrichment:** The testing endpoints include enriched data with seller and buyer information for better analysis.

3. **Performance:** These endpoints are designed for testing and may not be optimized for production use with large datasets.

4. **Order:** Results are ordered by timestamp in descending order (newest first).

5. **Includes:** All endpoints include related sapi and daging data with their associations.

## Common Use Cases

### Debugging Jagal Transactions
1. Check incoming transactions: `/incoming/JAGAL/{jagal_entity_id}`
2. Check all Jagal as seller: `/testing/seller/JAGAL`  
3. Check all Jagal as buyer: `/testing/buyer/JAGAL`
4. Get overall stats: `/testing/stats`

### Flow Testing
1. Create transaction from Pasar Hewan to Jagal: `POST /transfer`
2. Check if it appears in Jagal incoming: `/incoming/JAGAL/{jagal_id}`
3. Check statistics update: `/testing/stats`
4. Verify the transaction: `POST /{id}/verify`

This documentation should help you test all aspects of the transaction system effectively in Postman.
