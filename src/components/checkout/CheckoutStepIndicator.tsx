import React from 'react';
import { ShoppingCart, MapPin, CreditCard, CheckCircle } from 'lucide-react';

interface CheckoutStepIndicatorProps {
  currentStep: 'verify' | 'address' | 'summary';
}

const CheckoutStepIndicator: React.FC<CheckoutStepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { 
      name: 'Verify', 
      status: currentStep === 'verify' ? 'current' : 'completed', 
      icon: <ShoppingCart size={16} /> 
    },
    { 
      name: 'Address', 
      status: currentStep === 'address' ? 'current' : currentStep === 'verify' ? 'upcoming' : 'completed', 
      icon: <MapPin size={16} /> 
    },
    { 
      name: 'Checkout', 
      status: currentStep === 'summary' ? 'current' : 'upcoming', 
      icon: <CreditCard size={16} /> 
    }
  ];

  return (
    <div className="mb-6 mt-2">
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'current'
                      ? 'bg-krosh-lavender text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle size={18} />
                ) : (
                  step.icon || <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 ${
                step.status === 'current' ? 'font-medium text-krosh-lavender' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="w-full h-0.5 flex-1 mx-2">
                <div
                  className={`h-full ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutStepIndicator;
