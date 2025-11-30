import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountSidebar from '../components/AccountSidebar';
import Button from '../components/Button';
import SuccessToast from '../components/SuccessToast';
import Loading from '../components/Loading';
import { COLORS } from '../constants/theme';

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    loading: authLoading,
    error: authError,
    successMessage: authSuccessMessage,
    clearError,
    setSuccessMessage,
    clearSuccessMessage
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Load profile data from auth context
  useEffect(() => {
    if (user) {
      // Split name into first and last name for display
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        firstName: firstName,
        lastName: lastName
      });
    }
  }, [user]);

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

    // Combine firstName and lastName into name
    const profileData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email
    };

    const result = await updateProfile(profileData);
    if (result.success) {
      setIsEditMode(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    clearError();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    clearError();
    // Reset form data to original user data
    if (user) {
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        firstName: firstName,
        lastName: lastName
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
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray[50] }}>
      {/* Success Toast */}
      <SuccessToast
        message={authSuccessMessage}
        isVisible={!!authSuccessMessage}
        onClose={clearSuccessMessage}
      />

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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.gray[900] }}>Profile</h1>
              <p className="text-sm sm:text-base" style={{ color: COLORS.gray[600] }}>
                {user?.name ? `Welcome back, ${user.name}!` : 'Complete your profile to get started'}
              </p>
            </div>

            {/* Profile Status Card */}
            {user && (
              <div className="rounded-lg shadow-sm border p-4 sm:p-6 mb-6" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200] }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary[100] }}>
                      <span className="font-semibold text-lg" style={{ color: COLORS.primary[600] }}>
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: COLORS.gray[900] }}>{user.name || 'User'}</h3>
                      <p className="text-sm" style={{ color: COLORS.gray[500] }}>{user.mobile}</p>
                      <p className="text-xs capitalize" style={{ color: COLORS.gray[400] }}>{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                      backgroundColor: user.isVerified ? COLORS.success[100] : COLORS.warning[100],
                      color: user.isVerified ? COLORS.success[800] : COLORS.warning[800]
                    }}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="rounded-lg shadow-sm border" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200] }}>
              <div className="p-4 sm:p-6">
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: COLORS.gray[900] }}>
                    {isEditMode ? 'Edit Profile' : 'Profile Information'}
                  </h2>
                  {!isEditMode && (
                    <button
                      onClick={handleEditProfile}
                      className="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        borderColor: COLORS.gray[300],
                        color: COLORS.gray[700],
                        backgroundColor: COLORS.white
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.gray[50];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.white;
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = `2px solid ${COLORS.primary[500]}`;
                        e.currentTarget.style.outlineOffset = '2px';
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-6">
                  {/* Mobile Number Section */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.gray[50] }}>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>Mobile Number</label>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium" style={{ color: COLORS.gray[900] }}>{formData.mobile || 'Not provided'}</span>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: user?.isVerified ? COLORS.success[100] : COLORS.warning[100],
                          color: user?.isVerified ? COLORS.success[800] : COLORS.warning[800]
                        }}>
                          {user?.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Name Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>
                        First Name
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md outline-none text-sm sm:text-base"
                          style={{
                            borderColor: COLORS.gray[300]
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = COLORS.primary[500];
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = COLORS.gray[300];
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="py-2" style={{ color: COLORS.gray[900] }}>{formData.firstName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>
                        Last Name
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md outline-none text-sm sm:text-base"
                          style={{
                            borderColor: COLORS.gray[300]
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = COLORS.primary[500];
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = COLORS.gray[300];
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="py-2" style={{ color: COLORS.gray[900] }}>{formData.lastName || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Section */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>
                      Email Address
                    </label>
                    {isEditMode ? (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md outline-none text-sm sm:text-base"
                        style={{
                          borderColor: COLORS.gray[300]
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = COLORS.primary[500];
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = COLORS.gray[300];
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="py-2" style={{ color: COLORS.gray[900] }}>{formData.email || 'Not provided'}</p>
                    )}
                  </div>

                  {/* User Role and ID Section */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.gray[50] }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>User Role</label>
                        <p className="py-2 capitalize" style={{ color: COLORS.gray[900] }}>{user?.role || 'user'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.gray[700] }}>User ID</label>
                        <p className="py-2 text-xs font-mono" style={{ color: COLORS.gray[900] }}>{user?.id || 'Not available'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditMode && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: COLORS.gray[200] }}>
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: COLORS.primary[600],
                          color: COLORS.white
                        }}
                        onMouseEnter={(e) => {
                          if (!authLoading) {
                            e.currentTarget.style.backgroundColor = COLORS.primary[700];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!authLoading) {
                            e.currentTarget.style.backgroundColor = COLORS.primary[600];
                          }
                        }}
                      >
                        {authLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 font-medium py-2 px-4 rounded-md transition-colors"
                        style={{
                          backgroundColor: COLORS.gray[100],
                          color: COLORS.gray[700]
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.gray[200];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.gray[100];
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                {/* Error Message */}
                {authError && (
                  <div className="mt-4 border rounded-md p-4" style={{ backgroundColor: COLORS.error[50], borderColor: COLORS.error[200] }}>
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium" style={{ color: COLORS.error[800] }}>Error</h3>
                        <div className="mt-2 text-sm" style={{ color: COLORS.error[700] }}>
                          <p>{authError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: COLORS.gray[200] }}>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="font-medium text-sm"
                    style={{ color: COLORS.error[600] }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = COLORS.error[700];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = COLORS.error[600];
                    }}
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
