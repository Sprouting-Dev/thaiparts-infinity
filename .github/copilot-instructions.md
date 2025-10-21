# AI Coding Instructions for ThaiParts Infinity

## Project Overview

Thai industrial automation parts company website built with Next.js 15, using **static data instead of Strapi CMS** for faster delivery. Bilingual (Thai/English) with focus on B2B industrial clients.

## Architecture Patterns

### Static Data Strategy

- **No Strapi dependency** - all content is hardcoded in page components for delivery speed
- Use `src/lib/static-global.ts` for shared data (SEO, branding, navigation)
- Page-specific data defined directly in page components (see `src/app/contact-us/page.tsx`)
- Comment pattern: `// Static content for delivery - no Strapi dependency`

### Component Data Flow

```tsx
// Pattern: Define pageData object in page component
const pageData = {
  hero: { title: {...}, subtitle: "..." },
  contactInfo: { title: "...", address: "...", phone: "..." },
  // Pass to components with typed interfaces
};

<Hero title={pageData.hero.title} subtitle={pageData.hero.subtitle} />
<ContactInfo data={pageData.contactInfo} />
```

### Typography & Responsive Text

- **Dual title system**: Desktop (left/right text with colors) vs Mobile (lines array)
- **Color system**: `brandBlue` (#1063A7), `accentRed` (#E92928), `white`
- **Newlines**: Use `whitespace-pre-line` CSS class for `\n` support in text
- **Phone formatting**: Split by `\n` and map to separate `<a href="tel:">` elements

### Component Architecture

- Reusable components in `src/components/` (Hero, CTAButton, ContactInfo, etc.)
- Each component has TypeScript interface for props
- Static imports, no dynamic CMS fetching
- Components handle both desktop/mobile responsive patterns

## Development Workflow

### Key Commands

```bash
# Development with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Code quality checks
npm run check        # type-check + lint + format check
npm run fix          # lint fix + format
```

### File Patterns

- **Pages**: `src/app/[route]/page.tsx` (App Router)
- **Components**: `src/components/ComponentName.tsx`
- **Utilities**: `src/lib/` (button-styles.ts, static-global.ts, etc.)
- **Static assets**: `public/` with organized folders (`/homepage/`, `/contact/`)

## Styling System

### Tailwind v4 Setup

- Entry: `@import 'tailwindcss'` in `globals.css`
- Custom properties defined in `:root` (colors, fonts, spacing)
- No separate `tailwind.config.ts` - uses Tailwind v4 defaults

### Brand Colors

```css
--color-primary: #1063a7; /* brandBlue */
--color-accent: #e92928; /* accentRed */
--color-secondary: #f5f5f5; /* backgrounds */
```

### Typography

- **Font**: Kanit (Thai + Latin support)
- **Weights**: 100-900 available
- **Pattern**: Use color utility functions in components (see `Hero.tsx`)

## Thai Language Considerations

- Mixed Thai/English content throughout
- Use proper Thai typography with Kanit font
- Thai text in hero titles, navigation, contact forms
- UTF-8 encoding for Thai characters in static data

## Image & Media Patterns

- **Static assets**: All in `public/` folder with semantic organization
- **Next.js Image**: Configured for optimization with remote patterns
- **WebP conversion**: Helper utilities in `lib/image-optimize.ts` (from Strapi migration)
- **Responsive**: Use Next.js Image component with proper sizing

## Component Specific Patterns

### Hero Component

- Accepts dual title structure (desktop/mobile variants)
- Background image from `public/homepage/homepage-hero.png` as default
- CTA button integration with typed variants
- Responsive breakpoint handling (lg:, etc.)

### Contact Components

- **ContactInfo**: Split phone numbers with `\n`, map to clickable tel: links
- **ContactMap**: Google Maps iframe with Thai address support
- **ContactForm**: Field toggles via boolean props, success message handling

### Button System

- **CTAButton**: Uses `lib/button-styles.ts` for variant-based styling
- **Variants**: `hero-secondary`, `secondary`, `primary`, `content-primary`
- **Styling**: Gradient borders, box shadows, responsive padding

## Common Gotchas

- Phone numbers need `whitespace-pre-line` AND individual `<a>` tags for proper display
- Thai text encoding - ensure UTF-8 in all static data
- Turbopack enabled - use `--turbopack` flag for dev/build commands
- No CMS calls - all data is static/hardcoded for this delivery phase
- Image paths start from `public/` root (e.g., `/homepage/hero.png`)

## File References

- Layout structure: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`
- Static data: `src/lib/static-global.ts`
- Contact page example: `src/app/contact-us/page.tsx`
- Component patterns: `src/components/Hero.tsx`, `src/components/ContactInfo.tsx`
