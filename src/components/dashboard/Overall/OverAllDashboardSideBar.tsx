// @ts-nocheck
import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: Omit<SidebarItem, 'icon' | 'subItems'>[];
}

const OverAllDashSidebar = ({ isOpen, closeSidebar }) => {
  // Using expandedItemId instead of expanded array to track only one active item
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const navigate = useNavigate();

  // Function to fetch pending leaves count
  const fetchPendingLeavesCount = async () => {
    setIsLoadingLeaves(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const url = `${import.meta.env.VITE_BASE_URL}/leaves/pending-reviews?page=1&limit=1000`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter out leaves with review_count === 3 (fully processed)
          const pendingLeaves = data.data.leaves.filter((leave) => leave.review_count !== 3);
          setPendingLeavesCount(pendingLeaves.length);
        }
      }
    } catch (error) {
      console.error('Error fetching pending leaves count:', error);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  // Fetch pending leaves count on component mount
  useEffect(() => {
    fetchPendingLeavesCount();
    
    // Optional: Set up polling to refresh count every 5 minutes
    const interval = setInterval(() => {
      fetchPendingLeavesCount();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Enhanced notification badge component
  const NotificationBadge = ({ count, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      );
    }

    if (count === 0) return null;

    return (
      <div className="relative">
        <div 
          className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
          style={{
            animation: 'bounce 1s infinite'
          }}
        >
          <span className="text-white text-xs font-bold">
            {count > 99 ? '99+' : count}
          </span>
        </div>
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full opacity-75"
          style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        ></div>
      </div>
    );
  };

  // Enhanced warning icon for main menu item
  const LeaveWarningIcon = ({ count, isLoading = false }) => {
    if (count === 0 && !isLoading) return null;

    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <AlertTriangle 
            className={`h-4 w-4 ${isLoading ? 'animate-pulse text-orange-500' : 'text-red-500'}`}
            style={!isLoading ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}}
          />
          {!isLoading && count > 0 && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {count > 9 ? '9+' : count}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced sidebar items with notification support
  const sidebarItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/overall/'
    },
    {
      id: 'group',
      title: 'Companies',
      icon: <Grid className="h-5 w-5" />,
      subItems: [
        { id: 'companies-all', title: 'View Companies', path: '/overall/companies' },
        { id: 'departments-all', title: 'View Departments', path: '/overall/departments' }
      ]
    },
    {
      id: 'Level',
      title: 'Level Management',
      icon: <TrendingUp className="h-5 w-5" />,
      subItems: [
        { id: 'Manage Level', title: 'Manage Level', path: '/overall/management-page' },
      ]
    },
    {
      id: 'users',
      title: 'Manage Users',
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { id: 'users-all', title: 'View Users', path: '/overall/manage-users' },
      ]
    },
    {
      id: 'Team',
      title: 'Team Management',
      icon: <UsersRound className="h-5 w-5" />,
      subItems: [
        { id: 'Manage Team', title: 'View Teams', path: '/overall/teams' },
      ]
    },
    {
      id: 'Task',
      title: 'Task Management',
      icon: <CheckSquare className="h-5 w-5" />,
      subItems: [
        {id: 'Task dashboard', title: 'Task Dashboard', path: '/overall/tasks'},
        { id: 'Create Task', title: 'Create Task', path: '/overall/tasks/create' },
        { id: 'Further Review Tasks', title: 'Further Review Tasks', path: '/overall/further-review-tasks' },
        { id: 'Review Task', title: 'Review Task', path: '/overall/teams-tasks' },
        { id: 'Shifted Tasks', title: 'Shifted Tasks', path: '/overall/shifted-task' },
        { id: 'submitted-tasks', title: 'Submitted Tasks', path: '/overall/submitted-task' },
      ]
    },
    {
      id: 'Leave Request',
      title: 'Leave Management',
      icon: <Calendar className="h-5 w-5" />,
      subItems: [
        { id: 'Create Leave', title: 'Create Leave', path: '/overall/create-leave' },
        { 
          id: "Requested leave", 
          title: "Leaves Need Review", 
          path: "/overall/leaves",
          hasNotification: pendingLeavesCount > 0,
          notificationCount: pendingLeavesCount
        },
        { id: 'My Leaves', title: 'My Leaves', path: '/overall/leaves' },
        { id: 'Approved Leaves', title: 'Approved Leaves', path: '/overall/approved-leaves' },
      ]
    },
    {
      id: 'Report',
      title: 'Reports',
      icon: <BarChart2 className="h-5 w-5" />,
      subItems: [
        { id: 'UserReport', title: 'User Report', path: '/overall/user/report', icon: <FileText className="h-4 w-4" /> },
      ]
    },
    {
      id: 'Profile',
      title: 'My Profile',
      icon: <User className="h-5 w-5" />,
      subItems: [
        { id: 'My Profile', title: 'My Profile', path: '/overall/profile' }
      ]
    },
  ];

  const toggleExpand = (itemId) => {
    // If the item is already expanded, close it
    // Otherwise, expand this item (which automatically closes any other)
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const renderSidebarItem = (item) => {
    const isExpanded = expandedItemId === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isLeaveManagement = item.id === 'Leave Request';
    
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
            hover:shadow-sm relative
            ${isExpanded 
              ? 'bg-slate-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold border-l-4 border-emerald-500' 
              : 'text-gray-700 dark:text-gray-200 font-medium'
            }`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`transition-colors duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-emerald-500' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-500'
            }`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-[0.95rem] transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.title}
                </span>
                {isLeaveManagement && (
                  <LeaveWarningIcon 
                    count={pendingLeavesCount} 
                    isLoading={isLoadingLeaves}
                  />
                )}
              </div>
            )}
          </div>
          {hasSubItems && !isCollapsed && (
            <div className={`transition-all duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-emerald-500 rotate-0' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-500'
            }`}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
          {isCollapsed && isLeaveManagement && pendingLeavesCount > 0 && (
            <div className="absolute -top-1 -right-1">
              <NotificationBadge count={pendingLeavesCount} isLoading={isLoadingLeaves} />
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="pl-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.subItems?.map(subItem => (
              <Link
                key={subItem.id}
                to={subItem.path || '#'}
                className="flex items-center justify-between py-2 px-3 rounded-lg 
                  transition-all duration-200 ease-in-out
                  hover:bg-slate-50 dark:hover:bg-gray-600
                  text-gray-600 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white
                  hover:shadow-sm hover:translate-x-1
                  text-sm font-medium
                  border-l-2 border-transparent hover:border-emerald-300"
                onClick={closeSidebar} // Close sidebar on mobile after navigation
              >
                <span>{subItem.title}</span>
                {subItem.hasNotification && subItem.notificationCount > 0 && (
                  <NotificationBadge 
                    count={subItem.notificationCount}
                    isLoading={isLoadingLeaves}
                  />
                )}
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
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 dark:text-white text-lg">Overall</span>
              {pendingLeavesCount > 0 && (
                <span 
                  className="text-xs text-red-500 font-medium"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                >
                  {pendingLeavesCount} pending review{pendingLeavesCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
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

      {/* Enhanced Footer section with notification summary */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-2">
            {pendingLeavesCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    {pendingLeavesCount} leave{pendingLeavesCount !== 1 ? 's' : ''} need{pendingLeavesCount === 1 ? 's' : ''} attention
                  </span>
                </div>
              </div>
            )}
   
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {pendingLeavesCount > 0 && (
              <NotificationBadge count={pendingLeavesCount} isLoading={isLoadingLeaves} />
            )}
            <div 
              className="w-2 h-2 bg-emerald-500 rounded-full"
              style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            ></div>
          </div>
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
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default OverAllDashSidebar;