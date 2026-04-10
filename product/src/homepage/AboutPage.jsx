import React from 'react';
import SiteLayout from './SiteLayout';

const AboutPage = () => {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl font-['Quicksand']">
        <h1 className="text-4xl font-bold text-[var(--text-dark)] mb-6">About Nest Mart</h1>
        <p className="text-[var(--text-grey)] text-lg leading-relaxed mb-4">
          Nest Mart &amp; Grocery supplies wholesale groceries to businesses with bulk ordering, competitive pricing, and
          dependable delivery.
        </p>
        <p className="text-[var(--text-grey)] text-lg leading-relaxed">
          We focus on quality sourcing and long-term partnerships so your shelves stay stocked and your customers stay
          happy.
        </p>
      </div>
    </SiteLayout>
  );
};

export default AboutPage;
