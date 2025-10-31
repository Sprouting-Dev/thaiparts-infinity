'use client';
import Link from 'next/link';
import React from 'react';

export default function DetailNotFound({
  title = 'ไม่พบข้อมูล',
  message = 'ขออภัย เราไม่พบหน้าที่คุณกำลังค้นหา',
  primaryHref = '/',
  primaryLabel = 'กลับสู่หน้าหลัก',
  secondaryHref,
  secondaryLabel,
}: {
  title?: string;
  message?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center">
      <div className="container-970 flex flex-col items-center gap-8 py-24 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#E92928] flex items-center justify-center">
          <span className="text-white text-5xl font-bold">!</span>
        </div>

        <h1 className="font-['Kanit'] font-semibold text-[32px] md:text-[40px] text-[#1063A7]">
          {title}
        </h1>

        <p className="font-['Kanit'] text-[18px] md:text-[20px] text-[#666666] max-w-2xl">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={primaryHref}
            className="font-['Kanit'] bg-[#1063A7] text-white px-8 py-4 rounded-lg text-[18px] font-medium hover:bg-[#0d4f85] transition-colors shadow-lg hover:shadow-xl"
          >
            {primaryLabel}
          </Link>

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="font-['Kanit'] inline-block text-[18px] text-[#1063A7] underline decoration-accent"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
