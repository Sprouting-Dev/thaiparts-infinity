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
    <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(16, 99, 167, 0.04)' }}>
      {/* Header */}
      <h2 className="text-2xl font-medium text-[#1063A7] mb-8 text-center underline decoration-[#E92928] underline-offset-4">{title}</h2>
      
      {/* Company Info */}
      <div className="space-y-4 text-gray-700">
        {/* Address */}
        {address && (
          <div>
            <p className="whitespace-pre-line leading-relaxed">{address}</p>
          </div>
        )}

        {/* Phone */}
        {phone && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">เบอร์โทรศัพท์:</p>
            <div className="space-y-1">
              {phone.split('\n').map((line, index) => (
                <p key={index} className="text-gray-700">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        {email && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">อีเมล:</p>
            <p className="text-gray-700">{email}</p>
          </div>
        )}
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center gap-6 mt-8">
        {/* WhatsApp */}
        <a 
          href={`https://wa.me/66924242144`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
          </svg>
        </a>

        {/* Email */}
        <a 
          href={`mailto:${email}`}
          className="w-12 h-12 bg-[#1063A7] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>

        {/* LINE */}
        <a 
          href="https://line.me/ti/p/~@thaiparts"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-[#00B900] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12.017.572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </a>
      </div>

      {/* Map */}
      <div className="mt-8">
        <div className="relative rounded-xl overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15491.832!2d101.254!3d12.681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5%2F17%20M.2%2C%20Thap%20Ma%2C%20Mueang%20Rayong%2C%20Rayong%2C%2021000!5e0!3m2!1sen!2sth!4v1728472800"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Thai Parts Infinity Location"
          />
        </div>
      </div>
    </div>
  );
}