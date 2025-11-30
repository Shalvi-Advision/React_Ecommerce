# CategoriesDrawer API Integration

This document describes the integration of the Departments & Categories API with the CategoriesDrawer component for the PWA e-commerce application.

## Overview

The CategoriesDrawer component has been updated to integrate with the new API endpoints for fetching departments and their associated categories. The component now supports:

- Dynamic loading of departments from the API
- Lazy loading of categories when departments are expanded
- Responsive design for mobile and desktop
- Fallback handling for missing data
- Error states and loading indicators

## API Endpoints

### 1. Get Active Departments
- **Endpoint**: `POST /departments/get_active_department_list`
- **Request Body**:
  ```json
  {
    "project_code": "SAMPLE_PROJECT_CODE"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Active departments retrieved successfully",
    "data": [
      {
        "_id": "68a8a27d4169ced4c49f94ce",
        "department_id": "1",
        "department_name": "HOUSEHOLD ITEMS",
        "dept_type_id": "1",
        "dept_no_of_col": 0,
        "store_code": "null",
        "image_link": "https://patelrmart.com/mgmt_panel/sites/default/files/department/thumbnail/HOUSEHOLD-ITEMS.webp",
        "sequence_id": 1,
        "__v": 0
      }
    ]
  }
  ```

### 2. Get Active Categories by Department
- **Endpoint**: `POST /categories/get_active_categories_list`
- **Request Body**:
  ```json
  {
    "department_id": "2",
    "store_code": "KBR",
    "project_code": "SAMPLE_PROJECT_CODE"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Active categories retrieved successfully",
    "data": [
      {
        "_id": "68a8a2804169ced4c49f9976",
        "idcategory_master": "89",
        "category_name": "UPWAS ITEM",
        "dept_id": "2",
        "sequence_id": 1,
        "store_code": "KBR",
        "no_of_col": "4",
        "image_link": "https://patelrmart.com/mgmt_panel/sites/default/files/category/thumbnail/upvasspecial.webp",
        "category_bg_color": "#FFFF00",
        "__v": 0
      }
    ]
  }
  ```

## Environment Variables

Add these to your `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PROJECT_CODE=SAMPLE_PROJECT_CODE
REACT_APP_STORE_CODE=KBR
```

## Component Features

### 1. State Management
- `departments`: Array of department data from API
- `categories`: Object mapping department IDs to their categories
- `expandedDepartment`: Currently expanded department ID
- `loading`: Loading state for departments
- `categoriesLoading`: Loading state for individual department categories
- `error`: Error state for API failures

### 2. API Integration
- **Departments**: Loaded when drawer opens
- **Categories**: Loaded lazily when department is expanded
- **Caching**: Categories are cached to avoid repeated API calls
- **Error Handling**: Graceful fallback to hardcoded data

### 3. Responsive Design
- **Mobile**: Single column layout
- **Tablet**: 2-3 columns
- **Desktop**: 4-5 columns
- **Large Desktop**: 5 columns

### 4. Fallback Handling
- **Missing Images**: Shows emoji icons as fallback
- **Missing Data**: Shows "Not Available" text
- **API Failures**: Falls back to hardcoded categories
- **Network Errors**: Shows retry button

## Usage

```jsx
import CategoriesDrawer from './components/CategoriesDrawer';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsDrawerOpen(true)}>
        Open Categories
      </button>
      
      <CategoriesDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
```

## Testing

Run the test script to verify API integration:

```bash
node test-categories-api.js
```

This will test both the departments and categories API endpoints and provide detailed output.

## Performance Optimizations

1. **Lazy Loading**: Categories are only loaded when departments are expanded
2. **Caching**: Categories are cached to avoid repeated API calls
3. **Image Optimization**: Images have error handling and fallbacks
4. **Responsive Images**: Different image sizes for different screen sizes

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Shows retry button
2. **API Errors**: Falls back to hardcoded data
3. **Missing Images**: Shows emoji fallbacks
4. **Missing Data**: Shows appropriate placeholder text

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## PWA Features

- **Offline Support**: Falls back to hardcoded data when offline
- **Caching**: API responses are cached for better performance
- **Responsive**: Works on all device sizes
- **Touch Friendly**: Optimized for touch interactions

## Future Enhancements

1. **Search**: Add search functionality within categories
2. **Favorites**: Allow users to mark favorite categories
3. **Recent**: Show recently viewed categories
4. **Analytics**: Track category interactions
5. **A/B Testing**: Test different layouts and interactions
