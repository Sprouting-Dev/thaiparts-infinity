import MotionGridItem from '@/components/MotionGridItem';
import LinkMotion from './LinkMotion';
import Image from 'next/image';

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

export default function ContactInfo({ data }: ContactInfoProps) {
  const { title, companyName, address, phone, email } = data;

  return (
    <MotionGridItem>
      <div className="p-6 rounded-3xl bg-[#1063A70A] gap-6 flex flex-col">
        {/* Header */}
        <h2 className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium text-[#1063A7] text-center underline decoration-[#E92928] underline-offset-8">
          {title}
        </h2>

        {/* Company Info */}
        <div className="flex flex-col gap-3 text-left">
          {companyName && (
            <div>
              <p className="font-normal text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                {companyName}
              </p>
            </div>
          )}

          {/* Address */}
          {address && (
            <div>
              <p className="text-[16px] leading-[24px] lg:text-[22px] lg:leading-[33px]">
                {address}
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
                  // sanitize numbers for tel: links (strip spaces, parentheses, dashes)
                  const numeric = line.replace(/[^+\d]/g, '');
                  return (
                    <p key={index} className="text-gray-700">
                      <LinkMotion
                        href={`tel:${numeric}`}
                        className="text-gray-700"
                      >
                        {line}
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

        {/* Map */}
        <div className="relative rounded-xl overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3892.293257584682!2d101.22994948505483!3d12.694272588931957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102fb99960e24ab%3A0xc455a9b7e87ea2d5!2z4LmB4Lir4Lil4Lih4Lih4Liw4LiC4Liy4LihIOC4i-C4reC4oiA1IOC4leC4s-C4muC4peC4l-C4seC4muC4oeC4siDguK3guLPguYDguKDguK3guYDguKHguLfguK3guIfguKPguLDguKLguK3guIcg4Lij4Liw4Lii4Lit4LiHIDIxMDAw!5e0!3m2!1sth!2sth!4v1761036648283!5m2!1sth!2sth"
            width="100%"
            height="890"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Thai Parts Infinity Location"
          />
        </div>
      </div>
    </MotionGridItem>
  );
}
