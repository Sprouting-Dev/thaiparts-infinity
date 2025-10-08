import { api } from '@/lib/api';
import { homePopulate } from '@/lib/queries';
import { toAbsolute } from '@/lib/media';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import GridPreview from '@/components/GridPreview';

export const revalidate = 300; // ISR

type HomeResponse = any;

export default async function Page() {
  let attr: any = null;
  let fetchError: string | null = null;
  let debugJson: string | null = null;

  try {
    console.log(
      '🔍 Fetching from Strapi with query:',
      `/api/home-page?${homePopulate}`
    );
    console.log('🔍 Query breakdown:', {
      hero: 'populate[hero][populate][background]=*&populate[hero][populate][title][populate][lines]=*&populate[hero][populate][primaryCta]=*&populate[hero][populate][secondaryCta]=*',
      query: homePopulate,
    });

    const json = await api<HomeResponse>(`/api/home-page?${homePopulate}`, {
      next: { revalidate },
    });
    debugJson = JSON.stringify(json, null, 2);
    console.log('📦 Raw Strapi response:', json);

    // Strapi sometimes returns single-type as { data: { attributes: { ... } } }
    // other times (depending on build/middlewares) the fields may be present directly on data.
    attr = json?.data?.attributes ?? json?.data ?? null;
    console.log('🎯 Processed attributes:', attr);

    // Debug hero structure specifically
    if (attr?.hero) {
      console.log('🦸 Hero structure:', {
        heroKeys: Object.keys(attr.hero),
        hasTitle: !!attr.hero.title,
        titleStructure: attr.hero.title,
        hasBackground: !!attr.hero.background,
        hasPrimaryCta: !!attr.hero.primaryCta,
        hasSecondaryCta: !!attr.hero.secondaryCta,
      });
      console.log('🔍 Hero full object:', JSON.stringify(attr.hero, null, 2));
    } else {
      console.log('❌ No hero data found in response');
    }
  } catch (err: any) {
    // Surface the Strapi error for debugging but render a safe fallback
    const msg = err?.message ?? String(err);
    console.warn('❌ Failed to fetch home-page from Strapi:', msg);
    console.warn('❌ Query that failed:', `/api/home-page?${homePopulate}`);
    fetchError = msg;
    attr = null;
  }

  // Global data now fetched in RootLayout; keep page lean.

  // Debug logging for hero background
  if (process.env.NODE_ENV === 'development' && attr?.hero) {
    console.log('[page] Hero data:', attr.hero);
    console.log('[page] Background raw:', attr.hero.background);
    console.log(
      '[page] Background processed:',
      toAbsolute(attr.hero.background)
    );
  }

  // Check if we have the new responsive title structure
  const hasNewTitleStructure =
    attr?.hero?.title?.desktop && attr.hero.title?.mobile;

  if (process.env.NODE_ENV === 'development' && attr?.hero) {
    console.log('🔎 Title structure check:', {
      hasNewStructure: hasNewTitleStructure,
      titleKeys: attr.hero.title ? Object.keys(attr.hero.title) : 'no title',
      desktopKeys: attr.hero.title?.desktop
        ? Object.keys(attr.hero.title.desktop)
        : 'no desktop',
      mobileKeys: attr.hero.title?.mobile
        ? Object.keys(attr.hero.title.mobile)
        : 'no mobile',
    });
  }

  const hero =
    attr?.hero && hasNewTitleStructure
      ? {
          title: {
            desktop: {
              leftText: attr.hero.title.desktop.leftText,
              leftColor: attr.hero.title.desktop.leftColor || 'brandBlue',
              rightText: attr.hero.title.desktop.rightText,
              rightColor: attr.hero.title.desktop.rightColor || 'accentRed',
            },
            mobile: {
              lines: attr.hero.title.mobile.lines.map((line: any) => ({
                text: line.text,
                color: line.color || 'brandBlue',
              })),
            },
          },
          background: toAbsolute(attr.hero.background),
          subtitle: attr.hero.subtitle,
          ctas: [
            attr.hero.primaryCta && {
              label: attr.hero.primaryCta.label,
              href: attr.hero.primaryCta.href,
              variant: attr.hero.primaryCta.variant,
              newTab: false,
            },
            attr.hero.secondaryCta && {
              label: attr.hero.secondaryCta.label,
              href: attr.hero.secondaryCta.href,
              variant: attr.hero.secondaryCta.variant,
              newTab: false,
            },
          ].filter(Boolean) as {
            label: string;
            href?: string;
            variant: any;
            newTab?: boolean;
          }[],
          panel: {
            enabled: true,
            align: 'center' as const,
          },
        }
      : null;

  const features =
    attr?.features && attr.features.titleSegments
      ? {
          titleSegments: attr.features.titleSegments,
          description: attr.features.description || undefined,
          cta: attr.features.cta
            ? {
                label: attr.features.cta.label,
                href: attr.features.cta.href,
                variant: attr.features.cta.variant,
                newTab: attr.features.cta.newTab,
              }
            : undefined,
          items:
            attr.features.items?.map((item: any) => ({
              icon: toAbsolute(item?.icon),
              title: item?.title || '',
              description: item?.description || '',
            })) || [],
        }
      : null;

  // Debug features data
  if (process.env.NODE_ENV === 'development' && attr?.features) {
    console.log(
      '[page] Features raw data:',
      JSON.stringify(attr.features, null, 2)
    );
    console.log('[page] Features mapped:', features);
  }

  // Debug products data
  if (process.env.NODE_ENV === 'development' && attr?.products) {
    console.log(
      '🔍 [DEBUG] Products section:',
      JSON.stringify(
        {
          hasRelated: !!attr.products.related,
          relatedCount: Array.isArray(attr.products.related)
            ? attr.products.related.length
            : 0,
          relatedData: Array.isArray(attr.products.related)
            ? attr.products.related.map((item: any) => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                hasThumbnail: !!item.thumbnail,
                hasBadge: !!item.categoryBadge,
              }))
            : [],
          hasItems: !!attr.products.items,
          itemsCount: attr.products.items?.length || 0,
        },
        null,
        2
      )
    );
  }

  const products =
    attr?.products && attr.products.title
      ? {
          kind: 'products' as const,
          title: attr.products.title,
          cta: attr.products.cta
            ? {
                label: attr.products.cta.label,
                href: attr.products.cta.href,
                variant: attr.products.cta.variant,
              }
            : undefined,
          // Use related collection entries (best practice) or fallback to manual items
          items:
            attr.products.related &&
            Array.isArray(attr.products.related) &&
            attr.products.related.length > 0
              ? attr.products.related.map((item: any) => ({
                  image: toAbsolute(item.thumbnail),
                  title: item.name || 'No Name',
                  href: `/products/${item.slug || 'no-slug'}`,
                  categoryBadge: item.categoryBadge,
                }))
              : (() => {
                  // Log fallback usage for monitoring
                  if (
                    process.env.NODE_ENV === 'development' &&
                    attr.products.items?.length > 0
                  ) {
                    console.warn(
                      '🔄 Products: Using manual items fallback (consider using related collection)'
                    );
                  }
                  return (
                    attr.products.items?.map((item: any) => ({
                      image: toAbsolute(item.image),
                      title: item.title,
                      subtitle: item.subtitle,
                      description: item.description,
                      href: item.href,
                    })) || []
                  );
                })(),
        }
      : null;

  const services =
    attr?.services && attr.services.title
      ? {
          kind: 'services' as const,
          title: attr.services.title,
          cta: attr.services.cta
            ? {
                label: attr.services.cta.label,
                href: attr.services.cta.href,
                variant: attr.services.cta.variant,
              }
            : undefined,
          // Use related collection entries (best practice) or fallback to manual items
          items:
            attr.services.related &&
            Array.isArray(attr.services.related) &&
            attr.services.related.length > 0
              ? attr.services.related.map((item: any) => ({
                  image: toAbsolute(item.thumbnail),
                  title: item.name || '',
                  subtitle: item.subtitle,
                  href: `/services/${item.slug}`,
                }))
              : (() => {
                  // Log fallback usage for monitoring
                  if (
                    process.env.NODE_ENV === 'development' &&
                    attr.services.items?.length > 0
                  ) {
                    console.warn(
                      '🔄 Services: Using manual items fallback (consider using related collection)'
                    );
                  }
                  return (
                    attr.services.items?.map((item: any) => ({
                      image: toAbsolute(item.image),
                      title: item.title,
                      subtitle: item.subtitle,
                      description: item.description,
                      href: item.href,
                    })) || []
                  );
                })(),
        }
      : null;

  const posts =
    attr?.posts && attr.posts.title
      ? {
          kind: 'posts' as const,
          title: attr.posts.title,
          cta: attr.posts.cta
            ? {
                label: attr.posts.cta.label,
                href: attr.posts.cta.href,
                variant: attr.posts.cta.variant,
              }
            : undefined,
          // Use related collection entries (best practice) or fallback to manual items
          items:
            attr.posts.related &&
            Array.isArray(attr.posts.related) &&
            attr.posts.related.length > 0
              ? attr.posts.related.map((item: any) => {
                  // Extract text from body blocks for preview
                  const bodyText =
                    item.body
                      ?.map((block: any) => {
                        if (block.type === 'paragraph') {
                          return (
                            block.children
                              ?.map((child: any) => child.text)
                              .join('') || ''
                          );
                        }
                        return '';
                      })
                      .join(' ')
                      .slice(0, 150) || '';

                  return {
                    image: toAbsolute(item.thumbnail),
                    title: item.title || '',
                    subtitle: item.subtitle || '',
                    description: bodyText || '',
                    href: `/posts/${item.slug}`,
                  };
                })
              : (() => {
                  // Log fallback usage for monitoring
                  if (
                    process.env.NODE_ENV === 'development' &&
                    attr.posts.items?.length > 0
                  ) {
                    console.warn(
                      '🔄 Posts: Using manual items fallback (consider using related collection)'
                    );
                  }
                  return (
                    attr.posts.items?.map((item: any) => ({
                      image: toAbsolute(item.image),
                      title: item.title,
                      subtitle: item.subtitle,
                      description: item.description,
                      href: item.href,
                    })) || []
                  );
                })(),
        }
      : null;

  return (
    <div className="bg-[#F5F5F5]">
      {/* Main page layout */}
      <main className="w-full flex flex-col gap-16 justify-center items-center">
        {/* Full-bleed Hero (no max-width wrapper here) */}
        {hero ? (
          <Hero {...hero} />
        ) : (
          <section className="w-full h-[1024px] bg-neutral-100 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <h1 className="text-xl md:text-2xl font-semibold">
                Hero Section Unavailable
              </h1>
              <p className="mt-2 text-neutral-600">
                {fetchError
                  ? 'Failed to load from Strapi'
                  : 'No hero content configured in Strapi'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-left">
                  <h3 className="font-semibold text-amber-800">
                    Development Info:
                  </h3>
                  {fetchError ? (
                    <div>
                      <p className="text-amber-700 text-sm mt-1">
                        API Error: {fetchError}
                      </p>
                      <p className="text-amber-600 text-xs mt-2">
                        Make sure Strapi server is running at{' '}
                        {process.env.NEXT_PUBLIC_STRAPI_URL ||
                          'http://localhost:1337'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-amber-700 text-sm mt-1">
                        Hero data missing or incomplete
                      </p>
                      <p className="text-amber-600 text-xs mt-2">
                        Configure Hero section in Strapi: Home Page → Hero with
                        responsive title structure
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Constrained content wrapper (970px spec) */}
        <div className="container-970 flex flex-col gap-16">
          {/* Features Section */}
          {features ? (
            <Features {...features} />
          ) : (
            <section className="w-full bg-neutral-50 rounded p-8 text-center">
              <h2 className="text-xl font-semibold">Features</h2>
              <p className="text-neutral-600">
                Features content is loading from Strapi
              </p>
            </section>
          )}

          {/* Products Section */}
          {products ? (
            <GridPreview section={products} />
          ) : (
            <section className="w-full bg-neutral-50 rounded p-8 text-center">
              <h2 className="text-xl font-semibold">Products</h2>
              <p className="text-neutral-600">
                Products content is loading from Strapi
              </p>
            </section>
          )}

          {/* Services Section */}
          {services ? (
            <GridPreview section={services} />
          ) : (
            <section className="w-full bg-neutral-50 rounded p-8 text-center">
              <h2 className="text-xl font-semibold">Services</h2>
              <p className="text-neutral-600">
                Services content is loading from Strapi
              </p>
            </section>
          )}

          {/* Posts Section */}
          {posts ? (
            <GridPreview section={posts} />
          ) : (
            <section className="w-full bg-neutral-50 rounded p-8 text-center">
              <h2 className="text-xl font-semibold">Knowledge Center</h2>
              <p className="text-neutral-600">
                Posts content is loading from Strapi
              </p>
            </section>
          )}
        </div>

        {/* Pre-Footer CTA removed here; will be rendered globally in layout when implemented */}
      </main>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-blue-50 border border-blue-200 p-2 md:p-4 rounded-lg max-w-xs md:max-w-md max-h-64 md:max-h-96 overflow-auto text-xs z-50">
          <h4 className="font-bold text-blue-800 mb-2">🔍 Debug Info</h4>
          {fetchError ? (
            <div className="text-red-600">
              <strong>❌ Strapi Error:</strong> {fetchError}
            </div>
          ) : (
            <div className="text-green-600">
              <strong>✅ Data loaded:</strong>
              <ul className="mt-1 space-y-1">
                <li>Hero: {hero ? '✓' : '✗'}</li>
                <li>Features: {features ? '✓' : '✗'}</li>
                <li>Products: {products ? '✓' : '✗'}</li>
                <li>Services: {services ? '✓' : '✗'}</li>
                <li>Posts: {posts ? '✓' : '✗'}</li>
                <li>Pre-Footer CTA: (global)</li>
                <li>Global: (handled in layout)</li>
              </ul>
            </div>
          )}
          {debugJson && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-700">
                📄 Raw JSON
              </summary>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {debugJson}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
