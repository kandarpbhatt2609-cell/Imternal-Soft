import React, { useRef } from 'react';

const reviews = [
  { id: 1, name: "Michael Chen", role: "Retail Store Manager", company: "City Grocery Mart", avatar: "https://i.pravatar.cc/150?u=1", text: "We switched to GroceryHub six months ago and haven't looked back. The variety of products, competitive pricing, and exceptional customer service make them our go-to wholesale supplier. Highly recommended for any retail business!" },
  { id: 2, name: "Emily Rodriguez", role: "Business Owner", company: "Green Valley Organic Store", avatar: "https://i.pravatar.cc/150?u=2", text: "As an organic store owner, quality is my top priority. GroceryHub understands this perfectly. Their certified organic products and transparent sourcing have helped us maintain our standards while keeping prices competitive for our customers." },
  { id: 3, name: "David Martinez", role: "Cafe Chain Director", company: "Morning Brew Cafes", avatar: "https://i.pravatar.cc/150?u=3", text: "Managing 12 cafe locations requires a reliable supplier. GroceryHub has never let us down. Their bulk orders are processed efficiently, and the dedicated account manager makes ordering seamless." },
  { id: 4, name: "Sarah Jenkins", role: "Head Chef", company: "The Rustic Spoon", avatar: "https://i.pravatar.cc/150?u=4", text: "The quality of fresh produce we get from GroceryHub is incredible. Delivery is always on time, which is critical for our kitchen operations. Best wholesale distributor we've worked with by far." },
  { id: 5, name: "Robert Fox", role: "Procurement Manager", company: "FreshFoods Supermarket", avatar: "https://i.pravatar.cc/150?u=5", text: "What impressed me most was their ability to handle sudden volume spikes during holiday seasons. Their logistics network is top-notch, and customer support is always quick to resolve any issues." },
  { id: 6, name: "Amanda Silva", role: "Owner", company: "Silva Family Bakery", avatar: "https://i.pravatar.cc/150?u=6", text: "We source all our baking materials from GroceryHub. Not only do they offer an extensive catalog of specialty flour and sugars, but their pricing helps us keep our pastry prices competitive." }
];

const Testimonials = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#BCE6D0] py-20 md:py-24 w-full font-['Quicksand'] relative">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scroll-snap {
          scroll-snap-type: x mandatory;
        }
      `}} />
      
      <div className="container mx-auto px-4 max-w-[1300px]">
        <div className="w-full flex flex-col items-center justify-center text-center mb-16 md:mb-20 mx-auto">
          <h2 className="w-full text-center text-[40px] md:text-[46px] font-bold text-[#14213d] mb-4 tracking-tight">What Our Clients Say</h2>
          <p className="w-full text-center text-[#4e6b5c] text-[17px] md:text-[19px] leading-relaxed max-w-4xl mx-auto px-4">
            Don't just take our word for it - hear from businesses who trust GroceryHub for their<br className="hidden md:block"/> wholesale needs
          </p>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-5 lg:-left-7 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] text-[#3BB77E] hover:bg-[#3BB77E] hover:text-white transition-colors cursor-pointer border border-[#eee]"
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Slider Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-8 hide-scroll-snap no-scrollbar px-2"
          >
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="w-[85vw] md:w-[420px] lg:w-[420px] shrink-0 bg-white px-10 py-10 lg:px-12 lg:py-12 rounded-[1.5rem] shadow-[0_8px_24px_rgba(0,0,0,0.04)] snap-center flex flex-col transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="text-[#ffb300] mb-6 text-xl tracking-widest select-none flex gap-1">
                  ★★★★★
                </div>
                
                <p className="text-[#5a6268] text-[15px] lg:text-[16px] leading-[1.8] mb-10 flex-grow">
                  "{review.text}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <img 
                    src={review.avatar} 
                    alt={review.name} 
                    className="w-[56px] h-[56px] rounded-full object-cover shrink-0 border border-gray-100" 
                    loading="lazy"
                  />
                  <div className="flex flex-col">
                    <h5 className="font-bold text-[#14213d] text-[16px] leading-tight mb-1">{review.name}</h5>
                    <p className="text-[13px] text-[#6b7280] leading-tight mb-1">{review.role}</p>
                    <p className="text-[13px] text-[#3BB77E] font-semibold leading-tight">{review.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-5 lg:-right-7 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.15)] text-[#3BB77E] hover:bg-[#3BB77E] hover:text-white transition-colors cursor-pointer border border-[#eee]"
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
      </div>
    </section>
  );
};

export default Testimonials;