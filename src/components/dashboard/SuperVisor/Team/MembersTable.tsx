"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Mail,
  Tag,
  BarChart2,
  Hash,
} from "lucide-react"

interface MembersTableProps {
  teamMembers: any[]
  loading?: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortConfig: {
    key: string | null
    direction: "ascending" | "descending" | null
  }
  setSortConfig: (config: any) => void
  filterRole: string | null
  setFilterRole: (role: string | null) => void
  uniqueRoles: string[]
}

const MembersTable: React.FC<MembersTableProps> = ({
  teamMembers,
  loading = false,
  searchTerm,
  setSearchTerm,
  sortConfig,
  setSortConfig,
  filterRole,
  setFilterRole,
  uniqueRoles
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = teamMembers.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const email = member.email.toLowerCase()
      const username = member.username.toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = fullName.includes(searchLower) || 
                           email.includes(searchLower) || 
                           username.includes(searchLower)
      
      const matchesRole = !filterRole || member.role === filterRole

      return matchesSearch && matchesRole
    })

    // Sort if configured
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [teamMembers, searchTerm, filterRole, sortConfig])

  // Pagination calculations
  const totalMembers = filteredAndSortedMembers.length
  const totalPages = Math.ceil(totalMembers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMembers = filteredAndSortedMembers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRole, sortConfig])

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending"

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending"
      } else if (sortConfig.direction === "descending") {
        direction = null
      }
    }

    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-50">
          <ChevronDown size={16} />
        </span>
      )
    }

    if (sortConfig.direction === "ascending") {
      return (
        <span className="ml-1">
          <ChevronUp size={16} />
        </span>
      )
    }

    if (sortConfig.direction === "descending") {
      return (
        <span className="ml-1">
          <ChevronDown size={16} />
        </span>
      )
    }

    return (
      <span className="ml-1 opacity-50">
        <ChevronDown size={16} />
      </span>
    )
  }

  const renderRoleBadge = (role: string) => {
    let bgColor = "bg-gray-100 text-gray-800 border border-gray-200"

    if (role === "supervisor") {
      bgColor = "bg-blue-100 text-blue-800 border border-blue-200"
    } else if (role === "employee") {
      bgColor = "bg-green-100 text-green-800 border border-green-200"
    }

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${bgColor} shadow-sm`}>
        {role}
      </span>
    )
  }

  // Pagination component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, totalMembers)} of {totalMembers} members
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                page === currentPage
                  ? "bg-green-500 text-white border border-green-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or username..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filterRole || ""}
                onChange={(e) => setFilterRole(e.target.value || null)}
              >
                <option value="">All roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Smart Table */}
      {totalMembers > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
<thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
  <tr>
    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-gray-400" /> {/* Neutral for ID */}
        <span>#</span>
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer group"
      onClick={() => handleSort("firstName")}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-600" /> {/* Blue for Name */}
        <span>Name</span>
        {getSortIcon("firstName")}
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer group"
      onClick={() => handleSort("username")}
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-indigo-600" /> {/* Indigo for team/username */}
        <span>Username</span>
        {getSortIcon("username")}
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer group hidden lg:table-cell"
      onClick={() => handleSort("email")}
    >
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-red-500" /> {/* Red for communication */}
        <span>Email</span>
        {getSortIcon("email")}
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer group"
      onClick={() => handleSort("role")}
    >
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-emerald-600" /> {/* Emerald for role/job */}
        <span>Role</span>
        {getSortIcon("role")}
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer group"
      onClick={() => handleSort("level")}
    >
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-yellow-600" />
        <span>Level</span>
        {getSortIcon("level")}
      </div>
    </th>
  </tr>
</thead>

              <tbody className="divide-y divide-gray-100">
                {currentMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    className="bg-white hover:bg-gray-50 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                        {startIndex + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">{member.username}</div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="text-gray-600 truncate max-w-48" title={member.email}>
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderRoleBadge(member.role)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200">
                        {member.level}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700">No team members found</h3>
          <p className="text-gray-500 mt-2">
            Try selecting a different team or adjusting your search filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default MembersTable