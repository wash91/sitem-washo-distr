
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); // Open on desktop by default
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setSidebarOpen(true);
    } else {
      // On mobile, keep current state unless it was forced open by desktop view
      // This avoids closing it if user manually opened it on mobile
      if (window.innerWidth >= 768 && !sidebarOpen) {
         setSidebarOpen(false); // Close if resized from desktop to mobile and it was open
      } else if (window.innerWidth < 768 && sidebarOpen && !isMobile /*previous state was desktop*/) {
        setSidebarOpen(false); // If it was desktop and open, then resized to mobile, close it.
      }
    }
  }, [sidebarOpen, isMobile]);


  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      <main 
        className={`flex-1 p-3 md:p-4 overflow-y-auto transition-all duration-300 ease-in-out ${
          isMobile ? (sidebarOpen ? 'ml-60' : 'ml-0') : (sidebarOpen ? 'ml-60' : 'ml-0') // ml-60 for sidebar width
        }`}
      >
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden fixed top-3 left-3 z-50 bg-white shadow-lg rounded-md p-2" // Adjusted style
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <div className={`${isMobile && !sidebarOpen ? 'mt-12' : 'mt-0'} h-full`}> {/* Adjust margin for mobile button */}
         {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
