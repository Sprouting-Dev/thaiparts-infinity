'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CTAButton from './CTAButton';
import type { CTAVariant } from '@/lib/button-styles';
import { mediaUrl } from '@/lib/strapi';
import type { LayoutAttributes } from '@/types/cms';
import type { PossibleMediaInput } from '@/types/strapi';
import { sanitizeHtml } from '@/lib/sanitize';
import SafeHtml from '@/components/SafeHtml';

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

interface FooterProps {
  layout?: LayoutAttributes | null;
  embedded?: boolean;
}


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
  const contact: SharedContactComponent =
    (layout?.address as Record<string, unknown>) ?? {};
  const companyAddress =
    contact.adddress ?? contact.address ?? contact.address_text ?? '';
  const phones = [contact.phone_number_1, contact.phone_number_2].filter(
    Boolean
  ) as string[];

  // Format a footer phone line to display as (+66) 092-424-2144 and return an international tel: href
  const formatPhoneForFooter = (raw?: string | null) => {
    if (!raw) return null;
    const digitsOnly = String(raw).replace(/[^+\d]/g, '');
    let normalized = digitsOnly;

    if (normalized.startsWith('+66')) normalized = normalized.slice(3);
    else if (normalized.startsWith('66')) normalized = normalized.slice(2);

    if (normalized.length === 9) normalized = `0${normalized}`;

    if (normalized.length !== 10) {
      const tel = digitsOnly.startsWith('+') ? digitsOnly : digitsOnly;
      return { display: raw, href: `tel:${tel}` };
    }

    const display = `(+66) ${normalized.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`;
    const international = `+66${normalized.slice(1)}`;
    return { display, href: `tel:${international}` };
  };

  const preImage = (layout?.image ??
    (layout?.prefooter_image as PossibleMediaInput) ??
    (layout?.banner as PossibleMediaInput)) as PossibleMediaInput | undefined;
  const preBg = mediaUrl(preImage);

  // Use a neutral fallback string for missing CMS content
  const CMS_FALLBACK = 'ข้อมูลกำลังอยู่ระหว่างการอัปเดต';
  const preTitle = layout?.quote || CMS_FALLBACK;
  const preButton = layout?.button || CMS_FALLBACK;

  // Normalize and split quote from Strapi into two rich-text lines using <hr> as separator
  const rawQuote = typeof layout?.quote === 'string' ? layout.quote.trim() : '';
  const normalizedQuote = useMemo(
    () =>
      rawQuote
        .replace(/\r\n/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+$/g, ''),
    [rawQuote]
  );
  const [line1HTML, line2HTML] = useMemo(() => {
    const parts = normalizedQuote.split(/<hr\s*\/?\>/i);
    const t = typeof parts[0] === 'string' ? parts[0].trim() : '';
    const s = typeof parts[1] === 'string' ? parts[1].trim() : '';
    // Sanitize immediately so server HTML matches client and to reduce XSS risk.
    return [sanitizeHtml(t), sanitizeHtml(s)];
  }, [normalizedQuote]);

  // SafeHtml handles hydration mismatches for rich text - no mounted flag needed

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
          {Array.isArray(layout?.social_media) &&
            layout.social_media.length > 0 && (
              <div className="w-full flex items-center justify-center md:justify-start gap-2 px-8">
                {layout.social_media.map(s => {
                  const rec = s as Record<string, unknown> | undefined;
                  const type =
                    rec && typeof rec['type'] === 'string'
                      ? (rec['type'] as string)
                      : '';
                  const isEmail = type.toLowerCase() === 'email';
                  const href =
                    isEmail && contact.email
                      ? `mailto:${contact.email}`
                      : rec && typeof rec['url'] === 'string' && rec['url']
                        ? (rec['url'] as string)
                        : 'mailto:info@thaipartsinfinity.com';
                  const idPart =
                    rec &&
                    (typeof rec['id'] === 'number' ||
                      typeof rec['id'] === 'string')
                      ? String(rec['id'])
                      : `${type}-${String(rec?.['url'] ?? '')}`;
                  return (
                    <Link
                      key={idPart}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={socialIcon(type)}
                        alt={String(type || 'social')}
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
                  const formatted = formatPhoneForFooter(p);
                  return (
                    <div key={p}>
                      <Link
                        href={
                          formatted?.href ??
                          `tel:${String(p).replace(/\s+/g, '')}`
                        }
                        className="text-[#1063A7]"
                      >
                        {formatted?.display ?? p}
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
                <div className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] text-[#FFFFFF] font-semibold">
                  <SafeHtml html={String(line1HTML || preTitle)} />
                </div>
              )}

              {/* Second line (subtitle) - only render if present in the CMS quote after <hr> */}
              {line2HTML ? (
                <div className="text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px] text-[#FFFFFF] font-normal">
                  <SafeHtml html={String(line2HTML)} />
                </div>
              ) : null}
            </div>
            <div className="w-fit">
              <CTAButton
                cta={{ ...ctaObj, label: String(ctaObj.label) }}
                textSize="large"
              />
            </div>
          </div>
        </div>
      </section>
      <div>{content}</div>
    </div>
  );

  return <>{embedded ? content : wrapped}</>;
}
