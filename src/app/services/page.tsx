import { Metadata } from 'next';
import { ServicesGrid } from '@/components';
import { getAllServices } from '@/services/serviceService';

export const metadata: Metadata = {
  title: 'Services | THAIPARTS INFINITY',
  description: 'Industrial automation services and maintenance',
};

export default async function ServicesPage() {
  const services = await getAllServices();

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <main className="w-full flex flex-col items-center pt-24">
        <div className="flex flex-col gap-8 py-8 px-4 lg:px-[14.6875rem]">
          <div className="mt-12 lg:mt-24 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-accent flex-shrink-0" />
            <h1 className="font-['Kanit'] font-medium text-[1.375rem] leading-[2.0625rem] md:text-[1.75rem] md:leading-[2.625rem] text-primary">
              บริการและโซลูชันวิศวกรรม
            </h1>
          </div>
          <p className="font-['Kanit'] font-normal text-base lg:text-[1.375rem]">
            บริการของเราครอบคลุมตั้งแต่การวิเคราะห์ความต้องการ การออกแบบสถาปัตยกรรม การติดตั้งฮาร์ดแวร์และซอฟต์แวร์ การเชื่อมต่อกับ PLC/RTU ถึงการทำงานร่วมกับระบบ ERP/CMMS สำหรับการรายงานเชิงธุรกิจ เราเน้นการออกแบบที่แยกเครือข่าย OT/IT ใช้มาตรการ defense-in-depth ตามแนวทาง NIST และ IEC62443 และใช้เทคโนโลยีมาตรฐานเช่น OPC UA เพื่อความมั่นคงและความยืดหยุ่นของระบบ
          </p>
          <ServicesGrid services={services} linkable={true} />
        </div>
      </main>
    </div>
  );
}
