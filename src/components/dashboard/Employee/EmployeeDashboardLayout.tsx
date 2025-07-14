import { Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "./EmployeeNavBar"
import EmployeeDashboardSideBar from "./EmployeeDashboardSideBar";
import { useDispatch } from "react-redux";
import { logout } from "../../../Redux/Slices/LoginSlices";
import axios from "axios";
function EmployeeDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

const dispatch = useDispatch();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Auto logout function
  const handleAutoLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  // Intercept API responses for token errors
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the fetch function
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Clone the response to avoid "already read" errors
      const clonedResponse = response.clone();
      
      // Check for token errors
      if (!response.ok) {
        clonedResponse.json().then(data => {
          if (data.message === "Invalid authentication token") {
            handleAutoLogout();
          }
        }).catch(() => {
          // If response isn't JSON, check text
          clonedResponse.text().then(text => {
            if (text.includes("Invalid authentication token")) {
              handleAutoLogout();
            }
          });
        });
      }
      
      return response;
    };
    
    // Set up axios interceptor if axios is used
    if (typeof axios !== 'undefined') {
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && 
              (error.response.data.message === "Invalid authentication token" || 
               error.response.data?.includes("Invalid authentication token"))) {
            handleAutoLogout();
          }
          return Promise.reject(error);
        }
      );
      
      // Cleanup function
      return () => {
        window.fetch = originalFetch;
        if (typeof axios !== 'undefined') {
          axios.interceptors.response.eject(interceptor);
        }
      };
    } else {
      // Cleanup function for fetch only
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [dispatch]);
  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex flex-col h-screen overflow-hidden">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-1 pt-16 h-full">
        {/* Sidebar - fixed on desktop, slide in/out on mobile */}
        <div className={`fixed inset-y-0 left-0 z-40 pt-16 h-full lg:translate-x-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Overlay for mobile */}
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>

          <EmployeeDashboardSideBar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto w-full h-full transition-all duration-300 ease-in-out lg:ml-64 text-gray-900 dark:text-gray-100 pt-2 pb-4 px-4">
          <Outlet />
        </div>
      </div>
    </div>

  );
}

export default EmployeeDashboardLayout;