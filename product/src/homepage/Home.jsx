import React from 'react';
import SiteLayout from './SiteLayout';
import Hero from './Hero';
import PopularProducts from './PopularProducts';
import AboutUs from './AboutUs';

import './Products.css';
import './About.css';

const Home = () => {
  return (
    <SiteLayout>
      <Hero />
      <PopularProducts />
      <AboutUs />
    </SiteLayout>
  );
};

export default Home;
