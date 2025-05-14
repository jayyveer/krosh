import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  created_at?: string;
}

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
          <div className="space-y-3 mb-6">
            {userAddresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 relative ${
                  selectedAddress === address.id ? 'border-krosh-lavender bg-krosh-lavender/5' : 'border-gray-200'
                }`}
                onClick={() => onAddressSelect(address.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddress === address.id ? 'border-krosh-lavender' : 'border-gray-300'
                    }`}>
                      {selectedAddress === address.id && (
                        <div className="w-3 h-3 rounded-full bg-krosh-lavender"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{address.address_line1}</p>
                    {address.address_line2 && <p className="text-gray-600">{address.address_line2}</p>}
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
