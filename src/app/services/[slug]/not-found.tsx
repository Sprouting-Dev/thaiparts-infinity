import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center">
      <div className="container-970 flex flex-col items-center gap-8 py-24 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#E92928] flex items-center justify-center">
          <span className="text-white text-5xl font-bold">!</span>
        </div>
        
        <h1 className="font-['Kanit'] font-semibold text-[32px] md:text-[40px] text-[#1063A7]">
          ไม่พบบริการที่คุณต้องการ
        </h1>
        
        <p className="font-['Kanit'] text-[18px] md:text-[20px] text-[#666666] max-w-2xl">
          ขออภัย เราไม่พบบริการที่คุณกำลังค้นหา กรุณาตรวจสอบ URL หรือกลับไปยังหน้าบริการทั้งหมด
        </p>
        
        <Link 
          href="/services"
          className="font-['Kanit'] bg-[#1063A7] text-white px-8 py-4 rounded-lg text-[18px] font-medium hover:bg-[#0d4f85] transition-colors shadow-lg hover:shadow-xl"
        >
          กลับไปหน้าบริการ
        </Link>
      </div>
    </div>
  );
}
