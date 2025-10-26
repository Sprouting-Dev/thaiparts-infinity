'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CTAButton from './CTAButton';
import type { CTAVariant } from '@/lib/button-styles';
import { mediaUrl } from '@/lib/strapi';

type SocialKind = 'facebook' | 'line' | 'email' | 'youtube' | 'tiktok' | 'x';

interface SharedContactComponent {
  company_name?: string;
  adddress?: string; // ชื่อที่บาง schema ใช้
  address?: string; // เผื่อสะกดปกติ
  address_text?: string; // เผื่ออีกชื่อ
  phone_number_1?: string;
  phone_number_2?: string;
  email?: string;
  map_url?: string;
}

interface SharedSocialMediaComponent {
  id?: number;
  type?: SocialKind | string;
  url?: string;
}

interface LayoutCMS {
  address?: SharedContactComponent;
  social_media?: SharedSocialMediaComponent[];
  image?: any; // หลัก
  prefooter_image?: any; // สำรอง
  banner?: any; // สำรอง
  quote?: string;
  button?: string;
  copyright?: string;
}

interface FooterProps {
  layout?: LayoutCMS | null;
  embedded?: boolean;
}

// Development overlay removed for production cleanliness

const socialIcon = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'line':
      return '/layout/footer/icons/line-square.svg';
    case 'email':
      return '/layout/footer/icons/email-square.svg';
    case 'facebook':
      return '/layout/footer/icons/facebook-square.svg';
    case 'youtube':
      return '/layout/footer/icons/youtube-square.svg';
    case 'tiktok':
      return '/layout/footer/icons/tiktok-square.svg';
    case 'x':
      return '/layout/footer/icons/x-square.svg';
    default:
      return '/layout/footer/icons/link-square.svg';
  }
};

export default function Footer({ layout, embedded }: FooterProps) {
  const contact: SharedContactComponent = layout?.address ?? {};
  const companyAddress =
    contact.adddress ?? contact.address ?? contact.address_text ?? '';
  const phones = [contact.phone_number_1, contact.phone_number_2].filter(
    Boolean
  ) as string[];

  const preImage =
    layout?.image ??
    (layout as any)?.prefooter_image ??
    (layout as any)?.banner;
  const preBg = mediaUrl(preImage);

  // Dev overlay and missing-field checks removed

  // Use a neutral fallback string for missing CMS content
  const CMS_FALLBACK = 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต';
  const preTitle = layout?.quote || CMS_FALLBACK;
  const preButton = layout?.button || CMS_FALLBACK;

  // Normalize and split quote from Strapi into two rich-text lines using <hr> as separator
  const rawQuote = (layout?.quote ?? '').trim();
  const normalizedQuote = useMemo(
    () =>
      rawQuote
        .replace(/\r\n/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+$/g, ''),
    [rawQuote]
  );
  const [line1HTML, line2HTML] = useMemo(() => {
    const [t = '', s = ''] = normalizedQuote
      .split(/<hr\s*\/?\>/i)
      .map(v => v.trim());
    return [t, s];
  }, [normalizedQuote]);

  // Guard for dangerouslySetInnerHTML to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <div className="w-full mx-auto bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.12)] rounded-b-xl rounded-t-none flex flex-col items-start p-4 md:p-6 lg:p-8 gap-5">
      {/* Top */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Left brand + nav */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/thaiparts-infinity-logo.svg"
              alt="THAIPARTS INFINITY logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-['Kanit'] font-medium text-[16px] leading-[24px]">
              <span className="text-[#1063A7]">THAIPARTS</span>{' '}
              <span className="text-[#E92928]">INFINITY</span>
            </span>
          </div>

          <nav className="flex flex-col gap-2 md:px-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Products & Spare Parts', href: '/products' },
              { label: 'Engineering & Solutions', href: '/services' },
              { label: 'Knowledge Center', href: '/articles' },
              { label: 'About Us', href: '/about-us' },
              { label: 'Contact', href: '/contact-us' },
            ].map(link => (
              <div key={link.label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E92928]" />
                <Link
                  href={link.href}
                  className="font-['Kanit'] font-medium text-[14px] leading-[21px] text-[#1063A7] hover:text-[#E92928] transition-colors"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Socials */}
          {!!(layout?.social_media || []).length && (
            <div className="w-full flex items-center justify-center md:justify-start gap-2 px-8">
              {(layout?.social_media || []).map(s => {
                const isEmail = (s.type || '').toLowerCase() === 'email';
                const href =
                  isEmail && contact.email
                    ? `mailto:${contact.email}`
                    : s.url || 'mailto:info@thaipartsinfinity.com';
                return (
                  <Link
                    key={s.id ?? `${s.type}-${s.url}`}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={socialIcon(s.type)}
                      alt={String(s.type || 'social')}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right contact */}
        <div className="w-full lg:w-auto flex flex-col items-start gap-2 py-4 lg:p-4">
          {companyAddress ? (
            <div className="flex items-center gap-2">
              <Image
                src="/layout/footer/icons/location-round.svg"
                alt="Location"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <span className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                {companyAddress}
              </span>
            </div>
          ) : null}

          {!!phones.length && (
            <div className="flex items-center gap-2">
              <Image
                src="/layout/footer/icons/phone-round.svg"
                alt="Phone"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <div className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                {phones.map(p => {
                  const tel = p.replace(/\s+/g, '');
                  return (
                    <div key={p}>
                      <Link href={`tel:${tel}`} className="text-[#1063A7]">
                        {p}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {contact?.email ? (
            <div className="flex items-center gap-2">
              <Image
                src="/layout/footer/icons/email-round.svg"
                alt="Email"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <Link
                href={`mailto:${contact.email}`}
                className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]"
              >
                {contact.email}
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="w-full h-px bg-[rgba(233,41,40,0.25)] rounded-full" />
      <div className="w-full flex justify-start">
        <div className="font-['Kanit'] text-[14px] leading-[24px] text-[#1063A7]">
          {'© 2003 by THAIPARTS INFINITY CO., LTD.'}
        </div>
      </div>
    </div>
  );

  const ctaObj = {
    label: preButton,
    href: '/contact-us',
    variant: 'content-primary' as CTAVariant,
  };

  const wrapped = (
    <div className="w-full">
      <section className="relative w-full overflow-hidden rounded-t-2xl">
        {preBg ? (
          <Image
            src={preBg}
            alt="pre-footer background"
            width={1920}
            height={640}
            className="w-full h-[310px] object-cover"
            priority
          />
        ) : (
          <div className="w-full h-[310px] bg-gray-200" />
        )}

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full flex flex-col items-center px-8 gap-4 lg:gap-8">
            <div className="mx-auto flex flex-col gap-2 lg:gap-4 items-center text-center">
              {/* First line (rich text from Strapi) */}
              {(line1HTML || preTitle) && (
                <div
                  className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] text-[#FFFFFF] font-semibold"
                  suppressHydrationWarning
                  {...(mounted && line1HTML
                    ? { dangerouslySetInnerHTML: { __html: line1HTML } }
                    : { children: line1HTML || preTitle })}
                />
              )}

              {/* Second line (subtitle) - only render if present in the CMS quote after <hr> */}
              {line2HTML ? (
                <div
                  className="text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#FFFFFF] font-normal"
                  suppressHydrationWarning
                  {...(mounted && line2HTML
                    ? { dangerouslySetInnerHTML: { __html: line2HTML } }
                    : { children: line2HTML })}
                />
              ) : null}
            </div>
            <div className="w-fit">
              <CTAButton cta={ctaObj} textSize="large" />
            </div>
          </div>
        </div>
      </section>
      <div>{content}</div>
    </div>
  );

  return <>{embedded ? content : wrapped}</>;
}
