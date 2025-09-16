import React, { useState, useEffect } from "react";
import { Bitcoin, Menu, X } from "lucide-react";
import { Page } from "../../App";

function Navbar({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGetStarted = () => {
    onNavigate("dashboard");
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full pt-2 mb-8 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <img src="/logo.png" alt="LipaInvoice" className="h-32 w-32" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-md font-bold transition-colors "
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-md font-bold transition-colors "
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-md font-bold transition-colors "
                  >
                    Pricing
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleGetStarted}
                className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:bg-transparent border border-orange-500 hover:text-orange-500"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => {
                  scrollToSection("features");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("how-it-works");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  scrollToSection("pricing");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
              >
                Pricing
              </button>

              <div className="pt-4 pb-3 border-t border-gray-200">
                <button
                  onClick={handleGetStarted}
                  className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="mt-2 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
