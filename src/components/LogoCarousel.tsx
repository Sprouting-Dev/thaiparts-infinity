'use client';
import { useMemo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { MotionReveal } from '@/components/MotionReveal';
import MotionGridItem from '@/components/MotionGridItem';

interface LogoCarouselProps {
  icons: string[];
}

export default function LogoCarousel({ icons }: LogoCarouselProps) {
  // create AutoScroll plugin once
  const autoScrollPlugin = useMemo(() => {
    const opts = {
      speed: 0.6,
      startDelay: 50,
      playOnInit: true,
      pauseOnHover: true,
      stopOnInteraction: false,
    };
    return AutoScroll(opts as unknown as Record<string, unknown>);
  }, []);

  // call embla hook unconditionally
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', containScroll: 'trimSnaps' },
    [autoScrollPlugin]
  );

  // The AutoScroll plugin is configured with `playOnInit: true` above and
  // will start automatically when Embla initializes. Avoid manually calling
  // plugin.play() here because invoking plugin internals too early was
  // causing runtime errors (reading properties like `settled` on undefined).
  // Keep a light effect so we still react to emblaApi changes if needed later.
  useEffect(() => {
    if (!emblaApi) return;
    // No-op: plugin handles play on init. This effect exists to declare the
    // dependency on emblaApi so we can incrementally add lifecycle hooks later
    // without reintroducing the premature-play problem.
    return;
  }, [emblaApi, autoScrollPlugin]);

  const viewportDomRef = useRef<HTMLDivElement | null>(null);
  // Track focused slide for accessibility announcements
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [renderedIcons, setRenderedIcons] = useState<string[]>(icons || []);

  // Add a visual fade/translate effect for slides based on their distance
  // from the viewport center. We update inline styles on the slide elements
  // during Embla's scroll/resize lifecycle for smooth animations.
  useEffect(() => {
    if (!emblaApi || !viewportDomRef.current) return;

    const vp = viewportDomRef.current;

    const updateSlidesVisuals = () => {
      const vpRect = vp.getBoundingClientRect();
      const vpCenter = (vpRect.left + vpRect.right) / 2;
      const slides = Array.from(
        vp.querySelectorAll<HTMLElement>('.embla__slide')
      );
      const maxDist = vpRect.width / 2 || 1;

      slides.forEach(slide => {
        const r = slide.getBoundingClientRect();
        const slideCenter = (r.left + r.right) / 2;
        const dist = Math.min(Math.abs(slideCenter - vpCenter), maxDist);
        // normalized 0..1 where 0 is center, 1 is outer edge
        const t = dist / maxDist;
        // opacity: 1 at center, ~0.7 at edges (even subtler fade)
        const opacity = 1 - t * 0.3;
        // Only apply opacity (fade) — avoid any translate/transform
        slide.style.opacity = String(opacity);
        // Ensure there is no vertical translation on slides (neutralize translateY)
        // We explicitly set translateY(0) so any other inline Y translations are overridden.
        // Embla performs horizontal movement on the container, not on individual slides,
        // so setting translateY(0) on slides is safe and prevents the vertical 'jitter'
        // observed in some environments.
        slide.style.transform = 'translateY(0px)';
      });
    };

    // Initial update
    updateSlidesVisuals();

    // Hook into embla lifecycle events
    emblaApi.on('init', updateSlidesVisuals);
    emblaApi.on('scroll', updateSlidesVisuals);
    emblaApi.on('resize', updateSlidesVisuals);
    emblaApi.on('select', updateSlidesVisuals);

    window.addEventListener('resize', updateSlidesVisuals);

    return () => {
      try {
        emblaApi.off('init', updateSlidesVisuals);
        emblaApi.off('scroll', updateSlidesVisuals);
        emblaApi.off('resize', updateSlidesVisuals);
        emblaApi.off('select', updateSlidesVisuals);
      } catch {
        // ignore errors during cleanup
      }
      window.removeEventListener('resize', updateSlidesVisuals);
    };
  }, [emblaApi, renderedIcons]);

  // Expose simple keyboard navigation on the viewport container so users
  // can tab into the carousel and use arrow keys to move slides.
  useEffect(() => {
    const el = viewportDomRef.current;
    if (!el || !emblaApi) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        try {
          emblaApi.scrollNext();
        } catch {
          /* ignore */
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        try {
          emblaApi.scrollPrev();
        } catch {
          /* ignore */
        }
      }
    };

    el.addEventListener('keydown', onKey as EventListener);
    return () => el.removeEventListener('keydown', onKey as EventListener);
  }, [emblaApi]);

  // If the total width of slides is <= viewport width, duplicate the icons
  // so there is room to scroll. This avoids embla being a no-op when all
  // slides already fit in the viewport.
  useEffect(() => {
    setRenderedIcons(icons || []);
    const tryEnsureScrollable = () => {
      const el = viewportDomRef.current;
      if (!el) return;
      const viewportWidth = el.clientWidth || el.offsetWidth || 0;
      const container = el.querySelector(
        '.embla__container'
      ) as HTMLElement | null;
      if (!container) return;
      const contentWidth = container.scrollWidth || 0;
      // If content is not substantially wider than the viewport, duplicate enough
      // copies so the scroll content is at least ~3x viewport width (seamless feel).
      if (icons.length > 0) {
        const slides = container.querySelectorAll('.embla__slide');
        const currentCount = slides.length || icons.length;
        const avgSlideWidth = currentCount
          ? Math.max(1, contentWidth / currentCount)
          : 50;
        const targetWidth = Math.max(
          viewportWidth * 3,
          viewportWidth + avgSlideWidth * icons.length
        );

        // How many full repetitions of `icons` we need to reach targetWidth
        const perGroupWidth = avgSlideWidth * icons.length;
        let reps = Math.ceil(targetWidth / Math.max(1, perGroupWidth));
        reps = Math.max(reps, 1);
        reps = Math.min(reps, 12); // safety cap

        // Only update if current rendered icons are fewer than desired
        const desiredCount = reps * icons.length;
        if (currentCount < desiredCount) {
          let newIcons: string[] = [];
          for (let i = 0; i < reps; i++) newIcons = newIcons.concat(icons);
          setRenderedIcons(newIcons);
          // Re-init embla shortly after DOM update so it picks up new slides
          setTimeout(() => {
            try {
              // Some Embla builds expose `reInit` / `destroy` methods. Cast to
              // a narrow shape to avoid using `any` and satisfy linting.
              type EmblaMaybe = { reInit?: () => void; destroy?: () => void };
              const maybe = emblaApi as unknown as EmblaMaybe | null;
              if (maybe && typeof maybe.reInit === 'function') {
                maybe.reInit();
              } else if (maybe && typeof maybe.destroy === 'function') {
                maybe.destroy();
              }
            } catch {
              // swallow errors from reInit to avoid runtime noise
            }
          }, 80);
        }
      }
    };

    // Delay measurement slightly to allow layout to settle
    const t = window.setTimeout(tryEnsureScrollable, 100);
    return () => clearTimeout(t);
  }, [icons, emblaApi]);

  if (!icons || icons.length === 0) return null;

  return (
    <MotionReveal>
      <div className="w-full flex justify-center">
        <div
          className="embla overflow-hidden px-12 py-6"
          style={{ background: '#1063A70A' }}
        >
          {/* Announce focused slide for screen readers */}
          <div aria-live="polite" className="sr-only">
            {typeof focusedIndex === 'number'
              ? `Slide ${focusedIndex + 1} of ${renderedIcons.length}`
              : ''}
          </div>
          <div
            className="embla__viewport overflow-hidden"
            ref={el => {
              // assign both embla's ref and our dom ref
              // emblaRef may be a callback ref
              if (typeof emblaRef === 'function')
                emblaRef(el as HTMLDivElement | null);
              // emblaRef may also be an object ref with `.current`.
              try {
                const objRef = emblaRef as unknown as {
                  current?: HTMLDivElement | null;
                } | null;
                if (objRef && typeof objRef === 'object') {
                  objRef.current = el ?? null;
                }
              } catch {
                // ignore if emblaRef is not assignable
              }
              viewportDomRef.current = el ?? null;
            }}
          >
            <div className="embla__container">
              {renderedIcons.map((src, i) => {
                // Derive a friendly alt from filename if possible
                let alt = `standard logo ${i + 1}`;
                try {
                  const parts = src.split('/');
                  const file = parts[parts.length - 1] || '';
                  const name = file.split('.')[0].replace(/[-_]/g, ' ');
                  if (name) alt = `${name} logo`;
                } catch {
                  // fallback to index-based alt
                }

                return (
                  <div
                    key={i}
                    className="embla__slide flex-shrink-0"
                    // make slide focusable for keyboard users
                    tabIndex={0}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${renderedIcons.length}`}
                  >
                    <MotionGridItem index={i}>
                      <Image
                        src={src}
                        alt={alt}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </MotionGridItem>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MotionReveal>
  );
}
