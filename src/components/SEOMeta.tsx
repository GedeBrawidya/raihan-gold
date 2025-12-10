import { Helmet } from "react-helmet-async";

interface SEOMetaProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export const SEOMeta = ({
  title = "Raihan Gold - Jual Beli Emas Terpercaya",
  description = "Raihan Gold adalah toko emas terpercaya dengan harga kompetitif. Jual beli emas ANTAM (batangan & koin) berkualitas tinggi.",
  ogImage = "/og-image.jpg",
  canonicalUrl = "https://raihangold.com",
}: SEOMetaProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Raihan Gold",
    description: description,
    image: ogImage,
    url: canonicalUrl,
    telephone: "+62-812-3456-789",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
    priceRange: "$$",
    openingHours: "Mo-Sa 09:00-18:00",
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
