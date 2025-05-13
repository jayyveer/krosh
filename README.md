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

## PENDING TASKS
1. Remove Shop from the bottom tab and when user selects any category from categories tab it should show products of that category only after applying filter of that category.
2. Apply a back button to sections which takes them back t where they cam from 
3. Style heading a little better Profile,Categories etc doesnt look nice at the top style better with back button 
4. When the product is added to cart the toast message it shown at the bottom show it at the top right and a small version only
5. When the product is added to the cart the product cart does not show the upodated count, it only shows when i go to the cart page then it gets updated