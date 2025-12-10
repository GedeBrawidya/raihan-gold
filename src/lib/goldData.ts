import goldBarImage from "@/assets/gold-bar.jpg";
import goldCoinImage from "@/assets/gold-coin.jpg";
import goldNecklaceImage from "@/assets/gold-necklace.jpg";
import goldRingImage from "@/assets/gold-ring.jpg";

export interface GoldPrice {
  id: string;
  purity: string;
  sellPrice: number;
  buybackPrice: number;
  lastUpdated: Date;
}

export interface Product {
  id: string;
  name: string;
  weight: string;
  priceEstimation: number;
  imagePath: string;
  description: string;
  isActive: boolean;
}

// Mock data - in production, this would come from Lovable Cloud/Supabase
export const goldPrices: GoldPrice[] = [
  {
    id: "1",
    purity: "999.9 (24K)",
    sellPrice: 1150000,
    buybackPrice: 1100000,
    lastUpdated: new Date(),
  },
  {
    id: "2",
    purity: "958 (23K)",
    sellPrice: 1100000,
    buybackPrice: 1050000,
    lastUpdated: new Date(),
  },
  {
    id: "3",
    purity: "916 (22K)",
    sellPrice: 1050000,
    buybackPrice: 1000000,
    lastUpdated: new Date(),
  },
  {
    id: "4",
    purity: "750 (18K)",
    sellPrice: 860000,
    buybackPrice: 810000,
    lastUpdated: new Date(),
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Emas Batangan ANTAM",
    weight: "5 gram",
    priceEstimation: 5750000,
    imagePath: goldBarImage,
    description: "Emas batangan ANTAM dengan sertifikat resmi",
    isActive: true,
  },
  {
    id: "2",
    name: "Emas Batangan ANTAM",
    weight: "10 gram",
    priceEstimation: 11500000,
    imagePath: goldBarImage,
    description: "Emas batangan ANTAM dengan sertifikat resmi",
    isActive: true,
  },
  {
    id: "3",
    name: "Emas Batangan ANTAM",
    weight: "25 gram",
    priceEstimation: 28750000,
    imagePath: goldBarImage,
    description: "Emas batangan ANTAM dengan sertifikat resmi",
    isActive: true,
  },
  {
    id: "4",
    name: "Koin Emas Dinar",
    weight: "4.25 gram",
    priceEstimation: 4887500,
    imagePath: goldCoinImage,
    description: "Koin Dinar emas 22K",
    isActive: true,
  },
  {
    id: "5",
    name: "Emas Batangan ANTAM",
    weight: "50 gram",
    priceEstimation: 57500000,
    imagePath: goldBarImage,
    description: "Emas batangan ANTAM 50 gram dengan sertifikat resmi",
    isActive: true,
  },
  {
    id: "6",
    name: "Koin Emas Koleksi",
    weight: "1 gram",
    priceEstimation: 1150000,
    imagePath: goldCoinImage,
    description: "Koin emas koleksi (1 gram) - Emas ANTAM koleksi",
    isActive: true,
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
