import React, { useState, useEffect } from 'react';
import AccountSidebar from '../components/AccountSidebar';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { usePincode } from '../context/PincodeContext';
import { COLORS } from '../constants/theme';
import { 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  setDefaultAddress,
  transformAddressFromAPI,
  transformAddressToAPI 
} from '../api/addressApi';

const AddressPage = () => {
  const { getCurrentPincode, confirmedLocation } = usePincode();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pinCode: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Initialize pincode from context when confirmed location changes
  useEffect(() => {
    const currentPincode = getCurrentPincode();
    if (currentPincode) {
      setFormData(prev => ({
        ...prev,
        pinCode: currentPincode
      }));
    }
  }, [confirmedLocation, getCurrentPincode]);

  
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setApiError('');
      const response = await getAddresses();
      
      if (response.success && response.data) {
        // Transform API data to UI format
        const transformedAddresses = response.data.map(transformAddressFromAPI);
        setAddresses(transformedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setApiError('Failed to load addresses. Please try again.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    // PIN code validation is not needed as it's automatically set from context
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode.replace(/\s/g, ''))) newErrors.pinCode = 'PIN code must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    const currentPincode = getCurrentPincode();
    setFormData({
      name: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      pinCode: currentPincode || '',
      isDefault: false
    });
    setErrors({});
    setApiError('');
    setShowAddModal(true);
  };

  const handleEditAddress = (address) => {
    // Store the original address data to preserve all IDs
    setEditingAddress(address);
    const currentPincode = getCurrentPincode();
    setFormData({
      name: address.name,
      email: address.email || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      pinCode: currentPincode || address.pinCode, // Use current pincode from context, fallback to address pincode
      isDefault: address.isDefault
    });
    setErrors({});
    setApiError('');
    setShowAddModal(true);
  };

  const handleDeleteAddress = async (address) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setApiError('');
        await deleteAddress(address.id);
        setSuccessMessage('Address deleted successfully');
        // Reload addresses after deletion
        await loadAddresses();
      } catch (error) {
        console.error('Failed to delete address:', error);
        setApiError(error.message || 'Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (address) => {
    try {
      setApiError('');
      
      // First, update all other addresses to non-default
      const updatePromises = addresses
        .filter(addr => addr.id !== address.id && addr.isDefault)
        .map(addr => {
          const apiData = transformAddressToAPI({ ...addr, isDefault: false });
          return updateAddress(addr.id, apiData);
        });
      
      await Promise.all(updatePromises);
      
      // Then set the selected address as default
      const apiData = transformAddressToAPI({ ...address, isDefault: true });
      // Pass the complete address data including all IDs
      await setDefaultAddress(address.id, { ...apiData, mongoId: address.mongoId, idaddress_book: address.idaddress_book });
      
      setSuccessMessage('Default address updated successfully');
      // Reload addresses
      await loadAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      setApiError(error.message || 'Failed to set default address. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      setApiError('');

      // Transform form data to API format
      const apiData = transformAddressToAPI(formData);

      if (editingAddress) {
        // Update existing address
        
        // If setting as default, first unset other default addresses
        if (formData.isDefault) {
          const updatePromises = addresses
            .filter(addr => addr.id !== editingAddress.id && addr.isDefault)
            .map(addr => {
              const data = transformAddressToAPI({ ...addr, isDefault: false });
              // Pass complete address data with all IDs
              return updateAddress(addr.id, { ...data, mongoId: addr.mongoId, idaddress_book: addr.idaddress_book });
            });
          await Promise.all(updatePromises);
        }
        
        // Debug: Log the address data being used for update
        console.log('🔍 Updating address with:', {
          editingAddressId: editingAddress.id,
          editingAddressMongoId: editingAddress.mongoId,
          editingAddressIdaddressBook: editingAddress.idaddress_book,
          apiData: apiData
        });
        
        // Pass complete address data with all IDs for the main update
        await updateAddress(editingAddress.id, { ...apiData, mongoId: editingAddress.mongoId, idaddress_book: editingAddress.idaddress_book });
        setSuccessMessage('Address updated successfully');
      } else {
        // Add new address
        
        // If setting as default, first unset other default addresses
        if (formData.isDefault) {
          const updatePromises = addresses
            .filter(addr => addr.isDefault)
            .map(addr => {
              const data = transformAddressToAPI({ ...addr, isDefault: false });
              // Pass complete address data with all IDs
              return updateAddress(addr.id, { ...data, mongoId: addr.mongoId, idaddress_book: addr.idaddress_book });
            });
          await Promise.all(updatePromises);
        }
        
        await addAddress(apiData);
        setSuccessMessage('Address added successfully');
      }

      // Reload addresses
      await loadAddresses();

      // Close modal and reset form
      setShowAddModal(false);
      setEditingAddress(null);
      const currentPincode = getCurrentPincode();
      setFormData({
        name: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        pinCode: currentPincode || '',
        isDefault: false
      });
    } catch (error) {
      console.error('Failed to save address:', error);
      setApiError(error.message || 'Failed to save address. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    setErrors({});
    setApiError('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray[50] }}>
      <div className="flex">
        <AccountSidebar />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 border px-4 py-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: COLORS.success[50], borderColor: COLORS.success[200], color: COLORS.success[800] }}>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>{successMessage}</span>
                </div>
                <button onClick={() => setSuccessMessage('')} style={{ color: COLORS.success[600] }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.success[800]; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.success[600]; }}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {apiError && (
              <div className="mb-4 border px-4 py-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: COLORS.error[50], borderColor: COLORS.error[200], color: COLORS.error[800] }}>
                <span>{apiError}</span>
                <button onClick={() => setApiError('')} style={{ color: COLORS.error[600] }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.error[800]; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.error[600]; }}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: COLORS.gray[900] }}>My Addresses</h1>
              <button
                onClick={handleAddAddress}
                className="text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: COLORS.primary[600] }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.primary[600];
                }}
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add New Address</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            
            {loading ? (
              <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200] }}>
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.primary[600] }}></div>
                  <p style={{ color: COLORS.gray[600] }}>Loading addresses...</p>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: COLORS.white, borderColor: COLORS.gray[200] }}>
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: COLORS.gray[100] }}>
                    <MapPinIcon className="w-8 h-8" style={{ color: COLORS.gray[400] }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.gray[900] }}>No addresses saved</h3>
                  <p className="mb-6" style={{ color: COLORS.gray[600] }}>Add your first address to get started</p>
                  <button
                    onClick={handleAddAddress}
                    className="text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    style={{ backgroundColor: COLORS.primary[600] }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primary[700];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primary[600];
                    }}
                  >
                    Add New Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {addresses.map((address, index) => (
                  <div
                    key={address.mongoId || address.id || `address-${index}`}
                    className="rounded-lg shadow-sm border-2 p-4 sm:p-6 relative transition-all hover:shadow-md"
                    style={{
                      backgroundColor: COLORS.white,
                      borderColor: address.isDefault ? COLORS.primary[500] : COLORS.gray[200]
                    }}
                  >
                    {/* Default Badge */}
                    {address.isDefault && (
                      <div className="flex items-center justify-end mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[800] }}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      </div>
                    )}

                    {/* Address Details */}
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1" style={{ color: COLORS.gray[900] }}>{address.name}</h3>
                      {address.email && <p className="text-sm mb-1" style={{ color: COLORS.gray[600] }}>Email: {address.email}</p>}
                      <p className="text-sm mt-2" style={{ color: COLORS.gray[600] }}>
                        {address.addressLine1}
                        {address.addressLine2 && <>, {address.addressLine2}</>}
                      </p>
                      <p className="text-sm" style={{ color: COLORS.gray[600] }}>
                        {address.city} - {address.pinCode}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: COLORS.gray[100] }}>
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address)}
                          className="text-xs font-medium"
                          style={{ color: COLORS.primary[600] }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = COLORS.primary[700];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = COLORS.primary[600];
                          }}
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="ml-auto p-2 rounded-lg transition-colors"
                        style={{ color: COLORS.primary[600] }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary[700];
                          e.currentTarget.style.backgroundColor = COLORS.primary[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.primary[600];
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: COLORS.error[600] }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.error[700];
                          e.currentTarget.style.backgroundColor = COLORS.error[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.error[600];
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: COLORS.white }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: COLORS.gray[200] }}>
              <h2 className="text-xl font-bold" style={{ color: COLORS.gray[900] }}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="transition-colors"
                style={{ color: COLORS.gray[400] }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.gray[600];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.gray[400];
                }}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* API Error in Modal */}
              {apiError && (
                <div className="border px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: COLORS.error[50], borderColor: COLORS.error[200], color: COLORS.error[800] }}>
                  {apiError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                  Full Name <span style={{ color: COLORS.error[500] }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  style={{
                    borderColor: errors.name ? COLORS.error[500] : COLORS.gray[300]
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = COLORS.primary[500];
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.name) {
                      e.currentTarget.style.borderColor = COLORS.gray[300];
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-sm mt-1" style={{ color: COLORS.error[500] }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  style={{
                    borderColor: errors.email ? COLORS.error[500] : COLORS.gray[300]
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = COLORS.primary[500];
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = COLORS.gray[300];
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-sm mt-1" style={{ color: COLORS.error[500] }}>{errors.email}</p>}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                  Address Line 1 <span style={{ color: COLORS.error[500] }}>*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  style={{
                    borderColor: errors.addressLine1 ? COLORS.error[500] : COLORS.gray[300]
                  }}
                  onFocus={(e) => {
                    if (!errors.addressLine1) {
                      e.currentTarget.style.borderColor = COLORS.primary[500];
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.addressLine1) {
                      e.currentTarget.style.borderColor = COLORS.gray[300];
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="House no., Building name"
                />
                {errors.addressLine1 && <p className="text-sm mt-1" style={{ color: COLORS.error[500] }}>{errors.addressLine1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                  placeholder="Road name, Area, Colony"
                />
              </div>

              {/* City and PIN Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                    City <span style={{ color: COLORS.error[500] }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{
                      borderColor: errors.city ? COLORS.error[500] : COLORS.gray[300]
                    }}
                    onFocus={(e) => {
                      if (!errors.city) {
                        e.currentTarget.style.borderColor = COLORS.primary[500];
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.primary[500]}40`;
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.city) {
                        e.currentTarget.style.borderColor = COLORS.gray[300];
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-sm mt-1" style={{ color: COLORS.error[500] }}>{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.gray[700] }}>
                    PIN Code <span style={{ color: COLORS.error[500] }}>*</span>
                    <span className="text-xs ml-2" style={{ color: COLORS.gray[500] }}>(Fixed from selected location)</span>
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    readOnly
                    maxLength={6}
                    className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                    style={{
                      borderColor: COLORS.gray[300],
                      backgroundColor: COLORS.gray[50],
                      color: COLORS.gray[700]
                    }}
                    placeholder="6-digit PIN"
                  />
                  <p className="text-xs mt-1" style={{ color: COLORS.gray[500] }}>
                    PIN code is automatically set from your selected location
                  </p>
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="rounded"
                  style={{ accentColor: COLORS.primary[600] }}
                />
                <label className="ml-2 text-sm" style={{ color: COLORS.gray[700] }}>Set as default address</label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: COLORS.gray[200] }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: COLORS.gray[300],
                    color: COLORS.gray[700],
                    backgroundColor: COLORS.white
                  }}
                  onMouseEnter={(e) => {
                    if (!submitLoading) {
                      e.currentTarget.style.backgroundColor = COLORS.gray[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitLoading) {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: COLORS.primary[600]
                  }}
                  onMouseEnter={(e) => {
                    if (!submitLoading) {
                      e.currentTarget.style.backgroundColor = COLORS.primary[700];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitLoading) {
                      e.currentTarget.style.backgroundColor = COLORS.primary[600];
                    }
                  }}
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: COLORS.white }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
