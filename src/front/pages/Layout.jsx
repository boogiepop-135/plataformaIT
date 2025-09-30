import React, { useState } from "react";
import { Outlet } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import { Sidebar } from "../components/Sidebar";
import { TopNavbar } from "../components/TopNavbar";
import { Footer } from "../components/Footer";

// Base component that maintains the sidebar, top navbar and footer throughout the page
export const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <ScrollToTop>
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar */}
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Top Navigation */}
                <TopNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                {/* Main Content Area */}
                <main className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'
                    } pt-16`}>
                    <div className="min-h-[calc(100vh-8rem)]">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto">
                        <Footer />
                    </div>
                </main>
            </div>
        </ScrollToTop>
    );
};