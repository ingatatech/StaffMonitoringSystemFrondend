"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaSpinner, FaTag } from "react-icons/fa"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"

interface TaskType {
  id: number
  name: string
  organization: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

interface TaskTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string }) => Promise<void>
  mode: "create" | "edit"
  initialData?: TaskType | null
  isLoading?: boolean
}

const TaskTypeModal: React.FC<TaskTypeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
        })
      } else {
        setFormData({
          name: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, initialData])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Task type name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Task type name must be at least 2 characters"
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Task type name must be less than 255 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
      })
      onClose()
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl border-0 bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                      <FaTag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {mode === "create" ? "Create Task Type" : "Edit Task Type"}
                      </CardTitle>
                      <p className="text-blue-100 text-sm mt-1">
                        {mode === "create" 
                          ? "Add a new task type to organize your work" 
                          : "Update the task type information"
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 hover:scale-105"
                    disabled={isSubmitting}
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-8 bg-white">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Task Type Name */}
                  <div className="space-y-3">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                      Task Type Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter task type name (e.g., Development, Testing, Documentation)"
                        className={`w-full h-12 px-4 text-base bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:bg-white focus:shadow-md ${
                          errors.name 
                            ? "border-red-300 focus:border-red-500 bg-red-50" 
                            : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                        }`}
                        disabled={isSubmitting}
                        maxLength={255}
                      />
                      {errors.name && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-2 flex items-center"
                        >
                          <span className="mr-1">⚠️</span>
                          {errors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 text-xs">
                        Use descriptive names to categorize your tasks effectively
                      </p>
                      <p className="text-gray-400 text-xs font-mono">
                        {formData.name.length}/255 characters
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      disabled={isSubmitting}
                      className="px-8 py-3 h-12 text-base border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 h-12 text-base rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-3 h-5 w-5" />
                          {mode === "create" ? "Creating..." : "Updating..."}
                        </>
                      ) : (
                        <>{mode === "create" ? "Create Task Type" : "Update Task Type"}</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TaskTypeModal