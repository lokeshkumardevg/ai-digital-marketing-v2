import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import logo from "../assets/images/logo.png";
import { Menu, X } from "lucide-react";

const navItems = ["Features", "Tutorial", "Pricing", "Resources", "Careers"];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 z-50 w-full flex justify-center px-4 transition-all duration-300 ${
        isScrolled ? "top-2" : "top-4"
      }`}
    >
      {/* Main Container */}
      <div className="flex items-center justify-between w-full max-w-[1200px]">

        {/* Capsule Navbar */}
<div
  className={`relative flex items-center rounded-[60px] border transition-all duration-300
  ${
    isScrolled
      ? "h-[42px] px-6 bg-black/80 backdrop-blur-2xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
      : "h-[50px] px-10 bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.7)]"
  }`}
>

          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-[60px] pointer-events-none overflow-hidden">
            {/* <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent"></div> */}
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center relative z-10 shrink-0">
            <img
              src={logo}
              alt="Wheedle.ai"
              className="h-[22px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 ml-8 relative z-10 whitespace-nowrap">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[15px] font-medium text-white/60 hover:text-white transition duration-300 relative group"
              >
                {item}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>
        </div>

        {/* Right Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 ml-4">
<Link
  to="/register"
  className="flex h-[42px] w-[100px] items-center justify-center rounded-[14px] border bg-[#1630b7] text-[16px] font-medium text-white shadow-[0_0_0_3px_rgba(7,10,24,0.9)] transition hover:bg-[#1c39d3]"
>
  Login
</Link>

<Link
  to="/register"
  className="flex h-[42px] w-[120px] items-center justify-center rounded-[14px] border border-[#1d2747] bg-[#1630b7] text-[16px] font-medium text-white shadow-[0_0_0_3px_rgba(7,10,24,0.9)] transition hover:bg-[#1c39d3]">
  <Button variant="primary" size="md" className="!h-full !w-full !rounded-[14px] !bg-[#1630b7] !hover:bg-[#1c39d3] !border-none !shadow-none text-[12px]">
    Book Demo
  </Button>
</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={36} /> : <Menu size={36} />}
        </button>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-[70px] left-4 right-4 rounded-2xl bg-[#040816]/95 border border-white/10 backdrop-blur-xl p-6 flex flex-col gap-5 lg:hidden shadow-xl">

            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/80 hover:text-white text-base"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}

            <Button variant="secondary" size="sm" className="h-[44px] !rounded-lg !bg-[#0f1a3a]">
              Login
            </Button>

            <Button variant="primary" size="sm" className="h-[44px] !rounded-lg !bg-blue-600 font-medium">
              Book Demo
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;