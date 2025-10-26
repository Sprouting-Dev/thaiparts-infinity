'use client';
import Link from 'next/link';
import LinkMotion from './LinkMotion';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import CTAButton from './CTAButton';
import React, { useEffect, useRef, useState } from 'react';
import { getTextClass } from '@/components/ColoredText';
import { createPortal } from 'react-dom';
import type { CTAVariant } from '@/lib/button-styles';

interface Brand {
  segments?: Array<{
    text: string;
    color: 'primary' | 'secondary' | 'red' | 'blue';
  }>;
  logo?: string; // absolute URL already resolved upstream if possible
}

interface FooterInfo {
  phone?: string; // legacy single string
  phones?: string[]; // future array form
}

interface NavbarCTA {
  label: string;
  href?: string;
  variant: CTAVariant;
  enabled?: boolean;
}

interface NavbarInfo {
  ctas?: NavbarCTA[];
}

interface Props {
  brand?: Brand;
  footer?: FooterInfo;
  navbar?: NavbarInfo;
}

export default function Header({ brand, navbar }: Props) {
  // Brand rendering using segments approach
  const renderBrandText = () => {
    // Use segments from Strapi (preferred)
    if (brand?.segments && brand.segments.length > 0) {
      return brand.segments.map((segment, i) => (
        <span key={i} className={getColorClass(segment.color)}>
          {segment.text}
          {i < brand.segments!.length - 1 ? ' ' : ''}
        </span>
      ));
    }

    // Fallback to default segments
    return (
      <>
        <span className={getTextClass('brandBlue')}>THAIPARTS</span>{' '}
        <span className={getTextClass('accentRed')}>INFINITY</span>
      </>
    );
  };

  const getColorClass = (color: string) => getTextClass(color);

  // Debug: log navbar data in development
  if (process.env.NODE_ENV === 'development') {
    // console.log('[Header] navbar data:', navbar);
    // console.log('[Header] navbar.ctas:', navbar?.ctas);
  }

  // Get enabled CTAs from navbar (use Strapi data, minimal fallback)
  const enabledCTAs = navbar?.ctas?.filter(cta => cta.enabled !== false) || [];

  // Show fallback message in development if no CTAs configured
  if (process.env.NODE_ENV === 'development' && enabledCTAs.length === 0) {
    // console.log('[Header] No CTAs configured in Strapi navbar. Please add CTAs in Global > Navbar > CTAs');
  }
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [_headerHeight, setHeaderHeight] = useState(0);
  const [headerRect, setHeaderRect] = useState<{
    left: number;
    width: number;
    bottom: number;
  } | null>(null);
  const [navRect, setNavRect] = useState<{
    left: number;
    width: number;
    bottom: number;
  } | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const _portalMotionProps = reduceMotion
    ? {}
    : ({
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      } as const);

  // Hamburger animation variants & shared transition (coordinated)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const [_hamOffset, setHamOffset] = useState(7);

  // Determine a responsive offset based on the rendered button size so the
  // bars rotate into an X with consistent geometry across breakpoints.
  useEffect(() => {
    function updateOffset() {
      try {
        const btn = hamburgerRef.current;
        if (!btn) return setHamOffset(7);
        const rect = btn.getBoundingClientRect();
        // choose offset roughly half the height minus half the bar thickness
        const off = Math.max(6, Math.round(rect.height / 2 - 1.5));
        setHamOffset(off);
      } catch {
        setHamOffset(7);
      }
    }
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [mounted]);

  // Softer spring for a smooth morph; reduce when user prefers reduced motion
  const hamTransition = reduceMotion
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 180, damping: 22, mass: 1 } as const);

  const topBarVariants = {
    closed: { y: 0, rotate: 0 },
    // keep the open offset consistent with the original visual (7px)
    open: { y: 7, rotate: 45 },
  } as const;
  const middleBarVariants = {
    closed: { opacity: 1, scaleX: 1 },
    open: { opacity: 0, scaleX: 0.01 },
  } as const;
  const bottomBarVariants = {
    // restore the original closed bottom offset for consistent spacing (16px)
    closed: { y: 16, rotate: 0 },
    // match the top bar open offset
    open: { y: 7, rotate: -45 },
  } as const;

  // SSR guard
  useEffect(() => setMounted(true), []);

  // compute header height for positioning the fixed dropdown
  // compute header/nav rects for positioning the fixed dropdown. We extract
  // this into a callable function so we can measure on-demand (for example
  // immediately before opening the portal) ensuring the menu positions
  // correctly on first open even if layout settles later.
  const measureRects = React.useCallback(() => {
    try {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setHeaderHeight(rect.height || 0);
        setHeaderRect({
          left: rect.left,
          width: rect.width,
          bottom: rect.bottom,
        });
      }
      if (navRef.current) {
        const nrect = navRef.current.getBoundingClientRect();
        setNavRect({
          left: nrect.left,
          width: nrect.width,
          bottom: nrect.bottom,
        });
      }
    } catch {
      // swallow measurement errors in older browsers / test environments
    }
  }, []);

  useEffect(() => {
    // initial measurement and listeners for resize/scroll
    measureRects();
    const onResize = () => measureRects();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, [measureRects, mounted]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (e.target instanceof Node) {
        // ignore clicks inside the header/nav so hamburger can toggle normally
        if (headerRef.current && headerRef.current.contains(e.target)) return;
        if (navRef.current && navRef.current.contains(e.target)) return;
        if (!menuRef.current.contains(e.target)) {
          setMenuOpen(false);
        }
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // keyboard accessibility & focus trap when menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const menuNode = menuRef.current;
    if (!menuNode) return;

    // save previously-focused element to restore on close
    prevActiveRef.current = document.activeElement as HTMLElement | null;

    const FOCUSABLE =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      menuNode.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter(el => el.offsetParent !== null);
    if (focusable.length) {
      focusable[0].focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        // focus trap: keep focus within menu
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const currentIndex = focusable.indexOf(
          document.activeElement as HTMLElement
        );
        if (e.shiftKey) {
          // move backwards
          const prev =
            currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          focusable[prev].focus();
          e.preventDefault();
        } else {
          const next =
            currentIndex === -1 || currentIndex === focusable.length - 1
              ? 0
              : currentIndex + 1;
          focusable[next].focus();
          e.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // restore previous focus
      try {
        prevActiveRef.current?.focus();
      } catch {}
    };
  }, [menuOpen]);

  // Intentionally reference computed-but-not-used values to satisfy the
  // linter about 'assigned but never used' while preserving the computation
  // for possible future usage.
  void _headerHeight;
  void _portalMotionProps;
  void _hamOffset;

  return (
    // Responsive Header positioned at top
    <motion.header
      ref={headerRef}
      className="fixed inset-x-0 top-0 flex flex-col items-center justify-center p-4 lg:p-8 z-[50] order-2"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
    >
      {/* Header container (unified for all breakpoints) */}
      <div className="w-full">
        <div
          ref={navRef}
          className="rounded-full flex items-center p-4 relative backdrop-blur-md glass"
        >
          {/* Brand (single element, responsive sizing) */}
          <div
            className="flex items-center gap-2"
            style={{ filter: 'drop-shadow(0px 2px 32px #FFFFFF)' }}
          >
            <div className="relative w-[32px] h-[32px] lg:w-[48px] lg:h-[48px] flex items-center justify-center">
              <Image
                src="/thaiparts-infinity-logo.svg"
                alt="Brand Logo"
                width={48}
                height={48}
                className="object-contain w-8 h-8 lg:w-12 lg:h-12"
                priority
              />
            </div>
            <LinkMotion
              href="/"
              className="font-['Kanit'] font-medium whitespace-nowrap text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]"
            >
              {renderBrandText()}
            </LinkMotion>
          </div>

          {/* Unified hamburger: right on mobile, centered (absolute) on desktop */}
          <button
            aria-label="เปิดเมนูนำทาง"
            aria-expanded={menuOpen}
            onClick={() => {
              // Measure layout immediately before toggling so the portal
              // can position itself correctly on first open. Use
              // requestAnimationFrame to ensure layout is stable.
              try {
                requestAnimationFrame(() => {
                  measureRects();
                });
              } catch {
                // ignore if rAF not available
                measureRects();
              }
              setMenuOpen(v => !v);
            }}
            ref={hamburgerRef}
            className="ml-auto flex items-center justify-center hover:scale-105 active:scale-95 transition-transform rounded-full lg:ml-0 lg:w-[32px] lg:h-[32px] lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ filter: 'drop-shadow(0px 2px 24px rgba(0,0,0,0.15))' }}
          >
            {/* framer-motion hamburger -> X */}
            <span className="relative block w-[24px] h-[18px] lg:w-[32px] lg:h-[18px]">
              {/* Top bar: rotate from center toward 45deg */}
              <motion.span
                aria-hidden
                className="absolute rounded left-0 w-full h-[2.5px] bg-[#1063A7] origin-center"
                variants={topBarVariants}
                animate={menuOpen ? 'open' : 'closed'}
                transition={hamTransition}
              />

              {/* Middle bar: fade out while keeping center origin */}
              <motion.span
                aria-hidden
                className="absolute rounded left-0 w-full h-[2.5px] bg-[#1063A7] top-1/2 -translate-y-1/2 origin-center"
                variants={middleBarVariants}
                animate={menuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.14 }}
              />

              {/* Bottom bar: rotate from center toward -45deg */}
              <motion.span
                aria-hidden
                className="absolute rounded left-0 w-full h-[2.5px] bg-[#1063A7] origin-center"
                variants={bottomBarVariants}
                animate={menuOpen ? 'open' : 'closed'}
                transition={hamTransition}
              />
            </span>
          </button>

          {/* dropdown rendered into document.body via portal so backdrop-filter blurs page content (not navbar) */}
          {mounted &&
            createPortal(
              <div
                ref={menuRef}
                role="presentation"
                // position the portal relative to the navbar using its bounding rect
                style={{
                  left: navRect
                    ? `${navRect.left + navRect.width / 2}px`
                    : '50%',
                  // small 4px gap between navbar and dropdown
                  top: `${(navRect?.bottom ?? headerRect?.bottom ?? 48) + 4}px`,
                }}
                className="fixed -translate-x-1/2 w-full z-[60] flex justify-center px-4 lg:px-8 pointer-events-none"
              >
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      key="menu-card"
                      role="dialog"
                      aria-label="Navigation menu"
                      initial={
                        reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
                      }
                      animate={
                        reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                      }
                      exit={
                        reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }
                      }
                      transition={{ duration: reduceMotion ? 0 : 0.28 }}
                      className="pointer-events-auto mx-auto lg:mx-0 w-full sm:w-auto rounded-[16px] px-8 sm:px-16 py-4 flex flex-col items-center gap-4 backdrop-blur-md smooth-transition glass"
                      style={{ boxSizing: 'border-box', maxWidth: '920px' }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <h3 className="font-['Kanit'] font-semibold text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#1063A7] underline decoration-[#E92928] underline-offset-8">
                          MENU
                        </h3>

                        <div className="w-full">
                          <div className="flex flex-col gap-2.5 w-full">
                            {[
                              { label: 'Home', href: '/' },
                              {
                                label: 'Products & Spare Parts',
                                href: '/products',
                              },
                              {
                                label: 'Engineering & Solutions',
                                href: '/services',
                              },
                              { label: 'Knowledge Center', href: '/articles' },
                              { label: 'About Us', href: '/about-us' },
                              { label: 'Contact', href: '/contact-us' },
                            ].map(item => (
                              <motion.div
                                key={item.label}
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="flex flex-col"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-[4px] h-[4px] rounded-full bg-[#E92928] flex-shrink-0" />

                                  <Link
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="px-0.5"
                                  >
                                    <span className="relative inline-block">
                                      <motion.span
                                        className="font-['Kanit'] font-medium text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]"
                                        variants={{
                                          rest: { y: 0, color: '#1063A7' },
                                          hover: { y: -4, color: '#E92928' },
                                        }}
                                        transition={{
                                          duration: reduceMotion ? 0 : 0.32,
                                        }}
                                        style={{ display: 'inline-block' }}
                                      >
                                        {item.label}
                                      </motion.span>

                                      {/* underline tied to the text width only */}
                                      <motion.span
                                        aria-hidden
                                        className="absolute left-0 -bottom-0 h-[2px] bg-[#E92928] w-full origin-left transform"
                                        variants={{
                                          rest: { scaleX: 0 },
                                          hover: { scaleX: 1 },
                                        }}
                                        transition={{
                                          duration: reduceMotion ? 0 : 0.6,
                                        }}
                                        style={{
                                          transformOrigin: 'left center',
                                        }}
                                      />
                                    </span>
                                  </Link>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>,
              document.body
            )}

          {/* Desktop Contact Container */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            {enabledCTAs.map((cta, index) => (
              <CTAButton
                key={index}
                cta={cta}
                asMotion={true}
                textSize="small"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
