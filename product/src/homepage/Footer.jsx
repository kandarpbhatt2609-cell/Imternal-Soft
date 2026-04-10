import React from 'react';
import NestCartIcon from '../components/NestCartIcon';

const Footer = () => {
  return (
    <footer className="bg-[#253D4E] text-white pt-20 pb-10">
      <div className="homepage-shell">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[var(--nest-primary)] rounded-xl flex items-center justify-center text-white shrink-0">
                <NestCartIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">Nest Mart</h2>
                <span className="text-[12px] text-[#ADADAD] font-bold tracking-[0.2em] uppercase">Wholesale Solutions</span>
              </div>
            </div>
            <p className="text-[#ADADAD] text-[15px] font-medium mb-8 leading-relaxed">
              Your trusted partner for wholesale grocery supplies. Quality products at competitive prices for your business needs.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[var(--nest-primary)] flex items-center justify-center hover:bg-[var(--nest-primary-hover)] transition-all transform hover:-translate-y-1"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-sm text-white" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[var(--nest-primary)] flex items-center justify-center hover:bg-[var(--nest-primary-hover)] transition-all transform hover:-translate-y-1"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-sm text-white" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-[var(--nest-primary)] flex items-center justify-center hover:bg-[var(--nest-primary-hover)] transition-all transform hover:-translate-y-1"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-sm text-white" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold mb-8">Quick Links</h3>
            <ul className="space-y-4 text-[#ADADAD] text-[15px] font-medium">
              <li>
                <a href="/about" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Bulk Orders
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Become a Partner
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] font-bold mb-8">Customer Service</h3>
            <ul className="space-y-4 text-[#ADADAD] text-[15px] font-medium">
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--nest-primary)] hover:translate-x-1 inline-block transition-all">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[20px] font-bold mb-8">Contact Us</h3>
            <ul className="space-y-4 text-[#ADADAD] text-[15px] font-medium mb-8">
              <li className="flex gap-3 items-start">
                <span className="text-[var(--nest-primary)] material-icons-outlined">place</span> 123 Wholesale District, CA 90001
              </li>
              <li className="flex gap-3 items-center">
                <span className="text-[var(--nest-primary)] material-icons-outlined">phone</span> +1 (800) 123-4567
              </li>
              <li className="flex gap-3 items-center">
                <span className="text-[var(--nest-primary)] material-icons-outlined">email</span> sales@nestmart.com
              </li>
            </ul>
            <div className="relative group">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-[#1e323e] border border-transparent focus:border-[var(--nest-primary)] text-white px-6 py-4 rounded-xl outline-none text-[14px] transition-all"
              />
              <button
                type="button"
                className="absolute right-2 top-2 bottom-2 px-6 bg-[var(--nest-primary)] rounded-lg hover:bg-[var(--nest-primary-hover)] transition-colors shadow-lg"
                aria-label="Subscribe"
              >
                <span className="material-icons-outlined text-white text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#344b5c] pt-10 flex flex-col md:flex-row items-center justify-between text-[14px] text-[#ADADAD] font-medium">
          <p>© 2026 Nest Mart & Grocery. All rights reserved.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-[var(--nest-primary)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[var(--nest-primary)] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[var(--nest-primary)] transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
