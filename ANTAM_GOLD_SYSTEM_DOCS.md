# Antam Gold Price & Buyback System

## Overview
Complete implementation for managing and displaying Antam Gold prices with admin management, public price list, and customer buyback calculator.

## Components Created

### 1. **DailyPriceForm** (`src/components/admin/DailyPriceForm.tsx`)
Admin dashboard component for updating daily prices.

**Features:**
- Update `sell_price_per_gram` and `buyback_price_per_gram`
- Input validation (required, numeric, positive values)
- Loading and saving states
- Toast notifications for success/error
- Dark mode support

**Usage:**
```tsx
import { DailyPriceForm } from "@/components/admin/DailyPriceForm";

// Add to admin dashboard
<DailyPriceForm />
```

**Database Interaction:**
- Calls `getDailyPrice()` to fetch current prices
- Calls `updateDailyPrice()` to save changes
- Automatically updates `updated_at` timestamp

---

### 2. **BuybackSimulation** (`src/components/user/BuybackSimulation.tsx`)
Customer-facing calculator for buyback value estimation.

**Features:**
- Select from hardcoded weights: `[0.5, 1, 2, 3, 5, 10, 25, 50, 100]` grams
- Real-time calculation: `Total = buyback_price_per_gram × selected_weight`
- WhatsApp integration with pre-filled message
- Dark theme with gold accent
- Loading state while fetching price

**WhatsApp Message Format:**
```
Halo admin, saya mau buyback Antam [BERAT]g. Estimasi di web Rp [TOTAL]. Mohon diproses.
```

**Usage:**
```tsx
import { BuybackSimulation } from "@/components/user/BuybackSimulation";

<BuybackSimulation />
```

**Customization:**
- Change `whatsappPhone` variable to your actual WhatsApp number (format: `628xxxxxxxxxx`)

---

### 3. **PriceListTable** (`src/components/user/PriceListTable.tsx`)
Public price list table showing all weight variations automatically.

**Features:**
- Automatically generates rows for all weight options
- Displays: Weight, Harga Jual (Sell), Harga Buyback, Selisih (Difference)
- Responsive: Desktop table + mobile card layout
- Currency formatting in IDR
- Loading state
- Shows last update timestamp

**Row Generation Logic:**
```
For each weight in [0.5, 1, 2, 3, 5, 10, 25, 50, 100]:
  - Harga Jual = sell_price_per_gram × weight
  - Harga Buyback = buyback_price_per_gram × weight
  - Selisih = Harga Jual - Harga Buyback
```

**Usage:**
```tsx
import { PriceListTable } from "@/components/user/PriceListTable";

<PriceListTable />
```

---

## Database Schema

**Table: `gold_prices`**
```sql
CREATE TABLE gold_prices (
  id BIGINT PRIMARY KEY,
  sell_price_per_gram BIGINT NOT NULL,
  buyback_price_per_gram BIGINT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expected: Only 1 row in this table
INSERT INTO gold_prices (id, sell_price_per_gram, buyback_price_per_gram) 
VALUES (1, 750000, 700000);
```

---

## Supabase Functions Added

### `getDailyPrice(supabase: SupabaseClient): Promise<AntamDailyPrice | null>`
Fetches the single row from `gold_prices` table.

```tsx
const price = await getDailyPrice(supabase);
// Returns: { id: 1, sell_price_per_gram: 750000, buyback_price_per_gram: 700000, updated_at: "..." }
```

### `updateDailyPrice(supabase: SupabaseClient, payload): Promise<AntamDailyPrice | null>`
Updates sell and buyback prices. Automatically sets `updated_at` to current time.

```tsx
await updateDailyPrice(supabase, {
  sell_price_per_gram: 800000,
  buyback_price_per_gram: 750000,
});
```

---

## Integration Steps

### Step 1: Set Up Database
1. Create `gold_prices` table in Supabase with the schema above
2. Insert one row with initial prices:
   ```sql
   INSERT INTO gold_prices (id, sell_price_per_gram, buyback_price_per_gram)
   VALUES (1, 750000, 700000);
   ```

### Step 2: Configure WhatsApp Number
Edit `src/components/user/BuybackSimulation.tsx` line 19:
```tsx
const whatsappPhone = "628xxxxxxxxxx"; // Replace with your actual number
```

### Step 3: Add Components to Pages

**For Admin Dashboard:**
```tsx
import { DailyPriceForm } from "@/components/admin/DailyPriceForm";

export function AdminPricePage() {
  return (
    <div className="space-y-8">
      <DailyPriceForm />
    </div>
  );
}
```

**For Public Pages (e.g., Homepage or Prices Page):**
```tsx
import { PriceListTable } from "@/components/user/PriceListTable";
import { BuybackSimulation } from "@/components/user/BuybackSimulation";

export function PricesPage() {
  return (
    <div className="space-y-12">
      <PriceListTable />
      <BuybackSimulation />
    </div>
  );
}
```

---

## Features Summary

| Feature | Component | Status |
|---------|-----------|--------|
| Admin price update form | DailyPriceForm | ✅ Complete |
| Real-time price calculation | BuybackSimulation | ✅ Complete |
| Automatic price list generation | PriceListTable | ✅ Complete |
| WhatsApp integration | BuybackSimulation | ✅ Complete |
| IDR currency formatting | All | ✅ Complete |
| Dark mode support | All | ✅ Complete |
| Responsive design | BuybackSimulation, PriceListTable | ✅ Complete |
| Loading states | All | ✅ Complete |
| Input validation | DailyPriceForm | ✅ Complete |
| Error handling | All | ✅ Complete |

---

## Styling & Theme

All components use:
- **Tailwind CSS** with dark mode support
- **Gold accent color** for premium feel
- **Slate/Dark colors** for dark mode
- **Responsive design** for mobile, tablet, desktop
- **Smooth transitions** and hover effects

---

## Testing Checklist

- [ ] Admin can load DailyPriceForm without errors
- [ ] Admin can update prices successfully
- [ ] Updated prices appear in PriceListTable
- [ ] BuybackSimulation fetches latest buyback price
- [ ] Weight selection updates calculation correctly
- [ ] WhatsApp button opens with correct message
- [ ] PriceListTable generates all 9 weight rows
- [ ] Table responsive on mobile devices
- [ ] Dark mode works across all components
- [ ] Loading states display correctly
- [ ] Error handling works (invalid input, network errors)

---

## Notes

- The system uses a single-row approach for the `gold_prices` table (id = 1)
- All prices are stored as BIGINT (in smallest currency unit, e.g., Rp 1)
- Timestamps are auto-managed by the update function
- Weight options are hardcoded (not fetched from database)
- Currency formatting uses Indonesian locale (`id-ID`)
- WhatsApp phone number must be configured before deployment
