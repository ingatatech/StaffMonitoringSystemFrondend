import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast } from "../../utilis/ToastProps"
import { type RootState, store } from "../../Redux/store"

// Types
export interface User {
  id: number
  name: string
  email: string
  role?: string
  profilePictureUrl?: string | null
}

export interface Message {
  id: number
  content: string
  sender: {
    id: number
    name: string
  }
  receiver: {
    id: number
    name: string
  }
  reply_to?: {
    id: number
    content: string
  }
  attachments?: {
    type: string
    url: string
    name: string
  }[]
  isRead: boolean
  created_at: string
  conversationId: string
  dailyTask?: {
    id: number
    taskName: string
    userId: number
    userName: string
    submissionDate: string
  }
  taskId?: number
  taskTitle?: string
  taskDescription?: string
  reactions?: Record<string, number>
}

export interface DailyTaskInfo {
  id: number
  taskName: string
  userId: number
  userName: string
  submissionDate: string
}

export interface Conversation {
  id: string
  title: string
  otherUser: User
  task?: {
    id: number
    title: string
  }
  dailyTask?: DailyTaskInfo
  unreadCount: number
  lastMessage: {
    content: string
    sender: number
    created_at: string
  }
  created_at: string
  isPinned?: boolean
  isArchived?: boolean
}

export interface GroupedMessages {
  date: string
  messages: Message[]
}

export interface PinnedMessage {
  id: number
  messageId: number
  conversationId: string
  content: string
  sender: {
    id: number
    name: string
  }
  created_at: string
}

interface ChatState {
  users: User[]
  teamMembers: User[]
  organizationUsers: User[]
  conversations: Conversation[]
  archivedConversations: Conversation[]
  selectedConversation: string | null
  messages: GroupedMessages[]
  loading: boolean
  usersLoading: boolean
  messagesLoading: boolean
  sendingMessage: boolean
  error: string | null
  isOpen: boolean
  typingUsers: Record<string, { userId: number; name: string }>
  onlineUsers: number[]
  pinnedMessages: PinnedMessage[]
  theme: "light" | "dark"
  wallpaper: string
  fontSize: "small" | "medium" | "large"
    replyingTo: {
    id: number
    content: string
    sender: {
      id: number
      name: string
    }
  } | null
}

const initialState: ChatState = {
  users: [],
  teamMembers: [],
  organizationUsers: [],
  conversations: [],
  archivedConversations: [],
  selectedConversation: null,
  messages: [],
  loading: false,
  usersLoading: false,
  messagesLoading: false,
  sendingMessage: false,
  error: null,
  isOpen: false,
  typingUsers: {},
  onlineUsers: [],
  pinnedMessages: [],
  theme: "light",
  wallpaper: "default",
  fontSize: "medium",
  replyingTo: null,
}

// Async thunks
export const fetchUsers = createAsyncThunk("chat/fetchUsers", async (userId: number, { rejectWithValue }) => {
  try {
    const state = store.getState() as RootState
    const userId = state.login.user?.id
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/user/${userId}/team-members`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.data.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to fetch users"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async ({ userId, organizationId }: { userId: number; organizationId: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/${organizationId}/user/${userId}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch conversations"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Modify the fetchMessages thunk to sort messages within each group
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, userId }: { conversationId: string; userId: number }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/conversation/${conversationId}/${userId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Transform the API response into the expected format
      const transformedMessages = Object.entries(response.data.data).map(([date, messages]) => {
        // Sort messages within each day group by created_at (oldest first)
        const sortedMessages = (messages as Message[]).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )

        return {
          date,
          messages: sortedMessages,
        }
      })

      // Sort the day groups by date priority: "Older" first, then "Yesterday", then "Today"
      const sortedGroups = transformedMessages.sort((a, b) => {
        // Define the order of date groups
        const dateOrder = { Older: 1, Yesterday: 2, Today: 3 }

        // Get the order value for each group, defaulting to 0 if not found
        const orderA = dateOrder[a.date as keyof typeof dateOrder] || 0
        const orderB = dateOrder[b.date as keyof typeof dateOrder] || 0

        // Sort by the defined order
        return orderA - orderB
      })

      return sortedGroups
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch messages"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const startChatWithUser = createAsyncThunk(
  "chat/startChatWithUser",
  async ({ senderId, receiverId }: { senderId: number; receiverId: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/start-chat`,
        { senderId, receiverId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to start chat"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Modified task conversation thunk - no auto-message sending
export const startTaskConversation = createAsyncThunk(
  "chat/startTaskConversation",
  async (
    {
      senderId,
      receiverId,
      taskId,
      taskTitle,
      taskDescription,
    }: {
      senderId: number
      receiverId: number
      taskId: number
      taskTitle: string
      taskDescription: string
    },
    { rejectWithValue, dispatch },
  ) => {
    try {

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/chat/start-chat`,
        {
          senderId,
          receiverId,
          // Remove initialMessage - no auto-message
          taskId,
          taskTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Add task info to the response
      const result = {
        ...response.data.data,
        taskId,
        taskTitle,
      }


      return result
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to start task conversation"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const uploadAttachment = createAsyncThunk("chat/uploadAttachment", async (file: File, { rejectWithValue }) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/v1/chat/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to upload attachment"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

// Remove sendMessageThunk - only use socket service

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen
    },
    selectConversation: (state, action) => {
      state.selectedConversation = action.payload
      // Clear typing indicator when changing conversations
      state.typingUsers = {}
    },
    setReplyingTo: (state, action: PayloadAction<{
      id: number
      content: string
      sender: {
        id: number
        name: string
      }
    }>) => {
      state.replyingTo = action.payload
    },
    clearReplyingTo: (state) => {
      state.replyingTo = null
    },
    // In your chatSlice.ts
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      const conversationId = message.conversationId

      // Update conversation list
      const conversationIndex = state.conversations.findIndex((conv) => conv.id === conversationId)

      if (conversationIndex !== -1) {
        const conversation = state.conversations[conversationIndex]
        state.conversations[conversationIndex] = {
          ...conversation,
          lastMessage: {
            content: message.content,
            sender: message.sender.id,
            created_at: message.created_at,
          },
          unreadCount:
            state.selectedConversation === conversationId ? conversation.unreadCount : conversation.unreadCount + 1,
        }

        // Move conversation to top
        const updatedConversation = state.conversations[conversationIndex]
        state.conversations.splice(conversationIndex, 1)
        state.conversations.unshift(updatedConversation)
      }

      // Add message to current conversation if selected
      if (state.selectedConversation === conversationId) {
        const messageDate = new Date(message.created_at).toLocaleDateString()
        const dayIndex = state.messages.findIndex((group) => group.date === messageDate)

        if (dayIndex !== -1) {
          state.messages[dayIndex].messages.push(message)
        } else {
          state.messages.push({
            date: messageDate,
            messages: [message],
          })
          // Sort groups by date (newest last)
          state.messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }
      }
    },
    setUserTyping: (state, action) => {
      const { userId, name, conversationId } = action.payload
      if (state.selectedConversation === conversationId) {
        state.typingUsers[userId] = { userId, name }
      }
    },
    clearUserTyping: (state, action) => {
      const { userId, conversationId } = action.payload
      if (state.selectedConversation === conversationId) {
        const newTypingUsers = { ...state.typingUsers }
        delete newTypingUsers[userId]
        state.typingUsers = newTypingUsers
      }
    },
    setUserOnline: (state, action) => {
      const userId = action.payload.userId
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId)
      }
    },
    setUserOffline: (state, action) => {
      const userId = action.payload.userId
      state.onlineUsers = state.onlineUsers.filter((id) => id !== userId)
    },
    addNewConversation: (state, action) => {
      const { conversationId, sender, receiver, task } = action.payload

      if (!conversationId || !receiver) {
        return
      }

      const exists = state.conversations.some((conv) => conv.id === conversationId)

      if (!exists) {
        const newConversation = {
          id: conversationId,
          title: task ? `Task: ${task.title}` : `Chat with ${receiver.name}`,
          otherUser: receiver,
          task: task || undefined,
          unreadCount: 0,
          lastMessage: {
            content: task ? "Task conversation ready" : "New conversation started",
            sender: sender?.id || 0,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        }

        state.conversations.unshift(newConversation)
      }
    },
    resetChat: (state) => {
      state.selectedConversation = null
      state.messages = []
      state.typingUsers = {}
    },
    pinMessage: (state, action: PayloadAction<number>) => {
      const messageId = action.payload
      const message = state.messages.flatMap((group) => group.messages).find((msg) => msg.id === messageId)

      if (message && state.selectedConversation) {
        // Check if already pinned
        const alreadyPinned = state.pinnedMessages.some((pm) => pm.messageId === messageId)

        if (!alreadyPinned) {
          state.pinnedMessages.push({
            id: Date.now(), // Generate a unique ID
            messageId,
            conversationId: state.selectedConversation,
            content: message.content,
            sender: message.sender,
            created_at: message.created_at,
          })
        }
      }
    },
    unpinMessage: (state, action: PayloadAction<number>) => {
      const pinnedMessageId = action.payload
      state.pinnedMessages = state.pinnedMessages.filter((pm) => pm.id !== pinnedMessageId)
    },
    archiveConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload
      const conversationIndex = state.conversations.findIndex((c) => c.id === conversationId)

      if (conversationIndex !== -1) {
        const conversation = state.conversations[conversationIndex]
        state.conversations.splice(conversationIndex, 1)
        state.archivedConversations.push({
          ...conversation,
          isArchived: true,
        })

        // If the archived conversation was selected, reset selection
        if (state.selectedConversation === conversationId) {
          state.selectedConversation = null
          state.messages = []
        }
      }
    },
    unarchiveConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload
      const conversationIndex = state.archivedConversations.findIndex((c) => c.id === conversationId)

      if (conversationIndex !== -1) {
        const conversation = state.archivedConversations[conversationIndex]
        state.archivedConversations.splice(conversationIndex, 1)
        state.conversations.push({
          ...conversation,
          isArchived: false,
        })
      }
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload
    },
    setWallpaper: (state, action: PayloadAction<string>) => {
      state.wallpaper = action.payload
    },
    setFontSize: (state, action: PayloadAction<"small" | "medium" | "large">) => {
      state.fontSize = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        // Store team members and organization users separately
        if (action.payload) {
          state.teamMembers = action.payload.teamMembers || []
          state.organizationUsers = action.payload.organizationUsers || []
          // Combine both for backward compatibility
          state.users = [...state.teamMembers, ...state.organizationUsers]
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.error = action.payload as string
      })

      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        // Filter conversations into active and archived
        const allConversations = action.payload || []
        state.conversations = allConversations.filter((conv: any) => !conv.isArchived)
        state.archivedConversations = allConversations.filter((conv: any) => conv.isArchived)
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true
        state.messages = [] // Clear previous messages when loading new ones
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        // Ensure messages is an array
        state.messages = Array.isArray(action.payload) ? action.payload : []

        // Reset unread count for the selected conversation
        const conversationIndex = state.conversations.findIndex((conv) => conv.id === state.selectedConversation)
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false
        state.error = action.payload as string
        // Ensure messages is an array even on error
        state.messages = []
      })

      // Start chat with user
      .addCase(startChatWithUser.fulfilled, (state, action) => {
        const { conversationId, sender, receiver } = action.payload

        // Check if conversation already exists
        const exists = state.conversations.some((conv) => conv.id === conversationId)

        if (!exists && receiver) {
          // Add new conversation to the list
          state.conversations.unshift({
            id: conversationId,
            title: `Chat with ${receiver.name}`,
            otherUser: receiver,
            unreadCount: 0,
            lastMessage: {
              content: "Conversation started",
              sender: sender.id,
              created_at: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          })
        }

        // Select the conversation
        state.selectedConversation = conversationId
      })

      // Start task conversation - no auto-message
      .addCase(startTaskConversation.fulfilled, (state, action) => {
        const { conversationId, sender, receiver, taskId, taskTitle } = action.payload

        // Check if conversation already exists
        const existingIndex = state.conversations.findIndex((conv) => conv.id === conversationId)

        if (existingIndex === -1 && receiver) {
          // Add new conversation to the list with task info
          const newConversation = {
            id: conversationId,
            title: `Task: ${taskTitle}`,
            otherUser: receiver,
            task: {
              id: taskId,
              title: taskTitle,
            },
            unreadCount: 0,
            lastMessage: {
              content: "Task conversation ready",
              sender: sender?.id || 0,
              created_at: new Date().toISOString(),
            },
            created_at: new Date().toISOString(),
          }

          state.conversations.unshift(newConversation)
        }

        // Always select the conversation (whether new or existing)
        state.selectedConversation = conversationId
      })
  },
})

export const {
  toggleChat,
  selectConversation,
  receiveMessage,
  setUserTyping,
  clearUserTyping,
  setUserOnline,
  setUserOffline,
  addNewConversation,
  resetChat,
  pinMessage,
  unpinMessage,
  archiveConversation,
  unarchiveConversation,
  setTheme,
  setWallpaper,
  setFontSize,
  setReplyingTo,
  clearReplyingTo
} = chatSlice.actions

export default chatSlice.reducer
