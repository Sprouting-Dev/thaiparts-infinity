import MotionGridItem from '@/components/MotionGridItem';
import LinkMotion from './LinkMotion';
import Image from 'next/image';
import { getTextClass } from '@/components/ColoredText';

interface ContactInfoData {
  title: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  businessHours?: string;
  additionalInfo?: string;
}

interface ContactInfoProps {
  data: ContactInfoData;
}
interface ContactInfoProps {
  data: ContactInfoData;
  mapUrl?: string | null;
}

export default function ContactInfo({ data, mapUrl }: ContactInfoProps) {
  const { title, companyName, address, phone, email } = data;

  // Normalize and format a phone line for display and tel: href
  const formatPhoneLine = (raw: string) => {
    if (!raw) return null;
    // strip spaces and common separators but keep leading +
    const digitsOnly = raw.replace(/[^+\d]/g, '');
    let normalized = digitsOnly;

    // handle leading +66 or 66 country code -> produce national 0-prefixed for display
    if (normalized.startsWith('+66')) normalized = normalized.slice(3);
    else if (normalized.startsWith('66')) normalized = normalized.slice(2);

    // now normalized should be national digits like 924242144 or 0924242144
    // if 9 digits, prepend 0
    if (normalized.length === 9) normalized = `0${normalized}`;

    // If normalized isn't 10 digits at this point, fall back to showing raw
    if (normalized.length !== 10) {
      // create a safe tel href by removing non-digits and prefixing + if original had +
      const tel = digitsOnly.startsWith('+') ? digitsOnly : digitsOnly;
      return { display: raw, href: `tel:${tel}` };
    }

    // Build display: (+66) 0xx-xxx-xxxx but keep the leading 0 in display as in design
    const display = `(+66) ${normalized.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`;
    // Build international href: tel:+66xxxxxxxxx (drop leading 0)
    const international = `+66${normalized.slice(1)}`;
    return { display, href: `tel:${international}` };
  };

  return (
    <MotionGridItem>
      <div className="p-6 rounded-3xl bg-[#1063A70A] gap-6 flex flex-col">
        {/* Header */}
        <h2
          className={`text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium ${getTextClass('brandBlue')} text-center underline decoration-[#E92928] underline-offset-8`}
        >
          {title}
        </h2>

        {/* Company Info */}
        <div className="flex flex-col gap-3 text-left">
          {companyName && (
            <div>
              <p className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                บริษัท: {companyName}
              </p>
            </div>
          )}

          {/* Address */}
          {address && (
            <div>
              <p className="text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                ที่อยู่: {address}
              </p>
            </div>
          )}

          {/* Phone */}
          {phone && (
            <div className="flex flex-row gap-3">
              <p className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                เบอร์โทรศัพท์:
              </p>
              <div className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                {phone.split('\n').map((line, index) => {
                  const formatted = formatPhoneLine(line);
                  if (!formatted) return null;
                  return (
                    <p key={index} className="text-gray-700">
                      <LinkMotion
                        href={formatted.href}
                        className="text-gray-700"
                      >
                        {formatted.display}
                      </LinkMotion>
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div className="flex flex-row gap-3">
              <p className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                อีเมล:
              </p>
              <p className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                <LinkMotion href={`mailto:${email}`}>{email}</LinkMotion>
              </p>
            </div>
          )}
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-6">
          {/* Email */}
          <LinkMotion
            href={`mailto:${email}`}
            className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Image
              src="contact-us/icons/email.svg"
              alt="Email"
              width={64}
              height={64}
              className="w-12 h-12 lg:w-16 lg:h-16 border-1 border-[#FFFFFF3D] rounded-xl"
            />
          </LinkMotion>

          {/* LINE */}
          <LinkMotion
            href="https://lin.ee/E2Zf5YS"
            className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center hover:scale-110 transition-transform"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="contact-us/icons/line.svg"
              alt="LINE"
              width={64}
              height={64}
              className="w-12 h-12 lg:w-16 lg:h-16 border-1 border-[#FFFFFF3D] rounded-xl"
            />
          </LinkMotion>
        </div>

        {/* Map: single source of truth is CMS `map_url` (string). All other attributes are hardcoded. */}
        {mapUrl ? (
          <div className="relative rounded-xl overflow-hidden shadow-md flex justify-center">
            <iframe
              src={mapUrl}
              style={{
                border: 0,
                width: 'clamp(295px, 90vw, 890px)',
                height: 'clamp(295px, 90vw, 890px)',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Thai Parts Infinity Location"
            />
          </div>
        ) : null}
      </div>
    </MotionGridItem>
  );
}
