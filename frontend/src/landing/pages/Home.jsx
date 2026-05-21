// src/pages/Home.jsx
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import ResultsGrid from '../components/ResultsGrid';
import Verticals from '../components/Verticals';
import Steps from '../components/Steps';
import Pricing from '../components/Pricing';
import ContactForm from '../components/ContactForm';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import '../styles/animations.css';

function Home() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animationClass = entry.target.dataset.animation;
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.scroll-reveal');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden">
        <Navbar />
      
      <div className="relative bg-hero-radial animate-zoom">
        <Hero />
      </div>
      
      {/* Scroll reveal sections */}
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-left"
      >
        <TrustedBy />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-up"
      >
        <ResultsGrid />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-right"
      >
        <Verticals />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-scale"
      >
        <Steps />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-zoom"
      >
        <Pricing />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-left"
      >
        <ContactForm />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-right"
      >
        <Newsletter />
      </div>
      
      <div 
        className="scroll-reveal opacity-0"
        data-animation="animate-fade-up"
      >
        <Footer />
      </div>
    </div>
  );
}

export default Home;