import React from 'react';
import PolicyPage from '../components/policy/PolicyPage';

const Shipping: React.FC = () => {
  return (
    <PolicyPage title="Shipping Policy" lastUpdated="July 15, 2023">
      <h2>1. Shipping Information</h2>
      <p>
        At Yarn by Krosh, we strive to deliver your orders promptly and securely. This Shipping Policy 
        outlines our shipping procedures, delivery timeframes, and other important information regarding 
        the delivery of your purchases.
      </p>
      
      <h2>2. Processing Time</h2>
      <p>
        All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving 
        your order confirmation email. Orders placed after 2:00 PM IST may be processed the next business day.
      </p>
      <p>
        During peak seasons or promotional periods, processing times may be slightly longer. We will notify 
        you if there are any unexpected delays in processing your order.
      </p>
      
      <h2>3. Shipping Methods and Timeframes</h2>
      <p>
        We currently offer shipping within India only. Shipping methods and estimated delivery timeframes are as follows:
      </p>
      <ul>
        <li><strong>Standard Shipping:</strong> 3-7 business days</li>
        <li><strong>Express Shipping:</strong> 1-3 business days (available for select locations)</li>
      </ul>
      <p>
        Please note that these are estimated timeframes and actual delivery times may vary depending on your 
        location and other factors beyond our control.
      </p>
      
      <h2>4. Shipping Costs</h2>
      <p>
        Shipping costs are calculated based on the weight of your order and your delivery location. The exact 
        shipping cost will be displayed during checkout before you complete your purchase.
      </p>
      <p>
        We offer free standard shipping on orders above ₹999. This offer is valid for deliveries within India only.
      </p>
      
      <h2>5. Order Tracking</h2>
      <p>
        Once your order has been shipped, you will receive a shipping confirmation email with a tracking number. 
        You can use this tracking number to monitor the status of your delivery.
      </p>
      <p>
        You can also track your order by logging into your account on our website and viewing your order history.
      </p>
      
      <h2>6. Delivery</h2>
      <p>
        All orders require a signature upon delivery unless you have authorized the carrier to leave the package 
        without a signature.
      </p>
      <p>
        If you are not available to receive your package, the carrier may leave a delivery attempt notice with 
        instructions on how to retrieve your package or schedule a redelivery.
      </p>
      
      <h2>7. Shipping Restrictions</h2>
      <p>
        We currently do not ship to international addresses or P.O. boxes. If your shipping address is outside 
        our delivery area, we will contact you to arrange an alternative delivery method or provide a refund.
      </p>
      
      <h2>8. Lost or Damaged Packages</h2>
      <p>
        If your package appears to be lost or damaged during transit, please contact us at kroshenquiry@gmail.com 
        within 7 days of the estimated delivery date. We will work with the carrier to locate your package or 
        process a replacement or refund.
      </p>
      <p>
        We recommend inspecting your package upon delivery and reporting any damage immediately.
      </p>
      
      <h2>9. Address Changes</h2>
      <p>
        If you need to change your shipping address after placing an order, please contact us as soon as possible 
        at kroshenquiry@gmail.com. We will do our best to accommodate your request if the order has not yet been 
        shipped. Once an order has been shipped, we cannot change the delivery address.
      </p>
      
      <h2>10. Customs and International Duties</h2>
      <p>
        As we currently only ship within India, there are no customs fees or international duties applicable to 
        our shipments. If we expand our shipping to international destinations in the future, this policy will be 
        updated accordingly.
      </p>
      
      <h2>11. Contact Us</h2>
      <p>
        If you have any questions about our Shipping Policy, please contact us at kroshenquiry@gmail.com.
      </p>
    </PolicyPage>
  );
};

export default Shipping;
