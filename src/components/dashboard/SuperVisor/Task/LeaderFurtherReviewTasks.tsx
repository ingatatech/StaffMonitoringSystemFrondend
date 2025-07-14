// @ts-nocheck

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import {
  fetchFurtherReviewTasks,
  selectFurtherReviewTasks,
  selectFurtherReviewTasksLoading,
  selectFurtherReviewTasksError,
  setSelectedTask,
  FurtherReviewTask,
} from "../../../../Redux/Slices/TaskReviewSlice";
import { formatDate } from "../../../../utilis/dateUtils";
import {
  Search, Filter, List, Grid, CheckCircle, AlertCircle, Clock, Eye, EyeOff,
  MessageSquare, ChevronDown, ChevronRight, Users, Briefcase, FileText,
  Calendar, ArrowRight, RefreshCw, User, BarChart2, Building2, Activity
} from 'lucide-react';
import ViewTaskModal from "./ViewTaskModal";
import { FaComments, FaTimes, FaUser, FaCheck, FaHistory, FaExchangeAlt, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../../../ui/Badge";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import TaskReviewModal from "./TaskReviewModal";
import { truncateWords } from "../../../../utilis/stringUtils";
import EmptyState from "../../../ui/EmptyState";
import LoadingSpinner from "../../../ui/Loader";
import { toggleChat } from "../../../Chat/chatSlice";

interface Comment {
  text: string;
  user_id: number;
  timestamp: string;
  user_name: string;
}

const CommentsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  taskTitle: string
}> = ({ isOpen, onClose, comments, taskTitle }) => {
  if (!isOpen) return null

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaComments className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Task Comments</h2>
                    <p className="text-blue-100 text-sm truncate max-w-md">{taskTitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Comments Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white p-2 rounded-full flex-shrink-0">
                          <FaUser className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">{comment.user_name}</h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FaComments className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
                  <p className="text-gray-500">No comments have been added to this task.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {comments?.length || 0} comment
                  {comments?.length !== 1 ? "s" : ""}
                </span>
                <Button onClick={onClose} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const EnhancedHeader: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-2 mt-5"
            >
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <BarChart2 className="text-white text-xl" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800">
                Tasks For Further Review
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 text-sm ml-1"
            >
              Review tasks that have been forwarded to you for additional assessment
            </motion.p>
          </div>
        </div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onRefresh}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Tasks
            </Button>
          </motion.div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Review status tracking
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const EnhancedFilters: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onSortOrderChange: () => void;
  viewMode: string;
  onViewModeChange: (mode: 'list' | 'grid') => void;
}> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  viewMode,
  onViewModeChange
}) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Filter className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Filter & Search</h3>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex-1"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search tasks, descriptions, users..."
                    className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => onSearchChange("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Controls Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center gap-3 flex-wrap"
              >
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button
                    onClick={() => onViewModeChange("list")}
                    className={`p-2.5 transition-all duration-200 ${viewMode === "list"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "bg-white text-gray-500 hover:text-gray-700"
                      }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange("grid")}
                    className={`p-2.5 transition-all duration-200 ${viewMode === "grid"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "bg-white text-gray-500 hover:text-gray-700"
                      }`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

const LeaderFurtherReviewTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const furtherReviewTasks = useAppSelector(selectFurtherReviewTasks);
  const loading = useAppSelector(selectFurtherReviewTasksLoading);
  const error = useAppSelector(selectFurtherReviewTasksError);
  const user = useAppSelector((state: { login: { user: any } }) => state.login.user);
  const conversations = useAppSelector((state) => state.chat.conversations);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);

  // Local state
  const [localSearch, setLocalSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState<FurtherReviewTask | null>(null);
  // Comments modal state
  const [selectedTaskComments, setSelectedTaskComments] = useState<{
    comments: Comment[];
    taskTitle: string;
  } | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFurtherReviewTasks(user.id));
    }
  }, [dispatch, user?.id]);

  // Handle refresh
  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchFurtherReviewTasks(user.id));
    }
  };

  // Enhanced task selection handler for review
  const handleSelectTask = (task: FurtherReviewTask) => {
    dispatch(setSelectedTask(task as any));
    setSelectedTaskId(task.id);
    setIsReviewModalOpen(true);
  };

  // Handle sort
  const handleSort = (value: string) => {
    setSortBy(value as "date" | "name" | "status");
    setCurrentPage(1);
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  // Handle comments modal
  const handleOpenComments = (task: FurtherReviewTask) => {
    setSelectedTaskComments({
      comments: (task.comments || []).map((comment: any) => ({
        ...comment,
        timestamp: typeof comment.timestamp === "string" ? comment.timestamp : comment.timestamp?.toISOString?.() || "",
      })),
      taskTitle: task.title,
    });
    setIsCommentsModalOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsModalOpen(false);
    setSelectedTaskComments(null);
  };
  const handleViewTask = (task: FurtherReviewTask) => {
    setSelectedTaskForView(task);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTaskForView(null);
  };
  // Handle task chat
  const handleOpenTaskChat = (task: FurtherReviewTask, userId: number, userName: string) => {
    localStorage.setItem(
      "taskChatContext",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        userId: userId,
        userName: userName,
        autoOpen: true,
      }),
    );

    const existingConversations = conversations.filter((conv: any) => conv.otherUser.id === userId);



    dispatch(toggleChat());
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = furtherReviewTasks;
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = furtherReviewTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.createdBy?.username.toLowerCase().includes(searchLower) ||
          task.department?.toLowerCase().includes(searchLower)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [furtherReviewTasks, localSearch, sortBy, sortOrder]);

  // Pagination calculations
  const totalTasks = filteredAndSortedTasks.length;
  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Rejected</span>
          </div>
        );
      case "further_review":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <ArrowRight className="h-3 w-3 mr-1" />
            <span>Further Review</span>
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            <span>Pending</span>
          </div>
        );
      case "completed":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Completed</span>
          </div>
        );
      case "in_progress":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            <span>In Progress</span>
          </div>
        );
      case "delayed":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Delayed</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
            <span>{status || "Unknown"}</span>
          </div>
        );
    }
  };

  // Pagination Controls Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 px-6 py-4 border-t border-gray-200"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(endIndex, totalTasks)}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalTasks}</span> results
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  ) : (
                    <Button
                      onClick={() => setCurrentPage(page as number)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`text-sm min-w-[36px] ${currentPage === page
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : ""
                        }`}
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12 text-red-500" />}
        title="Error loading tasks"
        description={error}
        action={
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* Enhanced Header */}
      <EnhancedHeader onRefresh={handleRefresh} />

      {/* Enhanced Filters */}
      <EnhancedFilters
        searchTerm={localSearch}
        onSearchChange={setLocalSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSort}
        onSortOrderChange={handleSortOrderChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* No tasks found message */}
      {filteredAndSortedTasks.length === 0 && (
        <EmptyState
          icon={<Filter className="h-12 w-12 text-gray-300" />}
          title="No tasks found"
          description="There are no tasks forwarded to you for further review."
          action={
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          }
        />
      )}

      {/* Enhanced Smart Table */}
      {filteredAndSortedTasks.length > 0 && viewMode === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-[11px] font-bold text-gray-600">#</span>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[200px]">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Task Title</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[120px] hidden lg:table-cell">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <User className="w-3.5 h-3.5 text-green-500" />
                      <span>Submitted By</span>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left min-w-[120px] hidden xl:table-cell">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[100px]">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left min-w-[180px]">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 uppercase text-[11px] tracking-wider">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-md">
                        {startIndex + index + 1}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-gray-900 leading-tight text-[13px] truncate max-w-[180px]"
                              title={task.title}
                            >
                              {task.title}
                            </h3>

                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span
                          className="text-[13px] text-gray-700 font-medium truncate max-w-[130px]"
                          title={`${task.createdBy?.firstName} ${task.createdBy?.lastName}`}
                        >
                          {task.createdBy?.firstName} {task.createdBy?.lastName}
                        </span>
                      </div>
                    </td>



                    <td className="px-4 py-4 hidden xl:table-cell">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-900 text-[13px]">
                          {new Date(task.submittedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {new Date(task.submittedDate).toLocaleDateString("en-US", { weekday: "long" })}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {getStatusBadge(task.status)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Review Button */}
   
                        <button
                          onClick={() => handleViewTask(task)}
                          className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="View task details"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="ml-1 hidden sm:inline">Details</span>
                        </button>

                        {/* Review Button */}
                        <button
                          onClick={() => handleSelectTask(task)}
                          className={`inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md ${task.reviewed
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          title={task.reviewed ? "Already reviewed" : "Review task"}
                        >
                          {task.reviewed ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span className="ml-1 hidden sm:inline">Reviewed</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span className="ml-1 hidden sm:inline">Review</span>
                            </>
                          )}
                        </button>
                        {/* Chat Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTaskChat(task, task.createdBy?.id, task.createdBy?.username);
                          }}
                          className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Chat about task"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span className="ml-1 hidden sm:inline">Chat</span>
                        </button>

                        {/* Comments Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenComments(task);
                                }}
                                className="flex items-center px-1.5 py-1 text-[10px] font-medium rounded bg-purple-600 text-white hover:bg-purple-700 transition duration-150 shadow relative"
                                title="View task comments"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span className="hidden sm:inline ml-0.5">Message</span>
                                {task.comments && task.comments.length > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">
                                    {task.comments.length}
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-gray-800 text-xs">
                              <p>
                                {task.comments && task.comments.length > 0
                                  ? `View ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""}`
                                  : "No comments"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination Controls */}
          <PaginationControls />
        </motion.div>
      )}

      {/* Enhanced Tasks Grid */}
      {filteredAndSortedTasks.length > 0 && viewMode === "grid" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{task.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {task.createdBy?.firstName} {task.createdBy?.lastName}
                      </span>
                    </div>

                    {task.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{task.department}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {formatDate(task.submittedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Review Comment:</span>
                    <p className="text-sm text-gray-700">{task.reviewComment || "No comment provided"}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      {/* Comments Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenComments(task);
                              }}
                              size="sm"
                              className="bg-purple-500 text-white hover:bg-purple-600 p-2 relative"
                              title="View task comments"
                            >
                              <FaComments className="h-3 w-3" />
                              {task.comments && task.comments.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                                  {task.comments.length}
                                </span>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {task.comments && task.comments.length > 0
                                ? `View ${task.comments.length} comment${task.comments.length !== 1 ? "s" : ""
                                }`
                                : "No comments"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Chat Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTaskChat(task, task.createdBy?.id, task.createdBy?.username);
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-lg flex items-center bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        title="Chat about task"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </button>
                    </div>

                    {/* Review Button */}
                    <button
                      onClick={() => handleSelectTask(task)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition-colors ${task.reviewed
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      title={task.reviewed ? "Already reviewed" : "Review task"}
                    >
                      {task.reviewed ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Reviewed
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination for Grid View */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <PaginationControls />
            </motion.div>
          )}
        </div>
      )}
      {selectedTaskForView && (
        <ViewTaskModal
          task={selectedTaskForView}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />
      )}
      {/* Task Review Modal */}
      {isReviewModalOpen && (
        <TaskReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedTaskId(null);
          }}
          supervisorId={user?.id || null}
        />
      )}

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseComments}
        comments={selectedTaskComments?.comments || []}
        taskTitle={selectedTaskComments?.taskTitle || ""}
      />
    </div>
  );
};

export default LeaderFurtherReviewTasks;