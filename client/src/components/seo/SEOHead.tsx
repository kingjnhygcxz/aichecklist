import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export function SEOHead({
  title = "AIChecklist.io - AI-Powered Task Management & 226+ Professional Templates",
  description = "Transform your productivity with AIChecklist.io - featuring AIDOMO AI assistant, 226+ professional templates, voice authentication, smart calendar sync, Gantt charts, and more. Start free today!",
  keywords = "AI checklist, task management, productivity app, AIDOMO AI assistant, voice authentication, project templates, team collaboration, Gantt chart, PERT chart, calendar sync",
  ogImage = "https://aichecklist.io/logo.png",
  canonicalUrl,
  structuredData,
  noIndex = false
}: SEOHeadProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:url', canonicalUrl || `https://aichecklist.io${location}`, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:title', title, 'property');
    updateMetaTag('twitter:description', description, 'property');
    updateMetaTag('twitter:image', ogImage, 'property');

    // Update canonical URL
    updateCanonicalUrl(canonicalUrl || `https://aichecklist.io${location}`);

    // Add structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Track page view for analytics
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-XXXXXXXXXX', {
        page_title: title,
        page_location: canonicalUrl || `https://aichecklist.io${location}`
      });
    }
  }, [title, description, keywords, ogImage, canonicalUrl, location, structuredData, noIndex]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[data-seo="dynamic"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo', 'dynamic');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Predefined structured data schemas
export const SEOSchemas = {
  howTo: (title: string, steps: string[], description: string) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  }),

  faq: (questions: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(qa => ({
      "@type": "Question",
      "name": qa.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qa.answer
      }
    }))
  }),

  template: (template: { title: string; description: string; category: string; tasks: string[] }) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": template.title,
    "description": template.description,
    "category": template.category,
    "creator": {
      "@type": "Organization",
      "name": "AIChecklist.io"
    },
    "about": template.tasks.slice(0, 5).join(", ")
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })
};