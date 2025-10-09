interface ContactInfoData {
  title: string;
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
  const { title, address, phone, email, businessHours, additionalInfo } = data;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
      
      <div className="space-y-8">
        {/* Address */}
        {address && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 mt-0.5 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">ที่อยู่</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{address}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        {phone && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 mt-0.5 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">โทรศัพท์</h3>
              <div className="space-y-1">
                {phone.split('\n').map((line, index) => (
                  <a 
                    key={index}
                    href={`tel:${line.replace(/\s+/g, '')}`}
                    className="block text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    {line}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        {email && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 mt-0.5 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">อีเมล</h3>
              <a 
                href={`mailto:${email}`}
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                {email}
              </a>
            </div>
          </div>
        )}

        {/* Business Hours */}
        {businessHours && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 mt-0.5 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">เวลาทำการ</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{businessHours}</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {additionalInfo && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 mt-0.5 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">ข้อมูลเพิ่มเติม</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{additionalInfo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}