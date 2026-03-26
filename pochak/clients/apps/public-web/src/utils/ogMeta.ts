/**
 * Updates document <head> meta tags for Open Graph sharing.
 * Called when content pages load.
 */
export function setOgMeta(title: string, description: string, imageUrl?: string) {
  document.title = `${title} | POCHAK`;
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  if (imageUrl) setMetaTag('og:image', imageUrl);
  setMetaTag('og:type', 'video.other');
  setMetaTag('og:site_name', 'POCHAK');
}

function setMetaTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
