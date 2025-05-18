import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export interface Address {
  id?: string;
  user_id?: string;
  label: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_primary: boolean;
  created_at?: string;
}

interface AddressFormProps {
  address?: Address;
  onClose: () => void;
  onSave: () => void;
  isCheckout?: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const AddressForm: React.FC<AddressFormProps> = ({ 
  address, 
  onClose, 
  onSave,
  isCheckout = false
}) => {
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Address>({
    label: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    is_primary: false
  });

  useEffect(() => {
    if (address) {
      setFormData({
        ...address
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'Address label is required';
    }
    
    if (!formData.address_line.trim()) {
      newErrors.address_line = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'PIN code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const addressData = {
        ...formData,
        user_id: user?.id
      };
      
      if (address?.id) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', address.id);
          
        if (error) throw error;
        showToast('Address updated successfully', 'success');
      } else {
        // Insert new address
        const { error } = await supabase
          .from('addresses')
          .insert(addressData);
          
        if (error) throw error;
        showToast('Address added successfully', 'success');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">
          {address?.id ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
              Address Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Home, Office, etc."
              className={`w-full px-3 py-2 border rounded-md ${errors.label ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.label && <p className="mt-1 text-sm text-red-500">{errors.label}</p>}
          </div>
          
          <div>
            <label htmlFor="address_line" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address_line"
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              rows={3}
              placeholder="Street address, apartment, etc."
              className={`w-full px-3 py-2 border rounded-md ${errors.address_line ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address_line && <p className="mt-1 text-sm text-red-500">{errors.address_line}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-md ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_primary"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="h-4 w-4 text-krosh-lavender border-gray-300 rounded"
            />
            <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
              Set as primary address
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-krosh-lavender text-white rounded-md hover:opacity-90 disabled:opacity-70"
            >
              {loading ? 'Saving...' : (address?.id ? 'Update Address' : 'Save Address')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
