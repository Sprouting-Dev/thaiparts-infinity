'use client';
import React from 'react';
import { MotionReveal } from '@/components/MotionReveal';
import Image from 'next/image';
import PreFooterCta from './PreFooterCta';
import LinkMotion from './LinkMotion';

interface FooterColumn {
  title?: string;
  links?: { label: string; href?: string }[];
}

export interface FooterData {
  companyName?: string;
  address?: string;
  // Legacy single string (may contain comma or newline separated numbers)
  phone?: string;
  // Future-proof array form if backend adds repeatable component e.g. footer.phones
  phones?: string[];
  email?: string;
  facebook?: string;
  columns?: FooterColumn[];
  copyright?: string;
}

interface Props {
  data?: FooterData | null;
  embedded?: boolean; // when true, omit outer <footer> wrapper margins/padding container adjustments
}

// Global site footer now supports dynamic data from Strapi global.footer
export default function Footer({ data, embedded }: Props) {
  // Now 100% Strapi-driven - no fallback data

  const Content = (
    <div className="w-full mx-auto bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.12)] rounded-b-[8px] rounded-t-none flex flex-col items-start p-4 lg:p-8 gap-4.75">
      {/* Top area: main columns */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-4">
        {/* Left column: logo + vertical nav + social icons */}
        <div className="w-full lg:w-[50%] flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] relative items-center justify-center flex flex-shrink-0">
              <Image
                src="/thaiparts-infinity-logo.svg"
                alt="THAIPARTS INFINITY logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-['Kanit'] font-medium text-[16px] leading-[24px]">
              <span className="text-[#1063A7]">THAIPARTS</span>{' '}
              <span className="text-[#E92928]">INFINITY</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 md:px-8">
            {/* Navigation links matching the screenshot */}
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
                {link.href ? (
                  <LinkMotion
                    href={link.href}
                    className="font-['Kanit'] font-medium text-[14px] leading-[21px] text-[#1063A7] hover:text-[#E92928] transition-colors"
                  >
                    {link.label}
                  </LinkMotion>
                ) : (
                  <span className="font-['Kanit'] font-medium text-[14px] leading-[21px] text-[#1063A7]">
                    {link.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="w-full flex items-center justify-center md:justify-start gap-2 px-8">
            {/* Social media icons using Next.js Image - enhanced with LinkMotion for hover micro-interaction */}
            <LinkMotion
              href="https://lin.ee/E2Zf5YS"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <Image
                src="/layout/footer/icons/line-square.svg"
                alt="LINE"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </LinkMotion>

            <LinkMotion
              href="mailto:info@thaipartsinfinity.com"
              className="hover:opacity-70 transition-opacity"
            >
              <Image
                src="/layout/footer/icons/email-square.svg"
                alt="Email"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </LinkMotion>
          </div>
        </div>

        {/* Right column: contact info in exact order from image */}
        <div className="w-full lg:w-fit flex flex-col items-start gap-2 py-4 lg:p-4">
          {/* Address */}
          <div className="flex items-center gap-3">
            <Image
              src="/layout/footer/icons/location-round.svg"
              alt="Location"
              width={32}
              height={32}
              className="flex-shrink-0"
              style={{ width: 'auto', height: 'auto' }}
            />
            <span className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
              5/17 M.2, Thap Ma, Mueang Rayong, Rayong, 21000
            </span>
          </div>

          {/* Phone numbers */}
          <div className="flex items-center gap-3">
            <Image
              src="/layout/footer/icons/phone-round.svg"
              alt="Phone"
              width={32}
              height={32}
              className="flex-shrink-0"
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
              <div>
                <LinkMotion
                  href={`tel:+66924242144`}
                  className="text-[#1063A7]"
                >
                  (+66) 092-424-2144
                </LinkMotion>
              </div>
              <div>
                <LinkMotion
                  href={`tel:+66971282707`}
                  className="text-[#1063A7]"
                >
                  (+66)097-128-2707
                </LinkMotion>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Image
              src="/layout/footer/icons/email-round.svg"
              alt="Email"
              width={32}
              height={32}
              className="flex-shrink-0"
              style={{ width: 'auto', height: 'auto' }}
            />
            <LinkMotion
              href={`mailto:info@thaipartsinfinity.com`}
              className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]"
            >
              info@thaipartsinfinity.com
            </LinkMotion>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="w-full h-[1px] bg-[rgba(233,41,40,0.25)] rounded-full" />
      <div className="w-full flex justify-start">
        <div className="font-['Kanit'] text-[14px] leading-[24px] text-[#1063A7]">
          {data?.copyright || '© 2003 by THAIPARTS INFINITY CO., LTD.'}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return Content;
  }

  // Non-embedded: render pre-footer + footer inside a MotionReveal so the
  // reveal behavior is consistent site-wide and respects reduced-motion.
  return (
    <MotionReveal>
      <div className="w-full mx-auto px-8">
        {/* Pre-footer (embedded so it doesn't animate independently) */}
        <PreFooterCta embedded />

        {/* Footer content */}
        {Content}
      </div>
    </MotionReveal>
  );
}
