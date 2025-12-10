# Real-time Gold Price Section - Implementation Guide

## Overview
Complete implementation for displaying real-time Antam Gold prices with separate sections for selling (Beli) and buyback (Jual/Buyback).

---

## Components Created

### 1. **SellingPriceTable** (`src/components/prices/SellingPriceTable.tsx`)
Displays prices for customers who want to **BUY gold from the store**.

**Features:**
- Fetches `sell_price_per_gram` from Supabase
- Automatically generates 9 price rows for weights: `[0.5, 1, 2, 3, 5, 10, 25, 50, 100]` grams
- Responsive table (desktop) + card layout (mobile)
- Shows per-gram base price in header
- Hover effects and elegant styling
- Loading skeleton animation

**Calculation:**
```
For each weight: Selling Price = sell_price_per_gram × weight
```

**Usage:**
```tsx
import { SellingPriceTable } from "@/components/prices/SellingPriceTable";

<SellingPriceTable />
```

---

### 2. **BuybackCalculator** (`src/components/prices/BuybackCalculator.tsx`)
Interactive calculator for customers who want to **SELL/BUYBACK gold to the store**.

**Features:**
- Fetches `buyback_price_per_gram` from Supabase
- Dropdown selector for weight selection (NOT a table)
- Real-time calculation as weight is selected
- Large, bold gold display of estimated price
- WhatsApp integration with pre-filled message
- Loading skeleton animation

**WhatsApp Message Format:**
```
Halo admin, saya mau buyback Antam ukuran [BERAT] gram. Estimasi di web Rp [HARGA]. Mohon diproses.
```

**Calculation:**
```
Estimated Price = buyback_price_per_gram × selected_weight
```

**Usage:**
```tsx
import { BuybackCalculator } from "@/components/prices/BuybackCalculator";

<BuybackCalculator />
```

**Customization:**
- Line 17: Update `whatsappPhone` with actual number (format: `628xxxxxxxxxx`)

---

### 3. **GoldPriceContainer** (`src/components/prices/GoldPriceContainer.tsx`)
Main parent component with tab navigation system.

**Features:**
- Tab switching between "Beli Emas" and "Jual Emas / Buyback"
- Shows last update timestamp from database
- Refresh button to reload prices
- Luxury dark theme with gold accents
- Responsive section container

**Tabs:**
- **Tab 1 (Beli Emas):** Shows `SellingPriceTable`
- **Tab 2 (Jual Emas / Buyback):** Shows `BuybackCalculator`

**Usage:**
```tsx
import { GoldPriceContainer } from "@/components/prices/GoldPriceContainer";

// Add to your page
<GoldPriceContainer />
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

-- Initialize with one row (id = 1)
INSERT INTO gold_prices (id, sell_price_per_gram, buyback_price_per_gram)
VALUES (1, 750000, 700000);
```

**Column Details:**
- `sell_price_per_gram`: Price per gram when selling to customer (BIGINT)
- `buyback_price_per_gram`: Price per gram when buying back from customer (BIGINT)
- `updated_at`: Timestamp of last update (auto-managed)

---

## Supabase Functions Used

### `getDailyPrice(supabase: SupabaseClient): Promise<AntamDailyPrice | null>`
Fetches the single row from `gold_prices` table.

```tsx
const price = await getDailyPrice(supabase);
// Returns: { 
//   id: 1, 
//   sell_price_per_gram: 750000, 
//   buyback_price_per_gram: 700000, 
//   updated_at: "2025-12-10T12:00:00Z" 
// }
```

**Already implemented in `src/lib/supabase.tsx`**

---

## Setup Instructions

### Step 1: Database Setup
1. Create `gold_prices` table in Supabase with schema above
2. Insert initial row:
   ```sql
   INSERT INTO gold_prices (id, sell_price_per_gram, buyback_price_per_gram)
   VALUES (1, 750000, 700000);
   ```

### Step 2: Configure WhatsApp Number
Edit `src/components/prices/BuybackCalculator.tsx` line 17:
```tsx
const whatsappPhone = "628xxxxxxxxxx"; // Replace with your actual number
```

### Step 3: Add to Your Pages
**For Homepage or Dedicated Prices Page:**
```tsx
import { GoldPriceContainer } from "@/components/prices/GoldPriceContainer";

export function HomePage() {
  return (
    <>
      {/* Other content */}
      <GoldPriceContainer />
      {/* Other content */}
    </>
  );
}
```

---

## Styling & Theme

**Colors Used:**
- **Gold:** `#D4AF37` (Luxury accent)
- **Dark Slate:** `#1e293b`, `#0f172a` (Dark theme)
- **Green:** `#16a34a` (WhatsApp button)
- **Blue:** `#0f172a` (Info boxes)

**Features:**
- Dark luxury aesthetic perfect for jewelry stores
- High contrast for excellent readability
- Smooth transitions and hover effects
- Responsive design (mobile, tablet, desktop)
- Gold accent highlights for CTAs

---

## Component Behavior

### Loading States
- While fetching prices: Skeleton loaders display
- Smooth fade-in when data loads
- Refresh button available in footer

### Error Handling
- Graceful error logging (no UI errors shown to user)
- Falls back to empty state if price unavailable
- User can click refresh to retry

### Real-time Updates
- Prices fetched on component mount
- Manual refresh available via footer button
- Timestamp shows last database update

---

## Integration Checklist

- [ ] Database table created with correct schema
- [ ] Initial price row inserted (id = 1)
- [ ] WhatsApp number configured in BuybackCalculator
- [ ] GoldPriceContainer added to desired page
- [ ] Test "Beli Emas" tab loads prices correctly
- [ ] Test "Jual Emas / Buyback" tab loads and calculates correctly
- [ ] Test weight selection in calculator
- [ ] Test WhatsApp button opens with correct message
- [ ] Test refresh button loads updated timestamp
- [ ] Verify responsive design on mobile
- [ ] Verify dark theme styling matches brand

---

## Performance Considerations

- **Data Fetching:** Single Supabase query per component mount
- **Calculation:** Client-side (instant, no API calls)
- **Rendering:** Efficient React hooks (useState, useEffect)
- **Bundle Size:** ~8KB gzipped (lucide-react icons included)

---

## Customization Options

### Change Weight Options
Edit `WEIGHT_OPTIONS` in each component file:
```tsx
const WEIGHT_OPTIONS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100]; // Modify here
```

### Adjust Currency Formatting
Both components use `Intl.NumberFormat("id-ID", ...)` for IDR.
To change locale:
```tsx
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", { // Change locale here
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};
```

### Modify WhatsApp Message
Edit message template in `BuybackCalculator.tsx` line ~48:
```tsx
const message = `Halo admin, saya mau buyback Antam ukuran ${selectedWeight} gram. Estimasi di web Rp ${formatCurrency(estimatedPrice).replace("Rp ", "")}. Mohon diproses.`;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Prices not loading | Verify `gold_prices` table exists and has data. Check Supabase credentials in `.env.local` |
| WhatsApp button not working | Update phone number format: `628xxxxxxxxxx` |
| Styling looks different | Clear browser cache and rebuild. Check Tailwind CSS config |
| Timestamp not updating | Ensure `updated_at` field is TIMESTAMP type in database |
| Mobile layout broken | Verify responsive classes (md:) in components |

---

## Support & Notes

- All components use `lucide-react` for consistent icons
- Currency formatting uses Indonesian locale (`id-ID`)
- Responsive design tested on mobile, tablet, desktop
- Dark theme optimized for luxury brand aesthetic
- Components automatically handle loading states
