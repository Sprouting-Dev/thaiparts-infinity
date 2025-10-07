'use client';
import React from 'react';

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
  const columns = data?.columns || [];

  const Content = (
    <div className="w-full mx-auto bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.12)] rounded-b-[8px] rounded-t-none flex flex-col items-start p-4 gap-5">
      <div className="w-full flex flex-col items-start gap-4">
        <div className="w-full flex flex-col md:flex-row lg:flex-row justify-between items-start gap-6">
          {/* Brand + nav */}
          <div className="w-full max-w-[735px] flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-[32px] h-[32px] bg-[url('/file.svg')] bg-cover" />
              <span className="font-['Kanit'] font-medium text-[16px] leading-[24px] text-[#1063A7]">
                {data?.companyName || 'THAIPARTS INFINITY'}
              </span>
            </div>
            <nav className="flex flex-col items-start px-4 md:px-6 lg:px-8 gap-2">
              {columns.map(col => (
                <React.Fragment key={col.title || 'col'}>
                  {col.title && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-[4px] h-[4px] bg-[#E92928] rounded-full" />
                      <span className="font-['Kanit'] font-semibold text-[14px] leading-[21px] text-[#1063A7]">
                        {col.title}
                      </span>
                    </div>
                  )}
                  {col.links?.map(link => (
                    <div
                      key={link.label}
                      className="flex items-center gap-2 ml-0"
                    >
                      <div className="w-[4px] h-[4px] bg-[#E92928] rounded-full" />
                      <span className="font-['Kanit'] font-medium text-[14px] leading-[21px] text-[#1063A7]">
                        {link.label}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </nav>
            <div className="flex flex-col gap-2 px-4 md:px-6 lg:px-8">
              {data?.facebook && (
                <a
                  href={data.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1063A7] text-sm underline"
                >
                  Facebook
                </a>
              )}
            </div>
          </div>
          {/* Contact info */}
          <div className="w-full md:w-[300px] lg:w-[382px] flex flex-col items-start p-4 gap-2">
            <div className="flex flex-col items-start gap-2">
              {data?.address && (
                <div className="flex items-center gap-2">
                  <div className="w-[32px] h-[32px] border border-[#1063A7] rounded-full flex items-center justify-center">
                    <div className="w-[14px] h-[20px] bg-[#1063A7]" />
                  </div>
                  <span className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                    {data.address}
                  </span>
                </div>
              )}
              {(data?.phones?.length || data?.phone) && (
                <div className="flex items-start gap-2">
                  <div className="w-[32px] h-[32px] border border-[#1063A7] rounded-full flex items-center justify-center">
                    <div className="w-[20px] h-[20px] bg-[#1063A7]" />
                  </div>
                  <div className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                    {(data?.phones && data.phones.length > 0
                      ? data.phones
                      : (data?.phone || '')
                          .split(/[\n,]+/)
                          .map(p => p.trim())
                          .filter(Boolean)
                    ).map((p, i, arr) => (
                      <span key={p + i} className="block">
                        {p}
                        {i < arr.length - 1 ? '' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data?.email && (
                <div className="flex items-center gap-2">
                  <div className="w-[32px] h-[32px] border border-[#1063A7] rounded-full flex items-center justify-center">
                    <div className="w-[20px] h-[16px] bg-[#1063A7]" />
                  </div>
                  <span className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                    {data.email}
                  </span>
                </div>
              )}
              {data?.companyName && (
                <div className="flex items-center gap-2">
                  <div className="w-[32px] h-[32px] border border-[#1063A7] rounded-full flex items-center justify-center p-1">
                    <div className="w-[17px] h-[24px] bg-[#1063A7]" />
                  </div>
                  <span className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
                    {data.companyName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-[rgba(233,41,40,0.25)] rounded-full" />
      <div className="font-['Kanit'] text-[14px] leading-[21px] text-[#1063A7]">
        {data?.copyright || '© 2003 by THAIPARTS INFINITY CO., LTD.'}
      </div>
    </div>
  );

  if (embedded) {
    return Content;
  }

  return <footer className="w-full mx-auto px-8 mb-8">{Content}</footer>;
}
