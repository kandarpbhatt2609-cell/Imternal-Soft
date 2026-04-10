import React from 'react';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import Footer from './Footer';
import './App.css';

const SiteLayout = ({ children }) => {
  return (
    <div className="main-homepage-wrapper">
      <Navbar />
      <CategoryBar />
      <main className="homepage-shell">{children}</main>
      <Footer />
    </div>
  );
};

export default SiteLayout;
