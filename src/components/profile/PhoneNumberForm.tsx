import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface PhoneNumberFormProps {
  currentPhone?: string;
  userId: string;
  onClose: () => void;
  onSave: (phone: string) => void;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  currentPhone = '',
  userId,
  onClose,
  onSave
}) => {
  const { showToast } = useToast();
  const [phone, setPhone] = useState(currentPhone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhone(value);
    setError('');
  };

  const validatePhone = (): boolean => {
    if (!phone) {
      setError('Phone number is required');
      return false;
    }
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ phone })
        .eq('id', userId);
        
      if (error) throw error;
      
      showToast('Phone number updated successfully', 'success');
      onSave(phone);
      onClose();
    } catch (err) {
      console.error('Error updating phone number:', err);
      showToast('Failed to update phone number', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Update Phone Number</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone size={18} className="text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full pl-10 pr-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Please enter a valid 10-digit Indian mobile number
          </p>
        </div>
        
        <div className="flex justify-end gap-2">
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
            {loading ? 'Saving...' : 'Save Phone Number'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhoneNumberForm;
