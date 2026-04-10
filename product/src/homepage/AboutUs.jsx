import React from 'react';

const AboutUs = () => {
  return (
    <section className="w-full py-16 md:py-24 font-['Quicksand'] bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Header Section */}
        <div className="w-full flex flex-col items-center justify-center text-center mb-16 md:mb-20 mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#14213d] mb-5 tracking-tight w-full text-center">About Us</h2>
          <p className="text-gray-500 text-lg md:text-[1.15rem] leading-relaxed max-w-4xl mx-auto text-center">
            Your trusted partner in wholesale grocery distribution,<br className="hidden md:block" /> connecting businesses with quality products at competitive prices
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with floating badge */}
          <div className="relative lg:col-span-7">
            <div className="rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
              <img 
                src="/images/business-handshake.png" 
                alt="Two businessmen shaking hands outdoors" 
                className="w-full h-[350px] lg:h-[425px] object-cover object-center"
              />
            </div>
            
            {/* 15+ Years Badge */}
            <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 bg-[#489b70] text-white p-7 lg:p-9 rounded-[2rem] flex flex-col items-center justify-center min-w-[150px] lg:min-w-[180px] shadow-xl border-4 border-white">
              <span className="text-4xl lg:text-5xl font-bold leading-none mb-1">15+</span>
              <span className="text-sm lg:text-[15px] font-medium tracking-wide">Years of Excellence</span>
            </div>
          </div>
          
          {/* Right Column: Text & Features */}
          <div className="flex flex-col mt-8 lg:mt-0 lg:col-span-5 lg:pl-6">
            <div className="bg-[#bce6d0] text-[#2c7750] px-5 py-2 rounded-full text-[13px] tracking-wider uppercase font-bold inline-block w-max mb-6">
              Who We Are
            </div>
            
            <h3 className="text-3xl md:text-[42px] font-bold text-[#14213d] leading-[1.2] mb-6 tracking-tight">
              Leading Wholesale Grocery<br className="hidden md:block" /> Distributor Since 2010
            </h3>
            
            <p className="text-[#5a6268] text-base md:text-[1.05rem] mb-5 leading-[1.8]">
              GroceryHub has been at the forefront of wholesale grocery distribution, serving thousands of retailers, restaurants, and food businesses across the country. We bridge the gap between large-scale suppliers and small to medium-sized businesses.
            </p>
            
            <p className="text-[#5a6268] text-base md:text-[1.05rem] mb-10 leading-[1.8]">
              Our commitment to quality, reliability, and competitive pricing has made us the preferred choice for businesses looking to source premium grocery products in bulk quantities.
            </p>
            
            <div className="flex flex-col gap-7">
              {/* Feature 1 */}
              <div className="flex gap-5">
                <div className="w-[50px] h-[50px] rounded-full bg-[#dcf3e5] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-[#489b70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#14213d] mb-1.5">Quality Assurance</h4>
                  <p className="text-[#5a6268] text-[15px] leading-relaxed">All products are sourced from certified suppliers and undergo strict quality checks</p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="flex gap-5">
                <div className="w-[50px] h-[50px] rounded-full bg-[#dcf3e5] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-[#489b70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#14213d] mb-1.5">Competitive Pricing</h4>
                  <p className="text-[#5a6268] text-[15px] leading-relaxed">Direct sourcing allows us to offer unbeatable wholesale prices</p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="flex gap-5">
                <div className="w-[50px] h-[50px] rounded-full bg-[#dcf3e5] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-[#489b70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#14213d] mb-1.5">Reliable Delivery</h4>
                  <p className="text-[#5a6268] text-[15px] leading-relaxed">Fast and dependable delivery within 24-48 hours</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;