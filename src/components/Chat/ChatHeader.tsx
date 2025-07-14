import React from "react"
import { MoreHorizontal, Phone, Video, Briefcase, UserCheck, UserX, Clock } from "lucide-react"
import type { Conversation } from "./chatSlice"

interface ChatHeaderProps {
  conversation: Conversation | undefined
  onlineUsers: number[]
  currentUserId: number
  taskContext?: TaskChatContext | null
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onlineUsers, currentUserId, taskContext }) => {
  const displayUser =
    conversation?.otherUser ||
    (taskContext
      ? {
          id: taskContext.userId,
          name: taskContext.userName,
          profilePictureUrl: null,
        }
      : null)

  const displayTask =
    conversation?.task ||
    (taskContext
      ? {
          id: taskContext.taskId,
          title: taskContext.taskTitle,
        }
      : null)

  if (!displayUser) return null

  const isOnline = onlineUsers.includes(displayUser.id)

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center flex-1 min-w-0">
        {/* Enhanced Avatar with modern styling */}
        <div className="relative mr-4 group">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 overflow-hidden">
              {displayUser.profilePictureUrl ? (
                <img
                  src={displayUser.profilePictureUrl || "/placeholder.svg"}
                  alt={displayUser.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span className="text-lg font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {displayUser.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {/* Enhanced online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-3 border-white dark:border-gray-800 shadow-lg">
            <div className={`h-full w-full rounded-full ${
              isOnline 
                ? "bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg shadow-green-400/50" 
                : "bg-gradient-to-r from-gray-400 to-gray-500"
            }`}></div>
          </div>
        </div>

        {/* Enhanced user info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">
              {displayUser.name}
            </h3>
            
            {/* Enhanced task badge */}
            {displayTask && (
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full flex items-center text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Briefcase className="h-3 w-3 mr-1.5 drop-shadow-sm" />
                <span className="truncate max-w-[120px] drop-shadow-sm" title={displayTask.title}>
                  {displayTask.title}
                </span>
              </div>
            )}
          </div>
          
          {/* Enhanced status line */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <UserCheck className="h-4 w-4 text-green-500 drop-shadow-sm" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Online
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {conversation ? "Offline" : "Starting conversation..."}
                  </span>
                </>
              )}
            </div>
            
            {displayTask && (
              <div className="h-1 w-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            )}
            
            {displayTask && (
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full font-medium">
                Task #{displayTask.id}
              </span>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}

export default ChatHeader