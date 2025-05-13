# Krosh Admin Documentation

## Overview

The Krosh Admin section is a dedicated management interface for the Krosh e-commerce platform. It provides administrators with tools to manage products, categories, users, and orders. This document details the admin functionality, components, and workflows.

## Tech Stack

- **React** - Component-based UI library
- **TypeScript** - Type safety and improved developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service for authentication, database, and storage
- **React Router** - Navigation and routing

## Admin Access

The admin section is accessible at `/admin-access` and is completely separate from the shopping interface. Access is restricted to users with admin privileges.

### Admin Roles

The system supports two admin roles:

1. **Superadmin**: Full access to all admin features, including settings
2. **Editor**: Access to product, category, and order management, but not settings

## Project Structure

The admin section follows a modular structure:

```
/src
  /components
    /admin
      - AdminLayout.tsx     # Main layout wrapper for admin pages
      - AdminSidebar.tsx    # Admin navigation sidebar
  /screens
    /admin
      - AdminDashboard.tsx  # Overview with statistics
      - AdminProducts.tsx   # Product management
      - AdminProductVariants.tsx # Variant management for products
      - AdminCategories.tsx # Category management
      - AdminUsers.tsx      # User management
      - AdminOrders.tsx     # Order management
      - AdminSettings.tsx   # System settings (superadmin only)
  /lib
    - api.ts                # API functions for admin operations
    - adminSync.ts          # Admin status synchronization
    - imageUpload.ts        # Image upload functionality
```

## Key Features

### 1. Admin Dashboard

- Statistics overview:
  - Total users
  - Product count
  - Category count
  - Order count
- Recent users list
- Recent orders list
- Admin role indicator

### 2. Product Management

#### Product List
- Comprehensive product listing with:
  - Product image (from default variant)
  - Name and description
  - Price and original price
  - Size
  - Category
  - Variant count
  - Visibility toggle
  - Action buttons (edit, delete, manage variants)

#### Product Form
- Create and edit products with:
  - Name and description
  - Price and original price (for discounts)
  - Size (managed at product level)
  - Category selection
  - Visibility toggle (products require at least one variant to be visible)

#### Variant Management
- Dedicated page for managing variants of a product
- Variant listing with:
  - Variant image
  - Name and color
  - Stock information
  - Default variant indicator
- Variant form with:
  - Name and color
  - Stock quantity
  - SKU (Stock Keeping Unit)
  - Multiple image upload

### 3. Category Management

- Category listing with:
  - Category image
  - Name and slug
  - Description
  - Parent category (for subcategories)
  - Action buttons (edit, delete)
- Category form with:
  - Name (auto-generates slug)
  - Description
  - Parent category selection
  - Image upload

### 4. User Management

- User listing with:
  - Name and email
  - Registration date
  - Admin status
  - Action buttons (view details, make admin)
- User details view with:
  - Personal information
  - Address information
  - Order history
- Admin role assignment

### 5. Order Management

- Order listing with:
  - Order ID
  - Customer information
  - Date and total
  - Status indicator
  - Action buttons (view details, update status)
- Order details modal with:
  - Customer information
  - Shipping address
  - Order items with variants
  - Status update buttons

### 6. Settings (Superadmin Only)

- System configuration
- Admin user management
- Storage management

## Admin Workflows

### 1. Product Management Workflow

1. Admin navigates to Products page
2. Creates a new product with basic information and size
3. Product is created but hidden by default
4. Admin adds variants with colors and images
5. First variant is automatically set as default
6. Product becomes visible in the shop once it has at least one variant
7. Admin can toggle visibility (if product has variants)

### 2. Category Management Workflow

1. Admin navigates to Categories page
2. Creates a new category with name, description, and image
3. Optionally selects a parent category for subcategories
4. Category becomes available for product assignment and in the shop

### 3. Order Management Workflow

1. Admin navigates to Orders page
2. Views pending orders
3. Reviews order details
4. Updates order status:
   - Pending → Approved → Shipped → Delivered
   - Or cancels the order if necessary

### 4. User Management Workflow

1. Admin navigates to Users page
2. Views user list
3. Accesses user details
4. Manages user status (active/inactive)
5. Superadmin can assign admin roles to users

## Role-Based Access Control

Access to admin features is controlled by the user's admin role:

- **Superadmin**:
  - Access to all admin features
  - Can manage other admins
  - Can access settings

- **Editor**:
  - Access to products, categories, orders, and users
  - Cannot access settings
  - Cannot manage admin roles

## Image Management

The admin interface includes comprehensive image management:

- **Product Variants**: Multiple images per variant
- **Categories**: Featured image for category display
- **Storage**: Images are stored in Supabase Storage buckets
  - `shop-images` bucket for product images

## Responsive Design

The admin interface is designed with a desktop-first approach but is fully responsive:

- **Desktop**: Full sidebar navigation, expanded tables and forms
- **Tablet**: Collapsible sidebar, adapted layouts
- **Mobile**: Hidden sidebar with toggle, stacked layouts for forms and tables

## Security Features

- **Authentication**: Admin status verification on each page load
- **Role Checking**: Feature access based on admin role
- **Secure Storage**: Row-Level Security (RLS) policies in Supabase
- **Admin Synchronization**: Tools to ensure admin status consistency

## Error Handling

- Form validation with error messages
- API error handling with user-friendly notifications
- Fallback UI states for loading and error conditions

## Admin API Integration

The admin interface uses dedicated API functions for admin operations:

- **Admin Check**: Verifies admin status and role
- **Dashboard Data**: Retrieves statistics and recent activity
- **Product Management**: CRUD operations for products and variants
- **Category Management**: CRUD operations for categories
- **User Management**: User operations and admin role assignment
- **Order Management**: Order status updates and details
