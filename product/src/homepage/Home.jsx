import React, { useEffect } from 'react';
import SiteLayout from './SiteLayout';
import Hero from './Hero';
import PopularProducts from './PopularProducts';
import AboutUs from './AboutUs';

import './Products.css';
import './About.css';

const Home = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#about-us' || hash === '#contact-us') {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <PopularProducts />
      <AboutUs />
    </SiteLayout>
  );
};

export default Home;
