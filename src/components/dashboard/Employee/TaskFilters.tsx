"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaSearch, FaFilter, FaCalendarAlt, FaArrowRight, FaTimes } from "react-icons/fa"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Card } from "../../ui/Card"
import { Calendar } from "../../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { format } from "date-fns"
import { Badge } from "../../ui/Badge"
interface TaskFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  startDate?: Date
  endDate?: Date
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onClearFilters: () => void
  showDateFilters?: boolean
  placeholder?: string
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  showDateFilters = true,
  placeholder = "Search tasks...",
}) => {
  const [isStartDateOpen, setIsStartDateOpen] = React.useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = React.useState(false)

  const hasActiveFilters = searchTerm || startDate || endDate

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border shadow-sm bg-white">
        <div className="p-4">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="bg-blue-500 p-1.5 rounded-md">
              <FaFilter className="text-white text-xs" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Filter Tasks</h3>
          </motion.div>

          {/* Compact Filter Row */}
          <div className={`flex flex-col ${showDateFilters ? "md:flex-row" : ""} gap-3 items-end`}>
            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex-1 w-full"
            >
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-8 h-10 bg-white border-gray-200 focus:border-blue-500"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <FaTimes className="text-xs" />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Date Range Filter */}
            {showDateFilters && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex-1 w-full flex gap-2 items-center"
              >
                {/* Start Date */}
                <div className="flex-1">
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 justify-start text-left font-normal text-sm px-3"
                      >
                        <FaCalendarAlt className="mr-2 h-3 w-3 text-blue-500" />
                        <span className={startDate ? "text-gray-900" : "text-gray-500"}>
                          {startDate ? format(startDate, "PP") : "Start"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white shadow-lg border" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          onStartDateChange(date)
                          setIsStartDateOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  <FaArrowRight className="text-xs" />
                </div>

                {/* End Date */}
                <div className="flex-1">
                  <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 justify-start text-left font-normal text-sm px-3"
                      >
                        <FaCalendarAlt className="mr-2 h-3 w-3 text-blue-500" />
                        <span className={endDate ? "text-gray-900" : "text-gray-500"}>
                          {endDate ? format(endDate, "PP") : "End"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white shadow-lg border" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          onEndDateChange(date)
                          setIsEndDateOpen(false)
                        }}
                        initialFocus
                        disabled={(date) => (startDate ? date < startDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters}
                  className="h-10 px-3 text-sm"
                >
                  <FaTimes className="mr-1 text-xs" />
                  Clear
                </Button>
              </motion.div>
            )}
          </div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-gray-200"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-medium text-gray-500">Active filters:</div>
                  
                  <div className="text-white flex flex-wrap gap-1">
                    {searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="text-xs py-1">
                          <FaSearch className="mr-1 text-xs" />
                          {searchTerm}
                        </Badge>
                      </motion.div>
                    )}
                    
                    {startDate && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <Badge variant="secondary" className="text-xs py-1">
                          <FaCalendarAlt className="mr-1 text-xs" />
                          {format(startDate, "PP")}
                        </Badge>
                      </motion.div>
                    )}
                    
                    {endDate && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                      >
                        <Badge variant="secondary" className="text-xs py-1">
                          <FaCalendarAlt className="mr-1 text-xs" />
                          {format(endDate, "PP")}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}

export default TaskFilters