import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import AccountSidebar from '../components/AccountSidebar';
import Button from '../components/Button';
import SuccessToast from '../components/SuccessToast';
import Loading from '../components/Loading';

const ProfilePage = () => {
  const { user } = useAuth();
  const { 
    profile, 
    loading, 
    updating, 
    error, 
    successMessage, 
    isEditMode, 
    offlineMode,
    fetchProfile, 
    updateProfile, 
    setEditMode, 
    clearError,
    clearSuccessMessage,
    hasProfile,
    getDisplayName,
    isProfileComplete
  } = useProfile();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });

  // Store code - you might want to get this from context or props
  const storeCode = 'KLK'; // Default store code, should be dynamic

  // Load profile data on component mount
  useEffect(() => {
    if (user && user.mobile_no) {
      fetchProfile(storeCode);
    }
  }, [user, storeCode]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.emailId || '',
        mobile: profile.mobileNumber || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        pincode: profile.pincode || '',
        latitude: profile.latitude || '',
        longitude: profile.longitude || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    clearError();

    const result = await updateProfile(formData, storeCode);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handleEditProfile = () => {
    setEditMode(true);
    clearError();
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    clearError();
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.emailId || '',
        mobile: profile.mobileNumber || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        pincode: profile.pincode || '',
        latitude: profile.latitude || '',
        longitude: profile.longitude || ''
      });
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement delete account functionality
      console.log('Delete account requested');
    }
  };

  const handleChangeMobile = () => {
    // Implement change mobile number functionality
    console.log('Change mobile number requested');
  };

  const handleVerifyEmail = () => {
    // Implement email verification functionality
    console.log('Verify email requested');
  };

  // Show loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      <SuccessToast 
        message={successMessage} 
        isVisible={!!successMessage} 
        onClose={clearSuccessMessage} 
      />

      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Offline Mode:</span> You're viewing cached profile data. 
                Some features may be limited until you're back online.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="lg:w-64">
          <AccountSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {hasProfile() ? `Welcome back, ${getDisplayName()}!` : 'Complete your profile to get started'}
              </p>
            </div>

            {/* Profile Status Card */}
            {profile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {getDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{getDisplayName()}</h3>
                      <p className="text-sm text-gray-500">{profile.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isProfileComplete() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isProfileComplete() ? 'Complete' : 'Incomplete'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Edit Profile' : 'Profile Information'}
                  </h2>
                  {!isEditMode && (
                    <button
                      onClick={handleEditProfile}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-6">
                  {/* Mobile Number Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-gray-900 font-medium">{formData.mobile || 'Not provided'}</span>
                      <button
                        type="button"
                        onClick={handleChangeMobile}
                        className="mt-2 sm:mt-0 text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Change Mobile Number
                      </button>
                    </div>
                  </div>

                  {/* Name Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                          placeholder="Enter first name"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formData.firstName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                          placeholder="Enter last name"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formData.lastName || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Section */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditMode ? (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.email || 'Not provided'}</p>
                    )}
                    {formData.email && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-red-600 text-sm">Email is not verified.</span>
                        <button
                          type="button"
                          onClick={handleVerifyEmail}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Verify now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            id="addressLine1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                            placeholder="Enter address line 1"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{formData.addressLine1 || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            id="addressLine2"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                            placeholder="Enter address line 2"
                          />
                        ) : (
                          <p className="text-gray-900 py-2">{formData.addressLine2 || 'Not provided'}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          {isEditMode ? (
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                              placeholder="Enter city"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{formData.city || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode
                          </label>
                          {isEditMode ? (
                            <input
                              type="text"
                              id="pincode"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
                              placeholder="Enter pincode"
                            />
                          ) : (
                            <p className="text-gray-900 py-2">{formData.pincode || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditMode && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
