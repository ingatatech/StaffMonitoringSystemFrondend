// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import {
  fetchUsers,
  fetchConversations,
  fetchMessages,
  selectConversation,
  toggleChat,
  resetChat,
  pinMessage,
  archiveConversation,
} from "./chatSlice"
import { initializeSocket, disconnectSocket, joinConversation } from "../../services/socketService"
import ChatSidebar from "./ChatSidebar"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import ChatHeader from "./ChatHeader"
import MediaGallery from "./MediaGallery"
import SearchMessages from "./SearchMessages"
import { X, Minimize2, Maximize2, MessageSquare, Loader, Search, ImageIcon, Moon, Sun, Sparkles, Palette } from "lucide-react"
import { socket } from "../../services/socketService"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface ChatProps {
  userId: number
  organizationId: number
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const Chat: React.FC<ChatProps> = ({ userId, organizationId }) => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.chat?.isOpen) || false
  const selectedConversation = useAppSelector((state) => state.chat?.selectedConversation) || null
  const conversations = useAppSelector((state) => state.chat?.conversations) || []
  const users = useAppSelector((state) => state.chat?.users) || []
  const loading = useAppSelector((state) => state.chat?.loading) || false
  const messagesLoading = useAppSelector((state) => state.chat?.messagesLoading) || false
  const pinnedMessages = useAppSelector((state) => state.chat?.pinnedMessages) || []
  const archivedConversations = useAppSelector((state) => state.chat?.archivedConversations) || []
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers) || []
  const currentUser = useAppSelector((state) => state.login.user)

  const [taskChatContext, setTaskChatContext] = useState<TaskChatContext | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatDarkMode") === "true"
    }
    return false
  })
  const [showGallery, setShowGallery] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [wallpaper, setWallpaper] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatWallpaper") || "default"
    }
    return "default"
  })
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatFontSize") || "medium"
    }
    return "medium"
  })
  const [showThemePanel, setShowThemePanel] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const selectedConversationData = conversations.find((c) => c.id === selectedConversation)

  // Enhanced task context handling - NO auto-join, only load context
  useEffect(() => {
    if (isOpen) {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          const context: TaskChatContext = JSON.parse(taskChatContextStr)
          setTaskChatContext(context)


          if (conversations.length > 0 && context.autoOpen) {
            checkForExistingTaskConversation(context)
          }
        } catch (error) {
          localStorage.removeItem("taskChatContext")
        }
      }
    }
  }, [isOpen, conversations.length, dispatch, userId])

  const checkForExistingTaskConversation = async (context: TaskChatContext) => {
    try {
      const existingConversations = conversations.filter((c) => c.otherUser.id === context.userId)
      const taskConversation = existingConversations.find((c) => c.task?.id === context.taskId)

      if (taskConversation) {
        dispatch(selectConversation(taskConversation.id))
        try {
          await joinConversation(taskConversation.id)
          dispatch(fetchMessages({ conversationId: taskConversation.id, userId }))
          showSuccessToast(`Opened chat for task: ${context.taskTitle}`)
        } catch (error) {
        }
      } else {
        const generalConversation = existingConversations.find((c) => !c.task || c.task.id !== context.taskId)
        if (generalConversation) {

          dispatch(selectConversation(generalConversation.id))
          try {
            await joinConversation(generalConversation.id)
            dispatch(fetchMessages({ conversationId: generalConversation.id, userId }))
            showSuccessToast(`Opened chat with ${context.userName} for task: ${context.taskTitle}`)
          } catch (error) {
          }
        }
      }

      localStorage.setItem("taskChatContext", JSON.stringify({ ...context, autoOpen: false }))
    } catch (error) {
    }
  }

  const handleClearTaskContext = () => {
    setTaskChatContext(null)
    localStorage.removeItem("taskChatContext")
  }

  useEffect(() => {
    if (isOpen) {
      if (!socket.connected) {
        initializeSocket(userId, organizationId)
        setTimeout(() => {
          if (socket.connected) {
          } 
        }, 1000)
      }

      dispatch(fetchUsers(organizationId))
      dispatch(fetchConversations({ userId, organizationId }))

      return () => {
        disconnectSocket()
        dispatch(resetChat())
      }
    }
  }, [dispatch, userId, organizationId, isOpen])

  useEffect(() => {
    return () => {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          const context = JSON.parse(taskChatContextStr)
          if (!context.autoOpen) {
            localStorage.removeItem("taskChatContext")
          }
        } catch (error) {
          localStorage.removeItem("taskChatContext")
        }
      }
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      if (!socket.connected) {
        initializeSocket(userId, organizationId)
        const timer = setTimeout(() => {
          if (socket.connected) {
            joinConversation(selectedConversation)
              .then(() => {
                dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
              })
              .catch((error) => {
                showErrorToast("Failed to join conversation. Retrying...")
                setTimeout(() => {
                  joinConversation(selectedConversation)
                    .then(() => {
                      dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
                    })
                    .catch((retryError) => {
                      showErrorToast("Failed to join conversation. Please refresh the page.")
                    })
                }, 2000)
              })
          } else {
            showErrorToast("Failed to connect to chat server. Please refresh the page.")
          }
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        joinConversation(selectedConversation)
          .then(() => {
            dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
          })
          .catch((error) => {
            showErrorToast("Failed to join conversation. Retrying...")
            setTimeout(() => {
              joinConversation(selectedConversation)
                .then(() => {
                  dispatch(fetchMessages({ conversationId: selectedConversation, userId }))
                })
                .catch((retryError) => {
                  showErrorToast("Failed to join conversation. Please refresh the page.")
                })
            }, 2000)
          })
      }
    }
  }, [dispatch, selectedConversation, userId, organizationId])

  useEffect(() => {
    localStorage.setItem("chatDarkMode", darkMode.toString())
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("chatWallpaper", wallpaper)
  }, [wallpaper])

  useEffect(() => {
    localStorage.setItem("chatFontSize", fontSize)
  }, [fontSize])

  const handleClose = () => {
    dispatch(toggleChat())
  }

  const handleMinimize = () => {
    setMinimized(!minimized)
  }

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const getWallpaperStyle = () => {
    switch (wallpaper) {
      case "gradient-blue":
        return "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950"
      case "gradient-green":
        return "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950"
      case "gradient-purple":
        return "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950"
      case "gradient-cosmic":
        return "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900"
      case "solid-light":
        return "bg-gray-50 dark:bg-gray-900"
      default:
        return "bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm"
      case "large":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  const toggleShowSearch = () => {
    setShowSearch(!showSearch)
  }

  const toggleShowGallery = () => {
    setShowGallery(!showGallery)
  }

  const wallpaperOptions = [
    { key: "default", name: "Default", class: "bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30" },
    { key: "gradient-blue", name: "Ocean", class: "bg-gradient-to-br from-blue-50 to-indigo-100" },
    { key: "gradient-green", name: "Forest", class: "bg-gradient-to-br from-green-50 to-emerald-100" },
    { key: "gradient-purple", name: "Sunset", class: "bg-gradient-to-br from-purple-50 to-pink-100" },
    { key: "gradient-cosmic", name: "Cosmic", class: "bg-gradient-to-br from-indigo-100 to-purple-100" },
    { key: "solid-light", name: "Clean", class: "bg-gray-50" },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md transition-all duration-500">
      <div
        ref={chatContainerRef}
        className={`relative flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden ${
          minimized ? "w-80 h-20" : "w-[95%] h-[95%] md:w-[93%] md:h-[95%] lg:w-[95%] lg:h-[98%]"
        } ${getFontSizeClass()}`}
        style={{ 
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Enhanced Chat Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-white/80 via-gray-50/80 to-white/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          {selectedConversation || taskChatContext ? (
            <ChatHeader
              conversation={selectedConversationData}
              onlineUsers={onlineUsers}
              currentUserId={userId}
              taskContext={taskChatContext}
            />
          ) : (
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <MessageSquare className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text">
                  Messages
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay connected with your team</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {!minimized && (
              <>
                {/* Enhanced theme panel toggle */}
                <button
                  onClick={() => setShowThemePanel(!showThemePanel)}
                  className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl group"
                  aria-label="Theme options"
                >
                  <Palette size={18} />
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl group"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                
                {selectedConversation && (
                  <>
                    <button
                      onClick={toggleShowSearch}
                      className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                      aria-label="Search messages"
                    >
                      <Search size={18} />
                    </button>
                    <button
                      onClick={toggleShowGallery}
                      className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                      aria-label="Media gallery"
                    >
                      <ImageIcon size={18} />
                    </button>
                  </>
                )}
              </>
            )}
            
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <button
              onClick={handleMinimize}
              className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label={minimized ? "Maximize chat" : "Minimize chat"}
            >
              {minimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            
            <button
              onClick={handleClose}
              className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Enhanced Theme Panel */}
        {!minimized && showThemePanel && (
          <div className="absolute top-20 right-6 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 min-w-[300px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">Customize Chat</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Wallpaper</label>
                <div className="grid grid-cols-3 gap-2">
                  {wallpaperOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setWallpaper(option.key)}
                      className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${option.class} ${
                        wallpaper === option.key 
                          ? "border-blue-500 shadow-lg" 
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      title={option.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Font Size</label>
                <div className="flex space-x-2">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        fontSize === size
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!minimized && (
          <div className="flex flex-1 overflow-hidden">
            <ChatSidebar
              conversations={conversations}
              archivedConversations={archivedConversations}
              users={users}
              selectedConversation={selectedConversation}
              onSelectConversation={(conversationId) => {
                dispatch(selectConversation(conversationId))
                dispatch(fetchMessages({ conversationId, userId }))
              }}
              currentUserId={userId}
              onArchiveConversation={(conversationId) => {
                dispatch(archiveConversation(conversationId))
              }}
              taskContext={taskChatContext}
            />

            {/* Enhanced Main Chat Area */}
            <div className={`flex-1 flex flex-col ${getWallpaperStyle()} relative overflow-hidden`}>
              {/* Enhanced loading state */}
              {loading && !selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-indigo-400/5 to-purple-400/5 animate-pulse"></div>
                  <div className="relative">
                    <div className="w-20 h-20 relative">
                      <div className="w-full h-full border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-full h-full border-4 border-transparent border-r-purple-400 rounded-full animate-spin" 
                           style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <div className="absolute inset-4 w-12 h-12 border-2 border-indigo-300 dark:border-indigo-600 border-b-indigo-600 dark:border-b-indigo-400 rounded-full animate-spin" 
                           style={{ animationDuration: '2s' }}></div>
                    </div>
                  </div>
                  <div className="mt-8 text-center relative">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Loading conversations...
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                      Preparing your chat workspace with the latest conversations
                    </p>
                    <div className="mt-4 flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  </div>
                </div>
              ) : selectedConversation ? (
                <>
                  {showSearch && <SearchMessages conversationId={selectedConversation} onClose={toggleShowSearch} />}
                  {showGallery && <MediaGallery conversationId={selectedConversation} onClose={toggleShowGallery} />}
                  {pinnedMessages.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 p-4 border-b border-yellow-200 dark:border-yellow-800 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-yellow-500 rounded-lg shadow-lg">
                            <Pin className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                            {pinnedMessages.length} Pinned Message{pinnedMessages.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium px-3 py-1 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-all duration-200"
                          onClick={() => {
                            /* Toggle pinned messages view */
                          }}
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  )}
                  <ChatMessages
                    conversationId={selectedConversation}
                    currentUserId={userId}
                    onPinMessage={(messageId) => dispatch(pinMessage(messageId))}
                    taskContext={taskChatContext}
                  />
                  <ChatInput
                    conversationId={selectedConversation}
                    receiverId={selectedConversationData?.otherUser.id || 0}
                    taskContext={taskChatContext}
                    onClearTaskContext={handleClearTaskContext}
                  />
                </>
              ) : taskChatContext ? (
                <div className="flex-1 flex flex-col">
                  <ChatMessages
                    conversationId=""
                    currentUserId={userId}
                    onPinMessage={(messageId) => dispatch(pinMessage(messageId))}
                    taskContext={taskChatContext}
                    users={users}
                    dispatch={dispatch}
                    currentUser={currentUser}
                  />
                  <ChatInput
                    conversationId=""
                    receiverId={taskChatContext.userId}
                    taskContext={taskChatContext}
                    onClearTaskContext={handleClearTaskContext}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-indigo-400/5 to-purple-400/5 animate-pulse"></div>
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                      <MessageSquare className="h-16 w-16 text-blue-600 dark:text-blue-400 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <div className="mt-8 space-y-4 relative">
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome to Chat
                      </span>
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                      Select a conversation from the sidebar or start a new chat to begin messaging
                    </p>
                    <div className="mt-6 flex justify-center space-x-3">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-lg">
                        🚀 Ready to connect
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg">
                        💬 Start chatting
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat