// @ts-nocheck

"use client"

import React from "react"
import { useEffect, useRef, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../Redux/hooks"
import {
  Check,
  CheckCheck,
  Copy,
  Reply,
  Pin,
  Forward,
  Trash2,
  SmileIcon as EmojiSmile,
  MessageSquare,
  Loader,
  Briefcase,
  X,
  Download,
  Play,
  Pause,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Eye,
  ExternalLink,
} from "lucide-react"
import type { Message } from "./chatSlice"
import EmojiPicker from "emoji-picker-react"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import { setReplyingTo, clearReplyingTo } from "./chatSlice"

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

interface ChatMessagesProps {
  conversationId: string
  currentUserId: number
  onPinMessage: (messageId: number) => void
  taskContext: TaskChatContext | null
  users?: any[]
  dispatch?: any
  currentUser?: any
}

// First, add the RichTextRenderer component at the top of your file (after the imports)
const RichTextRenderer = ({ content, className = "" }) => {
  const cleanHtml = (html) => {
    if (!html) return ""
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">',
    )
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">',
    )
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')
    return cleaned
  }
  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml(content) }}
      style={{
        lineHeight: "1.5",
        color: "#1f2937",
        fontSize: "0.9rem",
      }}
    />
  )
}



const ChatMessages: React.FC<ChatMessagesProps> = ({
  conversationId,
  currentUserId,
  onPinMessage,
  taskContext,
  users = [],
  dispatch,
  currentUser,
}) => {
  const { messages = [], typingUsers = {}, messagesLoading, replyingTo } = useAppSelector((state) => state.chat) || {}
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null)
  const [messageReactions, setMessageReactions] = useState<Record<number, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<number, string>>({})
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({})
  const [videoPreviews, setVideoPreviews] = useState<Record<string, boolean>>({})
  const [imageZoom, setImageZoom] = useState<string | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const dispatchRedux = useAppDispatch()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // AUTO-CREATE CONVERSATION WHEN TASK CONTEXT EXISTS BUT NO CONVERSATION ID
  useEffect(() => {
    if (!conversationId && taskContext && users.length > 0 && dispatch && currentUser && !isCreatingConversation) {
      autoCreateTaskConversation()
    }
  }, [conversationId, taskContext, users.length, dispatch, currentUser, isCreatingConversation])

  const autoCreateTaskConversation = async () => {
    if (isCreatingConversation) return

    setIsCreatingConversation(true)

    try {
      const receiverFromUsers = users.find((user) => user.id === taskContext?.userId)
      const receiverInfo = receiverFromUsers || {
        id: taskContext?.userId,
        name: taskContext?.userName,
        email: "",
      }

      const { createConversation, joinConversation } = await import("../../services/socketService")
      const { selectConversation, addNewConversation, fetchMessages } = await import("./chatSlice")

      const createPayload = {
        senderId: currentUser?.id,
        receiverId: taskContext?.userId,
        title: `Task: ${taskContext?.taskTitle}`,
        taskId: taskContext?.taskId,
        taskTitle: taskContext?.taskTitle,
      }


      const result = await createConversation(
        taskContext?.userId,
        undefined,
        undefined,
        `Task: ${taskContext?.taskTitle}`,
        taskContext?.taskId,
        taskContext?.taskTitle,
      )


      if (result && result.conversationId) {

        dispatch(
          addNewConversation({
            conversationId: result.conversationId,
            sender: result.sender || { id: currentUser?.id, name: currentUser?.name || "You" },
            receiver: receiverInfo,
            task: {
              id: taskContext?.taskId,
              title: taskContext?.taskTitle,
            },
          }),
        )


        dispatch(selectConversation(result.conversationId))

        try {
          await joinConversation(result.conversationId)

          await new Promise((resolve) => setTimeout(resolve, 500))

          dispatch(fetchMessages({ conversationId: result.conversationId, userId: currentUserId }))

          showSuccessToast(`Ready to chat about task: ${taskContext?.taskTitle}`)
          setIsCreatingConversation(false)
        } catch (joinError) {
          showErrorToast("Created conversation but failed to join. Please try again.")
          setIsCreatingConversation(false)
        }
      } else {
        throw new Error("No conversation ID returned from auto-creation")
      }
    } catch (error) {
      showErrorToast("Failed to prepare task conversation. Please try again.")
      setIsCreatingConversation(false)
    }
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReaction = (messageId: number, emoji: string) => {
    setMessageReactions((prev) => {
      const messageReactions = prev[messageId] || {}
      const currentCount = messageReactions[emoji] || 0

      return {
        ...prev,
        [messageId]: {
          ...messageReactions,
          [emoji]: currentCount + 1,
        },
      }
    })

    setUserReactions((prev) => ({
      ...prev,
      [messageId]: emoji,
    }))

    setShowEmojiPicker(null)
  }

  const renderMessageStatus = (message: Message) => {
    const isCurrentUser = message.sender.id === currentUserId

    if (!isCurrentUser) return null

    return (
      <span className="ml-2 inline-flex items-center">
        {message.isRead ?
          <CheckCheck size={14} className="text-emerald-300 drop-shadow-sm" /> :
          <Check size={14} className="text-white/80 drop-shadow-sm" />
        }
      </span>
    )
  }

  const handleReplyToMessage = (message: Message) => {
    dispatchRedux(setReplyingTo({
      id: message.id,
      content: message.content,
      sender: message.sender,
    }))
    // Scroll to input field
    setTimeout(() => {
      document.getElementById("chat-input")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }


  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} />
    if (type.startsWith('video/')) return <Video size={20} />
    if (type.startsWith('audio/')) return <Music size={20} />
    if (type.includes('pdf')) return <FileText size={20} />
    return <File size={20} />
  }

  const getFileSize = (url: string) => {
    // This would typically come from the API response
    // For now, we'll return a placeholder
    return "Unknown size"
  }

  const renderAttachmentCard = (attachment: any, index: number, isCurrentUser: boolean) => {
    const { url, name, type } = attachment

    if (type === 'image' || type.startsWith('image/')) {
      return (
        <div key={index} className="group relative mb-3 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <img
              src={url || "/placeholder.svg"}
              alt={name}
              className="max-w-full h-auto max-h-80 object-cover cursor-pointer rounded-xl hover:scale-105 transition-transform duration-300"
              onClick={() => setImageZoom(url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-2">
                <button
                  onClick={() => setImageZoom(url)}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  aria-label="View full size"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => window.open(url, '_blank')}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  aria-label="Open in new tab"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
          {name && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium truncate">{name}</p>
            </div>
          )}
        </div>
      )
    }

    if (type === 'video' || type.startsWith('video/')) {
      return (
        <div key={index} className="relative mb-3 rounded-xl overflow-hidden shadow-lg bg-gray-900">
          <video
            src={url}
            controls
            className="max-w-full h-auto max-h-80 rounded-xl"
            poster="/placeholder.svg"
          />
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1 text-white text-xs backdrop-blur-sm">
              <Video size={14} />
              <span>Video</span>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'audio' || type.startsWith('audio/')) {
      return (
        <div key={index} className={`mb-3 p-4 rounded-xl border-2 shadow-lg transition-all duration-300 ${isCurrentUser
            ? 'bg-white/10 border-white/20 backdrop-blur-sm'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
          }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Music size={16} className={isCurrentUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'} />
                <p className={`font-medium text-sm truncate ${isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {name || 'Audio file'}
                </p>
              </div>
              <audio src={url} className="w-full h-8" controls />
            </div>
            <button
              onClick={() => window.open(url, '_blank')}
              className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${isCurrentUser
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'
                }`}
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )
    }

    // Document/File attachment
    return (
      <div key={index} className={`mb-3 p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 group ${isCurrentUser
          ? 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl transition-all duration-300 ${isCurrentUser
              ? 'bg-white/20 text-white group-hover:bg-white/30'
              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50'
            }`}>
            {getFileTypeIcon(type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate mb-1 ${isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
              {name || 'Unknown file'}
            </p>
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded-full ${isCurrentUser
                  ? 'bg-white/20 text-white/80'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                {type.split('/')[1]?.toUpperCase() || 'FILE'}
              </span>
              <span className={`text-xs ${isCurrentUser ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
                {getFileSize(url)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(url, '_blank')}
              className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${isCurrentUser
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                }`}
              aria-label="View file"
            >
              <Eye size={16} />
            </button>
            <a
              href={url}
              download={name}
              className={`p-2 rounded-full hover:scale-110 transition-all duration-200 ${isCurrentUser
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                }`}
              aria-label="Download file"
            >
              <Download size={16} />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const renderMessageActions = (message: Message) => {
    if (selectedMessage !== message.id) return null

    return (
      <div className="absolute flex items-center justify-center bottom-0 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform -translate-y-2 scale-95 group-hover:scale-100 transition-all duration-200">

        <button
          className="p-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/50 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:scale-110"
          onClick={() => handleReplyToMessage(message)}
          aria-label="Reply"
        >
          <Reply size={18} />
        </button>
        <button
          className="p-2.5 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/50 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 hover:scale-110"
          onClick={() => onPinMessage(message.id)}
          aria-label="Pin message"
        >
          <Pin size={18} />
        </button>


      </div>
    )
  }

  const renderTaskBadge = (message: Message) => {
    if (!message.taskId && !message.taskTitle) return null

    return (
      <div className="task-badge bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center shadow-lg">
        <Briefcase size={16} className="mr-2 drop-shadow-sm" />
        <span className="drop-shadow-sm">Task: {message.taskTitle || taskContext?.taskTitle || "Unknown Task"}</span>
        {message.taskId && <span className="text-xs ml-3 opacity-90 bg-white/20 px-2 py-0.5 rounded-full">#{message.taskId}</span>}
      </div>
    )
  }

  const renderReplyIndicator = () => {
    if (!replyingTo) return null

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 border-b border-blue-200 dark:border-blue-700 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
            <Reply size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">Replying to {replyingTo.sender.name}</p>
            <p className="text-blue-600 dark:text-blue-300 text-xs truncate max-w-md bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
              {replyingTo.content}
            </p>
          </div>
        </div>
        <button
          onClick={() => dispatchRedux(clearReplyingTo())}
          className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  const renderMessage = (message: Message, isFirstInGroup: boolean) => {
    const isCurrentUser = message.sender.id === currentUserId
    const hasReplyTo = !!message.reply_to
    const hasAttachments = message.attachments && message.attachments.length > 0
    const hasTaskInfo = message.taskId || message.taskTitle
    const isTaskMessage = hasTaskInfo || (taskContext && message.taskId === taskContext.taskId)

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`group relative flex ${isCurrentUser ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-6" : "mt-2"} px-6`}
        onMouseEnter={() => setSelectedMessage(message.id)}
        onMouseLeave={() => setSelectedMessage(null)}
      >
        <div
          className={`relative max-w-sm lg:max-w-lg xl:max-w-xl ${isCurrentUser
              ? isTaskMessage
                ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl shadow-blue-500/30"
                : "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white shadow-2xl shadow-green-500/30"
              : isTaskMessage
                ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-blue-800/50 border-2 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-100 shadow-xl shadow-blue-500/20"
                : "bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-750 dark:to-gray-800 text-gray-800 dark:text-gray-100 border-2 border-gray-200/50 dark:border-gray-600/50 shadow-xl shadow-gray-500/20"
            } ${hasTaskInfo ? "rounded-b-2xl rounded-t-lg" : "rounded-2xl"} overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
        >
          {renderMessageActions(message)}

          {showEmojiPicker === message.id && (
            <div
              ref={emojiPickerRef}
              className="absolute z-20 bottom-full mb-4 shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600"
              style={{ [isCurrentUser ? "right" : "left"]: 0 }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => handleReaction(message.id, emojiData.emoji)}
                width={300}
                height={400}
              />
            </div>
          )}

          {renderTaskBadge(message)}

          {hasReplyTo && (
            <div
              className={`px-5 pt-4 pb-2 text-sm ${isCurrentUser ? "text-blue-100 bg-black/10" : "text-gray-600 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50"
                } border-l-4 ${isCurrentUser ? "border-blue-300" : "border-blue-400 dark:border-blue-500"} ml-3 mr-3 mt-3 mb-2 rounded-r-lg backdrop-blur-sm`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Reply size={12} className={isCurrentUser ? "text-blue-200" : "text-blue-500"} />
                <span className={`text-xs font-medium ${isCurrentUser ? "text-blue-200" : "text-blue-600 dark:text-blue-400"}`}>
                  {message.reply_to?.sender?.name || "Someone"}
                </span>
              </div>
              <p className="truncate text-xs opacity-90 bg-black/10 dark:bg-white/10 px-2 py-1 rounded">{message.reply_to?.content || ""}</p>
            </div>
          )}

          {/* Attachments */}
          {hasAttachments && (
            <div className={`px-5 pt-4 ${message.content ? "pb-2" : "pb-4"}`}>
              {(message.attachments ?? []).map((attachment, index) =>
                renderAttachmentCard(attachment, index, isCurrentUser)
              )}
            </div>
          )}

          {/* Message content */}
          {message.content && (
            <div className="px-5 py-4">
              <p className="leading-relaxed">{message.content}</p>
            </div>
          )}

          {/* Message footer */}
          <div
            className={`px-5 pb-3 pt-2 flex items-center justify-between text-xs border-t border-black/10 dark:border-white/10 ${isCurrentUser ? "text-white/80" : "text-gray-500 dark:text-gray-400"
              }`}
          >
            <span className="font-medium">{formatMessageDate(message.created_at)}</span>
            {renderMessageStatus(message)}
          </div>

          {/* Reactions */}
          {messageReactions[message.id] && Object.keys(messageReactions[message.id]).length > 0 && (
            <div
              className={`absolute ${isCurrentUser ? "left-0 -translate-x-1/3" : "right-0 translate-x-1/3"} -bottom-3 flex z-10`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border-2 border-gray-200 dark:border-gray-700 px-3 py-1.5 flex items-center space-x-2 backdrop-blur-sm">
                {Object.entries(messageReactions[message.id]).map(([emoji, count]) => (
                  <div key={emoji} className="flex items-center space-x-1 hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">{emoji}</span>
                    {count > 1 && <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Filter out duplicate messages by their unique ID
  const uniqueMessages = messages
    .flatMap((group) => group.messages)
    .reduce((acc, message) => {
      if (!acc.some((m) => m.id === message.id)) {
        acc.push(message)
      }
      return acc
    }, [] as Message[])

  // Group messages by date again after filtering duplicates
  const groupedMessages = uniqueMessages.reduce(
    (acc, message) => {
      const date = new Date(message.created_at).toLocaleDateString()
      const group = acc.find((g) => g.date === date)
      if (group) {
        group.messages.push(message)
      } else {
        acc.push({ date, messages: [message] })
      }
      return acc
    },
    [] as { date: string; messages: Message[] }[],
  )

  // Group messages by sender and task for consecutive messages
  const groupMessagesBySender = (messages: Message[]) => {
    return messages.reduce((groups, message, index, array) => {
      const prevMessage = array[index - 1]
      const senderChanged = !prevMessage || prevMessage.sender.id !== message.sender.id
      const taskChanged = prevMessage?.taskId !== message.taskId
      const timeGap =
        prevMessage &&
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000

      if (senderChanged || taskChanged || timeGap) {
        groups.push([message])
      } else {
        groups[groups.length - 1].push(message)
      }
      return groups
    }, [] as Message[][])
  }

  // Image zoom modal
  const renderImageZoomModal = () => {
    if (!imageZoom) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={() => setImageZoom(null)}
      >
        <div className="relative max-w-[90vw] max-h-[90vh] p-4">
          <img
            src={imageZoom}
            alt="Zoomed image"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setImageZoom(null)}
            className="absolute top-6 right-6 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => window.open(imageZoom, '_blank')}
            className="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <ExternalLink size={24} />
          </button>
        </div>
      </div>
    )
  }

  if (messagesLoading || isCreatingConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {isCreatingConversation ? "Creating conversation..." : "Loading messages..."}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            {isCreatingConversation ? "Setting up your chat workspace" : "Fetching your conversation history"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderImageZoomModal()}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
        {/* Task context banner - only show at top if this is a dedicated task conversation */}
        {taskContext && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700 mb-6 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl mr-4 shadow-lg">
                  <Briefcase className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">{taskContext.taskTitle}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-3 py-1 rounded-full font-medium">
                      Task #{taskContext.taskId}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      with {taskContext.userName}
                    </span>
                  </div>
                </div>
              </div>
              {taskContext.taskDescription && (
                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-600/50">
                  <RichTextRenderer
                    content={taskContext.taskDescription}
                    className="text-blue-800 dark:text-blue-200"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {renderReplyIndicator()}

        {groupedMessages.length > 0 ? (
          <div className="flex flex-col space-y-8">
            {groupedMessages.map((group) => (
              <div key={group.date} className="relative">
                <div className="flex justify-center mb-6">
                  <div className="px-6 py-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-lg border border-gray-300 dark:border-gray-600 backdrop-blur-sm">
                    {group.date}
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  {groupMessagesBySender(group.messages).map((messageGroup, groupIndex) => (
                    <div key={groupIndex} className="space-y-1">
                      {messageGroup.map((message, msgIndex) => renderMessage(message, msgIndex === 0))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !taskContext ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 rounded-full flex items-center justify-center shadow-2xl">
                <MessageSquare className="h-16 w-16 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No messages yet</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              Start the conversation by sending your first message and make this chat come alive
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 rounded-full flex items-center justify-center shadow-2xl">
                <Briefcase className="h-16 w-16 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Ready to discuss: {taskContext.taskTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              Send your first message to start the conversation about this task and collaborate effectively
            </p>
          </div>
        )}

        {/* Typing indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="flex items-center mb-6 px-6">
            <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 px-6 py-4 rounded-2xl text-gray-700 dark:text-gray-300 text-sm shadow-xl border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {Object.values(typingUsers)[0]?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <span className="font-medium">
                    {Object.values(typingUsers)
                      .map((user: { userId: number; name: string }) => user.name)
                      .join(", ")}{" "}
                    {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing
                  </span>
                </div>
                <div className="flex space-x-1">
                  <span
                    className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce shadow-sm"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-bounce shadow-sm"
                    style={{ animationDelay: "200ms" }}
                  ></span>
                  <span
                    className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-bounce shadow-sm"
                    style={{ animationDelay: "400ms" }}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </>
  )
}

export default ChatMessages