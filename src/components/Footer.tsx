'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PreFooterCta from './PreFooterCta';

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
    <div className="w-full mx-auto bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.12)] rounded-b-[8px] rounded-t-none flex flex-col items-start p-4 gap-6">
      {/* Top area: main columns */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-8">
        {/* Left column: logo + vertical nav + social icons */}
        <div className="w-full lg:w-[50%] flex flex-col items-start gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[40px] h-[40px] bg-[url('/thaiparts-infinity-logo.svg')] bg-contain bg-no-repeat" />
            <span className="font-['Kanit'] font-medium text-[18px] leading-[24px]">
              <span className="text-[#1063A7]">THAIPARTS</span>
              <span className="ml-1 text-[#E92928]">INFINITY</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 px-8">
            {/* Navigation links matching the screenshot */}
            {[
              { label: 'Home', href: '/' },
              { label: 'Products & Spare Parts', href: '/products' },
              { label: 'Engineering & Solutions', href: '/services' },
              { label: 'Knowledge Center', href: '/posts' },
              { label: 'About Us', href: '/about-us' },
              { label: 'Contact', href: '/contact-us' }
            ].map((link) => (
              <div key={link.label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E92928]" />
                <a href={link.href} className="font-['Kanit'] font-medium text-[15px] leading-[24px] text-[#1063A7] hover:text-[#E92928] transition-colors">
                  {link.label}
                </a>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3 px-8">
            {/* Social media icons using Next.js Image - no border */}
            <a href="https://lin.ee/E2Zf5YS" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <Image src="/layout/footer/icons/line-square.svg" alt="LINE" width={32} height={32} />
            </a>
            <a href="mailto:info@thaipartsinfinity.com" className="hover:opacity-70 transition-opacity">
              <Image src="/layout/footer/icons/email-square.svg" alt="Email" width={32} height={32} />
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity">
              <Image src="/layout/footer/icons/whatsapp-square.svg" alt="WhatsApp" width={32} height={32} />
            </a>
          </div>
        </div>

        {/* Right column: contact info in exact order from image */}
        <div className="w-full lg:w-fit flex flex-col items-start gap-4 p-4">
          {/* Address */}
          <div className="flex items-center gap-3">
            <Image src="/layout/footer/icons/location-round.svg" alt="Location" width={32} height={32} className="flex-shrink-0 mt-1" />
            <span className="font-['Kanit'] text-[14px] leading-[20px] text-[#1063A7]">
              5/17 M.2, Thap Ma, Mueang Rayong, Rayong, 21000
            </span>
          </div>

          {/* Phone numbers */}
          <div className="flex items-center gap-3">
            <Image src="/layout/footer/icons/phone-round.svg" alt="Phone" width={32} height={32} className="flex-shrink-0" />
            <div className="font-['Kanit'] text-[14px] leading-[20px] text-[#1063A7]">
              <div>(+66) 092-424-2144</div>
              <div>(+66)097-128-2707</div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Image src="/layout/footer/icons/email-round.svg" alt="Email" width={32} height={32} className="flex-shrink-0" />
            <span className="font-['Kanit'] text-[14px] leading-[20px] text-[#1063A7]">
              info@thaipartsinfinity.com
            </span>
          </div>

          {/* Facebook */}
          {/* <div className="flex items-center gap-3">
            <Image src="/layout/footer/icons/email-round.svg" alt="Facebook" width={32} height={32} className="flex-shrink-0" />
            <span className="font-['Kanit'] text-[14px] leading-[20px] text-[#1063A7]">
              thaipartsinfinity Co.,Ltd.
            </span>
          </div> */}
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="w-full h-[1px] bg-[rgba(233,41,40,0.25)] rounded-full mt-4" />
      <div className="w-full flex justify-start">
        <div className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7] mt-3">
          {data?.copyright || '© 2003 by THAIPARTS INFINITY CO., LTD.'}
        </div>
      </div>
    </div>
  );

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (embedded) {
    return Content;
  }

  // Non-embedded: animate pre-footer + footer as one block
  return (
    <motion.footer
      className="w-full mx-auto px-8 mb-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
    >
      {/* Pre-footer (embedded so it doesn't animate independently) */}
      <PreFooterCta embedded />

      {/* Footer content */}
      {Content}
    </motion.footer>
  );
}
