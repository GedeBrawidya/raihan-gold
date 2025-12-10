# 🎯 Admin Dashboard - Clean & Functional System

## Overview

A professional, SaaS-style admin dashboard for managing gold prices and products. Built with React, Vite, Tailwind CSS, and Supabase. Fully integrated with your database schema.

---

## 📋 Database Schema Reference

### Table 1: gold_prices
```sql
id              (bigint, PK)
karat_label     (text)
buy_price       (decimal)
sellback_price  (decimal)
display_order   (integer)
updated_at      (timestamp)
```

### Table 2: products
```sql
id              (uuid, PK)
name            (text)
description     (text)
weight          (decimal)
price           (decimal)
image_url       (text)
is_active       (boolean)
created_at      (timestamp)
```

---

## 🗂️ Project Structure

```
src/
├── pages/admin/
│   ├── Login.tsx                 (Auth page)
│   ├── DashboardPageNew.tsx      (Overview)
│   ├── GoldPricesPage.tsx        (Gold prices CRUD)
│   └── ProductsPage.tsx          (Products CRUD)
├── components/admin/
│   └── AdminLayoutNew.tsx        (Sidebar + Top nav)
├── lib/
│   ├── supabase.tsx             (CRUD functions)
│   └── auth.tsx                 (Authentication)
└── App.tsx                      (Routing)
```

---

## 🔌 CRUD Operations

### Gold Prices Functions (in `src/lib/supabase.tsx`)

```typescript
// Get all gold prices
getGoldPrices(supabase: SupabaseClient)
→ Returns: GoldPrice[]

// Get single gold price by ID
getGoldPriceById(supabase: SupabaseClient, id: number)
→ Returns: GoldPrice

// Update gold price
updateGoldPrice(supabase: SupabaseClient, id: number, payload: {
  buy_price?: number;
  sellback_price?: number;
  display_order?: number;
})
→ Returns: GoldPrice
```

### Products Functions (in `src/lib/supabase.tsx`)

```typescript
// Get all products
getProducts(supabase: SupabaseClient)
→ Returns: Product[]

// Get single product by ID
getProductById(supabase: SupabaseClient, id: string)
→ Returns: Product

// Create product
createProduct(supabase: SupabaseClient, payload: {
  name: string;
  description: string;
  weight: number;
  price: number;
  image_url: string;
  is_active: boolean;
})
→ Returns: Product

// Update product
updateProduct(supabase: SupabaseClient, id: string, payload: {
  name?: string;
  description?: string;
  weight?: number;
  price?: number;
  image_url?: string;
  is_active?: boolean;
})
→ Returns: Product

// Delete product
deleteProduct(supabase: SupabaseClient, id: string)
→ Returns: boolean

// Upload image
uploadProductImage(supabase: SupabaseClient, file: File)
→ Returns: string (URL)
```

---

## 📄 Pages & Features

### 1. Dashboard Page (`DashboardPageNew.tsx`)
**Route:** `/admin/dashboard`

**Features:**
- Overview cards showing total gold prices & products
- Info sections explaining each module
- Quick stats

### 2. Gold Prices Management (`GoldPricesPage.tsx`)
**Route:** `/admin/gold-prices`

**Features:**
- Table with columns: Karat, Buy Price, Sellback Price, Display Order, Updated At
- Edit button for each row
- Inline edit form with validation
- Save/Cancel buttons
- Currency formatting (IDR)
- Date formatting

**Schema Fields Used:**
- `id`
- `karat_label`
- `buy_price`
- `sellback_price`
- `display_order`
- `updated_at`

### 3. Products Management (`ProductsPage.tsx`)
**Route:** `/admin/products`

**Features:**
- Grid view of products
- Add button to create new product
- Edit button for each product
- Delete button with confirmation
- Modal form for Add/Edit
- Image upload with preview
- Active/Inactive toggle
- Validation for required fields & numbers
- Image removal option

**Schema Fields Used:**
- `id`
- `name`
- `description`
- `weight`
- `price`
- `image_url`
- `is_active`
- `created_at`

### 4. Admin Layout (`AdminLayoutNew.tsx`)
**Features:**
- Sidebar with navigation
- Top navigation bar with date
- Mobile menu toggle
- User info display
- Logout button
- Dark mode support
- Responsive design

**Navigation Links:**
- Dashboard
- Gold Prices
- Products

---

## 🎨 Design System

### Colors
```
Blue:     #3b82f6     (Primary)
Slate:    #64748b     (Neutral)
Green:    #10b981     (Success)
Red:      #ef4444     (Danger)
```

### Component Styles
- Minimalist SaaS design
- Generous spacing
- Large border radius (8-12px)
- Subtle borders & shadows
- Light & dark mode support

### Responsive Breakpoints
- Mobile: < 768px (single column, sidebar overlay)
- Tablet: 768px+ (2 columns, sidebar visible)
- Desktop: 1024px+ (full layout)

---

## 🔑 Key Implementation Details

### Validation
**Gold Prices:**
- All fields are numbers
- Display order is integer
- Buy & sellback prices are decimals

**Products:**
- Name is required
- Weight & price must be numbers
- Image is optional
- Status toggle (active/inactive)

### API Error Handling
```typescript
try {
  // API call
} catch (err: any) {
  toast({ title: "Error", description: err.message });
}
```

### Currency Formatting
```typescript
new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
}).format(value)
```

### Date Formatting
```typescript
new Date(date).toLocaleDateString("id-ID", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})
```

---

## 🚀 Getting Started

### 1. Login
```
URL: http://localhost:5173/admin/login
Credentials: Use your Supabase email/password
```

### 2. Navigate to Dashboard
After login, you'll see the admin layout with three sections

### 3. Manage Gold Prices
- Click "Gold Prices" in sidebar
- View all prices in table
- Click "Edit" on any row
- Modify values and save

### 4. Manage Products
- Click "Products" in sidebar
- View products in grid
- Click "Tambah Produk" to add
- Upload image (optional)
- Fill form and create
- Edit or delete existing products

---

## 🔐 Authentication

Uses Supabase Authentication with protected routes. All admin pages require login.

**Auth Provider:** `src/lib/auth.tsx`
**Protected Route:** `src/components/ProtectedRoute.tsx`

---

## 📦 Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@supabase/supabase-js": "^2.x",
  "tailwindcss": "^3.x",
  "lucide-react": "latest",
  "framer-motion": "^10.x"
}
```

---

## 🌙 Dark Mode

All pages support dark mode with Tailwind CSS dark class:
```tsx
className="dark:bg-slate-800 dark:text-white"
```

Toggle in browser DevTools → Toggle Device Toolbar

---

## 📱 Mobile Support

- Responsive sidebar (overlay on mobile)
- Touch-friendly buttons
- Optimized table scrolling
- Grid layout for products

---

## 🎯 Field Mapping

### Gold Prices Form
| Input | Database Field | Type | Validation |
|-------|----------------|------|------------|
| Karat | karat_label | text | Read-only |
| Buy Price | buy_price | decimal | Must be number |
| Sell Price | sellback_price | decimal | Must be number |
| Order | display_order | integer | Must be number |

### Products Form
| Input | Database Field | Type | Validation |
|-------|----------------|------|------------|
| Name | name | text | Required |
| Description | description | text | Optional |
| Weight | weight | decimal | Must be number |
| Price | price | decimal | Must be number |
| Image | image_url | text | Optional, file upload |
| Status | is_active | boolean | Toggle |

---

## 🔄 Data Flow

### Gold Prices Edit Flow
1. Load all prices → `getGoldPrices()`
2. User clicks Edit
3. Display form with current values
4. User modifies values
5. Validate numbers
6. Call `updateGoldPrice(id, payload)`
7. Reload table
8. Show success toast

### Products CRUD Flow

**Create:**
1. Click "Tambah Produk"
2. Open modal
3. Fill form + upload image
4. Call `createProduct(payload)`
5. Reload list
6. Show success toast

**Read:**
1. Load all products → `getProducts()`
2. Display in grid with image

**Update:**
1. Click Edit on product
2. Load product data → `getProductById(id)`
3. Populate form
4. Call `updateProduct(id, payload)`
5. Reload list
6. Show success toast

**Delete:**
1. Click Delete
2. Confirm dialog
3. Call `deleteProduct(id)`
4. Reload list
5. Show success toast

---

## 🛠️ Development

### Run Dev Server
```bash
npm run dev
# Runs on http://localhost:5173
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

---

## 📊 Expected Database Queries

### Gold Prices
```sql
-- Get all with order
SELECT * FROM gold_prices ORDER BY display_order ASC;

-- Update single row
UPDATE gold_prices 
SET buy_price = ?, sellback_price = ?, display_order = ?, updated_at = NOW()
WHERE id = ?;
```

### Products
```sql
-- Get all
SELECT * FROM products ORDER BY created_at DESC;

-- Insert
INSERT INTO products (name, description, weight, price, image_url, is_active, created_at)
VALUES (?, ?, ?, ?, ?, ?, NOW());

-- Update
UPDATE products 
SET name = ?, description = ?, weight = ?, price = ?, image_url = ?, is_active = ?
WHERE id = ?;

-- Delete
DELETE FROM products WHERE id = ?;
```

---

## ⚠️ Important Notes

1. **RLS Policies**: Ensure Supabase RLS policies allow authenticated users to read/write
2. **Storage**: Products bucket must exist for image uploads
3. **Environment**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
4. **Image Upload**: Images stored in Supabase storage 'products' bucket

---

## 🎓 Learning Points

This dashboard demonstrates:
- React hooks (useState, useEffect, useContext)
- Supabase CRUD operations
- Form validation & handling
- Error handling with toasts
- Responsive design
- Dark mode support
- File uploads
- Date/currency formatting
- Authentication & protected routes
- Modal components
- Grid/table layouts

---

## 🐛 Troubleshooting

**Issue:** Can't login
- Check Supabase credentials in `.env.local`
- Verify user exists in Supabase Auth

**Issue:** Can't load data
- Check RLS policies in Supabase
- Verify table names match schema
- Check browser console for errors

**Issue:** Can't upload images
- Create 'products' bucket in Supabase Storage
- Set bucket permissions to public or use signed URLs
- Check file size limits

**Issue:** Dark mode not working
- Add `dark` class to `<html>` element
- Toggle in browser DevTools

---

*Clean, professional, and fully functional admin dashboard for gold trading business.*
