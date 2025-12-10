const WHATSAPP_NUMBER = "6285190044083";

export const generateWhatsAppLink = (productName: string, weight: string): string => {
  const message = encodeURIComponent(
    `Halo admin Raihan Gold, saya tertarik dengan ${productName} (${weight}). Mohon informasi lebih lanjut.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

export const generateGeneralWhatsAppLink = (): string => {
  const message = encodeURIComponent(
    `Halo admin Raihan Gold, saya ingin bertanya tentang produk emas.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};
