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

function Home() {
  return (
    <div className="overflow-hidden">
      <div className="relative bg-hero-radial">
        <Navbar />
        <Hero />
        <TrustedBy />
      </div>
      <ResultsGrid />
      <Verticals />
      <Steps />
      <Pricing />
      <ContactForm />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default Home;
