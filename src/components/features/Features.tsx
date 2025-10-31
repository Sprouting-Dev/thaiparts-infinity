'use client';
import Image from 'next/image';
import MotionGridItem from '@/components/motion/MotionGridItem';
import { MotionReveal } from '@/components/motion/MotionReveal';
import { getTextClass } from '@/lib/coloredText';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesProps {
  items: FeatureItem[];
}

export default function Features({ items }: FeaturesProps) {
  return (
    <MotionReveal>
      <section className="w-full flex flex-col items-center gap-6 lg:gap-12">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-4 lg:gap-8 smooth-transition items-stretch">
          {items.map((item, i) => (
            <MotionGridItem key={i} index={i}>
              <div className="bg-[#1063A70A] rounded-lg lg:rounded-2xl p-4 flex flex-col items-center gap-6 justify-between h-full">
                <div className="flex flex-col items-center gap-4 lg:gap-6">
                  <h3
                    className={`font-['Kanit'] font-medium ${getTextClass(
                      'brandBlue'
                    )} text-[22px] lg:text-[28px] leading-[33px] lg:leading-[42px] text-center`}
                  >
                    {item.title}
                  </h3>
                  <div className="w-16 h-16 lg:w-24 lg:h-24 flex items-center justify-center">
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>

                <p
                  className={`font-['Kanit'] text-[16px] lg:text-[22px] leading-[24px] lg:leading-[33px] ${getTextClass(
                    'brandBlue'
                  )} text-center`}
                >
                  {item.description}
                </p>
              </div>
            </MotionGridItem>
          ))}
        </div>
      </section>
    </MotionReveal>
  );
}
