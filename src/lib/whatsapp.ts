const WHATSAPP_NUMBER = "6285190044083";

export const generateWhatsAppLink = (productName: string, weight: string | number, price: string): string => {
  // Menggunakan format baris baru (\n) dan bold (*) agar rapi di WhatsApp
  const text = `Halo Admin Raihan Gold, 👋

Saya tertarik untuk melakukan pembelian produk berikut:

🛍️ *Nama Produk:* ${productName}
⚖️ *Berat:* ${weight} gram
💰 *Estimasi Harga:* ${price}

Mohon informasi ketersediaan stok dan prosedur pembayarannya. Terima kasih.`;

  const message = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

export const generateGeneralWhatsAppLink = (): string => {
  const text = `Halo Admin Raihan Gold, 👋

Saya ingin berkonsultasi mengenai harga emas dan produk yang tersedia hari ini. Mohon bantuannya. Terima kasih.`;

  const message = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};