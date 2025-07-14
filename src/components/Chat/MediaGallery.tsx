"use client"

import React from "react"
import { useState, useEffect } from "react"
import { X, ImageIcon, FileText, Video, File, Music, Play, Pause, Download, ExternalLink } from "lucide-react"
import { useAppSelector } from "../../Redux/hooks"

interface MediaGalleryProps {
  conversationId: string
  onClose: () => void
}

type MediaItem = {
  id: number
  type: string
  url: string
  name: string
  messageId: number
  created_at: string
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ conversationId, onClose }) => {
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos" | "documents" | "audio">("all")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  const messages = useAppSelector((state) =>
    state.chat.messages
      .flatMap((group) => group.messages)
      .filter((message) => message.attachments && message.attachments.length > 0),
  )

  useEffect(() => {
    // Extract all media items from messages
    const items: MediaItem[] = []

    messages.forEach((message) => {
      if (message.attachments) {
        message.attachments.forEach((attachment) => {
          items.push({
            id: Math.random(), // In a real app, use a proper ID
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
            messageId: message.id,
            created_at: message.created_at,
          })
        })
      }
    })

    // Sort by date (newest first)
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setMediaItems(items)
    setLoading(false)
  }, [messages])

  // Helper function to determine file category based on type or extension
  const getFileCategory = (item: MediaItem) => {
    const type = item.type.toLowerCase()
    const name = item.name.toLowerCase()
    
    // Check type field first
    if (type === "image" || type.startsWith("image/")) return "images"
    if (type === "video" || type.startsWith("video/")) return "videos"
    if (type === "audio" || type.startsWith("audio/")) return "audio"
    if (type === "document" || type.startsWith("application/")) return "documents"
    
    // If type is not clear, check file extension
    const extension = name.split('.').pop() || ""
    
    // Image extensions
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(extension)) return "images"
    
    // Video extensions
    if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(extension)) return "videos"
    
    // Audio extensions
    if (["mp3", "wav", "ogg", "aac", "m4a", "flac", "wma"].includes(extension)) return "audio"
    
    // Default to documents for everything else
    return "documents"
  }

  const filteredItems = mediaItems.filter((item) => {
    if (activeTab === "all") return true
    const category = getFileCategory(item)
    return activeTab === category
  })

  // Audio playback functions
  const handleAudioPlay = (audioUrl: string, audioId: string) => {
    // Stop currently playing audio
    if (playingAudio && playingAudio !== audioId) {
      const currentAudio = audioElements[playingAudio]
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
    }

    // Get or create audio element
    let audio = audioElements[audioId]
    if (!audio) {
      audio = new Audio(audioUrl)
      audio.addEventListener('ended', () => {
        setPlayingAudio(null)
      })
      audio.addEventListener('error', (e) => {
        setPlayingAudio(null)
      })
      setAudioElements(prev => ({ ...prev, [audioId]: audio }))
    }

    if (playingAudio === audioId) {
      // Pause current audio
      audio.pause()
      setPlayingAudio(null)
    } else {
      // Play new audio
      audio.play().then(() => {
        setPlayingAudio(audioId)
      }).catch((error) => {
      })
    }
  }

  // Get appropriate icon for file type
  const getFileIcon = (item: MediaItem) => {
    const category = getFileCategory(item)
    const extension = item.name.toLowerCase().split('.').pop() || ""
    
    switch (category) {
      case "images":
        return <ImageIcon size={32} className="text-blue-500" />
      case "videos":
        return <Video size={32} className="text-red-500" />
      case "audio":
        return <Music size={32} className="text-green-500" />
      case "documents":
        // More specific document icons based on extension
        if (["pdf"].includes(extension)) {
          return <FileText size={32} className="text-red-600" />
        } else if (["doc", "docx"].includes(extension)) {
          return <FileText size={32} className="text-blue-600" />
        } else if (["xls", "xlsx"].includes(extension)) {
          return <FileText size={32} className="text-green-600" />
        } else if (["ppt", "pptx"].includes(extension)) {
          return <FileText size={32} className="text-orange-600" />
        } else {
          return <File size={32} className="text-gray-500" />
        }
      default:
        return <File size={32} className="text-gray-500" />
    }
  }

  const renderMediaItem = (item: MediaItem) => {
    const category = getFileCategory(item)
    const audioId = `audio-${item.id}`

    if (category === "images") {
      return (
        <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square">
          <img src={item.url || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} className="text-gray-700" />
            </a>
            <a 
              href={item.url} 
              download={item.name}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Download"
            >
              <Download size={16} className="text-gray-700" />
            </a>
          </div>
        </div>
      )
    }

    if (category === "videos") {
      return (
        <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
          <video src={item.url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={() => {
                const video = document.createElement('video')
                video.src = item.url
                video.controls = true
                video.autoplay = true
                video.style.width = '100%'
                video.style.height = '100%'
                
                const modal = document.createElement('div')
                modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
                modal.onclick = (e) => {
                  if (e.target === modal) {
                    document.body.removeChild(modal)
                  }
                }
                
                const container = document.createElement('div')
                container.className = 'relative max-w-4xl max-h-full'
                container.appendChild(video)
                
                const closeBtn = document.createElement('button')
                closeBtn.innerHTML = '✕'
                closeBtn.className = 'absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center'
                closeBtn.onclick = () => document.body.removeChild(modal)
                container.appendChild(closeBtn)
                
                modal.appendChild(container)
                document.body.appendChild(modal)
              }}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Play video"
            >
              <Play size={24} fill="white" className="text-white ml-1" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <a 
              href={item.url} 
              download={item.name}
              className="p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
              title="Download"
            >
              <Download size={14} className="text-white" />
            </a>
          </div>
        </div>
      )
    }

    if (category === "audio") {
      return (
        <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-4 flex flex-col items-center justify-center aspect-square">
          <Music size={32} className="text-green-500 mb-2" />
          <p className="text-xs text-center truncate max-w-full mb-3">{item.name}</p>
          <button
            onClick={() => handleAudioPlay(item.url, audioId)}
            className="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors mb-2"
            title={playingAudio === audioId ? "Pause" : "Play"}
          >
            {playingAudio === audioId ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <a 
            href={item.url} 
            download={item.name}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Download"
          >
            <Download size={14} />
          </a>
        </div>
      )
    }

    // Document or other file
    return (
      <div className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-4 flex flex-col items-center justify-center aspect-square">
        {getFileIcon(item)}
        <p className="mt-2 text-xs text-center truncate max-w-full">{item.name}</p>
        <div className="mt-2 flex space-x-2">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Open"
          >
            <ExternalLink size={14} />
          </a>
          <a 
            href={item.url} 
            download={item.name}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Download"
          >
            <Download size={14} />
          </a>
        </div>
      </div>
    )
  }

  // Count items by category
  const getCategoryCount = (category: string) => {
    if (category === "all") return mediaItems.length
    return mediaItems.filter(item => getFileCategory(item) === category).length
  }

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [audioElements])

  return (
    <div className="absolute inset-0 z-10 bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Media Gallery</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All ({getCategoryCount("all")})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "images"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("images")}
        >
          Images ({getCategoryCount("images")})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "videos"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("videos")}
        >
          Videos ({getCategoryCount("videos")})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "audio"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("audio")}
        >
          Audio ({getCategoryCount("audio")})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "documents"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Documents ({getCategoryCount("documents")})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id}>{renderMediaItem(item)}</div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {activeTab === "images" ? (
              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : activeTab === "videos" ? (
              <Video className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : activeTab === "audio" ? (
              <Music className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : activeTab === "documents" ? (
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            ) : (
              <File className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            )}
            <p className="text-gray-500 dark:text-gray-400">
              No {activeTab === "all" ? "media" : activeTab} found
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaGallery