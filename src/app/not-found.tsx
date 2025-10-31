import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center">
      <div className="container-970 flex flex-col items-center gap-8 py-24 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#E92928] flex items-center justify-center">
          <span className="text-white text-5xl font-bold">!</span>
        </div>

        <h1 className="font-['Kanit'] font-semibold text-[32px] md:text-[40px] text-[#1063A7]">
          ไม่พบหน้าที่คุณค้นหา
        </h1>

        <p className="font-['Kanit'] text-[18px] md:text-[20px] text-[#666666] max-w-2xl">
          ขออภัย เราไม่พบหน้าหรือเนื้อหาที่คุณกำลังค้นหา กรุณาตรวจสอบ URL
          หรือกลับไปยังหน้าหลักและลองอีกครั้ง
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="font-['Kanit'] bg-[#1063A7] text-white px-8 py-4 rounded-lg text-[18px] font-medium hover:bg-[#0d4f85] transition-colors shadow-lg hover:shadow-xl"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
