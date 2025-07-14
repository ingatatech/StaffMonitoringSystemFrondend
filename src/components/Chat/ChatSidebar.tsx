"use client"

import React from "react"
import { useState } from "react"
import {
  Search,
  MessageSquare,
  Loader,
  Archive,
  Filter,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Users,
  MessageCircle,
  UserPlus,
  User,
  Star,
  Clock,
  Zap,
  Hash,
  Mail,
  Phone,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react"
import { addNewConversation, type Conversation, type User as UserType } from "./chatSlice"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import { createConversation } from "../../services/socketService"
import { motion, AnimatePresence } from "framer-motion"

interface ChatSidebarProps {
  conversations: Conversation[]
  archivedConversations: Conversation[]
  users: UserType[]
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  currentUserId: number
  onArchiveConversation: (conversationId: string) => void
  taskContext?: any | null
}

type TabType = "conversations" | "contacts" 

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  archivedConversations,
  users,
  selectedConversation,
  onSelectConversation,
  currentUserId,
  taskContext,
}) => {
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("contacts")
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "unread" | "tasks" | "archived">("all")
  const [showOrgUsers, setShowOrgUsers] = useState(false)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const { usersLoading, teamMembers, organizationUsers } = useAppSelector((state) => state.chat)
  const onlineUsers = useAppSelector((state) => state.chat?.onlineUsers || [])

  // Enhanced conversation grouping with animation support
  const groupedConversations = conversations.reduce(
    (acc, conversation) => {
      const userId = conversation.otherUser.id

      if (acc[userId]) {
        if (new Date(conversation.lastMessage.created_at) > new Date(acc[userId].lastMessage.created_at)) {
          acc[userId] = conversation
        }

        if (conversation.task && !acc[userId].task) {
          acc[userId].task = conversation.task
        }

        acc[userId].unreadCount += conversation.unreadCount
      } else {
        acc[userId] = { ...conversation }
      }

      return acc
    },
    {} as Record<number, Conversation>,
  )

  const consolidatedConversations = Object.values(groupedConversations)

const filteredTeamMembers = React.useMemo(() =>
  teamMembers.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ),
  [teamMembers, searchTerm, currentUserId]
)

const currentUserInTeam = teamMembers.find((user) => user.id === currentUserId)

const filteredOrgUsers = React.useMemo(() => 
  organizationUsers.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ),
  [organizationUsers, searchTerm, currentUserId]
)

const filteredConversations = React.useMemo(() => 
  consolidatedConversations.filter((conv) => {
    const matchesSearch =
      searchTerm === "" ||
      conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.task?.title && conv.task.title.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    switch (filterType) {
      case "unread":
        return conv.unreadCount > 0
      case "tasks":
        return !!conv.task || !!conv.dailyTask
      case "archived":
        return archivedConversations.some(ac => ac.id === conv.id)
      default:
        return true
    }
  }),
  [consolidatedConversations, searchTerm, filterType, archivedConversations]
)


  const userConversationMap = React.useMemo(() => 
    conversations.reduce(
      (map, conv) => {
        const userId = conv.otherUser.id
        if (!map[userId] || new Date(conv.lastMessage.created_at) > new Date(map[userId].lastMessage.created_at)) {
          map[userId] = conv
        }
        return map
      },
      {} as Record<number, Conversation>,
    ),
    [conversations]
  )

  const handleStartChat = async (receiverId: number) => {
    try {
      const existingConversations = conversations.filter((conv) => conv.otherUser.id === receiverId)
      let conversationId = null

      if (existingConversations.length > 0) {
        const mostRecentConv = existingConversations.sort(
          (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
        )[0]

        conversationId = mostRecentConv.id
      } else {
        const receiver = [...teamMembers, ...organizationUsers].find((user) => user.id === receiverId)
        const result = (await createConversation(receiverId, "Hello! Let's chat.")) as any

        if (result && result.conversationId && receiver) {
          conversationId = result.conversationId

          dispatch(
            addNewConversation({
              conversationId: result.conversationId,
              sender: { id: currentUserId, name: "You" },
              receiver,
            }),
          )
        }
      }

      if (conversationId) {
        onSelectConversation(conversationId)
        setActiveTab("conversations")
      }
    } catch (error) {
     
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString()
  }

  const renderUserItem = (user: UserType, showLastMessage = false) => {
    const conversation = userConversationMap[user.id]
    const hasConversation = !!conversation
    const isOnline = onlineUsers.includes(user.id)
    const isExpanded = expandedUser === user.id

    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`group relative px-4 py-3 flex items-center cursor-pointer transition-all duration-300 rounded-xl mx-2 mb-1 ${
          selectedConversation === conversation?.id 
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg"
            : "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20"
        }`}
        onClick={() => handleStartChat(user.id)}
      >
        <div className="relative mr-4">
          <div className={`h-12 w-12 rounded-full p-0.5 transition-all duration-300 ${
            isOnline 
              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-400/30"
              : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
          }`}>
            <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span className="text-lg font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 bg-green-400 animate-pulse"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user.name}
            </p>
            {hasConversation && showLastMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                {formatLastActive(conversation.lastMessage.created_at)}
              </span>
            )}
          </div>

          {showLastMessage && hasConversation ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                {conversation.lastMessage.sender === currentUserId && "You: "}
                {conversation.lastMessage.content}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="ml-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full px-2 py-0.5 shadow-lg">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
              <span className="truncate flex-1">{user.email}</span>
              {user.role && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
          )}
        </div>

        <button 
          className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setExpandedUser(isExpanded ? null : user.id)
          }}
        >
          <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-14 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                Email User
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Phone className="h-4 w-4 mr-2" />
                Call User
              </button>
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Star className="h-4 w-4 mr-2" />
                Add to Favorites
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="w-full md:w-80 flex flex-col border-r border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
      {/* Enhanced Header with Gradient */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/30 dark:to-indigo-900/30">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Messages</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {activeTab === "conversations" 
            ? `${filteredConversations.length} conversations` 
            : `${filteredTeamMembers.length + filteredOrgUsers.length} contacts`}
        </p>
      </div>

      {/* Enhanced Search and Tabs */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={activeTab === "conversations" ? "Search conversations..." : "Search contacts..."}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-700/80 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Enhanced Tabs with Animation */}
        <div className="flex bg-gray-100/50 dark:bg-gray-800/50 rounded-xl overflow-hidden shadow-inner p-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center rounded-lg transition-all duration-300 ${
              activeTab === "contacts"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            onClick={() => {
              setActiveTab("contacts")
              setExpandedUser(null)
            }}
          >
            <UserPlus size={16} className="mr-2" />
            Contacts
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center rounded-lg transition-all duration-300 ${
              activeTab === "conversations"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            onClick={() => {
              setActiveTab("conversations")
              setExpandedUser(null)
            }}
          >
            <MessageCircle size={16} className="mr-2" />
            Chats
            {filteredConversations.filter(conv => conv.unreadCount > 0).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                {filteredConversations.filter(conv => conv.unreadCount > 0).length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Enhanced Filters with Animation */}
        {activeTab === "conversations" && (
          <div className="mt-4 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span className="font-medium">
                {filterType !== "all" ? `Filtered: ${filterType}` : "Filter"}
              </span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.button>

            {filterType !== "all" && (
              <button 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setFilterType("all")}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <AnimatePresence>
          {activeTab === "conversations" && showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-600/50">
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filterType === "all" 
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setFilterType("all")}
                  >
                    <Hash size={14} className="mr-1" />
                    All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filterType === "unread" 
                        ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setFilterType("unread")}
                  >
                    <Zap size={14} className="mr-1" />
                    Unread
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filterType === "tasks" 
                        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setFilterType("tasks")}
                  >
                    <Briefcase size={14} className="mr-1" />
                    Tasks
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filterType === "archived" 
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setFilterType("archived")}
                  >
                    <Archive size={14} className="mr-1" />
                    Archived
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Loading Indicator */}
      {usersLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
          >
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full ml-1 mt-1"></div>
          </motion.div>
          <span className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
            Loading your {activeTab === "conversations" ? "conversations" : "contacts"}...
          </span>
        </div>
      )}

      {/* Enhanced Content */}
      {!usersLoading && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? (
            <>
              {filteredConversations.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {filterType === "unread" 
                        ? "Unread Messages" 
                        : filterType === "tasks" 
                          ? "Task Conversations" 
                          : filterType === "archived"
                            ? "Archived Chats"
                            : "Recent Conversations"}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-600"></div>
                  </div>
                  
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`group px-4 py-3 flex items-center cursor-pointer transition-all duration-300 mx-2 mb-1 rounded-xl ${
                        selectedConversation === conversation.id 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg"
                          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/50 dark:hover:to-blue-900/20"
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="relative mr-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5 shadow-md">
                          <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {conversation.otherUser.profilePictureUrl ? (
                              <img
                                src={conversation.otherUser.profilePictureUrl}
                                alt={conversation.otherUser.name}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-bold text-white">
                                {conversation.otherUser.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {onlineUsers.includes(conversation.otherUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 bg-green-400 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {conversation.otherUser.name}
                            </p>
                            {conversation.task && (
                              <span className="ml-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                                <Briefcase size={12} className="mr-1" />
                                Task
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                            {formatLastActive(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {conversation.lastMessage.sender === currentUserId && "You: "}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-1 shadow-md">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {searchTerm ? "No matches found" : "No conversations yet"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {searchTerm
                      ? "Try adjusting your search query"
                      : activeTab === "conversations"
                        ? "Start a conversation from the Contacts tab"
                        : "Your team members will appear here"}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-2">
              {/* Team Members Section */}
              <div className="mb-4">
                <div className="px-4 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Team Members
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {filteredTeamMembers.length}
                  </span>
                </div>

                {filteredTeamMembers.length > 0 ? (
                  <div>
                    {filteredTeamMembers.map((user) => renderUserItem(user, true))}
                  </div>
                ) : currentUserInTeam ? (
                  <div className="px-4 py-6 text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5 shadow-md">
                      <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {currentUserInTeam.profilePictureUrl ? (
                          <img
                            src={currentUserInTeam.profilePictureUrl}
                            alt={currentUserInTeam.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {currentUserInTeam.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You're the only team member currently
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No team members found
                    </p>
                  </div>
                )}
              </div>

              {/* Organization Users Section */}
              <div>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setShowOrgUsers(!showOrgUsers)}
                >
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Organization Members
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {filteredOrgUsers.length}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                        showOrgUsers ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {showOrgUsers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {filteredOrgUsers.length > 0 ? (
                        <div>
                          {filteredOrgUsers.map((user) => renderUserItem(user, true))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No organization members found
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatSidebar