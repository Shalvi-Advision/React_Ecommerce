# Pincode-Based Location and Store Selection System

This document describes the implementation of a guided user flow for pincode-based location and store selection on the e-commerce website.

## Overview

The system provides a complete user journey from pincode selection to store confirmation, matching the design specifications provided in the images. It includes:

1. **Pincode Selection Modal** - Initial location search and selection
2. **Store Selection Modal** - Choose from available stores in the selected area
3. **Store Details Modal** - Final confirmation with store details
4. **Persistent Storage** - Location and store selection saved in localStorage
5. **Header Integration** - Display selected location in the website header

## Features

### 1. Pincode Selection Flow
- Search for pincodes using autocomplete
- Real-time search results as user types
- Serviceability check for selected pincode
- Error handling for non-serviceable areas

### 2. Store Selection
- Display all available stores for the selected pincode
- Store details including address, timings, contact info
- Visual indicators for delivery options (Home Delivery, Self Pickup)
- Store offers and minimum order amounts

### 3. Final Confirmation
- Complete store details display
- Location confirmation with visual feedback
- One-click confirmation to save selection

### 4. Persistent Storage
- Selected location and store saved in localStorage
- Automatic restoration on page reload
- Easy reset functionality

## API Integration

The system integrates with the following APIs:

### Base Configuration
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PROJECT_CODE = process.env.REACT_APP_PROJECT_CODE || 'default_project';
```

### API Endpoints

1. **Get All Pincodes**
   - `GET /api/pincodes/get_pincode_list`
   - Returns list of all available pincodes

2. **Check Pincode Serviceability**
   - `POST /api/pincodes/check_if_pincode_exists`
   - Body: `{ "pincode": "421002", "project_code": "{{project_code}}" }`

3. **Get Pincode-wise Stores**
   - `POST /api/pincodes/get_pincodewise_outlet`
   - Body: `{ "pincode": "421301", "project_code": "{{project_code}}" }`

4. **Get Store Details**
   - `POST /api/pincodes/get_store_details`
   - Body: `{ "store_code": "{{store_code}}", "project_code": "{{project_code}}" }`

## Components

### 1. PincodeSelectionModal
- **File**: `src/components/PincodeSelectionModal.js`
- **Purpose**: Initial pincode search and selection
- **Features**:
  - Search input with autocomplete
  - Real-time search results
  - Loading states and error handling
  - Promotional banner at bottom

### 2. StoreSelectionModal
- **File**: `src/components/StoreSelectionModal.js`
- **Purpose**: Display and select from available stores
- **Features**:
  - Store cards with detailed information
  - Delivery options indicators
  - Contact information display
  - Store offers and minimum order amounts

### 3. StoreDetailsModal
- **File**: `src/components/StoreDetailsModal.js`
- **Purpose**: Final confirmation with complete store details
- **Features**:
  - Location confirmation display
  - Complete store information
  - Visual confirmation feedback
  - One-click confirmation button

### 4. PincodeContext
- **File**: `src/context/PincodeContext.js`
- **Purpose**: Global state management for pincode and store selection
- **Features**:
  - Modal state management
  - Selection state tracking
  - Serviceability checking
  - Persistent storage integration

## Usage

### Basic Integration

The system is automatically integrated into the main app. Users can:

1. Click on the location button in the header
2. Search for their pincode
3. Select from available stores
4. Confirm their selection

### Programmatic Usage

```javascript
import { usePincode } from './context/PincodeContext';

function MyComponent() {
  const {
    isLocationSet,
    getLocationDisplayText,
    getStoreDisplayText,
    openPincodeModal,
    resetLocation
  } = usePincode();

  return (
    <div>
      <button onClick={openPincodeModal}>
        {isLocationSet ? getLocationDisplayText() : 'Select Location'}
      </button>
      {isLocationSet && (
        <p>Store: {getStoreDisplayText()}</p>
      )}
    </div>
  );
}
```

## Environment Variables

Add the following to your `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PROJECT_CODE=your_project_code_here
```

## Design Specifications

The modals are designed to match the provided design images:

### Pincode Selection Modal
- Clean, centered modal with rounded corners
- Search bar with green accent color
- Location pin icon with decorative elements
- Promotional banner at bottom with D-Mart branding

### Store Selection Modal
- List of store cards with detailed information
- Visual indicators for delivery options
- Contact information and store timings
- Responsive design for mobile and desktop

### Store Details Modal
- Location confirmation display
- Serviceability confirmation card
- Complete store details
- Prominent confirmation button

## Error Handling

The system includes comprehensive error handling:

- **API Errors**: Network failures, server errors
- **Serviceability Errors**: Non-serviceable pincodes
- **Loading States**: User feedback during API calls
- **Validation**: Input validation and sanitization

## Mobile Responsiveness

All modals are fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Future Enhancements

Potential improvements for future versions:

1. **Geolocation Integration**: Auto-detect user location
2. **Recent Locations**: Save and display recent selections
3. **Favorites**: Allow users to save favorite stores
4. **Store Ratings**: Display store ratings and reviews
5. **Delivery Time Estimation**: Show estimated delivery times
6. **Multi-language Support**: Support for multiple languages

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check `REACT_APP_API_URL` environment variable
   - Verify API server is running
   - Check network connectivity

2. **Pincode Not Found**
   - Verify pincode exists in the database
   - Check `REACT_APP_PROJECT_CODE` configuration
   - Ensure API endpoints are correctly configured

3. **Store Selection Issues**
   - Verify stores exist for the selected pincode
   - Check store data format in API response
   - Ensure proper error handling

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'pincode:*');
```

## Support

For technical support or questions about this implementation, please refer to the main project documentation or contact the development team.
