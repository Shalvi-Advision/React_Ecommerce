# Customer Profile API Integration

This document describes the integration of Customer Profile APIs into the React PWA project.

## Overview

The Customer Profile feature has been integrated with the following components:

- **Profile API Service** (`src/api/profileApi.js`)
- **Profile Context** (`src/context/ProfileContext.js`) 
- **Updated Profile Page** (`src/pages/ProfilePage.js`)
- **App Integration** (`src/App.js`)

## API Endpoints

### 1. Get Customer Profile
- **Endpoint**: `POST ${API_BASE_URL}/users/get_customer_profile`
- **Request Body**: `{ "store_code": "{{store_code}}" }`
- **Response**: Customer profile data with all fields

### 2. Add/Update Customer Profile
- **Endpoint**: `POST ${API_BASE_URL}/users/add_update_customer_profile`
- **Request Body**: Profile data with store_code
- **Response**: Updated profile data

## Features Implemented

### ✅ Core Functionality
- [x] Automatic profile fetching on user login
- [x] Create Profile form for first-time users
- [x] Edit Profile functionality with form validation
- [x] Success toast notifications
- [x] Error handling with user-friendly messages

### ✅ Responsive Design
- [x] Mobile-first responsive design using Tailwind CSS
- [x] Breakpoints: `sm`, `md`, `lg`, `xl`
- [x] Adaptive layouts for all screen sizes
- [x] Touch-friendly interface elements

### ✅ PWA Compatibility
- [x] Offline mode with cached profile data
- [x] localStorage integration for data persistence
- [x] IndexedDB support for enhanced offline storage
- [x] Network status awareness

### ✅ State Management
- [x] React Context for global profile state
- [x] Reducer pattern for state updates
- [x] Optimistic updates with rollback capability
- [x] Loading and error states

## File Structure

```
src/
├── api/
│   ├── profileApi.js              # Profile API service functions
│   └── testProfileIntegration.js  # Test utilities
├── context/
│   └── ProfileContext.js          # Profile state management
├── pages/
│   └── ProfilePage.js             # Updated profile page
└── App.js                        # App with ProfileProvider
```

## Usage

### 1. Profile Context Usage

```javascript
import { useProfile } from '../context/ProfileContext';

const MyComponent = () => {
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    updateProfile,
    setEditMode,
    hasProfile,
    getDisplayName 
  } = useProfile();

  // Use profile data and methods
};
```

### 2. API Service Usage

```javascript
import { getCustomerProfile, addUpdateCustomerProfile } from '../api/profileApi';

// Fetch profile
const profile = await getCustomerProfile('KLK');

// Update profile
const updatedProfile = await addUpdateCustomerProfile(profileData);
```

## Profile Data Structure

### API Response Format
```javascript
{
  "_id": "6896c9fb29549c535059a09f",
  "full_name": "Jivan Patil",
  "mobile_number": "9890354858",
  "email_id": "user@example.com",
  "delivery_addr_line_1": "123 Main Street",
  "delivery_addr_line_2": "Apt 4B",
  "delivery_addr_city": "Pune",
  "delivery_addr_pincode": "421306",
  "is_default": "Yes",
  "latitude": "",
  "longitude": "",
  "area_id": "Sadashiv Peth",
  "user_id": "68cce59098dfde3aa9224b85",
  "store_code": "KLK"
}
```

### UI Form Data Format
```javascript
{
  firstName: "John",
  lastName: "Doe", 
  email: "john@example.com",
  mobile: "9890354858",
  addressLine1: "123 Main Street",
  addressLine2: "Apt 4B",
  city: "Pune",
  pincode: "421306",
  latitude: "",
  longitude: ""
}
```

## Offline Support

### Caching Strategy
- Profile data is cached in localStorage with 24-hour expiry
- IndexedDB is used as fallback for enhanced PWA support
- Offline mode banner shows when using cached data
- Automatic sync when connection is restored

### Storage Keys
- `cached_profile`: Cached profile data
- `profile_last_cached`: Timestamp of last cache update

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation to offline mode
- User-friendly error messages

### Validation Errors
- Client-side form validation
- Server-side error display
- Field-specific error highlighting

## Testing

### Manual Testing
```javascript
import { runAllTests } from './api/testProfileIntegration';

// Run all integration tests
runAllTests();
```

### Test Coverage
- API endpoint connectivity
- Data formatting and transformation
- Context state management
- Component integration
- Error scenarios

## Configuration

### Environment Variables
```bash
REACT_APP_API_URL=https://ecom-api-ozl0.onrender.com/api
```

### Store Code
The store code is currently hardcoded as 'KLK' but should be made dynamic based on:
- User's selected store
- Geographic location
- App configuration

## Performance Optimizations

### Loading States
- Skeleton loading for initial profile fetch
- Optimistic updates for form submissions
- Debounced input validation

### Memory Management
- Automatic cleanup of unused state
- Efficient re-renders with useMemo/useCallback
- Proper dependency arrays in useEffect

## Security Considerations

### Data Protection
- No sensitive data in localStorage
- Secure API communication with HTTPS
- Input sanitization and validation

### Authentication
- Token-based authentication
- Automatic token refresh
- Secure logout with data cleanup

## Future Enhancements

### Planned Features
- [ ] Profile photo upload
- [ ] Multiple address support
- [ ] Profile completion progress bar
- [ ] Social login integration
- [ ] Profile sharing capabilities

### Technical Improvements
- [ ] GraphQL integration
- [ ] Real-time profile updates
- [ ] Advanced caching strategies
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

1. **Profile not loading**
   - Check network connectivity
   - Verify API endpoint accessibility
   - Check browser console for errors

2. **Offline mode not working**
   - Clear localStorage and refresh
   - Check IndexedDB support
   - Verify service worker registration

3. **Form validation errors**
   - Check required field completion
   - Verify email format
   - Ensure mobile number format

### Debug Tools
- Browser DevTools Network tab
- React DevTools for state inspection
- Console logging for API calls
- Test utilities in `testProfileIntegration.js`

## Support

For issues or questions regarding the Profile API integration:
1. Check the browser console for error messages
2. Run the test utilities to verify functionality
3. Review this documentation for configuration issues
4. Contact the development team for API-related problems

