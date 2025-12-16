# RPH Transaksi Penyembelihan - Implementation Guide

## Overview

Updated RPH transaction slaughter functionality to integrate with the new simplified backend API for slaughter operations.

## Key Changes Made

### 🔧 **Frontend Updates (RphTransaksi.jsx)**

#### 1. **State Management Updates**

- Simplified `slaughterForm` to only include required fields:
  ```javascript
  const [slaughterForm, setSlaughterForm] = useState({
    sapiId: "",
    beratDaging: "",
    idPengecekanHalalSehat: "",
  });
  ```
- Added new states for backend integration:
  - `availableSapiForSlaughter` - List of sapi available for slaughter
  - `rphId` - Current RPH entity ID
  - `slaughterLoading` - Loading state
  - `slaughterError` - Error messages

#### 2. **Data Fetching Functions**

- `fetchAvailableSapiForSlaughter()` - Gets sapi that can be slaughtered by RPH
- `fetchSlaughterHistory()` - Gets historical slaughter records
- Both functions use useCallback for performance optimization

#### 3. **Form Enhancements**

- **Real-time Validation**: Checks if berat daging exceeds berat sapi
- **Smart Dropdown**: Shows sapi info (ID, jenis, kelamin, berat)
- **Dynamic Max Validation**: Input field max value based on selected sapi
- **Info Display**: Shows selected sapi details below form
- **Loading States**: Button shows loading spinner during submission

#### 4. **Backend Integration**

- `handleSlaughterSubmit()` now calls backend API:
  ```javascript
  POST /api/transaksi-penyembelihan
  {
    "sapiId": "uuid",
    "beratDaging": 150.5,
    "penyembelihId": "rph-uuid",
    "penyembelihType": "RPH",
    "idPengecekanHalalSehat": "optional-uuid"
  }
  ```

#### 5. **UI Improvements**

- **Statistics Cards**: Shows available sapi, total slaughters, total meat weight
- **Enhanced Table**: Displays comprehensive slaughter history with sapi info
- **Improved Modal**: Better detail view with structured information
- **Error Handling**: Displays validation and API errors
- **Success Feedback**: Clear confirmation messages

### 🛡️ **Validation Rules**

1. **Required Fields**: Sapi selection and berat daging
2. **Weight Validation**: Berat daging ≤ berat sapi
3. **Ownership Validation**: RPH can only slaughter sapi with verified transactions
4. **Duplicate Prevention**: Each sapi can only be slaughtered once

### 📊 **Data Flow**

1. **Page Load**: Get RPH ID from localStorage, fetch available sapi and history
2. **Form Selection**: User selects sapi, validation shows max weight allowed
3. **Input Validation**: Real-time checking of weight constraints
4. **Submission**: API call to backend with validation
5. **Success**: Refresh data, show success message, reset form
6. **Error**: Display error message, keep form data

### 🎯 **Form Fields (Simplified)**

- ✅ **Pilih Sapi** (Required) - Dropdown with sapi info
- ✅ **Berat Daging** (Required) - Number input with validation
- ✅ **ID Pengecekan Halal Sehat** (Optional) - Text input
- ❌ **Removed**: Distributor selection, timestamp (auto-generated)

### 📈 **Statistics Display**

- **Sapi Tersedia**: Count of available sapi for slaughter
- **Total Penyembelihan**: Number of completed slaughter operations
- **Total Daging**: Sum of all meat weight produced (kg)

### 🔄 **Backend Endpoints Used**

```
GET  /api/transaksi-penyembelihan/available-sapi/RPH/{rphId}
GET  /api/transaksi-penyembelihan/entity/RPH/{rphId}
POST /api/transaksi-penyembelihan
```

### 💡 **Error Handling**

- **Validation Errors**: Real-time weight validation
- **API Errors**: Display backend error messages
- **Network Errors**: Generic error message
- **Loading States**: Prevent double submission

### 🎨 **UI/UX Improvements**

- **Consistent Design**: Matches Jagal implementation
- **Responsive Layout**: Works on mobile and desktop
- **Icon Usage**: Intuitive icons for different sections
- **Color Coding**: Status badges and validation messages
- **Loading Indicators**: Clear feedback during operations

## Example Usage

### Form Submission Flow

1. User selects sapi from dropdown
2. System shows max weight allowed based on sapi weight
3. User enters meat weight (validated in real-time)
4. Optional: Enter halal health check ID
5. Submit triggers API call with loading state
6. Success: Data refreshed, form reset, success message
7. Error: Error message displayed, form preserved

### Data Validation

```javascript
// Weight validation example
const selectedSapi = availableSapiForSlaughter.find((s) => s.id === formData.sapiId);
if (selectedSapi.beratSapi && beratDaging > selectedSapi.beratSapi) {
  setError("Berat daging tidak boleh melebihi berat sapi");
}
```

### Statistics Calculation

```javascript
// Total meat weight calculation
const totalMeatWeight = slaughters.reduce((total, s) => total + (s.daging?.berat || 0), 0).toFixed(1);
```

## Integration Notes

- RPH ID should be fetched from user profile in real implementation
- Form validation prevents common user errors
- Real-time feedback improves user experience
- Statistics provide quick overview of operations
- Error handling covers both client and server scenarios
