# Gold Price System - Complete Optimization Guide

## 🎯 Summary of Changes

Semua komponen gold price telah dioptimasi untuk performa, UX, dan fitur yang lebih lengkap.

---

## 📊 1. GoldPriceTable.tsx (MAJOR EXPANSION)

File utama yang sekarang berisi **2 tab berbeda** dengan pricing logic yang komprehensif.

### Features:
- ✅ **Tab System**: Switching antara "Harga Berdasarkan Kemurnian" dan "Harga Antam + Buyback"
- ✅ **Tab 1 - Kemurnian**: Menampilkan tabel harga per karat dengan margin analysis
- ✅ **Tab 2 - Antam**: Tabel harga Antam + form buyback lengkap
- ✅ **Margin Calculation**: Otomatis hitung selisih harga jual - buyback
- ✅ **Buyback Form**: Dengan input nama, nomor HP, dan weight selection
- ✅ **WhatsApp Integration**: Pre-filled message ke admin
- ✅ **Responsive Design**: Mobile-optimized dengan grid layout
- ✅ **Loading States**: Skeleton loaders dan error handling

### Components Inside:
1. **Main Tab Header** - dengan refresh button
2. **PurityPricesTable** - Tabel kemurnian dengan 4 kolom (Kemurnian, Harga Jual, Harga Buyback, Margin)
3. **AntamPriceListWithForm** - Komponen nested dengan:
   - Price info cards (sell & buyback per gram)
   - Antam price table (minimal, 4 kolom)
   - Form dengan weight selector buttons, price display, dan WhatsApp button

### Data Flow:
```
GoldPriceTable
├── useSupabase() → getGoldPrices() & getDailyPrice()
├── State: rows (karat prices), dailyPrice (Antam prices), activeTab
└── Renders:
    ├── Tab 1: PurityPricesTable
    └── Tab 2: AntamPriceListWithForm
        ├── Price Info Cards
        ├── Antam Price Table
        └── Buyback Form (name, phone, weight, WhatsApp)
```

### Styling:
- Dark gradient background: `from-background to-slate-50`
- Gold accent: `#D4AF37` for highlights
- Tab indicators with smooth transitions
- Hover effects on tables
- Responsive padding and text sizing

---

## 🎨 2. SellingPriceTable.tsx (OPTIMIZED)

Komponen untuk tab "Beli Emas" dalam GoldPriceContainer.

### Improvements:
- ✅ **Error Handling**: Alert box with retry button
- ✅ **Memoization**: useMemo untuk formatted price (prevents re-renders)
- ✅ **Refresh Button**: In header untuk manual price reload
- ✅ **Skeleton Loader**: Custom loader component
- ✅ **Better Icons**: TrendingUp, AlertCircle, RefreshCw
- ✅ **Type Safety**: Interface PriceRow dengan weight & sellingPrice
- ✅ **Mobile Optimized**: Card layout pada mobile, table pada desktop
- ✅ **Accessibility**: Better button titles dan disabled states

### Performance Optimizations:
```tsx
// Memoize expensive calculations
const formattedPrice = useMemo(() => {
  return formatCurrency(priceData?.sell_price_per_gram || 0);
}, [priceData?.sell_price_per_gram]);
```

### Calculation Logic:
```
Selling Price = sell_price_per_gram × weight
for each weight in [0.5, 1, 2, 3, 5, 10, 25, 50, 100]
```

---

## 💰 3. BuybackCalculator.tsx (OPTIMIZED)

Komponen untuk tab "Jual Emas / Buyback" dalam GoldPriceContainer.

### Improvements:
- ✅ **Weight Selection Buttons**: Grid layout instead of dropdown
- ✅ **Real-time Calculation**: useMemo untuk estimatedPrice
- ✅ **Error State**: Alert with retry option
- ✅ **Better WhatsApp Message**: Using toLocaleString untuk number format
- ✅ **Skeleton Loader**: Custom loader dengan 3 items
- ✅ **Refresh Button**: In header
- ✅ **Visual Feedback**: Hover/active states pada weight buttons
- ✅ **Type Safety**: Props validation

### Features:
- Weight buttons: `[0.5, 1, 2, 3, 5, 10, 25, 50, 100]g`
- Grid: 5 columns mobile, 9 columns desktop
- Selected button: gold background + scale effect
- Estimated price display: Large, bold, gold text
- WhatsApp CTA: Full-width green button

### Calculation Logic:
```
Estimated Price = buyback_price_per_gram × selected_weight
Message: "Halo admin, saya mau buyback Antam ukuran [weight]g. Estimasi di web Rp [price]. Mohon diproses."
```

---

## 🎛️ 4. GoldPriceContainer.tsx (OPTIMIZED)

Wrapper component dengan tab system untuk SellingPriceTable dan BuybackCalculator.

### Improvements:
- ✅ **Memoized Time Formatting**: useMemo untuk formattedUpdatedTime
- ✅ **Responsive Tab Labels**: Hidden text on mobile ("Beli" instead of "Beli Emas")
- ✅ **Backdrop Blur**: Modern CSS effect on tab background
- ✅ **Better Section Header**: Dengan icon badge "Harga Real-Time"
- ✅ **Fade-in Animation**: Tab content dengan `animate-in fade-in`
- ✅ **Improved Footer**: Flex layout dengan responsive wrapping
- ✅ **Duration Classes**: Smooth 200ms transitions

### Architecture:
```
GoldPriceContainer (parent)
├── Section Header (title, subtitle, badge)
├── Tab Navigation (sell/buyback)
├── Tab Content:
│   ├── sell → SellingPriceTable
│   └── buyback → BuybackCalculator
└── Footer (last updated, refresh button)
```

---

## ⚡ Performance Optimizations Applied

### 1. **Memoization**
```tsx
// Prevents unnecessary recalculations
const formattedPrice = useMemo(() => {
  return formatCurrency(priceData?.sell_price_per_gram || 0);
}, [priceData?.sell_price_per_gram]);
```

### 2. **Skeleton Loaders**
Instead of generic spinners, custom loaders match content height.

### 3. **Error Boundaries**
```tsx
if (error && !priceData) {
  return <ErrorAlert />; // User can retry
}
```

### 4. **Optimized Re-renders**
- Split components into child components
- Each component manages its own state
- Parent only passes necessary props

---

## 🔄 Data Flow Architecture

### Supabase Tables Used:
1. **gold_prices** (old, multi-row)
   - Columns: id, karat_label, buy_price, sellback_price, display_order, updated_at
   - Used by: GoldPriceTable Tab 1

2. **gold_prices** (new, single-row)
   - Columns: id, sell_price_per_gram, buyback_price_per_gram, updated_at
   - Used by: GoldPriceTable Tab 2, SellingPriceTable, BuybackCalculator

### Function Calls:
```
GoldPriceTable
├── getGoldPrices(supabase) → rows for Tab 1
└── getDailyPrice(supabase) → price for Tab 2

GoldPriceContainer
├── SellingPriceTable → getDailyPrice()
└── BuybackCalculator → getDailyPrice()

PriceListCurrentTable
└── getDailyPrice() → generates 9 weight rows
```

---

## 📱 Responsive Design Details

### Mobile (< 768px):
- Tab labels shortened: "Beli" vs "Beli Emas"
- Weight buttons: 5 columns grid
- Tables: Card layout with stacked rows
- Padding: `p-6` instead of `p-8`
- Form: Single column

### Desktop (≥ 768px):
- Tab labels full: "Beli Emas" vs "Jual Emas / Buyback"
- Weight buttons: 9 columns grid
- Tables: Full width table layout
- Padding: `p-8`
- Form: 2 columns grid

---

## 🎨 Color & Styling Guide

### Primary Colors:
- **Gold**: `#D4AF37` (accent, highlights, CTAs)
- **Slate-900**: `#0f172a` (dark background)
- **Slate-950**: `#030712` (darker background)
- **Slate-800**: `#1e293b` (cards)
- **Green**: `#16a34a` (WhatsApp button)

### Text Colors:
- **White**: Main text on dark backgrounds
- **Slate-400**: Secondary text (gray)
- **Gold**: Emphasis, numbers, CTAs
- **Green-600**: Selling prices
- **Blue-600**: Buyback prices
- **Amber-600**: Margin/difference

### Effects:
- Border: `border-slate-700` with opacity variants
- Shadow: `shadow-xl`, `shadow-lg`
- Hover: `hover:bg-slate-700/50`, `hover:scale-105`
- Transitions: `transition-all duration-200`

---

## 🧪 Testing Checklist

- [ ] Tab switching works smoothly
- [ ] Prices load from Supabase
- [ ] Calculations are accurate
- [ ] WhatsApp links format correctly
- [ ] Mobile layout responsive
- [ ] Error states display properly
- [ ] Refresh button works
- [ ] Form validation works
- [ ] Currency formatting is correct
- [ ] Icons render properly
- [ ] Dark mode styles correct
- [ ] Loading states appear and disappear

---

## 🔐 Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📋 Integration Checklist

1. **Database Setup**
   - [ ] Verify gold_prices table with both schemas
   - [ ] Antam prices in new schema (single row, id=1)
   - [ ] Purity prices in old schema (multiple rows)

2. **Component Setup**
   - [ ] Import GoldPriceTable in main page
   - [ ] Import GoldPriceContainer for alternate layout
   - [ ] Configure WhatsApp numbers in forms

3. **Testing**
   - [ ] Test all tabs and calculations
   - [ ] Test responsive design
   - [ ] Test error handling
   - [ ] Test WhatsApp integration

4. **Deployment**
   - [ ] Set environment variables
   - [ ] Test on staging
   - [ ] Deploy to production

---

## 🚀 Key Features Summary

| Feature | Component | Status |
|---------|-----------|--------|
| Purity Price Table | GoldPriceTable Tab 1 | ✅ Complete |
| Antam Price Table | GoldPriceTable Tab 2 | ✅ Complete |
| Buyback Form | GoldPriceTable Tab 2 | ✅ Complete |
| WhatsApp Integration | BuybackCalculator & Form | ✅ Complete |
| Weight Calculator | All | ✅ Complete |
| Error Handling | All | ✅ Complete |
| Loading States | All | ✅ Complete |
| Responsive Design | All | ✅ Complete |
| Dark Mode | All | ✅ Complete |
| Performance Optimization | All | ✅ Complete |

---

## 💡 Pro Tips

1. **Customization**: Edit WEIGHT_OPTIONS constant untuk mengubah pilihan berat
2. **WhatsApp**: Ganti nomor HP di setiap form component
3. **Colors**: Modify tailwind classes untuk mengubah color scheme
4. **Messages**: Edit template message untuk buyback/selling
5. **Validation**: Add email validation di form jika diperlukan

---

## 📞 Support Notes

- All components use TypeScript for type safety
- Supabase context via useSupabase hook
- Toast notifications untuk user feedback
- Framer Motion untuk animations (optional)
- Lucide React untuk icons konsisten

---

## File Structure

```
src/
├── components/
│   ├── GoldPriceTable.tsx (Main - 2 tabs)
│   └── prices/
│       ├── SellingPriceTable.tsx (Optimized)
│       ├── BuybackCalculator.tsx (Optimized)
│       └── GoldPriceContainer.tsx (Optimized wrapper)
└── lib/
    └── supabase.tsx (Functions: getGoldPrices, getDailyPrice, updateDailyPrice)
```

---

## Version Control

**Latest Optimization**: December 10, 2025
- Added error handling with retry
- Added memoization for performance
- Expanded GoldPriceTable with 2 tabs
- Optimized responsive design
- Enhanced styling and UX
