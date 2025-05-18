# Krosh - Task Manager

This document outlines the pending tasks for the Krosh e-commerce platform in order of priority. Tasks are categorized by their importance and dependency relationships.

## Priority Levels

- **P0**: Critical issues that block functionality or cause errors
- **P1**: High-priority features needed for core functionality
- **P2**: Important features for a complete user experience
- **P3**: Nice-to-have features that enhance the user experience
- **P4**: Future enhancements

## Action Plan


### P1: Core Functionality (Admin)

1. **Complete Orders Page in Admin**
   - Finish implementation of AdminOrders.tsx
   - Add order status management functionality
   - Implement order details view
   - *Estimated time: 6-8 hours*

2. **Implement Order Status Workflow**
   - Update order status from requested to approved to shipped
   - Add notifications for status changes
   - *Estimated time: 4-5 hours*

3. **Implement Settings Page in Admin**
   - Create AdminSettings.tsx with configuration options
   - Add store settings management
   - *Estimated time: 6-8 hours*


### P2: Important Features (Shop)


2. **Implement Search Tab**
   - Update Search.tsx to show results only after user searches
   - Improve search functionality
   - *Estimated time: 3-4 hours*

### P4: Future Enhancements


2. **Add Payment Functionality**
   - Research payment gateway options
   - Implement payment processing
   - *Estimated time: 12-15 hours*

3. **Implement Shipping Management**
   - Research shipping options
   - Implement shipping cost calculation
   - *Estimated time: 6-8 hours*

4. **Add Banner Images**
   - Design and implement banner system
   - *Estimated time: 3-4 hours*

5. **Implement Inventory Management**
   - Create inventory tracking system
   - Add low stock alerts
   - *Estimated time: 8-10 hours*

6. **Add Restock Functionality**
   - Implement product restocking workflow
   - *Estimated time: 4-5 hours*

7. **Implement Email Service**
   - Set up email notifications
   - Add order confirmation emails
   - *Estimated time: 6-8 hours*

8. **Convert to PWA**
   - Add service worker
   - Create manifest.json
   - Implement offline functionality
   - *Estimated time: 8-10 hours*

## Task Completion Tracker

| Task ID | Task Name | Completion Date | Notes |
|---------|-----------|----------------|-------|
| 1 | Fix Product Variant Schema Issue | 2023-07-10 | Removed SKU and size fields from product_variants UI in AdminProductVariants.tsx |
| 2 | Convert Currency to Rupees | 2023-07-10 | Created formatPrice utility function and updated all price displays to use ₹ symbol |
| 3 | Remove Search from Sidebar | 2023-07-10 | Removed Search option from Sidebar.tsx |
| 4 | Redesign Cart Page | 2023-07-10 | Improved UI with better product display, enhanced quantity controls, and redesigned order summary |
| 5 | Add Categories Dropdown in Sidebar | 2023-07-10 | Added categories dropdown in Sidebar.tsx with dynamic fetching from Supabase |
