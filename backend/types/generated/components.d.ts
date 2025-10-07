import type { Schema, Struct } from '@strapi/strapi';

export interface LayoutBrand extends Struct.ComponentSchema {
  collectionName: 'components_layout_brands';
  info: {
    description: 'Brand component with flexible text segments and logo';
    displayName: 'brand';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    segments: Schema.Attribute.Component<'shared.text-segment', true> &
      Schema.Attribute.Required;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'footer';
  };
  attributes: {
    address: Schema.Attribute.Text;
    columns: Schema.Attribute.Component<'layout.footer-column', true>;
    companyName: Schema.Attribute.Text;
    copyright: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    facebook: Schema.Attribute.String;
    phone: Schema.Attribute.String;
  };
}

export interface LayoutFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_layout_footer_columns';
  info: {
    displayName: 'footerColumn';
  };
  attributes: {
    heading: Schema.Attribute.String;
    links: Schema.Attribute.Component<'shared.links', true>;
  };
}

export interface LayoutNavbar extends Struct.ComponentSchema {
  collectionName: 'components_layout_navbars';
  info: {
    description: 'Navigation bar with configurable CTA buttons (full href control)';
    displayName: 'navbar';
  };
  attributes: {
    ctas: Schema.Attribute.Component<'shared.cta', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
        },
        number
      >;
  };
}

export interface SectionsFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_items';
  info: {
    displayName: 'featureItem';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsFeatures extends Struct.ComponentSchema {
  collectionName: 'components_sections_features';
  info: {
    displayName: 'features';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta', false>;
    description: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'sections.feature-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 4;
        },
        number
      >;
    titleSegments: Schema.Attribute.Component<'shared.text-segment', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SectionsFooterCta extends Struct.ComponentSchema {
  collectionName: 'components_sections_footer_ctas';
  info: {
    displayName: 'footerCta';
  };
  attributes: {
    bg: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    cta: Schema.Attribute.Component<'shared.cta', false> &
      Schema.Attribute.Required;
    subtitle: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsGridPosts extends Struct.ComponentSchema {
  collectionName: 'components_sections_grid_posts';
  info: {
    displayName: 'gridPosts';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta', false>;
    items: Schema.Attribute.Component<'shared.card', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
        },
        number
      >;
    related: Schema.Attribute.Relation<'manyToMany', 'api::post.post'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsGridProducts extends Struct.ComponentSchema {
  collectionName: 'components_sections_grid_products';
  info: {
    displayName: 'gridProducts';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta', false>;
    items: Schema.Attribute.Component<'shared.card', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
        },
        number
      >;
    related: Schema.Attribute.Relation<'manyToMany', 'api::product.product'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsGridServices extends Struct.ComponentSchema {
  collectionName: 'components_sections_grid_services';
  info: {
    displayName: 'gridServices';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta', false>;
    items: Schema.Attribute.Component<'shared.card', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
        },
        number
      >;
    related: Schema.Attribute.Relation<'manyToMany', 'api::service.service'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'hero';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    > &
      Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.cta', false> &
      Schema.Attribute.Required;
    secondaryCta: Schema.Attribute.Component<'shared.cta', false>;
    subtitle: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.Component<'shared.responsive-title', false> &
      Schema.Attribute.Required;
  };
}

export interface SharedCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_cards';
  info: {
    displayName: 'card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCategoryBadge extends Struct.ComponentSchema {
  collectionName: 'components_shared_category_badges';
  info: {
    description: 'Category badge with predefined colors';
    displayName: 'Category Badge';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<
      ['blue', 'teal', 'red', 'navy', 'green']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'blue'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_ctas';
  info: {
    description: 'Call-to-action button with 4 variants: hero-secondary (black with gradient border), secondary (red with gradient border), primary (blue with gradient border), content-primary (large blue with gradient border)';
    displayName: 'cta';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    newTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    variant: Schema.Attribute.Enumeration<
      ['hero-secondary', 'secondary', 'primary', 'content-primary']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'secondary'>;
  };
}

export interface SharedDesktopTitle extends Struct.ComponentSchema {
  collectionName: 'components_shared_desktop_titles';
  info: {
    description: 'Single line title with two color segments for desktop';
    displayName: 'Desktop Title';
  };
  attributes: {
    leftColor: Schema.Attribute.Enumeration<
      ['brandBlue', 'accentRed', 'white']
    > &
      Schema.Attribute.DefaultTo<'brandBlue'>;
    leftText: Schema.Attribute.String & Schema.Attribute.Required;
    rightColor: Schema.Attribute.Enumeration<
      ['brandBlue', 'accentRed', 'white']
    > &
      Schema.Attribute.DefaultTo<'accentRed'>;
    rightText: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLinks extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMobileTitle extends Struct.ComponentSchema {
  collectionName: 'components_shared_mobile_titles';
  info: {
    description: 'Multiple line title for mobile display';
    displayName: 'Mobile Title';
  };
  attributes: {
    lines: Schema.Attribute.Component<'shared.title-line', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
  };
}

export interface SharedResponsiveTitle extends Struct.ComponentSchema {
  collectionName: 'components_shared_responsive_titles';
  info: {
    description: 'A title that displays differently on desktop vs mobile';
    displayName: 'Responsive Title';
  };
  attributes: {
    desktop: Schema.Attribute.Component<'shared.desktop-title', false> &
      Schema.Attribute.Required;
    mobile: Schema.Attribute.Component<'shared.mobile-title', false> &
      Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedTextSegment extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_segments';
  info: {
    description: 'Text segment with customizable color for flexible brand rendering';
    displayName: 'text-segment';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'blue', 'red']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'primary'>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTitleLine extends Struct.ComponentSchema {
  collectionName: 'components_shared_title_lines';
  info: {
    description: 'A single line of title with color variant';
    displayName: 'Title Line';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<['brandBlue', 'accentRed', 'white']> &
      Schema.Attribute.DefaultTo<'brandBlue'>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'layout.brand': LayoutBrand;
      'layout.footer': LayoutFooter;
      'layout.footer-column': LayoutFooterColumn;
      'layout.navbar': LayoutNavbar;
      'sections.feature-item': SectionsFeatureItem;
      'sections.features': SectionsFeatures;
      'sections.footer-cta': SectionsFooterCta;
      'sections.grid-posts': SectionsGridPosts;
      'sections.grid-products': SectionsGridProducts;
      'sections.grid-services': SectionsGridServices;
      'sections.hero': SectionsHero;
      'shared.card': SharedCard;
      'shared.category-badge': SharedCategoryBadge;
      'shared.cta': SharedCta;
      'shared.desktop-title': SharedDesktopTitle;
      'shared.links': SharedLinks;
      'shared.mobile-title': SharedMobileTitle;
      'shared.responsive-title': SharedResponsiveTitle;
      'shared.seo': SharedSeo;
      'shared.text-segment': SharedTextSegment;
      'shared.title-line': SharedTitleLine;
    }
  }
}
