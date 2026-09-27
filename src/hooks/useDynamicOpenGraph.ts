import { useEffect } from 'react';
import { BrandKit, NamingOption } from '../types/brand.js';

export interface DynamicOgMetaOptions {
  brandName: string;
  oneLinePitch: string;
  archetype?: string;
  themeName?: string;
  primaryColor?: string;
  shareUrl?: string;
  shareId?: string;
}

function updateMetaTag(
  selector: string,
  attributeName: string,
  attributeValue: string,
  content: string
) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function setDynamicOpenGraph(options: DynamicOgMetaOptions) {
  if (typeof document === 'undefined') return;

  const {
    brandName,
    oneLinePitch,
    archetype = 'Strategic Identity',
    themeName = 'Modern High-Conviction',
    primaryColor = '#06b6d4',
    shareUrl,
    shareId,
  } = options;

  const origin = window.location.origin;
  const canonicalUrl = shareUrl || (shareId ? `${origin}${window.location.pathname}?shareId=${shareId}` : window.location.href);

  // Generate dynamic OG image URL
  const ogImageParams = new URLSearchParams({
    brandName: brandName,
    pitch: oneLinePitch,
    archetype: archetype,
    theme: themeName,
    color: primaryColor,
  });
  if (shareId) {
    ogImageParams.set('shareId', shareId);
  }
  const ogImageUrl = `${origin}/api/og-image?${ogImageParams.toString()}`;

  const pageTitle = `${brandName} – Brand Strategy Dossier | BrandBattle`;
  const socialTitle = `${brandName} – Verified Brand Strategy Dossier`;
  const socialDesc = oneLinePitch.length > 200 ? oneLinePitch.slice(0, 197) + '...' : oneLinePitch;

  // 1. Document Title
  document.title = pageTitle;

  // 2. Standard Meta
  updateMetaTag('meta[name="description"]', 'name', 'description', socialDesc);

  // 3. OpenGraph Tags
  updateMetaTag('meta[property="og:title"]', 'property', 'og:title', socialTitle);
  updateMetaTag('meta[property="og:description"]', 'property', 'og:description', socialDesc);
  updateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  updateMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'BrandBattle Studio');
  updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);
  updateMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', ogImageUrl);
  updateMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
  updateMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  updateMetaTag('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/svg+xml');
  updateMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', `${brandName} Brand Strategy Dossier`);

  // 4. Twitter / X Card Tags
  updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', socialTitle);
  updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', socialDesc);
  updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);
  updateMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', `${brandName} Brand Strategy Dossier`);

  // 5. Canonical Link
  updateLinkTag('canonical', canonicalUrl);

  // 6. Schema.org JSON-LD Structured Data
  let ldJsonScript = document.querySelector('#schema-brand-kit') as HTMLScriptElement | null;
  if (!ldJsonScript) {
    ldJsonScript = document.createElement('script');
    ldJsonScript.id = 'schema-brand-kit';
    ldJsonScript.type = 'application/ld+json';
    document.head.appendChild(ldJsonScript);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brandName,
    description: socialDesc,
    url: canonicalUrl,
    image: ogImageUrl,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    category: archetype,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
  ldJsonScript.textContent = JSON.stringify(structuredData);

  return { ogImageUrl, canonicalUrl };
}

export function restoreDefaultOpenGraph() {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'BrandBattle - Multi-Agent Brand Intelligence Platform';
  const defaultDesc =
    'AI-powered brand strategy arena deploying specialized agent debate (Growth VC, Creative Director, Brutal Skeptic) to forge launch-ready startup brand kits.';

  document.title = defaultTitle;
  updateMetaTag('meta[name="description"]', 'name', 'description', defaultDesc);
  updateMetaTag('meta[property="og:title"]', 'property', 'og:title', defaultTitle);
  updateMetaTag('meta[property="og:description"]', 'property', 'og:description', defaultDesc);
  updateMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  updateMetaTag('meta[property="og:url"]', 'property', 'og:url', window.location.origin);
  updateMetaTag('meta[property="og:image"]', 'property', 'og:image', `${window.location.origin}/api/og-image`);
  updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', defaultTitle);
  updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', defaultDesc);
  updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${window.location.origin}/api/og-image`);

  const ldJsonScript = document.querySelector('#schema-brand-kit');
  if (ldJsonScript) {
    ldJsonScript.remove();
  }
}

/**
 * Hook to automatically update Open Graph tags when in BrandKitStage or viewing a shared kit
 */
export function useDynamicOpenGraph(options: DynamicOgMetaOptions | null) {
  useEffect(() => {
    if (!options || !options.brandName) {
      return;
    }

    setDynamicOpenGraph(options);

    return () => {
      restoreDefaultOpenGraph();
    };
  }, [
    options?.brandName,
    options?.oneLinePitch,
    options?.archetype,
    options?.themeName,
    options?.primaryColor,
    options?.shareUrl,
    options?.shareId,
  ]);
}
