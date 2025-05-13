# Krosh – Yarn & Crochet Store

A beautiful, responsive eCommerce platform for a yarn and crochet supply brand.

## Project Overview

Krosh is an elegant eCommerce platform for yarn and crochet enthusiasts. This project implements a complete shopping experience with product management, cart functionality, user authentication, and an admin dashboard.

### Tech Stack

- **React** - Component-based UI library
- **TypeScript** - Type safety and improved developer experience
- **Redux Toolkit** - State management for predictable application state
- **Tailwind CSS** - Utility-first CSS framework with custom pastel palette
- **Framer Motion** - Animation library for subtle UI interactions
- **React Router** - Navigation and routing
- **Supabase** - Backend-as-a-Service for authentication, database, and storage
- **Vite** - Fast build tool and development server

## Project Structure

```
/src
  /components
    /admin          # Admin-specific components
    /layout         # Layout components (navbar, sidebar, etc.)
    /ui             # Reusable UI components
    /cart           # Cart-related components
  /contexts
    - AuthContext.tsx
    - ToastContext.tsx
  /hooks
    - useCart.ts
    - useAuth.ts
  /lib
    - api.ts        # API functions
    - auth.ts       # Authentication functions
    - supabase.ts   # Supabase client
    - imageUpload.ts # Image handling
  /redux
    /slices
      - cartSlice.ts
    - store.ts
  /screens
    /admin          # Admin pages
    - Home.tsx      # Shop pages
    - Shop.tsx
    - ProductDetail.tsx
    - Cart.tsx
    - Profile.tsx
    - Login.tsx
    - Orders.tsx
  - App.tsx
  - main.tsx
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

### Shop Features

- **Product Browsing**
  - Category filtering
  - Search functionality
  - Pagination with "Load More"
  - Responsive product grid

- **Product Details**
  - Image gallery
  - Variant selection (colors/shades)
  - Size information
  - Add to cart functionality
  - Related products

- **Shopping Cart**
  - Add/remove products
  - Quantity management
  - Price calculations

- **User Account**
  - Authentication (login/signup)
  - Profile management
  - Address management
  - Order history

- **Responsive Navigation**
  - Top Navbar (always visible)
  - Sidebar (desktop/toggled on mobile)
  - Bottom Tabs (mobile only)

### Admin Features

- **Dashboard**
  - Statistics overview
  - Recent users and orders

- **Product Management**
  - Create/edit products
  - Manage variants
  - Upload images
  - Toggle visibility

- **Category Management**
  - Create/edit categories
  - Upload category images
  - Support for subcategories

- **Order Management**
  - View and process orders
  - Update order status
  - Order details

- **User Management**
  - View user information
  - Manage admin access
  - User details

## Product and Variant Structure

The application implements a specific product-variant relationship:

- **Products**: Contain basic information and size at the product level
- **Variants**: Represent different colors/shades of the same product
  - Each product must have at least one variant
  - Variants store their own images and stock information
  - Products are only visible in the shop when they have at least one variant

## Admin Roles

The system supports two admin roles:

1. **Superadmin**: Full access to all admin features, including settings
2. **Editor**: Access to product, category, and order management, but not settings

## Documentation

Detailed documentation is available in the `/docs` directory:

- [Shop Documentation](docs/SHOP_DOCUMENTATION.md) - Details about the shop-side functionality
- [Admin Documentation](docs/ADMIN_DOCUMENTATION.md) - Information about the admin interface
- [Supabase Schema](docs/SUPABASE_SCHEMA.md) - Database schema and relationships

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
   ```
   git clone https://github.com/jayyveer/krosh.git
   cd krosh
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file with your Supabase credentials
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

The application can be built for production using:

```
npm run build
# or
yarn build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
