import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCustomerProfile, addUpdateCustomerProfile, formatProfileDataForAPI, formatProfileDataForUI } from '../api/profileApi';

// Profile Context
const ProfileContext = createContext();

// Profile Actions
const profileActions = {
  FETCH_PROFILE_START: 'FETCH_PROFILE_START',
  FETCH_PROFILE_SUCCESS: 'FETCH_PROFILE_SUCCESS',
  FETCH_PROFILE_FAILURE: 'FETCH_PROFILE_FAILURE',
  UPDATE_PROFILE_START: 'UPDATE_PROFILE_START',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
  SET_EDIT_MODE: 'SET_EDIT_MODE',
  CLEAR_EDIT_MODE: 'CLEAR_EDIT_MODE',
  SET_SUCCESS_MESSAGE: 'SET_SUCCESS_MESSAGE',
  CLEAR_SUCCESS_MESSAGE: 'CLEAR_SUCCESS_MESSAGE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_OFFLINE_MODE: 'SET_OFFLINE_MODE',
  CLEAR_OFFLINE_MODE: 'CLEAR_OFFLINE_MODE',
  LOAD_CACHED_PROFILE: 'LOAD_CACHED_PROFILE',
  CACHE_PROFILE: 'CACHE_PROFILE'
};

// Profile Reducer
const profileReducer = (state, action) => {
  switch (action.type) {
    case profileActions.FETCH_PROFILE_START:
      return {
        ...state,
        loading: true,
        error: null,
        offlineMode: false
      };

    case profileActions.FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
        offlineMode: false,
        lastFetched: Date.now()
      };

    case profileActions.FETCH_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        offlineMode: action.payload.includes('Network error') || action.payload.includes('unable to reach server')
      };

    case profileActions.UPDATE_PROFILE_START:
      return {
        ...state,
        updating: true,
        error: null
      };

    case profileActions.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        updating: false,
        profile: action.payload,
        error: null,
        lastFetched: Date.now()
      };

    case profileActions.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload
      };

    case profileActions.SET_EDIT_MODE:
      return {
        ...state,
        isEditMode: true,
        error: null
      };

    case profileActions.CLEAR_EDIT_MODE:
      return {
        ...state,
        isEditMode: false,
        error: null
      };

    case profileActions.SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload
      };

    case profileActions.CLEAR_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: null
      };

    case profileActions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case profileActions.SET_OFFLINE_MODE:
      return {
        ...state,
        offlineMode: true
      };

    case profileActions.CLEAR_OFFLINE_MODE:
      return {
        ...state,
        offlineMode: false
      };

    case profileActions.LOAD_CACHED_PROFILE:
      return {
        ...state,
        profile: action.payload,
        offlineMode: true,
        loading: false
      };

    case profileActions.CACHE_PROFILE:
      return {
        ...state,
        cachedProfile: action.payload,
        lastCached: Date.now()
      };

    default:
      return state;
  }
};

// Initial profile state
const initialProfileState = {
  profile: null,
  loading: false,
  updating: false,
  error: null,
  successMessage: null,
  isEditMode: false,
  offlineMode: false,
  lastFetched: null,
  cachedProfile: null,
  lastCached: null
};

// Profile Provider Component
export const ProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);

  // Load cached profile on mount
  useEffect(() => {
    const loadCachedProfile = () => {
      try {
        const cachedProfile = localStorage.getItem('cached_profile');
        const lastCached = localStorage.getItem('profile_last_cached');
        
        if (cachedProfile && lastCached) {
          const profileData = JSON.parse(cachedProfile);
          const cacheTime = parseInt(lastCached);
          const now = Date.now();
          
          // Use cached data if it's less than 24 hours old
          if (now - cacheTime < 24 * 60 * 60 * 1000) {
            dispatch({
              type: profileActions.LOAD_CACHED_PROFILE,
              payload: profileData
            });
            console.log('📱 Loaded cached profile data');
          }
        }
      } catch (error) {
        console.error('Error loading cached profile:', error);
      }
    };

    loadCachedProfile();
  }, []);

  // Cache profile data
  const cacheProfile = (profileData) => {
    try {
      localStorage.setItem('cached_profile', JSON.stringify(profileData));
      localStorage.setItem('profile_last_cached', Date.now().toString());
      dispatch({
        type: profileActions.CACHE_PROFILE,
        payload: profileData
      });
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  };

  // Fetch customer profile
  const fetchProfile = async (storeCode) => {
    dispatch({ type: profileActions.FETCH_PROFILE_START });

    try {
      const response = await getCustomerProfile(storeCode);
      const formattedProfile = formatProfileDataForUI(response.data);
      
      // Cache the profile data
      cacheProfile(formattedProfile);
      
      dispatch({
        type: profileActions.FETCH_PROFILE_SUCCESS,
        payload: formattedProfile
      });

      return { success: true, data: formattedProfile };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch profile';
      dispatch({
        type: profileActions.FETCH_PROFILE_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update customer profile
  const updateProfile = async (formData, storeCode) => {
    dispatch({ type: profileActions.UPDATE_PROFILE_START });

    try {
      const apiData = formatProfileDataForAPI(formData, storeCode);
      const response = await addUpdateCustomerProfile(apiData);
      
      // Format the updated profile data
      const updatedProfile = {
        ...state.profile,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        emailId: formData.email || '',
        mobileNumber: formData.mobile || '',
        addressLine1: formData.addressLine1 || '',
        addressLine2: formData.addressLine2 || '',
        city: formData.city || '',
        pincode: formData.pincode || '',
        latitude: formData.latitude || '',
        longitude: formData.longitude || '',
        updatedAt: new Date().toISOString()
      };
      
      // Cache the updated profile
      cacheProfile(updatedProfile);
      
      dispatch({
        type: profileActions.UPDATE_PROFILE_SUCCESS,
        payload: updatedProfile
      });

      // Set success message
      setSuccessMessage('Profile updated successfully!');
      
      return { success: true, data: updatedProfile };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update profile';
      dispatch({
        type: profileActions.UPDATE_PROFILE_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Set edit mode
  const setEditMode = (isEdit = true) => {
    if (isEdit) {
      dispatch({ type: profileActions.SET_EDIT_MODE });
    } else {
      dispatch({ type: profileActions.CLEAR_EDIT_MODE });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: profileActions.CLEAR_ERROR });
  };

  // Set success message
  const setSuccessMessage = (message) => {
    dispatch({ type: profileActions.SET_SUCCESS_MESSAGE, payload: message });
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      dispatch({ type: profileActions.CLEAR_SUCCESS_MESSAGE });
    }, 3000);
  };

  // Clear success message
  const clearSuccessMessage = () => {
    dispatch({ type: profileActions.CLEAR_SUCCESS_MESSAGE });
  };

  // Check if profile exists
  const hasProfile = () => {
    return state.profile && state.profile.firstName && state.profile.lastName;
  };

  // Get profile display name
  const getDisplayName = () => {
    if (!state.profile) return '';
    const { firstName, lastName, fullName } = state.profile;
    return fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!state.profile) return false;
    const { firstName, lastName, mobileNumber } = state.profile;
    return !!(firstName && lastName && mobileNumber);
  };

  // Get missing profile fields
  const getMissingFields = () => {
    if (!state.profile) return ['firstName', 'lastName', 'mobileNumber', 'emailId'];
    
    const missing = [];
    const { firstName, lastName, mobileNumber, emailId, addressLine1, city, pincode } = state.profile;
    
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!mobileNumber) missing.push('mobileNumber');
    if (!emailId) missing.push('emailId');
    if (!addressLine1) missing.push('addressLine1');
    if (!city) missing.push('city');
    if (!pincode) missing.push('pincode');
    
    return missing;
  };

  const value = {
    // State
    profile: state.profile,
    loading: state.loading,
    updating: state.updating,
    error: state.error,
    successMessage: state.successMessage,
    isEditMode: state.isEditMode,
    offlineMode: state.offlineMode,
    lastFetched: state.lastFetched,
    
    // Actions
    fetchProfile,
    updateProfile,
    setEditMode,
    clearError,
    setSuccessMessage,
    clearSuccessMessage,
    
    // Helpers
    hasProfile,
    getDisplayName,
    isProfileComplete,
    getMissingFields
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

