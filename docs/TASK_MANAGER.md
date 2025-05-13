# Krosh - Task Manager

This document outlines the pending tasks for the Krosh e-commerce platform in order of priority. Tasks are categorized by their importance and dependency relationships.

## Priority Levels

- **P0**: Critical issues that block functionality or cause errors
- **P1**: High-priority features needed for core functionality
- **P2**: Important features for a complete user experience
- **P3**: Nice-to-have features that enhance the user experience
- **P4**: Future enhancements

## Action Plan

### P0: Critical Issues

1. **Fix Product Variant Schema Issue**
   - Remove SKU column from product_variants table and UI
   - Remove size from product_variants in UI and schema in admin section
   - Update AdminProductVariants.tsx to remove these fields
   - Update related database migrations if necessary
   - *Estimated time: 2-3 hours*

2. **Fix Disabled Button Styling**
   - Review and update button styling to ensure they don't appear disabled
   - Update button component styles across the application
   - *Estimated time: 1-2 hours*

### P1: Core Functionality

3. **Implement User Registration**
   - Create registration page with form validation
   - Implement registration functionality using Supabase auth
   - Add user data to users table after successful registration
   - *Estimated time: 4-6 hours*

4. **Complete Orders Page in Admin**
   - Finish implementation of AdminOrders.tsx
   - Add order status management functionality
   - Implement order details view
   - *Estimated time: 6-8 hours*

5. **Implement Order Status Workflow**
   - Update order status from requested to approved to shipped
   - Add notifications for status changes
   - *Estimated time: 4-5 hours*

6. **Convert Currency to Rupees**
   - Update price display across the application
   - Add ₹ symbol instead of $
   - *Estimated time: 1-2 hours*

7. **Remove Search from Sidebar**
   - Update Sidebar.tsx to remove search option
   - *Estimated time: 30 minutes*

### P2: Important Features

8. **Implement Settings Page in Admin**
   - Create AdminSettings.tsx with configuration options
   - Add store settings management
   - *Estimated time: 6-8 hours*

9. **Redesign Cart Page**
   - Improve UI/UX of the cart page
   - Add better product display
   - Improve quantity controls
   - *Estimated time: 4-6 hours*

10. **Redesign Home Page**
    - Add beginners kit section
    - Add information about crocheting
    - Improve overall layout and visual appeal
    - *Estimated time: 8-10 hours*

11. **Implement Search Tab**
    - Update Search.tsx to show results only after user searches
    - Improve search functionality
    - *Estimated time: 3-4 hours*

12. **Design My Orders Page**
    - Create user-facing orders page
    - Show order history and status
    - *Estimated time: 5-6 hours*

13. **Add Categories Dropdown in Sidebar**
    - Update Sidebar.tsx to include categories dropdown
    - *Estimated time: 2-3 hours*

14. **Manage User Addresses**
    - Implement save, delete, and set primary address functionality
    - Update Profile.tsx to manage addresses
    - *Estimated time: 4-5 hours*

### P3: Enhanced User Experience

15. **Design About Page**
    - Create About.tsx with company information
    - *Estimated time: 3-4 hours*

16. **Add Terms and Conditions and Privacy Section**
    - Create pages for legal information
    - Add links in footer
    - *Estimated time: 3-4 hours*

17. **Add Our Story in Sidebar**
    - Update Sidebar.tsx to include Our Story link
    - Create Our Story page
    - *Estimated time: 2-3 hours*

18. **Add FAQ Section in Sidebar**
    - Update Sidebar.tsx to include FAQ link
    - Create FAQ page
    - *Estimated time: 3-4 hours*

19. **Redesign Profile Section**
    - Improve UI/UX of the profile page
    - Add more user information display
    - *Estimated time: 4-5 hours*

20. **Add Social Media Links**
    - Create social media section
    - Add redirection to social platforms
    - *Estimated time: 1-2 hours*

21. **Update Footer**
    - Add categories and sidebar sections to footer
    - Add policies in the footer
    - *Estimated time: 2-3 hours*

22. **Add Favicon Icon**
    - Create and add favicon
    - Update index.html
    - *Estimated time: 1 hour*

23. **Add Logo to Navbar**
    - Design solution for circular logo in navbar
    - *Estimated time: 2-3 hours*

### P4: Future Enhancements

24. **Implement Checkout Functionality**
    - Research options for checkout process
    - Implement WhatsApp integration for order communication
    - *Estimated time: 10-12 hours*

25. **Add Payment Functionality**
    - Research payment gateway options
    - Implement payment processing
    - *Estimated time: 12-15 hours*

26. **Implement Shipping Management**
    - Research shipping options
    - Implement shipping cost calculation
    - *Estimated time: 6-8 hours*

27. **Add Banner Images**
    - Design and implement banner system
    - *Estimated time: 3-4 hours*

28. **Implement Inventory Management**
    - Create inventory tracking system
    - Add low stock alerts
    - *Estimated time: 8-10 hours*

29. **Add Restock Functionality**
    - Implement product restocking workflow
    - *Estimated time: 4-5 hours*

30. **Implement Email Service**
    - Set up email notifications
    - Add order confirmation emails
    - *Estimated time: 6-8 hours*

31. **Convert to PWA**
    - Add service worker
    - Create manifest.json
    - Implement offline functionality
    - *Estimated time: 8-10 hours*

## Task Completion Tracker

| Task ID | Task Name | Status | Completion Date | Notes |
|---------|-----------|--------|----------------|-------|
| 1 | Fix Product Variant Schema Issue | Completed | 2023-07-10 | Removed SKU and size fields from product_variants UI in AdminProductVariants.tsx |
| 2 | Fix Disabled Button Styling | Pending | | |
| 3 | Implement User Registration | Pending | | |
| 4 | Complete Orders Page in Admin | Pending | | |
| 5 | Implement Order Status Workflow | Pending | | |
| 6 | Convert Currency to Rupees | Pending | | |
| 7 | Remove Search from Sidebar | Pending | | |
| 8 | Implement Settings Page in Admin | Pending | | |
| 9 | Redesign Cart Page | Pending | | |
| 10 | Redesign Home Page | Pending | | |
| 11 | Implement Search Tab | Pending | | |
| 12 | Design My Orders Page | Pending | | |
| 13 | Add Categories Dropdown in Sidebar | Pending | | |
| 14 | Manage User Addresses | Pending | | |
| 15 | Design About Page | Pending | | |
| 16 | Add Terms and Conditions and Privacy Section | Pending | | |
| 17 | Add Our Story in Sidebar | Pending | | |
| 18 | Add FAQ Section in Sidebar | Pending | | |
| 19 | Redesign Profile Section | Pending | | |
| 20 | Add Social Media Links | Pending | | |
| 21 | Update Footer | Pending | | |
| 22 | Add Favicon Icon | Pending | | |
| 23 | Add Logo to Navbar | Pending | | |
| 24 | Implement Checkout Functionality | Pending | | |
| 25 | Add Payment Functionality | Pending | | |
| 26 | Implement Shipping Management | Pending | | |
| 27 | Add Banner Images | Pending | | |
| 28 | Implement Inventory Management | Pending | | |
| 29 | Add Restock Functionality | Pending | | |
| 30 | Implement Email Service | Pending | | |
| 31 | Convert to PWA | Pending | | |
