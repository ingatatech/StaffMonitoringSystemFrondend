// @ts-nocheck
import { io, type Socket } from "socket.io-client"
import { store } from "../Redux/store"
import {
  receiveMessage,
  setUserTyping,
  clearUserTyping,
  setUserOnline,
  setUserOffline,
  addNewConversation,
  setReplyingTo,
  clearReplyingTo,
} from "../components/Chat/chatSlice"
import { showErrorToast } from "../utilis/ToastProps"

// Add this interface at the top of the file, after the imports
interface ConversationResult {
  success: boolean
  conversationId: string
  sender?: {
    id: number
    name: string
  }
  receiver?: {
    id: number
    name: string
  }
  error?: string
}

// Create socket instance
export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
  autoConnect: false,
  transports: ["websocket"],
})

// Initialize socket connection
export const initializeSocket = (userId: number, organizationId: number) => {
  if (!socket.connected) {
    try {
      socket.connect()

      // Setup event listeners
      setupSocketListeners()

      // Authenticate user
      socket.emit("authenticate", { userId, organizationId }, (response: any) => {
        if (response && response.success) {
        } else {
          showErrorToast("Failed to connect to chat server")
        }
      })
    } catch (error) {
      showErrorToast("Failed to connect to chat server")
    }
  }
}

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    try {
      socket.emit("disconnect_user")
      socket.disconnect()
    } catch (error) {
    }
  }
}

export const sendMessage = (
  conversationId: string,
  receiverId: number,
  content: string,
  attachments?: { type: string; url: string; name: string }[],
  taskId?: number | null,
  taskTitle?: string | null,
  taskDescription?: string | null,
  replyToMessageId?: number | null
) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      try {
        socket.connect()
        setTimeout(() => {
          if (socket.connected) {
            sendMessageWithSocket()
          } else {
            reject("Failed to connect to chat server")
          }
        }, 1000)
      } catch (error) {
        reject("Failed to connect to chat server")
      }
    } else {
      sendMessageWithSocket()
    }

    function sendMessageWithSocket(retryCount = 0) {
      try {
        const currentUser = store.getState().login.user
        const senderId = currentUser?.id

        if (!senderId) {
          return reject("User not authenticated")
        }

        const messagePayload = {
          conversationId,
          senderId,
          receiverId,
          content,
          attachments,
          taskId: taskId || undefined,
          taskTitle: taskTitle || undefined,
          taskDescription: taskDescription || undefined,
          replyToMessageId: replyToMessageId || undefined,
        }


        socket.emit("send_message", messagePayload, (response: any) => {
          if (response?.success) {
            // Dispatch to Redux store for immediate UI update
            store.dispatch(
              receiveMessage({
                ...messagePayload,
                id: response.data?.id || Date.now(),
                created_at: new Date().toISOString(),
                isRead: false,
                sender: {
                  id: senderId,
                  name: currentUser?.name || "You",
                },
                receiver: {
                  id: receiverId,
                  name: "",
                },
                reply_to: response.data?.reply_to || (replyToMessageId ? {
                  id: replyToMessageId,
                  content: store.getState().chat.replyingTo?.content || "",
                  sender: store.getState().chat.replyingTo?.sender || { id: 0, name: "" }
                } : undefined),
                task: taskId
                  ? {
                      id: taskId,
                      title: taskTitle || "",
                      description: taskDescription || "",
                    }
                  : null,
              }),
            )
            // Clear the reply after sending
            store.dispatch(clearReplyingTo())
            resolve(response)
          } else {
            handleSendError(response, retryCount)
          }
        })
      } catch (error) {
        reject(error)
      }
    }

    function handleSendError(response: any, retryCount: number) {
      const errorMsg = response?.error || "Failed to send message"
      if (retryCount < 2) {
        setTimeout(() => sendMessageWithSocket(retryCount + 1), 1000)
      } else {
        reject(errorMsg)
      }
    }
  })
}

const setupSocketListeners = () => {


  socket.on("connect_error", (error) => {
    showErrorToast("Chat connection error. Please try again.")
  })

  socket.on("new_message", (message) => {
    if (message && message.conversationId) {
      store.dispatch(receiveMessage(message))
    }
  })

  socket.on("user_typing", (data) => {
    if (data && data.userId && data.conversationId) {
      store.dispatch(setUserTyping(data))
    }
  })

  socket.on("user_stop_typing", (data) => {
    if (data && data.userId && data.conversationId) {
      store.dispatch(clearUserTyping(data))
    }
  })

  socket.on("user_online", (data) => {
    if (data && data.userId) {
      store.dispatch(setUserOnline(data))
    }
  })

  socket.on("user_offline", (data) => {
    if (data && data.userId) {
      store.dispatch(setUserOffline(data))
    }
  })

  socket.on("new_conversation", (data) => {
    if (data && data.conversationId && data.sender) {
      store.dispatch(addNewConversation(data))
    }
  })
}

export const replyToMessage = (
  conversationId: string,
  receiverId: number,
  content: string,
  replyToMessageId: number,
  attachments?: { type: string; url: string; name: string }[],
) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      showErrorToast("Not connected to chat server")
      reject("Not connected to chat server")
      return
    }

    try {
      socket.emit(
        "reply_to_message",
        {
          conversationId,
          receiverId,
          content,
          replyToMessageId,
          attachments,
        },
        (response: any) => {
          if (response && response.success) {
            resolve(response)
          } else {
            showErrorToast(response?.error || "Failed to send reply")
            reject(response?.error || "Failed to send reply")
          }
        },
      )
    } catch (error) {
      showErrorToast("Failed to send reply")
      reject(error)
    }
  })
}

// Update the createConversation function to include senderId
export const createConversation = (
  receiverId: number,
  initialMessage?: string,
  dailyTaskId?: number,
  title?: string,
  taskId?: number,
  taskTitle?: string,
): Promise<ConversationResult> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      showErrorToast("Not connected to chat server")
      reject("Not connected to chat server")
      return
    }

    // Get current user ID from Redux store
    const currentUser = store.getState().login.user
    const senderId = currentUser?.id

    if (!senderId) {
      showErrorToast("User not authenticated")
      reject("User not authenticated")
      return
    }

    try {


      socket.emit(
        "create_conversation",
        { senderId, receiverId, initialMessage, dailyTaskId, title, taskId, taskTitle },
        (response: ConversationResult) => {

          if (response && response.success && response.conversationId) {
            // Ensure we have all the necessary data
            const result = {
              ...response,
              sender: response.sender || { id: senderId, name: currentUser?.name || "You" },
              taskId,
              taskTitle,
            }
            resolve(result)
          } else {
            const errorMsg = response?.error || "Failed to create conversation"
            showErrorToast(errorMsg)
            reject(errorMsg)
          }
        },
      )
    } catch (error) {
      showErrorToast("Failed to create conversation")
      reject("Failed to create conversation")
    }
  })
}

// Enhanced join conversation with better error handling and authentication
export const joinConversation = (conversationId: string) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {

      try {
        socket.connect()

        // Wait for connection to establish
        setTimeout(() => {
          if (socket.connected) {
            joinWithAuth(conversationId, resolve, reject)
          } else {
            const error = "Not connected to chat server"
            showErrorToast(error)
            reject(error)
          }
        }, 1000)
      } catch (error) {
        showErrorToast("Failed to connect to chat server")
        reject("Failed to connect to chat server")
      }

      return
    }

    joinWithAuth(conversationId, resolve, reject)
  })
}

// Enhanced helper function to join with authentication
function joinWithAuth(conversationId: string, resolve: Function, reject: Function, retryCount = 0) {
  // Get current user ID from Redux store
  const currentUser = store.getState().login.user
  const userId = currentUser?.id
  const organizationId = currentUser?.organization?.id

  if (!userId || !organizationId) {

    if (retryCount < 2) {
      setTimeout(() => joinWithAuth(conversationId, resolve, reject, retryCount + 1), 1000)
      return
    }

    showErrorToast("Authentication error. Please refresh the page.")
    reject("Not authenticated")
    return
  }


  // Re-authenticate before joining to ensure we have a valid session
  socket.emit("authenticate", { userId, organizationId }, (authResponse: any) => {
    if (authResponse && authResponse.success) {

      // Now join the conversation
      socket.emit("join_conversation", conversationId, (response: any) => {

        if (response && response.success) {
          resolve(response)
        } else {

          // If we get a specific error about authentication, try to re-authenticate
          if (response?.error?.includes("authenticated") && retryCount < 2) {
            setTimeout(() => joinWithAuth(conversationId, resolve, reject, retryCount + 1), 1000)
          } else {
            const errorMsg = response?.error || "Failed to join conversation"
            showErrorToast(errorMsg)
            reject(errorMsg)
          }
        }
      })
    } else {

      if (retryCount < 2) {
        setTimeout(() => joinWithAuth(conversationId, resolve, reject, retryCount + 1), 1000)
      } else {
        showErrorToast("Authentication error. Please refresh the page.")
        reject("Authentication failed")
      }
    }
  })
}

// Send typing indicator
export const sendTypingIndicator = (conversationId: string, receiverId: number) => {
  if (socket.connected) {
    try {
      socket.emit("typing", { conversationId, receiverId })
    } catch (error) {
    }
  }
}

// Send stop typing indicator
export const sendStopTypingIndicator = (conversationId: string, receiverId: number) => {
  if (socket.connected) {
    try {
      socket.emit("stop_typing", { conversationId, receiverId })
    } catch (error) {
    }
  }
}
