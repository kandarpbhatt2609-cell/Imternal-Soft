import React from 'react';

const Hero = () => {
  return (
    <section className="w-full pt-[10%] pb-6 md:pb-8 font-['Quicksand']">
      {/* Space above = gap between Part 2 (nav) and Part 3 (hero card) */}
      <div className="w-full rounded-t-[28px] rounded-b-[28px] overflow-hidden min-h-[min(570px,65vh)] md:min-h-[min(660px,72vh)] flex flex-col md:flex-row md:items-stretch shadow-sm">
        <div className="flex-1 bg-[var(--hero-mint)] p-12 md:p-16 lg:py-20 lg:px-24 flex flex-col justify-center">
          <h1 className="text-[var(--text-dark)] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 md:mb-8">
            Wholesale Grocery For Your Business
          </h1>
          <p className="text-[var(--text-grey)] text-lg md:text-xl max-w-md">
            Bulk orders, competitive pricing, and reliable delivery for businesses.
          </p>
        </div>

        <div className="flex-1 relative min-h-[360px] sm:min-h-[420px] md:min-h-0">
          <img
            src="/images/hero-spices.png"
            alt="Colorful spices and herbs for wholesale grocery"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
