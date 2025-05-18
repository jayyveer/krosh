import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import AddressList from '../address/AddressList';
import { Address } from '../address/AddressForm';
import { supabase } from '../../lib/supabase';

interface ShippingAddressStepProps {
  userAddresses: Address[];
  selectedAddress: string | null;
  loadingAddresses: boolean;
  onAddressSelect: (addressId: string) => void;
  onBackClick: () => void;
  onContinue: () => void;
}

const ShippingAddressStep: React.FC<ShippingAddressStepProps> = ({
  userAddresses,
  selectedAddress,
  loadingAddresses,
  onAddressSelect,
  onBackClick,
  onContinue
}) => {
  return (
    <>
      <SectionHeader title="Shipping Address" showBackButton={true} onBackClick={onBackClick} />

      {loadingAddresses ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-krosh-lavender/30 border-t-krosh-lavender rounded-full animate-spin"></div>
        </div>
      ) : userAddresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-krosh-lavender/20 rounded-full flex items-center justify-center mb-4">
              <MapPin size={30} className="text-krosh-lavender" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Addresses Found</h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
              Please add a shipping address to continue with checkout.
            </p>
            <Link
              to="/profile"
              className="px-6 py-2 bg-krosh-lavender text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Add Address
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <AddressList
              addresses={userAddresses}
              onAddressChange={async () => {
                // Refresh addresses
                const { data } = await supabase
                  .from('addresses')
                  .select('*')
                  .eq('user_id', userAddresses[0].user_id)
                  .order('is_primary', { ascending: false });

                if (data && data.length > 0) {
                  // Update addresses in parent component
                  // This is a workaround since we can't directly update userAddresses
                  onAddressSelect(data[0].id);
                }
              }}
              isCheckout={true}
              selectedAddressId={selectedAddress || undefined}
              onAddressSelect={onAddressSelect}
            />
          </div>

          <button
            onClick={() => {
              console.log('Proceeding to summary step');
              onContinue();
            }}
            disabled={!selectedAddress}
            className={`w-full py-3 rounded-lg font-medium ${
              !selectedAddress
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white hover:opacity-90 transition-opacity shadow-md'
            }`}
          >
            Continue to Checkout
          </button>
        </>
      )}
    </>
  );
};

export default ShippingAddressStep;
