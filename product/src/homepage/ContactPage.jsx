import React from 'react';
import SiteLayout from './SiteLayout';

const ContactPage = () => {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl font-['Quicksand']">
        <h1 className="text-4xl font-bold text-[var(--text-dark)] mb-6">Contact</h1>
        <p className="text-[var(--text-grey)] text-lg leading-relaxed mb-8">
          Reach our team for orders, partnerships, or support.
        </p>
        <ul className="space-y-4 text-[var(--text-dark)] text-lg">
          <li className="flex gap-3 items-start">
            <span className="text-[var(--nest-primary)] material-icons-outlined">place</span>
            <span>123 Wholesale District, CA 90001</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="text-[var(--nest-primary)] material-icons-outlined">phone</span>
            <a href="tel:+18001234567" className="hover:text-[var(--nest-primary)] transition-colors">
              +1 (800) 123-4567
            </a>
          </li>
          <li className="flex gap-3 items-center">
            <span className="text-[var(--nest-primary)] material-icons-outlined">email</span>
            <a href="mailto:sales@nestmart.com" className="hover:text-[var(--nest-primary)] transition-colors">
              sales@nestmart.com
            </a>
          </li>
        </ul>
      </div>
    </SiteLayout>
  );
};

export default ContactPage;
