import { useState, useEffect } from "react"
import {  ChevronDown, Menu } from "lucide-react"
import ProfileImage from "../../../assets/profile.jpg"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { logout } from "../../../Redux/Slices/LoginSlices";

import React from "react";
import ChatButton from "../../Chat/ChatButton";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string
  title: string
  description: string
  type: "info" | "warning" | "error"
  read: boolean
}

interface OverAllDashboardNavbarProps {
  toggleSidebar: () => void;
}

const OverAllDashboardNavbar = ({ toggleSidebar }: OverAllDashboardNavbarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.login.user);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Task Assignment",
      description: "Project X needs review",
      type: "info",
      read: false,
    },
    {
      id: "2",
      title: "Deadline Alert",
      description: "Task Y is overdue",
      type: "warning",
      read: false,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const profileData = useAppSelector((state) => state.profile.data)
  const userInfo = useSelector((state: RootState) => state.login.user)
  const unreadCount = notifications.filter((n) => !n.read).length



  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    if (profileData?.profilePictureUrl) {
      setPreviewUrl(profileData.profilePictureUrl)
    } else if (userInfo?.profilePictureUrl) {
      setPreviewUrl(userInfo.profilePictureUrl)
    }
  }, [profileData?.profilePictureUrl, userInfo?.profilePictureUrl])

  // Ingata Logo Component
  const IngataLogo = () => (
    <div className="flex items-center space-x-3">
      {/* Ingata Icon - Circular woven ring design - Enhanced size */}
      <div className="relative w-10 h-10 flex-shrink-0 z-index-10">
        <svg viewBox="0 0 32 32" className="w-9 h-9 drop-shadow-sm">
          {/* Outer ring - Deep Blue */}
          <circle 
            cx="16" 
            cy="16" 
            r="14" 
            fill="none" 
            stroke="#1E3A8A" 
            strokeWidth="3"
            className="opacity-90"
          />
          {/* Inner woven pattern - Gold gradient effect */}
          <circle 
            cx="16" 
            cy="16" 
            r="9" 
            fill="none" 
            stroke="#F59E0B" 
            strokeWidth="2"
            strokeDasharray="5,2"
            className="opacity-85"
            transform="rotate(45 16 16)"
          />
          <circle 
            cx="16" 
            cy="16" 
            r="9" 
            fill="none" 
            stroke="#FBBF24" 
            strokeWidth="1.5"
            strokeDasharray="4,3"
            className="opacity-75"
            transform="rotate(-30 16 16)"
          />
          {/* Center accent - Emerald */}
          <circle 
            cx="16" 
            cy="16" 
            r="3.5" 
            fill="#10B981" 
            className="opacity-70"
          />
        </svg>
      </div>
      
      {/* Brand Text */}
      <div className="flex items-baseline space-x-1.5">
        <span 
          className="text-xl font-bold bg-gradient-to-r from-blue-800 to-yellow-600 bg-clip-text text-transparent tracking-tight"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Ingata
        </span>
        <span 
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-widest"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          S-PRO
        </span>
      </div>
    </div>
  );

  return (
    <nav className="px-4 py-3 flex items-center justify-between shadow-sm bg-white dark:bg-gray-800">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 lg:hidden dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Ingata S-PRO Logo */}
        <div className="ml-2 lg:ml-0">
          <IngataLogo />
        </div>
      </div>
<div className="hidden sm:flex flex-1 justify-center">
<div className="flex flex-row justify-center items-center gap-3">
        {/* Org Logo */}
    {user?.organization?.organizationLogoUrl && (
      <img
        src={user.organization.organizationLogoUrl}
        alt={`${user.organization.name} logo`}
        className="h-12 w-12 object-contain mb-2"
      />
    )}
  <div className="flex flex-col items-center">


    {/* Org Name */}
    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 via-blue-800 to-slate-700 bg-clip-text text-transparent dark:from-slate-300 dark:via-blue-300 dark:to-slate-300 tracking-wide text-center">
      {user?.organization?.name || "Organization"}
    </h1>

    {/* Subtle underline */}
    <div className="h-0.5 w-16 bg-gradient-to-r from-blue-600 to-yellow-500 mx-auto mt-1 rounded-full opacity-70"></div>
  </div>
  </div>
</div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center space-x-2" onClick={() => setShowProfile(!showProfile)}>
            <img src={previewUrl || ProfileImage} alt="Profile" className="h-8 w-8 rounded-full" />
            <span className="hidden md:block font-medium text-gray-900 dark:text-gray-100">{user?.username}</span>
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-1">
                <a
                  href="/overall/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Your Profile
                </a>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        {user?.id && user?.organization?.id ? (
          <ChatButton userId={user.id} organizationId={user.organization.id} />
        ) : null}
      </div>
    </nav>
  );
};

export default OverAllDashboardNavbar;