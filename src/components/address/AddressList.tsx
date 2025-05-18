import React, { useState } from 'react';
import { MapPin, Edit, Trash2, Plus, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import AddressForm, { Address } from './AddressForm';

interface AddressListProps {
  addresses: Address[];
  onAddressChange: () => void;
  isCheckout?: boolean;
  selectedAddressId?: string;
  onAddressSelect?: (addressId: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ 
  addresses, 
  onAddressChange,
  isCheckout = false,
  selectedAddressId,
  onAddressSelect
}) => {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [addressId]: true }));
      
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
        
      if (error) throw error;
      
      showToast('Address deleted successfully', 'success');
      onAddressChange();
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
    } finally {
      setLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[addressId];
        return newLoading;
      });
    }
  };

  const handleSetPrimary = async (addressId: string) => {
    try {
      setLoading(prev => ({ ...prev, [addressId]: true }));
      
      const { error } = await supabase
        .from('addresses')
        .update({ is_primary: true })
        .eq('id', addressId);
        
      if (error) throw error;
      
      showToast('Primary address updated', 'success');
      onAddressChange();
    } catch (error) {
      console.error('Error updating primary address:', error);
      showToast('Failed to update primary address', 'error');
    } finally {
      setLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[addressId];
        return newLoading;
      });
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = () => {
    onAddressChange();
  };

  const handleSelectAddress = (addressId: string) => {
    if (onAddressSelect) {
      onAddressSelect(addressId);
    }
  };

  if (showAddForm) {
    return (
      <AddressForm 
        address={editingAddress || undefined} 
        onClose={handleCloseForm} 
        onSave={handleSaveAddress}
        isCheckout={isCheckout}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          {isCheckout ? 'Select Delivery Address' : 'Saved Addresses'}
        </h3>
        <button 
          onClick={handleAddNew}
          className="text-sm text-krosh-lavender flex items-center gap-1"
        >
          <Plus size={16} />
          <span>Add New</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <MapPin size={24} className="mx-auto mb-2 text-gray-400" />
          <p>No addresses saved yet</p>
          <p className="text-sm">Add an address to make checkout faster</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border rounded-lg p-3 relative ${
                isCheckout && selectedAddressId === address.id 
                  ? 'border-krosh-lavender bg-krosh-lavender/5' 
                  : 'border-gray-200'
              } ${isCheckout ? 'cursor-pointer' : ''}`}
              onClick={isCheckout ? () => handleSelectAddress(address.id!) : undefined}
            >
              {address.is_primary && !isCheckout && (
                <span className="absolute top-2 right-2 bg-krosh-lavender/20 text-krosh-text text-xs px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
              
              <div className="flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{address.label}</span>
                  {isCheckout && selectedAddressId === address.id && (
                    <Check size={18} className="text-krosh-lavender" />
                  )}
                </div>
                
                <p className="text-sm mt-1">{address.address_line}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="text-sm text-gray-600">{address.country}</p>
                
                {!isCheckout && (
                  <div className="flex gap-3 mt-3">
                    {!address.is_primary && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(address.id!);
                        }}
                        disabled={loading[address.id!]}
                        className="text-xs text-krosh-lavender flex items-center gap-1"
                      >
                        <Check size={14} />
                        Set as Primary
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      className="text-xs text-gray-600 flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address.id!);
                      }}
                      disabled={loading[address.id!]}
                      className="text-xs text-red-500 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      {loading[address.id!] ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
