# Krosh Shop Documentation

## Overview

The Krosh Shop is a responsive e-commerce platform designed for yarn and crochet enthusiasts. This document provides detailed information about the shop-side functionality, components, and user flows.

## Tech Stack

- **React** - Component-based UI library
- **TypeScript** - Type safety and improved developer experience
- **Redux Toolkit** - State management for cart and user preferences
- **Tailwind CSS** - Utility-first CSS framework with custom pastel palette
- **Framer Motion** - Animation library for UI interactions
- **React Router** - Navigation and routing
- **Supabase** - Backend-as-a-Service for authentication, database, and storage

## Project Structure

The shop-side of the application follows a modular structure:

```
/src
  /components
    /layout
      - Layout.tsx           # Main layout wrapper for shop pages
      - TopNavbar.tsx        # Top navigation bar with cart and user info
      - Sidebar.tsx          # Side navigation (desktop/toggled on mobile)
      - BottomTabs.tsx       # Bottom navigation for mobile
    /ui
      - ProductCard.tsx      # Product display card with add to cart functionality
      - FilterButton.tsx     # Category filter buttons
      - AnimatedContainer.tsx # Wrapper for page transitions
      - SectionHeader.tsx    # Consistent header with back button
  /screens
    - Home.tsx              # Landing page with featured products
    - Shop.tsx              # Product listing with category filters
    - ProductDetail.tsx     # Detailed product view with variants
    - Categories.tsx        # Category browsing
    - Search.tsx            # Product search functionality
    - Cart.tsx              # Shopping cart management
    - Profile.tsx           # User profile and settings
    - Orders.tsx            # Order history and tracking
  /contexts
    - AuthContext.tsx       # Authentication state management
    - ToastContext.tsx      # Toast notifications
  /redux
    /slices
      - cartSlice.ts        # Cart state management
  /hooks
    - useCart.ts            # Custom hook for cart operations
  /lib
    - api.ts                # API functions for data fetching
    - auth.ts               # Authentication functions
    - supabase.ts           # Supabase client configuration
```

## Key Features

### 1. Responsive Design

- **Mobile-First Approach**: Optimized for all devices
- **Adaptive Layout**:
  - Top Navbar (always visible)
  - Sidebar (desktop/toggled on mobile)
  - Bottom Tabs (mobile only)

### 2. Product Browsing

#### Shop Page
- Grid display of products with pagination
- Category filtering with server-side filtering
- "Load More" functionality for infinite scrolling
- Product cards with:
  - Product image (from default variant)
  - Product name and price
  - Discount badge (if applicable)
  - Size and color information
  - Add to Cart button with animation

#### Categories Page
- Visual grid of product categories
- Category images with names
- Direct navigation to filtered shop view

#### Search Page
- Product search functionality
- Real-time results as user types
- Category filtering within search results

### 3. Product Detail

- Image gallery with thumbnails
- Product information:
  - Name, price, and original price (if discounted)
  - Size information (at product level)
  - Description
- Variant selection:
  - Color swatches with visual indicators
  - Out-of-stock indicators
- Add to Cart functionality
- Related products section

### 4. Shopping Cart

- Cart management:
  - Add/remove products
  - Update quantities (max 5 per item)
  - Stock validation
- Cart summary with:
  - Product details
  - Variant information
  - Price calculations
  - Quantity controls
- Proceed to checkout flow

### 5. User Authentication

- Login/Signup functionality
- Profile management:
  - Personal information
  - Address management
  - Order history
- Persistent login state

### 6. Order Management

- Order placement
- Order history
- Order status tracking
- Order details view

## User Flows

### 1. Product Discovery Flow

1. User navigates to Shop or Categories page
2. Browses products by category or uses search
3. Views product details by clicking on a product card
4. Selects variant (color) if available
5. Adds product to cart

### 2. Cart and Checkout Flow

1. User adds products to cart from product detail or product cards
2. Navigates to cart page to review items
3. Adjusts quantities or removes items
4. Proceeds to checkout
5. Enters shipping information
6. Selects payment method
7. Places order

### 3. User Account Flow

1. User registers or logs in
2. Manages profile information
3. Adds or edits shipping addresses
4. Views order history
5. Tracks current orders

## Product and Variant Structure

The shop implements a specific product-variant relationship:

- **Products**: Contain basic information and size at the product level
- **Variants**: Represent different colors/shades of the same product
  - Each product must have at least one variant
  - Variants store their own images and stock information
  - Products are only visible in the shop when they have at least one variant

## API Integration

The shop interfaces with Supabase for all data operations:

- **Products API**: Fetches products with pagination and filtering
- **Categories API**: Retrieves category information
- **Cart API**: Manages cart items in the database
- **User API**: Handles user authentication and profile management
- **Orders API**: Processes and retrieves order information

## Animation and UI Enhancements

- Page transitions with Framer Motion
- Card hover effects
- Add to Cart button animations
- Loading skeletons for better UX
- Toast notifications for user feedback

## Responsive Breakpoints

- **Mobile**: < 768px
  - Bottom navigation tabs
  - Collapsible sidebar
  - Single or double column product grid
- **Tablet**: 768px - 1024px
  - Sidebar navigation
  - Three column product grid
- **Desktop**: > 1024px
  - Persistent sidebar
  - Four column product grid
  - Enhanced product detail layout

## Performance Optimizations

- Lazy loading of products with pagination
- Server-side filtering for categories
- Image optimization
- Caching of user ID to reduce auth calls
- Optimized API calls to fetch only necessary data
