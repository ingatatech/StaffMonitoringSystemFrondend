// @ts-nocheck
import React, { useState } from "react";
import { LayoutDashboard, PlusCircle, User, Users, ChevronDown, ChevronRight, X, RefreshCw, CalendarClock,Calendar } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/employee-dashboard",
  },
  {
    id: "create-task",
    title: "Create Task",
    icon: <PlusCircle className="h-5 w-5" />,
    path: "/employeeDashboard/create-task",
  },
  {
    id: "shifted-task",
    title: "Shifted Task",
    icon: <CalendarClock className="h-5 w-5" />,
    path: "/employeeDashboard/shifted-task",
  },
  {
    id: "submitted-tasks",
    title: "Submitted Task",
    icon: <CalendarClock className="h-5 w-5" />,
    path: "/employeeDashboard/submitted-task",
  },
    {
    id: 'Leave Request',
    title: 'Leave Management',
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      { id: 'Create Leave', title: 'Create Leave', path: '/employeeDashboard/create-leave' },
      { id: 'My Leaves', title: 'My Leaves', path: '/employeeDashboard/leaves' },
      {id: 'Approved Leaves', title: 'Approved Leaves', path: '/employeeDashboard/approved-leaves' },

    ]
    
  },
  {
    id: 'Profile',
    title: 'My Profile',
    icon: <User className="h-5 w-5" />,
    path: '/employee/profile',
  },
];

const EmployeeDashboardSideBar = ({ isOpen, closeSidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
    closeSidebar(); // Close sidebar on mobile after navigation
  };


const renderSidebarItem = (item: SidebarItem & { subItems?: SidebarItem[] }) => (
  <div key={item.id}>
    <div
      onClick={() => item.path && handleItemClick(item.path)}
      className={`w-full flex items-center py-2.5 px-3 rounded-lg
        cursor-pointer group
        transition-all duration-200 ease-in-out
        hover:bg-slate-100 dark:hover:bg-gray-700
        hover:text-gray-900 dark:hover:text-white
        hover:shadow-sm
        text-gray-700 dark:text-gray-200 font-medium`}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className={`transition-colors duration-200 flex-shrink-0 
          text-gray-500 dark:text-gray-400 group-hover:text-blue-500`}>
          {item.icon}
        </div>
        {!isCollapsed && (
          <span className="text-[0.95rem] transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
            {item.title}
          </span>
        )}
      </div>
    </div>
    {/* Render subItems if present */}
    {item.subItems && !isCollapsed && (
      <div className="ml-8">
        {item.subItems.map((sub) => (
          <div
            key={sub.id}
            onClick={() => handleItemClick(sub.path)}
            className="py-2 px-3 rounded-lg cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-700 text-sm"
          >
            {sub.title}
          </div>
        ))}
      </div>
    )}
  </div>
);


  return (
    <aside 
      className={`h-full bg-slate-50 dark:bg-gray-900 
        border-r border-slate-200 dark:border-gray-700 
        shadow-lg dark:shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col backdrop-blur-sm`}
    >
      {/* Header controls (fixed) */}
      <div className="p-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-lg">Employee</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg 
            transition-all duration-200 ease-in-out
            hover:bg-slate-200 dark:hover:bg-gray-700
            text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded-lg 
            transition-all duration-200 ease-in-out
            text-gray-600 dark:text-gray-300 
            hover:bg-slate-200 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Scrollable sidebar content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-1.5 p-4">
          {sidebarItems.map(renderSidebarItem)}
        </div>
      </div>

      {/* Footer section */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Employee Dashboard v2.0
          </div>
        ) : (
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </aside>
  );
};

export default EmployeeDashboardSideBar;