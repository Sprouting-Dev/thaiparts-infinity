# Strapi Navbar Component Setup Guide

## Overview
This guide explains how to set up the new dynamic navbar system in Strapi admin panel after the component schema updates.

## Updated Components

### 1. `shared.cta` Component
- **4 New Variants**: `contact`, `secondary`, `primary`, `content-primary`
- **New Fields**: `newTab` (boolean), `enabled` (boolean)
- **Required Fields**: `label`, `href`, `variant`

### 2. `layout.navbar` Component  
- **Phone Field**: `phone` (string, optional) - displays in header + used for contact CTA
- **CTA Array**: `ctas` (repeatable, max 4) - configurable action buttons

## Setup Instructions

### Step 1: Update Component Schemas
The component schemas have been updated in:
- `backend/src/components/shared/cta.json`
- `backend/src/components/layout/navbar.json`

**Action Required**: Restart Strapi backend to load new schemas.

```bash
cd backend
npm run develop
```

### Step 2: Configure Global > Navbar
1. Go to Strapi Admin → **Content Manager** → **Global** (Single Type)
2. Edit the **Global** entry
3. In the **Navbar** section, configure:

#### Phone Number
- **Field**: `phone`
- **Example**: `"086-888-2566"`
- **Usage**: Shows in header + auto-fills contact CTA

#### CTA Buttons (up to 4)
Configure each CTA with:

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `label` | Text | Required | Button text |
| `href` | Text | Required | Link URL/path |
| `variant` | Select | `contact`, `secondary`, `primary`, `content-primary` | Button style |
| `newTab` | Boolean | Optional | Open in new tab |
| `enabled` | Boolean | Optional | Show/hide button |

### Step 3: CTA Variant Guide

#### 1. **Contact Variant**
- **Style**: Blue background, white text, phone icon
- **Use Case**: Main contact/phone button
- **Behavior**: Uses navbar phone number if no href specified
- **Example**: 
  ```
  Label: "โทรสอบถาม"
  Href: "tel:086-888-2566" 
  Variant: "contact"
  ```

#### 2. **Secondary Variant**
- **Style**: Light blue background (#CCE8FF), dark text
- **Use Case**: Secondary actions, soft CTAs
- **Example**:
  ```
  Label: "ดูสินค้าทั้งหมด"
  Href: "/products"
  Variant: "secondary"
  ```

#### 3. **Primary Variant**  
- **Style**: Dark blue background (#0066CC), white text
- **Use Case**: Main action buttons, important CTAs
- **Example**:
  ```
  Label: "ติดต่อเรา"
  Href: "/contact"
  Variant: "primary"
  ```

#### 4. **Content-Primary Variant**
- **Style**: Gradient border, white background, blue text
- **Use Case**: Premium content, special offers
- **Example**:
  ```
  Label: "รับใบเสนอราคา"
  Href: "/quote"
  Variant: "content-primary"
  ```

## Sample Configuration

### Recommended Navbar Setup
```json
{
  "phone": "086-888-2566",
  "ctas": [
    {
      "label": "โทรสอบถาม",
      "href": "tel:086-888-2566",
      "variant": "contact",
      "enabled": true
    },
    {
      "label": "ดูสินค้า",
      "href": "/products", 
      "variant": "secondary",
      "enabled": true
    },
    {
      "label": "ติดต่อเรา",
      "href": "/contact",
      "variant": "primary", 
      "enabled": true
    },
    {
      "label": "รับใบเสนอราคา",
      "href": "/quote",
      "variant": "content-primary",
      "newTab": true,
      "enabled": true
    }
  ]
}
```

## Frontend Integration

The frontend automatically:
- ✅ Fetches navbar data from Global single type
- ✅ Renders enabled CTAs with correct styling
- ✅ Handles contact variant with phone integration
- ✅ Supports gradient borders for content-primary
- ✅ Applies responsive layout and animations

## Testing

After setup:
1. **Save** Global entry in Strapi
2. **Refresh** frontend to see changes
3. **Test** all CTA buttons work correctly
4. **Verify** phone number displays in header
5. **Check** responsive behavior on mobile

## Troubleshooting

### CTAs Not Showing
- Check `enabled: true` for each CTA
- Verify navbar component is saved in Global
- Restart frontend if needed: `npm run dev`

### Phone Not Displaying  
- Ensure `phone` field is filled in navbar
- Check contact CTA has correct `tel:` prefix

### Styling Issues
- Verify `variant` matches one of 4 options
- Check browser console for CSS errors
- Clear browser cache if styles not updating

## Development Notes

- **Max CTAs**: 4 buttons recommended for UI layout
- **Performance**: Global data cached for 300 seconds
- **SEO**: All CTA links support `newTab` option
- **Accessibility**: Proper ARIA labels included
- **Analytics**: Ready for tracking implementation

---

**Updated**: January 2025  
**Frontend**: Next.js App Router + TypeScript  
**Backend**: Strapi v4 + Components