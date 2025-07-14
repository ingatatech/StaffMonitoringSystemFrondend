// @ts-nocheck
"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, X, Loader, Smile, Mic, Briefcase, Reply } from "lucide-react"
import { sendTypingIndicator, sendStopTypingIndicator, sendMessage } from "../../services/socketService"
import { uploadAttachment } from "./chatSlice"
import { useAppDispatch, useAppSelector } from "../../Redux/hooks"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import EmojiPicker from "emoji-picker-react"

interface ChatInputProps {
  conversationId: string
  receiverId: number
  taskContext?: TaskChatContext | null
  onClearTaskContext?: () => void
}

interface TaskChatContext {
  taskId: number
  taskTitle: string
  userId: number
  userName: string
  taskDescription: string
  autoOpen: boolean
}

const VALIDATION_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, 
  maxFiles: 5, 
  allowedExtensions: {
    images: [
      ".jpg", ".jpeg", ".png", ".gif", ".tif", ".webp",
      ".bmp", ".svg", ".ico", ".heic", ".tiff", ".psd",
      ".ai", ".eps", ".raw", ".avif", ".jp2"
    ],
    audio: [
      ".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma",
      ".m4a", ".opus", ".aiff", ".alac", ".amr", ".mid",
      ".midi", ".mp2", ".mpa", ".ra", ".weba"
    ],
    video: [
      ".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv",
      ".wmv", ".m4v", ".3gp", ".mpg", ".mpeg", ".m2v",
      ".m4p", ".m4v", ".mp2", ".mpe", ".mpv", ".mxf",
      ".nsv", ".ogv", ".qt", ".rm", ".rmvb", ".svi",
      ".vob", ".yuv"
    ],
    documents: [
      ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt",
      ".pptx", ".txt", ".rtf", ".csv", ".zip", ".rar",
      ".7z", ".gz", ".tar", ".bz2", ".dmg", ".iso",
      ".epub", ".mobi", ".pages", ".numbers", ".key",
      ".odt", ".ods", ".odp", ".md", ".json", ".xml",
      ".html", ".htm", ".log", ".sql", ".db", ".dat",
      ".apk", ".exe", ".dll", ".msi"
    ],
    fonts: [
      ".ttf", ".otf", ".woff", ".woff2", ".eot", ".sfnt"
    ],
    archives: [
      ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2",
      ".xz", ".iso", ".dmg", ".pkg", ".deb", ".rpm"
    ],
    executables: [
      ".exe", ".msi", ".dmg", ".pkg", ".deb", ".rpm",
      ".apk", ".app", ".bat", ".cmd", ".sh", ".bin"
    ],
    code: [
      ".js", ".ts", ".jsx", ".tsx", ".py", ".java",
      ".c", ".cpp", ".h", ".cs", ".php", ".rb",
      ".go", ".swift", ".kt", ".scala", ".sh", ".pl",
      ".lua", ".sql", ".json", ".xml", ".yml", ".yaml",
      ".ini", ".cfg", ".conf", ".env"
    ]
  }
}

const ALL_ALLOWED_EXTENSIONS = [
  ...VALIDATION_CONFIG.allowedExtensions.images,
  ...VALIDATION_CONFIG.allowedExtensions.audio,
  ...VALIDATION_CONFIG.allowedExtensions.video,
  ...VALIDATION_CONFIG.allowedExtensions.documents,
  ...VALIDATION_CONFIG.allowedExtensions.fonts,
  ...VALIDATION_CONFIG.allowedExtensions.archives,
  ...VALIDATION_CONFIG.allowedExtensions.executables,
  ...VALIDATION_CONFIG.allowedExtensions.code
]

const validateFileSize = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > VALIDATION_CONFIG.maxFileSize) {
    const maxSizeMB = VALIDATION_CONFIG.maxFileSize / (1024 * 1024)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      isValid: false,
      error: `File "${file.name}" is too large (${fileSizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`
    }
  }
  return { isValid: true }
}

const validateFileExtension = (file: File): { isValid: boolean; error?: string; category?: string } => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!ext || ext === '.') {
    return { isValid: false, error: `File "${file.name}" has no extension` }
  }

  if (!ALL_ALLOWED_EXTENSIONS.includes(ext)) {
    const allowedTypes = Object.keys(VALIDATION_CONFIG.allowedExtensions).join(', ')
    return {
      isValid: false,
      error: `File type "${ext}" is not allowed. Allowed types: ${allowedTypes}`
    }
  }

  // Determine file category
  let category = 'documents'
  if (VALIDATION_CONFIG.allowedExtensions.images.includes(ext)) category = 'images'
  else if (VALIDATION_CONFIG.allowedExtensions.audio.includes(ext)) category = 'audio'
  else if (VALIDATION_CONFIG.allowedExtensions.video.includes(ext)) category = 'video'
  else if (VALIDATION_CONFIG.allowedExtensions.fonts.includes(ext)) category = 'fonts'
  else if (VALIDATION_CONFIG.allowedExtensions.archives.includes(ext)) category = 'archives'
  else if (VALIDATION_CONFIG.allowedExtensions.executables.includes(ext)) category = 'executables'
  else if (VALIDATION_CONFIG.allowedExtensions.code.includes(ext)) category = 'code'

  return { isValid: true, category }
}

const validateFileCount = (currentFiles: File[], newFiles: File[]): { isValid: boolean; error?: string } => {
  const totalFiles = currentFiles.length + newFiles.length
  if (totalFiles > VALIDATION_CONFIG.maxFiles) {
    return {
      isValid: false,
      error: `Cannot upload more than ${VALIDATION_CONFIG.maxFiles} files at once. You're trying to upload ${totalFiles} files.`
    }
  }
  return { isValid: true }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const ChatInput: React.FC<ChatInputProps> = ({ conversationId, receiverId, taskContext, onClearTaskContext }) => {
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<{ type: string; url: string; name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const { sendingMessage, replyingTo } = useAppSelector((state) => state.chat)
  const currentUser = useAppSelector((state) => state.login.user)
  const users = useAppSelector((state) => state.chat.users) || []

  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        if (conversationId) {
          sendStopTypingIndicator(conversationId, receiverId)
        }
      }
    }
  }, [conversationId, receiverId])

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSendMessage = async () => {
    if (message.trim() === "" && attachments.length === 0) return

    try {
      // Get task context for message metadata
      let currentTaskContext = taskContext
      if (!currentTaskContext) {
        const taskChatContextStr = localStorage.getItem("taskChatContext")
        if (taskChatContextStr) {
          try {
            currentTaskContext = JSON.parse(taskChatContextStr)
          } catch (error) {
                     }
        }
      }

      // Send message to existing conversation
      if (conversationId) {
        const targetReceiverId = receiverId || currentTaskContext?.userId

        if (!targetReceiverId) {
          showErrorToast("Receiver not found. Please try again.")
          return
        }



        await sendMessage(
          conversationId,
          targetReceiverId,
          message,
          attachments,
          currentTaskContext?.taskId || null,
          currentTaskContext?.taskTitle || null,
          currentTaskContext?.taskDescription || null,
          replyingTo?.id || null
        )

        // Reset input state
        setMessage("")
        setAttachments([])

        // Clear task context after first message is sent
        if (currentTaskContext) {
          localStorage.removeItem("taskChatContext")
          if (onClearTaskContext) {
            onClearTaskContext()
          }
          showSuccessToast(`Message sent for task: ${currentTaskContext.taskTitle}`)
        }
      } else {
        showErrorToast("No conversation available. Please wait for conversation to be created.")
      }
    } catch (error) {
    
      showErrorToast("Failed to send message. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (!conversationId) return // Don't send typing indicator if no conversation

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    } else {
      sendTypingIndicator(conversationId, receiverId)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingIndicator(conversationId, receiverId)
      typingTimeoutRef.current = null
    }, 3000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Convert FileList to Array
    const fileArray = Array.from(files)

    // 1. Validate file count first
    const countValidation = validateFileCount(attachments, fileArray)
    if (!countValidation.isValid) {
      showErrorToast(countValidation.error!)
      return
    }

    const validFiles: File[] = []
    const invalidFiles: string[] = []

    // 2. Validate each file
    for (const file of fileArray) {
      // Size validation - strict 10MB check
      const sizeValidation = validateFileSize(file)
      if (!sizeValidation.isValid) {
        invalidFiles.push(sizeValidation.error!)
        continue
      }

      // Extension validation
      const extValidation = validateFileExtension(file)
      if (!extValidation.isValid) {
        invalidFiles.push(extValidation.error!)
        continue
      }

      validFiles.push(file)
    }

    // Show all validation errors at once
    if (invalidFiles.length > 0) {
      // Show first 3 errors to avoid overwhelming the user
      invalidFiles.slice(0, 3).forEach(error => showErrorToast(error))

      // If there were more errors, show a summary
      if (invalidFiles.length > 3) {
        showErrorToast(`And ${invalidFiles.length - 3} more files couldn't be uploaded`)
      }

      // If no valid files, return early
      if (validFiles.length === 0) {
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }
    }

    // Proceed with upload for valid files
    setIsUploading(true)
    setUploadProgress({})

    try {
      const newAttachments: any[] = []

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]

        try {
          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 0
          }))

          const result = await dispatch(uploadAttachment(file)).unwrap()

          // Update progress to complete
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }))

          newAttachments.push(result)

        } catch (fileError: any) {
          // Remove from progress
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })

          showErrorToast(`Failed to upload ${file.name}: ${fileError?.message || 'Unknown error'}`)
        }
      }

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments])
        showSuccessToast(`Uploaded ${newAttachments.length} file(s) successfully`)
      }

    } catch (error) {
      
      showErrorToast("Upload process failed. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }


  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleEmojiSelect = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // Implement audio recording logic here
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const renderAttachmentPreview = (attachment: { type: string; url: string; name: string }, index: number) => {
    if (attachment.type.startsWith("image/")) {
      return (
        <div className="relative group">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={attachment.url || "/placeholder.svg"}
              alt={attachment.name}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(index)}
          >
            <X size={12} />
          </button>
        </div>
      )
    }

    if (attachment.type.startsWith("video/")) {
      return (
        <div className="relative group">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <button
            className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(index)}
          >
            <X size={12} />
          </button>
        </div>
      )
    }

    return (
      <div className="relative group">
        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <button
          className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-800/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeAttachment(index)}
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  // Get current task context for display
  const currentTaskContext =
    taskContext ||
    (() => {
      const taskChatContextStr = localStorage.getItem("taskChatContext")
      if (taskChatContextStr) {
        try {
          return JSON.parse(taskChatContextStr) as TaskChatContext
        } catch (error) {
          return null
        }
      }
      return null
    })()

  const isDisabled = isUploading || sendingMessage

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" id="chat-input">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <Reply size={14} className="mr-1.5 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 truncate max-w-xs">
              {replyingTo.content}
            </span>
          </div>
          <button
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => dispatch({ type: 'chat/clearReplyingTo' })}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Task context indicator - only show if task context exists */}
      {currentTaskContext && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase size={14} className="mr-1.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Discussing task: {currentTaskContext.taskTitle}
              </span>
              {currentTaskContext.taskId && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">(#{currentTaskContext.taskId})</span>
              )}
            </div>
            <button
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
                localStorage.removeItem("taskChatContext")
                if (onClearTaskContext) {
                  onClearTaskContext()
                }
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
            Uploading files...
          </div>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="mb-1">
              <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                <span className="truncate max-w-xs">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {attachments.map((attachment, index) => (
            <div key={index}>{renderAttachmentPreview(attachment, index)}</div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex justify-center gap-2 items-center">
        <div className="flex space-x-1">
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            aria-label="Attach file"
            title={`Upload files (Max: ${VALIDATION_CONFIG.maxFiles} files, ${VALIDATION_CONFIG.maxFileSize / (1024 * 1024)}MB each)`}
          >
            <Paperclip size={20} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              multiple
              disabled={isDisabled}
              accept={ALL_ALLOWED_EXTENSIONS.join(',')}
              title={`Max ${VALIDATION_CONFIG.maxFiles} files, ${VALIDATION_CONFIG.maxFileSize / (1024 * 1024)}MB each`}
            />
          </button>
          <button
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isDisabled}
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
        </div>

        <div className="relative flex-1">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-10">
              <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={350} />
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={currentTaskContext ? `Message about ${currentTaskContext.taskTitle}...` : "Type a message..."}
            rows={1}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
              handleTyping()
            }}
            onKeyDown={handleKeyPress}
            style={{ minHeight: "40px", maxHeight: "120px" }}
            disabled={isDisabled}
          />

          {isUploading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        <button
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSendMessage}
          disabled={isDisabled || (message.trim() === "" && attachments.length === 0)}
          aria-label="Send message"
        >
          {sendingMessage ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  )
}

export default ChatInput