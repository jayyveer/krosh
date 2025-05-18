import React from 'react';
import PolicyPage from '../components/policy/PolicyPage';

const Returns: React.FC = () => {
  return (
    <PolicyPage title="Return Policy" lastUpdated="July 15, 2023">
      <h2>1. Return Policy Overview</h2>
      <p>
        At Yarn by Krosh, we want you to be completely satisfied with your purchase. This Return Policy 
        outlines our procedures for returns, exchanges, and refunds.
      </p>
      <p>
        Please read this policy carefully before making a purchase. By placing an order with us, you agree 
        to the terms of this Return Policy.
      </p>
      
      <h2>2. Return Eligibility</h2>
      <p>
        You may return items purchased from Yarn by Krosh within 7 days of delivery, provided that:
      </p>
      <ul>
        <li>The item is unused and in its original condition</li>
        <li>The item is in its original packaging with all tags attached</li>
        <li>You have proof of purchase (order confirmation or receipt)</li>
      </ul>
      <p>
        The following items are not eligible for return:
      </p>
      <ul>
        <li>Items that have been used, altered, or washed</li>
        <li>Items marked as "Final Sale" or "Non-Returnable"</li>
        <li>Downloadable patterns or digital products</li>
        <li>Gift cards</li>
      </ul>
      
      <h2>3. Return Process</h2>
      <p>
        To initiate a return, please follow these steps:
      </p>
      <ol>
        <li>Contact our customer service team at kroshenquiry@gmail.com within 7 days of receiving your order</li>
        <li>Include your order number and the reason for the return in your email</li>
        <li>Our team will provide you with return instructions and a return authorization</li>
        <li>Package the item(s) securely in their original packaging</li>
        <li>Ship the package to the address provided in the return instructions</li>
      </ol>
      <p>
        We recommend using a trackable shipping method for all returns to ensure that your package can be 
        tracked and verified upon receipt.
      </p>
      
      <h2>4. Return Shipping</h2>
      <p>
        Customers are responsible for return shipping costs unless the return is due to our error (such as 
        sending the wrong item or a defective product).
      </p>
      <p>
        If the return is due to our error, we will provide a prepaid shipping label or reimburse your return 
        shipping costs.
      </p>
      
      <h2>5. Refunds</h2>
      <p>
        Once we receive and inspect your return, we will notify you about the status of your refund.
      </p>
      <p>
        If your return is approved, we will initiate a refund to your original method of payment. The time it 
        takes for the refund to appear in your account depends on your payment provider's processing times, 
        but typically takes 5-10 business days.
      </p>
      <p>
        Refunds include the price of the item(s) but do not include the original shipping charges unless the 
        return is due to our error.
      </p>
      
      <h2>6. Exchanges</h2>
      <p>
        If you would like to exchange an item for a different size, color, or product, please follow the return 
        process and place a new order for the desired item.
      </p>
      <p>
        If the exchange is due to our error, please contact our customer service team, and we will arrange the 
        exchange at no additional cost to you.
      </p>
      
      <h2>7. Damaged or Defective Items</h2>
      <p>
        If you receive a damaged or defective item, please contact us at kroshenquiry@gmail.com within 48 hours 
        of delivery with photos of the damage or defect.
      </p>
      <p>
        We will arrange for a replacement or refund, including return shipping costs, for all damaged or defective items.
      </p>
      
      <h2>8. Late or Missing Refunds</h2>
      <p>
        If you haven't received your refund within 10 business days after we've confirmed its processing, please 
        check your bank account again and then contact your credit card company or bank, as it may take some time 
        for the refund to be officially posted.
      </p>
      <p>
        If you've done this and still haven't received your refund, please contact us at kroshenquiry@gmail.com.
      </p>
      
      <h2>9. Sale Items</h2>
      <p>
        Items purchased on sale or with a discount code are eligible for return under the same conditions as 
        regularly priced items, unless specifically marked as "Final Sale" or "Non-Returnable."
      </p>
      
      <h2>10. Changes to This Policy</h2>
      <p>
        We reserve the right to modify this Return Policy at any time. Changes will be effective immediately upon 
        posting on our website. Your continued use of our services after such modifications constitutes your 
        acceptance of the modified policy.
      </p>
      
      <h2>11. Contact Us</h2>
      <p>
        If you have any questions about our Return Policy, please contact us at kroshenquiry@gmail.com.
      </p>
    </PolicyPage>
  );
};

export default Returns;
