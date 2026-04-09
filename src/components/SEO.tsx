import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SEO = ({
  title = "TheVideoJanitors - Professional Short-Form Video Editing",
  description = "Subscribe to a plan. Get matched with a vetted editor. Receive polished reels in 48 hours. No bidding wars, no freelancer mess.",
  keywords = "video editing, short-form video, reels editing, tiktok editing, youtube shorts, content creation, video editor",
  ogImage = "/og-image.jpg",
  canonical,
}: SEOProps) => {
  const siteUrl = "https://thevideojanitors.com";
  const fullTitle = title.includes("TheVideoJanitors") ? title : `${title} | TheVideoJanitors`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical || siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Additional */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="TheVideoJanitors" />
    </Helmet>
  );
};

export default SEO;