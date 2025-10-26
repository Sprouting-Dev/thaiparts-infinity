'use client';

import { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimation,
} from 'framer-motion';
import MotionGridItem from '@/components/MotionGridItem';
import CTAButton from './CTAButton';

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
  // Use data from props or fallback to Thai content
  const title = data?.title || 'ติดต่อเรา';
  const showNameField = data?.showNameField ?? true;
  const showEmailField = data?.showEmailField ?? true;
  const showPhoneField = data?.showPhoneField ?? true;
  const showSubjectField = data?.showSubjectField ?? false;
  const showMessageField = data?.showMessageField ?? true;
  const submitButtonText = data?.submitButtonText || 'ส่งข้อความ';
  const successMessage =
    data?.successMessage ||
    'ขอบคุณสำหรับข้อความของคุณ เราจะติดต่อกลับเร็วๆ นี้';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '', // ตั้งค่า default subject
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const reduce = useReducedMotion();
  const formControls = useAnimation();

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (showNameField && !formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ';
    }

    if (showEmailField && !formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (
      showEmailField &&
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (showSubjectField && !formData.subject.trim()) {
      newErrors.subject = 'กรุณากรอกหัวข้อ';
    }

    if (showMessageField && !formData.message.trim()) {
      newErrors.message = 'กรุณากรอกข้อความ';
    }

    setErrors(newErrors);
    // trigger a subtle shake on the form when validation fails
    if (Object.keys(newErrors).length > 0) {
      // don't animate if user prefers reduced motion
      if (!reduce) {
        void formControls.start({
          x: [0, -8, 8, -6, 0],
          transition: { duration: 0.42 },
        });
      }
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Delegate to submitForm so CTAButton can call it as well
    await submitForm();
  };

  // Extracted submission flow so it can be invoked from CTAButton onClick
  const submitForm = async () => {
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
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to send email. Please try again.'
      );
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
      <MotionGridItem>
        <AnimatePresence>
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.28 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
          >
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                ส่งข้อความสำเร็จ!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">{successMessage}</p>
              <div className="flex items-center justify-center">
                <CTAButton
                  cta={{
                    label: 'ส่งข้อความอีกครั้ง',
                    onClick: () => setIsSubmitted(false),
                    variant: 'content-primary',
                  }}
                  asMotion={true}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </MotionGridItem>
    );
  }

  return (
    <MotionGridItem>
      <div
        className="flex flex-col p-6 gap-6 rounded-3xl"
        style={{ backgroundColor: 'rgba(16, 99, 167, 0.04)' }}
      >
        <h2 className="text-[22px] leading-[33px] lg:text-[28px] lg:leading-[42px] font-medium text-[var(--brand-blue)] text-center underline decoration-[var(--accent-red)] underline-offset-4">
          {title}
        </h2>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          animate={formControls}
        >
          {/* Name Field */}
          {showNameField && (
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-gray-900"
              ></label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-full glassinput focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[var(--brand-blue)] transition-all duration-200 text-lg ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="ชื่อของคุณ*"
              />
              {errors.name &&
                (reduce ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.name}
                  </p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.name}
                  </motion.p>
                ))}
            </div>
          )}

          {/* Email Field */}
          {showEmailField && (
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-900"
              ></label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-full glassinput focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[var(--brand-blue)] transition-all duration-200 text-lg ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="อีเมลของคุณ*"
              />
              {errors.email &&
                (reduce ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.email}
                  </p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.email}
                  </motion.p>
                ))}
            </div>
          )}

          {/* Phone Field */}
          {showPhoneField && (
            <div>
              <label
                htmlFor="phone"
                className="block text-base font-semibold text-gray-900"
              ></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-full glassinput focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[var(--brand-blue)] transition-all duration-200 text-lg ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="เบอร์โทรติดต่อ"
              />
              {errors.phone &&
                (reduce ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.phone}
                  </p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.phone}
                  </motion.p>
                ))}
            </div>
          )}

          {/* Subject Field */}
          {showSubjectField && (
            <div>
              <label
                htmlFor="subject"
                className="block text-base font-semibold text-gray-900"
              ></label>
              <input
                type="text"
                id="subject"
                name="subject"
                autoComplete="off"
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-full glassinput focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[var(--brand-blue)] transition-all duration-200 text-lg ${
                  errors.subject
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="หัวข้อ*"
              />
              {errors.subject &&
                (reduce ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.subject}
                  </p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.subject}
                  </motion.p>
                ))}
            </div>
          )}

          {/* Message Field */}
          {showMessageField && (
            <div>
              <label
                htmlFor="message"
                className="block text-base font-semibold text-gray-900"
              ></label>
              <textarea
                id="message"
                name="message"
                autoComplete="off"
                rows={6}
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
                className={`w-full px-4 py-4 border-2 rounded-3xl glassinput focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[var(--brand-blue)] transition-all duration-200 text-lg resize-vertical ${
                  errors.message
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="ข้อความ*"
              />
              {errors.message &&
                (reduce ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.message}
                  </p>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.message}
                  </motion.p>
                ))}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <CTAButton
              cta={{
                label: submitButtonText,
                onClick: async () => {
                  if (!validateForm()) return;
                  await submitForm();
                },
                variant: 'content-primary',
              }}
              asMotion={true}
              className="w-full"
              loading={isSubmitting}
              loadingLabel="กำลังส่ง..."
            />
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-full p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> We&apos;ll respond to your inquiry within
              24-48 hours. For urgent matters, please call us directly.
            </p>
          </div>
        </motion.form>
      </div>
    </MotionGridItem>
  );
}
