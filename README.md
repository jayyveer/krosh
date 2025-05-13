# Krosh – Yarn & Crochet Store

A beautiful, responsive eCommerce UI scaffold for a yarn and crochet supply brand.

## Project Overview

Krosh is an elegant eCommerce platform for yarn and crochet enthusiasts. This project implements a complete UI scaffold with responsive design, animations, and dummy data to showcase the platform's capabilities.

### Tech Stack

- **React** - Component-based UI library
- **TypeScript** - Type safety and improved developer experience
- **Redux Toolkit** - State management for predictable application state
- **Tailwind CSS** - Utility-first CSS framework with custom pastel palette
- **Framer Motion** - Animation library for subtle UI interactions
- **React Router** - Navigation and routing
- **Vite** - Fast build tool and development server

## Project Structure

```
/src
  /components
    /layout
      - Layout.tsx
      - TopNavbar.tsx
      - Sidebar.tsx
      - BottomTabs.tsx
    /ui
      - ProductCard.tsx
      - PromoSection.tsx
      - AnimatedContainer.tsx
      - FilterButton.tsx
  /redux
    /slices
      - cartSlice.ts
    - store.ts
    - hooks.ts
  /screens
    - Home.tsx
    - Shop.tsx
    - Search.tsx
    - Profile.tsx
    - Cart.tsx
    - Admin.tsx
    - NotFound.tsx
  /hooks
    - useCart.ts
  /contexts
    - AuthContext.tsx
    - ToastContext.tsx
  /lib
    - animations.ts
    - dummyData.ts
    - api.ts
    - auth.ts
    - supabase.ts
  - App.tsx
  - main.tsx
  - index.css
```

## Design Principles

- **Minimal, Elegant UI** - Clean, uncluttered design suited for a yarn/craft store
- **Pastel Color Palette** - Warm, welcoming tones:
  - Lavender: `#E3D0FF`
  - Pastel Pink: `#FFC1CC`
  - Powder Blue: `#A3D2CA`
  - Text: `#333333`
  - Background: `#FFFDFD`
- **Responsive Design** - Mobile-first approach, optimized for all devices
- **Subtle Animations** - Non-intrusive animations that enhance the user experience

## Features

- **Responsive Navigation**
  - Top Navbar (always visible)
  - Sidebar (desktop/toggled on mobile)
  - Bottom Tabs (mobile only)
- **Dummy Screens**
  - Home - Welcome message and promo sections
  - Shop - Grid of product cards with category filters
  - Search - Search bar with dummy filter functionality
  - Profile - Dummy login screen
  - Cart - Empty state message
  - Admin - Placeholder for future admin dashboard
- **Animations**
  - Page transitions
  - Card hover effects
  - Sidebar slide
  - UI element interactions

## Phase Planning

This repository represents Phase 0 (UI Scaffold) of the Krosh project. Future phases include:

- **Phase 1**: Supabase integration for product/catalog data
- **Phase 2**: User login/signup + cart logic
- **Phase 3**: Admin panel (on `/admin`)
- **Phase 4**: Payments integration (Stripe, COD)
- **Phase 5**: Inventory, orders, invoices

## COMPLETED TASKS
1. ✅ Topnavbar in the right now shows first cart icon then Login button/ if logged in then it shows circle user avatar and name of the user
2. ✅ Sidebar is now open when in desktop mode and closed by default when in mobile mode
3. ✅ Cart no. of products in the cart is now reflected instantly using Redux
4. ✅ Made the login route a separate route with no layout (no header/bottom tabs)
5. ✅ Added user avatar dropdown with profile, orders, and logout options
6. ✅ Added logout button in sidebar and profile section
7. ✅ Profile section now shows user details (name, email, phone, addresses)
8. ✅ Updated bottom tabs to show Home, Search, Categories, Shop, and Profile

## COMPLETED TASKS (LATEST)
1. ✅ Removed Shop from the bottom tab and replaced with Cart
2. ✅ Added category filtering functionality - when user selects a category, it shows products of that category only
3. ✅ Applied back button to sections which takes users back to where they came from
4. ✅ Styled headings better with consistent design and back button integration
5. ✅ Moved toast messages to top-right with a more compact and visually appealing design
6. ✅ Fixed cart count update issue - now updates instantly when products are added to cart

## COMPLETED TASKS (NEWEST)
1. ✅ Added back button to all sections (Search, Categories, Cart, Profile)
2. ✅ Changed section headings to use black font instead of gradient
3. ✅ Implemented UI with back button and section heading side by side
4. ✅ Made back button consistent across all sections for scalable UI
5. ✅ Updated categories to sort Z-A (reverse alphabetical order)
6. ✅ Fixed cart functionality to update count immediately when products are added
7. ✅ Modified search page to only show products after user searches, with loading state

## COMPLETED TASKS (LATEST)
1. ✅ Added back button to Profile and Shop sections (always visible)
2. ✅ Adjusted toast notification position to avoid overlapping with cart icon
3. ✅ Implemented lazy loading for products with "Load More" button and Supabase pagination
4. ✅ Redesigned product card with:
   - Smaller, more appropriate image size
   - Category overlay on bottom left of image
   - Discount percentage badge on top right
   - Improved layout with product name, price, and original price
   - Full-width Add to Cart button that changes to Remove from Cart when in cart
5. ✅ Created detailed product page with:
   - Image gallery with thumbnails
   - Product information and description
   - Variant selection
   - Quantity controls
   - Add/Remove from cart functionality
   - Related products section

## COMPLETED TASKS (NEWEST)
1. ✅ Changed the color of "Load More Products" button to blue to differentiate from the "Add to Cart" button
2. ✅ Added smooth animation between "Add to Cart" and "Remove from Cart" buttons for better user experience
3. ✅ Removed review placeholder in product description page until the feature is developed
4. ✅ Improved quantity management:
   - Limited product quantity to maximum of 5
   - Disabled plus button when maximum quantity is reached
   - Implemented removal when quantity goes below 1
   - Updated cart when quantity changes
5. ✅ Changed color of "Add to Cart" button to pink to make it more visually distinct and active
6. ✅ Fixed category switching with lazy loading by resetting products and reloading when category changes
7. ✅ Improved breadcrumbs and product detail page layout:
   - Enhanced breadcrumb styling with better visual hierarchy
   - Made product detail page more compact with smaller images and controls
   - Reduced vertical spacing while maintaining all important information


## COMPLETED TASKS (FINAL)
1. ✅ Optimized API calls:
   - Reduced unnecessary API calls when navigating between categories
   - Implemented user ID caching to avoid repeated auth calls
   - Limited data fetching to only necessary fields
   - Fixed cart item fetching to be more efficient

2. ✅ Removed quantity changing from product details page:
   - Quantity management now exclusively in cart page
   - Added note to inform users about quantity management location
   - Product page now adds items with quantity 1 by default

3. ✅ Simplified "Remove from Cart" text:
   - Changed button text from "Remove from Cart" to just "Remove"
   - Applied change consistently across product cards and detail page

4. ✅ Removed wishlist button:
   - Removed heart/wishlist button until the feature is implemented
   - Cleaned up UI to focus on available features

5. ✅ Fixed user address fetching:
   - Updated API calls to use the correct 'addresses' table instead of 'user_addresses'
   - Ensured proper data loading for user profile

6. ✅ Improved category filtering at API level:
   - Modified API call to filter by category at the database level
   - Updated query to include category filter parameter
   - Eliminated client-side filtering for better performance

## COMPLETED TASKS (LATEST)
1. ✅ Added smooth animation to product detail page buttons:
   - Implemented the same animation for Add/Remove buttons as in ProductCard
   - Created consistent user experience across the application
   - Enhanced visual feedback for cart interactions

2. ✅ Fixed repeated cart API calls:
   - Implemented cart loading state tracking with useRef
   - Added conditions to prevent unnecessary API calls
   - Optimized cart fetching when navigating between categories

3. ✅ Fixed category filtering in API:
   - Completely rewrote the category filtering logic
   - Now properly filters by category_id at the database level
   - First gets category ID from slug, then filters products by that ID
   - Eliminated the issue with incorrect products showing in categories

4. ✅ Verified category denotation in product cards:
   - Confirmed that category overlay is present in bottom left of product images
   - Ensured consistent display across all product cards
   - Maintained the design as specified in requirements

## ADMIN SECTION IMPLEMENTATION
1. ✅ Created separate admin layout:
   - Implemented desktop-first design for admin section
   - Added dedicated admin sidebar with role-based navigation
   - Created separate admin routes under `/admin-access`
   - Isolated admin functionality from shopping section

2. ✅ Optimized admin authentication:
   - Implemented lazy-loading for admin status checks
   - Added admin role-based access control (superadmin vs editor)
   - Created secure admin authentication flow
   - Optimized API calls to only check admin status when needed

3. ✅ Implemented admin dashboard:
   - Added statistics overview (users, products, categories, orders)
   - Created recent users and orders sections
   - Designed responsive dashboard layout

4. ✅ Added category management:
   - Created category listing with edit/delete functionality
   - Implemented category image upload and storage
   - Added form for creating and editing categories
   - Prepared database structure for subcategories

## FEATURES ADDED (LATEST)
1. Complete admin section with separate layout and routing
2. Role-based access control for admin features
3. Category management with image upload
4. Optimized authentication and API calls
5. Desktop-first admin interface design

## ALL TASKS COMPLETED
All requested features and fixes have been implemented. The application now has:
- Optimized API calls with proper filtering
- Smooth animations for better user experience
- Proper cart management with quantity limits
- Clean UI with focus on implemented features
- Consistent design across all components
- Complete admin section with category management
