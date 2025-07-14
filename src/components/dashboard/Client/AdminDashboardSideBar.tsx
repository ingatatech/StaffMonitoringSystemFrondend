// @ts-nocheck
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MapPin,
  BarChart2,
  FileText,
  Building2,
  Bell,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Layers,
  Grid,
  X,
  UsersRound,
  CheckSquare,
  Award,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: Omit<SidebarItem, 'icon' | 'subItems'>[];
}

const sidebarItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/admin/'
  },
  {
    id: 'group',
    title: 'Company',
    icon: <Grid className="h-5 w-5" />,
    subItems: [
      { id: 'group-new', title: 'Complete Group', path: '/admin/create-group' },
      { id: 'companies-all', title: 'View Companies', path: '/admin/companies' },
      { id: 'departments-all', title: 'View Departments', path: '/admin/departments' }
    ]
  },
  {
    id: 'Level',
    title: 'Supervisory Level',
    icon: <TrendingUp className="h-5 w-5" />,
    subItems: [
      { id: 'Manage Level', title: 'Manage Level', path: '/admin/management-page' },
    ]
  },
  {
    id: 'Position',
    title: 'Position Management',
    icon: <Award className="h-5 w-5" />,
    subItems: [
      { id: 'create-position', title: 'Create Position', path: '/admin/create-position' },
      { id: 'manage-position', title: 'Manage Position', path: '/admin/manage-position' },
    ]
  },
  {
    id: 'users',
    title: 'Manage Users',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: 'create-user', title: 'Create user', path: '/admin/register' },
      { id: 'users-all', title: 'View Users', path: '/admin/manage-users' },
    ]
  },
  {
    id: 'Team',
    title: 'Team Management',
    icon: <UsersRound className="h-5 w-5" />,
    subItems: [
      { id: 'create-team', title: 'Create Team', path: '/admin/team' },
      { id: 'Manage Team', title: 'View Teams', path: '/admin/teams' },
    ]
  },
  {
    id: 'Task',
    title: 'Task Management',
    icon: <CheckSquare className="h-5 w-5" />,
    subItems: [      
       { id: 'Manage Task Type', title: 'Manage Task Type', path: '/admin/manage-task-types' },
    ]
  },
  {
    id: 'Report',
    title: 'Reports',
    icon: <BarChart2 className="h-5 w-5" />,
    subItems: [
      { id: 'UserReport', title: 'User Report', path: '/admin/user/report', icon: <FileText className="h-4 w-4" /> },
    ]
  },
  {
    id: 'Profile',
    title: 'My Profile',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: 'My-profile', title: 'My Profile', path: '/admin/profile' },
    ]
  },
];

const AdminDashSidebar = ({ isOpen, closeSidebar }) => {
  // Now expanded only tracks a single active item instead of an array
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const toggleExpand = (itemId) => {
    // If the item is already expanded, close it
    // Otherwise, expand this item (which automatically closes any other)
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const renderSidebarItem = (item) => {
    const isExpanded = expandedItemId === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    
    const handleItemClick = () => {
      if (hasSubItems) {
        toggleExpand(item.id);
      } else if (item.path) {
        // Use navigate instead of window.location.href
        navigate(item.path);
        closeSidebar(); // Close sidebar on mobile after navigation
      }
    };

    return (
 <div key={item.id} className="space-y-1">
        <button
          onClick={handleItemClick}
          className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg
            cursor-pointer group
            transition-all duration-200 ease-in-out
            hover:bg-slate-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm
            ${isExpanded 
              ? 'bg-slate-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold border-l-4 border-blue-500' 
              : 'text-gray-700 dark:text-gray-200 font-medium'
            }`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`transition-colors duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-blue-500' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
            }`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="text-[0.95rem] transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
                {item.title}
              </span>
            )}
          </div>
          {hasSubItems && !isCollapsed && (
            <div className={`transition-all duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-blue-500 rotate-0' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
            }`}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="pl-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.subItems?.map(subItem => (
              <Link
                key={subItem.id}
                to={subItem.path || '#'}
                className="block py-2 px-3 rounded-lg 
                  transition-all duration-200 ease-in-out
                  hover:bg-slate-50 dark:hover:bg-gray-600
                  text-gray-600 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white
                  hover:shadow-sm hover:translate-x-1
                  text-sm font-medium
                  border-l-2 border-transparent hover:border-blue-300"
                onClick={closeSidebar} // Close sidebar on mobile after navigation
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };


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
            <span className="font-bold text-gray-800 dark:text-white text-lg">Admin</span>
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

      {/* Footer section (optional) */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Admin Dashboard v2.0
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
        
        /* Animation keyframes */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default AdminDashSidebar;