"use client"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaComments, FaTimes, FaUser } from "react-icons/fa"
import { Button } from "../../ui/button"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  taskTitle: string
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, comments, taskTitle }) => {
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
            <div className="bg-gradient-to-r from-blue to-blue-600 text-white p-6">
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
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue text-white p-2 rounded-full flex-shrink-0">
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

export default CommentsModal
