// Home single-type populate (named keys, no numeric indices) to avoid ValidationError: Invalid key 2 at hero
// Strategy:
// - Use explicit field names under each component/media field
// - Only drill down where nesting exists (hero.title.desktop / hero.title.mobile.lines, list item media)
// - Keep ordering stable for cache keys
export const homePopulate = [
  // --- Hero (shallow media + components) ---
  'populate[hero][populate][background]=1', // media (no deep *) to avoid hero.background.related error
  'populate[hero][populate][primaryCta]=1', // component (shallow ok)
  'populate[hero][populate][secondaryCta]=1', // component
  // Responsive title pieces
  'populate[hero][populate][title][populate][desktop]=1',
  'populate[hero][populate][title][populate][mobile][populate][lines]=1',
  // --- Features ---
  'populate[features][populate][titleSegments]=1', // title segments for colored text
  'populate[features][populate][cta]=1', // features CTA button
  'populate[features][populate][items][populate][icon]=1', // icon is media
  // Note: description is a text field, no need to populate
  // --- Products ---
  'populate[products][populate][cta]=1',
  'populate[products][populate][related][populate][thumbnail]=1',
  'populate[products][populate][related][populate][categoryBadge]=1',
  'populate[products][populate][items][populate][image]=1',
  // --- Services ---
  'populate[services][populate][cta]=1',
  'populate[services][populate][related][populate][thumbnail]=1',
  'populate[services][populate][items][populate][image]=1',
  // --- Posts ---
  'populate[posts][populate][cta]=1',
  'populate[posts][populate][related][populate][thumbnail]=1',
  'populate[posts][populate][items][populate][image]=1',
  // --- Page SEO ---
  'populate[seo][populate][ogImage]=1',
].join('&');

// Separate populate for global single type (favicon + navbar + brand + footer + seo)
// Populate favicon + navbar (ctas) + brand (logo) + footer (columns -> links) + defaultSeo (ogImage)
// Global populate: explicit arrays so Turbopack/URL building stable & Strapi returns nested media.
// - favicon (media)
// - navbar (component -> ctas array)
// - brand (component -> logo media)
// - footer (component -> columns -> links)
// - defaultSeo (component -> ogImage media)
export const globalPopulate =
  'populate[navbar][populate][0]=ctas' +
  '&populate[brand][populate][0]=logo' +
  '&populate[brand][populate][1]=segments' +
  '&populate[footer][populate][0]=columns' +
  '&populate[footer][populate][columns][populate][0]=links' +
  '&populate[footerCta][populate][0]=bg' +
  '&populate[footerCta][populate][1]=cta' +
  '&populate[defaultSeo][populate][0]=ogImage';

export default homePopulate;
