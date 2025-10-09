'use client';

import { useState } from 'react';

interface ContactFormData {
  title: string;
  description?: string;
  showNameField: boolean;
  showEmailField: boolean;
  showPhoneField: boolean;
  showSubjectField: boolean;
  showMessageField: boolean;
  submitButtonText: string;
  successMessage: string;
}

interface ContactFormProps {
  data: ContactFormData;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactForm({ data }: ContactFormProps) {
  // Use Thai content for the form
  const title = 'ส่งข้อความหาเรา';
  const description = 'กรอกแบบฟอร์มด้านล่าง แล้วทีมงานของเราจะติดต่อกลับภายใน 24 ชั่วโมง';
  const showNameField = true;
  const showEmailField = true;
  const showPhoneField = true;
  const showSubjectField = false;
  const showMessageField = true;
  const submitButtonText = 'ส่งข้อความ';
  const successMessage = 'ขอบคุณสำหรับข้อความของคุณ เราจะติดต่อกลับเร็วๆ นี้';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'Contact Form Inquiry', // ตั้งค่า default subject
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (showNameField && !formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ';
    }

    if (showEmailField && !formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (showEmailField && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (showSubjectField && !formData.subject.trim()) {
      newErrors.subject = 'กรุณากรอกหัวข้อ';
    }

    if (showMessageField && !formData.message.trim()) {
      newErrors.message = 'กรุณากรอกข้อความ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setIsSubmitted(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Contact Form Inquiry', // ตั้งค่า default subject
        message: '',
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error state here
      alert(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">ส่งข้อความสำเร็จ!</h3>
          <p className="text-gray-600 mb-8 text-lg">{successMessage}</p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-[#1063A7] text-white px-8 py-3 rounded-xl hover:bg-[#0d4d85] transition-colors font-medium"
          >
            ส่งข้อความอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(16, 99, 167, 0.04)' }}>
      <h2 className="text-2xl font-medium text-[#1063A7] mb-8 text-center underline decoration-[#E92928] underline-offset-4">{title}</h2>
      
      {description && (
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Field */}
        {showNameField && (
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-gray-900 mb-3">
              ชื่อ *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1063A7] transition-all duration-200 text-lg ${
                errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="กรอกชื่อของคุณ"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
          </div>
        )}

        {/* Email Field */}
        {showEmailField && (
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-900 mb-3">
              อีเมล *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1063A7] transition-all duration-200 text-lg ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
          </div>
        )}

        {/* Phone Field */}
        {showPhoneField && (
          <div>
            <label htmlFor="phone" className="block text-base font-semibold text-gray-900 mb-3">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1063A7] transition-all duration-200 text-lg ${
                errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="092-424-2144"
            />
            {errors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>}
          </div>
        )}

        {/* Subject Field */}
        {showSubjectField && (
          <div>
            <label htmlFor="subject" className="block text-base font-semibold text-gray-900 mb-3">
              หัวข้อ *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1063A7] transition-all duration-200 text-lg ${
                errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="หัวข้อที่ต้องการสอบถาม"
            />
            {errors.subject && <p className="mt-2 text-sm text-red-600 font-medium">{errors.subject}</p>}
          </div>
        )}

        {/* Message Field */}
        {showMessageField && (
          <div>
            <label htmlFor="message" className="block text-base font-semibold text-gray-900 mb-3">
              ข้อความ *
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1063A7] transition-all duration-200 text-lg resize-vertical ${
                errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="กรุณาเขียนข้อความที่ต้องการสอบถาม..."
            />
            {errors.message && <p className="mt-2 text-sm text-red-600 font-medium">{errors.message}</p>}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1063A7] text-white py-4 px-6 rounded-xl hover:bg-[#0d4d85] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังส่ง...
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> We'll respond to your inquiry within 24-48 hours. For urgent matters, please call us directly.
          </p>
        </div>
      </form>
    </div>
  );
}