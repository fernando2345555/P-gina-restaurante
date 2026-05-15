import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../context/AppContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website' 
}) => {
  const { config } = useApp();

  const seo = {
    title: title ? `${title} | ${config.siteName}` : config.siteName,
    description: description || config.cuisineType || 'Zenith Grill - Templo de la Brasa. La mejor experiencia en parrilla argentina y BBQ.',
    image: image || config.heroImage,
    url: url || window.location.href,
  };

  return (
    <Helmet>
      {/* Standard identity tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Theme Color */}
      <meta name="theme-color" content={config.primaryColor || '#ff4e00'} />
    </Helmet>
  );
};
