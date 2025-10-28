import { Metadata } from 'next';
import { ServicesGrid } from '@/components';

export const metadata: Metadata = {
  title: 'Services | THAIPARTS INFINITY',
  description: 'Industrial automation services and maintenance',
};

type Service = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    subtitle?: string;
    thumbnail?: {
      data?: { attributes?: { url?: string } };
      url?: string; // flattened fallback
    };
  };
};

function getServices(): Service[] {
  // Static services data (mirror homepage services)
  return [
    {
      id: 1,
      attributes: {
        name: 'System Design & Upgrade',
        slug: 'system-design',
        subtitle: 'ออกแบบและยกระดับระบบ',
        thumbnail: { url: '/homepage/services/system-design-and-upgrade.webp' }
      }
    },
    {
      id: 2,
      attributes: {
        name: 'Preventive Maintenance',
        slug: 'preventive-maintenance',
        subtitle: 'บำรุงรักษาเชิงป้องกัน',
        thumbnail: { url: '/homepage/services/preventive-maintenance.webp' }
      }
    },
    {
      id: 3,
      attributes: {
        name: 'Rapid Response & On-site Support',
        slug: 'rapid-response',
        subtitle: 'บริการฉุกเฉิน แลการสนับสนุนในพื้นที่',
        thumbnail: { url: '/homepage/services/rapid-response-and-on-site-support.webp' }
      }
    }
  ];
}

export default function ServicesPage() {
  const services = getServices();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="container-970 flex flex-col gap-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#E92928] flex-shrink-0" />
            <h1 className="font-['Kanit'] font-medium text-[22px] leading-[33px] md:text-[28px] md:leading-[42px] text-[#1063A7]">
              บริการของเรา
            </h1>
          </div>
            <p>บริการของเราครอบคลุมตั้งแต่การวิเคราะห์ความต้องการ การออกแบบสถาปัตยกรรม การติดตั้งฮาร์ดแวร์และซอฟต์แวร์ การ เชื่อมต่อกับ PLC/RTU ถึงการทำงานร่วมกับระบบ ERP/CMMSสำหรับการรายงานเชิงธุรกิจ</p>
            <p>เราเน้นการออกแบบที่ แยกเครือข่าย OT/IT, ใช้มาตรการ defense-in-depth ตามแนวทาง NIST และ IEC62443, และใช้เทคโนโลยีมาตรฐานเช่น OPC UA เพื่อความมั่นคงและความยืดหยุ่นของระบบ</p>

          {/* Services Grid */}
          <ServicesGrid services={services} linkable={true} />
        </div>
      </main>
    </div>
  );
}
