import { Helmet } from 'react-helmet-async';
import { SEOData } from '@/types/analytics';

interface SEOHeadProps {
  seoData: SEOData;
  postUrl?: string;
  postImage?: string;
}

export default function SEOHead({ seoData, postUrl, postImage }: SEOHeadProps) {
  const {
    title,
    description,
    keywords,
    ogImage,
    canonical,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags
  } = seoData;

  const fullImageUrl = postImage || ogImage;
  const fullCanonicalUrl = canonical || postUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="Nexus Blog" />
      <meta property="og:locale" content="pt_BR" />
      
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && (
        <meta property="article:author" content={author} />
      )}
      {section && (
        <meta property="article:section" content={section} />
      )}
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@nexusblog" />
      <meta name="twitter:site" content="@nexusblog" />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "description": description,
          "image": fullImageUrl,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Nexus Blog",
            "logo": {
              "@type": "ImageObject",
              "url": "https://nexusblog.com/logo.png"
            }
          },
          "datePublished": publishedTime,
          "dateModified": modifiedTime,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": fullCanonicalUrl
          },
          "keywords": keywords.join(', '),
          "articleSection": section,
          "wordCount": description.split(' ').length
        })}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
}
