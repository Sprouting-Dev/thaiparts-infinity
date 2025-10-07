# Grid Best Practice Guide

## Overview
เปลี่ยนจาก manual items (shared.card components) เป็น **relations-based approach** ที่ดึงข้อมูลจาก collection types โดยตรง

## What Changed

### Backend Changes
1. **Grid Components** - เพิ่ม `related` relation field ใน:
   - `sections.grid-products` → relation to `api::product.product` 
   - `sections.grid-services` → relation to `api::service.service`
   - `sections.grid-posts` → relation to `api::post.post`

2. **Schema Structure** (ตอนนี้แต่ละ grid component มี):
   ```json
   {
     "title": "string (required)",
     "cta": "component shared.cta", 
     "related": "relation manyToMany to collection",  // ← NEW!
     "items": "component shared.card (fallback)"      // ← kept for backward compatibility
   }
   ```

### Frontend Changes
1. **Queries** - เพิ่ม populate สำหรับ related entries:
   ```
   populate[products][populate][related][populate][thumbnail]=1
   populate[products][populate][related][populate][categoryBadge]=1
   ```

2. **Mapping Logic** - prefer related entries > manual items:
   ```tsx
   items: attr.products.related?.data?.length > 0 
     ? attr.products.related.data.map(...)  // Collection entries
     : attr.products.items?.map(...)        // Manual items (fallback)
   ```

## How to Use in Strapi Admin

### Best Practice Method (Recommended)
1. **Go to Home Page** in Strapi admin
2. **Edit** the Products/Services/Posts section
3. **Use the "Related" field** instead of manual items:
   - Click "Add an entry" in Related field
   - Select actual Products/Services/Posts from your collections
   - Order them as desired
4. **Leave "Items" empty** (or remove existing manual items)

### Legacy Method (Still Works)
- Continue using manual "Items" (shared.card components)
- Frontend will fallback to these if no Related entries exist

## Migration Steps

### For Existing Sites
1. **Keep existing manual items** for now (no breaking changes)
2. **Restart Strapi** so new relation fields appear in admin
3. **Test**: visit homepage - should work exactly the same
4. **Gradually migrate**:
   - For each grid section, populate the "Related" field with collection entries
   - Verify the homepage shows the same content
   - Once satisfied, clear the old "Items" field

### For New Sites
- Always use "Related" fields instead of manual items
- Only use manual "Items" for one-off content that doesn't exist in collections

## Benefits of Best Practice Approach

✅ **Single Source of Truth**: Content lives in collection types  
✅ **Better SEO**: Individual pages (e.g., `/products/bearing-123`) exist  
✅ **Easier Content Management**: Edit product once, updates everywhere  
✅ **Automatic Updates**: Homepage reflects latest published content  
✅ **Better Performance**: No duplicate content storage  
✅ **Rich Data**: Access to full collection fields (badges, categories, etc.)  

## Example Workflow

### Before (Manual Items)
```
Home Page > Products Section > Items > Add Item
- Upload image
- Type title manually
- Type description manually  
- Add manual href
```

### After (Relations)
```
1. Create Product in Products collection
   - Name: "High-Quality Bearing"
   - Slug: "bearing-123" 
   - Thumbnail: upload image
   - Category Badge: "Industrial Parts"

2. Home Page > Products Section > Related > Add Entry
   - Select "High-Quality Bearing" from dropdown
   - Done! 
```

## Troubleshooting

### Q: Related field doesn't appear in Strapi admin
**A**: Restart Strapi server after schema changes

### Q: Homepage shows nothing after adding Related entries  
**A**: Check that:
- Entries are **Published** (not Draft)
- Frontend populate query includes related fields
- Collection entries have required fields (name/title, slug, thumbnail)

### Q: Can I use both Related and Items together?
**A**: Yes! Frontend prefers Related entries but falls back to Items if Related is empty

### Q: How to get the same results as before?
**A**: For each manual item in your current setup:
1. Create equivalent entry in the collection (Products/Services/Posts)
2. Add that entry to the Related field  
3. Remove the manual item once you verify it works

## Data Flow Comparison

### Old Flow (Manual)
```
Strapi Admin → Manual Items → shared.card component → Frontend
```

### New Flow (Relations)  
```
Strapi Admin → Collection Entry → Related field → Frontend
                     ↓
             Individual page (/products/slug)
```

The new approach creates both homepage entries AND individual pages automatically!