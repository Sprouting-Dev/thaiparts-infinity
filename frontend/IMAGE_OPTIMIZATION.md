# Image Optimization Helper

Helper functions สำหรับแปลงรูปภาพจาก Strapi เป็น .webp เพื่อประสิทธิภาพที่ดีขึ้น

## Features

- ✅ แปลงรูปเป็น .webp อัตโนมัติ (ยกเว้น .svg)
- ✅ ปรับขนาดและคุณภาพได้
- ✅ Responsive image srcSet
- ✅ Next.js Image component compatible
- ✅ รองรับ Strapi media formats

## Basic Usage

```typescript
import { toOptimizedMedia, ImageSizes } from '@/lib/media';
import { toOptimizedImage, generateSrcSet } from '@/lib/image-optimize';

// แปลง Strapi media เป็น optimized URL
const optimizedUrl = toOptimizedMedia(strapiImage, ImageSizes.medium);

// ใช้กับ background image
<div style={{ backgroundImage: `url(${optimizedUrl})` }} />

// สร้าง responsive srcSet
const srcSet = generateSrcSet(strapiImage);
<img srcSet={srcSet} sizes="(max-width: 768px) 100vw, 50vw" />
```

## Image Size Presets

```typescript
ImageSizes.thumbnail; // 150x150, quality: 80
ImageSizes.small; // 300x300, quality: 85
ImageSizes.medium; // 600x400, quality: 85
ImageSizes.large; // 1200x800, quality: 90
ImageSizes.hero; // 1920x1080, quality: 90
ImageSizes.avatar; // 64x64, quality: 80
ImageSizes.logo; // 200x200, quality: 90
```

## Custom Options

```typescript
// Custom size และ quality
const customImage = toOptimizedImage(url, {
  width: 800,
  height: 600,
  quality: 75,
  format: 'webp', // 'webp' | 'avif' | 'jpeg' | 'png'
});

// Responsive breakpoints
const responsiveSet = generateSrcSet(url, [
  { width: 320, quality: 75 },
  { width: 768, quality: 85 },
  { width: 1200, quality: 90 },
]);
```

## Next.js Integration

```typescript
import { getImageProps } from '@/lib/image-optimize';

// สำหรับ Next.js Image component
const imageProps = getImageProps(strapiImage, {
  width: 600,
  height: 400,
  alt: 'Description'
});

<Image {...imageProps} />
```

## Examples

### Header Logo

```typescript
// ใน Header component
<div
  style={{
    backgroundImage: `url(${toOptimizedMedia(brand.logo, ImageSizes.logo)})`
  }}
/>
```

### Hero Image with Responsive

```typescript
// Hero section
const heroSrcSet = generateSrcSet(heroImage, [
  { width: 768, quality: 80 },
  { width: 1024, quality: 85 },
  { width: 1920, quality: 90 }
]);

<img
  srcSet={heroSrcSet}
  sizes="100vw"
  alt="Hero image"
/>
```

### Product Grid

```typescript
// Product thumbnails
{products.map(product => (
  <img
    key={product.id}
    src={toOptimizedMedia(product.thumbnail, ImageSizes.thumbnail)}
    alt={product.name}
  />
))}
```

## How it works

1. **SVG Detection**: ไฟล์ .svg จะไม่ถูกแปลง
2. **External URLs**: URL ภายนอก (ไม่ใช่ Strapi) จะไม่ถูกแปลง
3. **Optimization**: สร้าง URL ใหม่ด้วย format: `filename_WIDTHxHEIGHT_qQUALITY.webp`
4. **Fallback**: ถ้าแปลงไม่ได้จะใช้ URL เดิม

## Performance Benefits

- 🚀 ไฟล์เล็กลง 25-50% เมื่อเทียบกับ JPEG/PNG
- ⚡ โหลดเร็วขึ้น
- 📱 รองรับ responsive images
- 🎯 SEO friendly
- 💾 ประหยัด bandwidth

## Browser Support

WebP รองรับบน:

- Chrome/Edge (100%)
- Firefox (100%)
- Safari (100%)
- Mobile browsers (>95%)

สำหรับ browser เก่าจะ fallback เป็น format เดิม
