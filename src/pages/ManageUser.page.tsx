// @ts-nocheck

"use client";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  updateUserRole,
  deleteUser,
  deactivateUser
} from "../Redux/Slices/ManageUserSlice";
import {
  updateUser,
  clearError as clearAuthError,
  clearSuccess as clearAuthSuccess,
} from "../Redux/Slices/AuthSlice";
import {
  fetchHoldingCompanies,
  fetchSupervisoryLevels,
  fetchPositions,
  fetchOrganizationDepartments,
} from "../Redux/Slices/RegisterSlice";
import type { AppDispatch, RootState } from "../Redux/store";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Shield,
  User,
  Briefcase,
  Filter,
  Settings,
  X,
  Save,
  Loader2,
  FileText,
  Building2,
  BarChart2,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import Checkbox from "../components/ui/checkbox";
import { debounce } from "lodash";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";

// Enhanced Summary Card Component similar to TaskSummaryCard
interface UserSummaryCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  loading?: boolean;
}

const UserSummaryCard: React.FC<UserSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  bgGradient,
  textColor,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-16`}>
        <div className="h-full flex items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-3">
            {/* Icon Section - Reduced size */}
            <div className="bg-white/20 p-1.5 rounded-md backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-base`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {React.cloneElement(icon, { className: "h-4 w-4" })}
              </motion.div>
            </div>

            {/* Text Content Section - Reduced text sizes */}
            <div className="flex-1 flex flex-col justify-center ml-2">
              <p className={`${textColor} text-[0.65rem] font-medium opacity-90 mb-0.5 leading-none`}>{title}</p>
              <p className={`${textColor} text-base font-bold leading-tight`}>
                {loading ? (
                  <motion.div
                    className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  value
                )}
              </p>
              {subtitle && <p className={`${textColor} text-[0.6rem] opacity-75 -mt-0.5 leading-none`}>{subtitle}</p>}
            </div>

            {/* Eye Icon Section - Reduced size */}
            <div className={`${textColor} opacity-60 self-center`}>
              <Eye className="text-xs" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};


const ManageUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.manageUser
  );
  const { currentUser, updateLoading, updateError, updateSuccess } =
    useSelector((state: RootState) => state.auth);
  const {
    holdingCompanies,
    supervisoryLevels,
    positions,
    organizationStructure,
  } = useSelector((state: RootState) => state.register);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isEditRoleVisible, setIsEditRoleVisible] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [activityFilter, setActivityFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);
  const [deactivateMessage, setDeactivateMessage] = useState<string>("");

  // Update user modal states
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<any>(null);
  const [updateFormData, setUpdateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    supervisoryLevelId: "none",
    company_id: "none",
    department_id: "none",
    position_id: "none",
    directSupervisorPositionId: "none",
  });

  const { user: loggedInUser } = useSelector((state: RootState) => state.login);
  const hasSubsidiaries = loggedInUser?.organization?.hasSubsidiaries || false;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
      dispatch(fetchHoldingCompanies());
      dispatch(fetchSupervisoryLevels());
      dispatch(fetchPositions());
      if (!hasSubsidiaries) {
        dispatch(fetchOrganizationDepartments());
      }
    }
  }, [dispatch, loggedInUser, hasSubsidiaries]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success("User updated successfully!");
      setIsUpdateModalVisible(false);
      setUserToUpdate(null);
      resetUpdateForm();
      dispatch(clearAuthSuccess());
      if (loggedInUser?.organization?.id) {
        dispatch(fetchUsers(loggedInUser.organization.id));
      }
    }
  }, [updateSuccess, dispatch, loggedInUser]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
      dispatch(clearAuthError());
    }
  }, [updateError, dispatch]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleDeactivateUser = async () => {
    if (userToDeactivate) {
      try {
        const resultAction = await dispatch(deactivateUser(userToDeactivate));
        if (deactivateUser.fulfilled.match(resultAction)) {
          setDeactivateMessage(resultAction.payload.message || "User deactivated successfully");
          if (loggedInUser?.organization?.id) {
            await dispatch(fetchUsers(loggedInUser.organization.id));
          }
        } else {
          setDeactivateMessage(resultAction.payload || "Failed to deactivate user");
        }
        setUserToDeactivate(null);
      } catch (error) {
        setDeactivateMessage("Failed to deactivate user");
        setUserToDeactivate(null);
      }
    }
  };

  const handleBulkUpdateRole = async () => {
    if (!newRole) return;

    try {
      for (const userId of selectedUsers) {
        await dispatch(updateUserRole({ userId, newRole })).unwrap();
      }
      if (loggedInUser?.organization?.id) {
        dispatch(fetchUsers(loggedInUser.organization.id));
      }
      setSelectedUsers([]);
      setIsEditRoleVisible(false);
    } catch (error) { }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete)).unwrap();
        setUserToDelete(null);
        setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete));
      } catch (error) { }
    }
  };

  const handleUpdateUser = (user: any) => {
    setUserToUpdate(user);
    setUpdateFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      telephone: user.telephone || "",
      supervisoryLevelId: user.supervisoryLevelObj?.id?.toString() || "none",
      company_id: user.company?.id?.toString() || "none",
      department_id: user.department?.id?.toString() || "none",
      position_id: user.position?.id?.toString() || "none",
      directSupervisorPositionId: user.position?.directSupervisor?.id?.toString() || "none",
    });
    setIsUpdateModalVisible(true);
  };

  const resetUpdateForm = () => {
    setUpdateFormData({
      firstName: "",
      lastName: "",
      email: "",
      telephone: "",
      supervisoryLevelId: "none",
      company_id: "none",
      department_id: "none",
      position_id: "none",
      directSupervisorPositionId: "none",
    });
  };

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "position_id" && value && value !== "none") {
      const selectedPosition = positions.find(
        (pos) => pos.id === Number(value)
      );
      if (selectedPosition) {
        if (selectedPosition.supervisoryLevel?.id) {
          setUpdateFormData((prev) => ({
            ...prev,
            supervisoryLevelId: selectedPosition.supervisoryLevel.id.toString(),
          }));
        }
        if (selectedPosition.department?.id) {
          setUpdateFormData((prev) => ({
            ...prev,
            department_id: selectedPosition.department.id.toString(),
          }));
        }
      }
    }

    if (field === "company_id") {
      setUpdateFormData((prev) => ({
        ...prev,
        department_id: "none",
        position_id: "none",
        supervisoryLevelId: "none",
      }));
    }
  };

  const handleSubmitUpdate = async () => {
    if (!userToUpdate) return;

    const updateData: any = {};

    if (updateFormData.firstName.trim())
      updateData.firstName = updateFormData.firstName.trim();
    if (updateFormData.lastName.trim())
      updateData.lastName = updateFormData.lastName.trim();
    if (updateFormData.email.trim())
      updateData.email = updateFormData.email.trim();
    if (updateFormData.telephone.trim())
      updateData.telephone = updateFormData.telephone.trim();

    if (updateFormData.supervisoryLevelId !== "none") {
      updateData.supervisoryLevelId =
        updateFormData.supervisoryLevelId === "none"
          ? -1
          : Number(updateFormData.supervisoryLevelId);
    }
    if (updateFormData.company_id !== "none") {
      updateData.company_id =
        updateFormData.company_id === "none"
          ? -1
          : Number(updateFormData.company_id);
    }
    if (updateFormData.department_id !== "none") {
      updateData.department_id =
        updateFormData.department_id === "none"
          ? -1
          : Number(updateFormData.department_id);
    }
    if (updateFormData.position_id !== "none") {
      updateData.position_id =
        updateFormData.position_id === "none"
          ? -1
          : Number(updateFormData.position_id);
    }
    if (updateFormData.directSupervisorPositionId !== "none") {
      updateData.directSupervisorPositionId =
        updateFormData.directSupervisorPositionId === "none"
          ? -1
          : Number(updateFormData.directSupervisorPositionId);
    }

    dispatch(updateUser({ userId: userToUpdate.id, userData: updateData }));
  };

  const getFilteredPositions = () => {
    if (!hasSubsidiaries || updateFormData.company_id === "none") {
      return positions;
    }
    return positions.filter(
      (position) =>
        position.company &&
        position.company.id === Number(updateFormData.company_id)
    );
  };

  const getDepartmentOptions = () => {
    if (!organizationStructure) return [];

    if (updateFormData.company_id !== "none") {
      const selectedSubsidiary = organizationStructure.subsidiaries?.find(
        (sub: any) => sub.id === Number(updateFormData.company_id)
      );
      return selectedSubsidiary?.departments || [];
    }

    return organizationStructure.departments || [];
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRoles.length === 0 || selectedRoles.includes(user.role)) &&
      (activityFilter === "all" ||
        (activityFilter === "active" && user.role !== "disabled") ||
        (activityFilter === "disabled" && user.role === "disabled"))
  );

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === currentUsers.length
        ? []
        : currentUsers.map((user) => user.id)
    );
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setCurrentPage(1);
  };

  const getInitials = (username: string) => {
    return (
      username
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || username.substring(0, 2).toUpperCase()
    );
  };

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
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700 font-medium">
          <span className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{indexOfFirstUser + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
            <span className="font-semibold text-gray-900">{filteredUsers.length}</span> users
          </span>
          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm ${
                page === currentPage
                  ? "bg-emerald-500 text-white border border-emerald-500 shadow-emerald-200"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="mt-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 bg-clip-text text-transparent">
                User Management
              </h1>

            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">User Analytics</h2>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <UserSummaryCard
                  title="Total Users"
                  value={users.length}
                  subtitle="All registered"
                  icon={<Users />}
                  bgGradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                  textColor="text-white"
                  loading={loading}
                />

                <UserSummaryCard
                  title="Overall"
                  value={users.filter((user) => user.role === "overall").length}
                  subtitle="Administrators"
                  icon={<Shield />}
                  bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  textColor="text-white"
                  loading={loading}
                />

                <UserSummaryCard
                  title="Supervisor"
                  value={users.filter((user) => user.role === "supervisor").length}
                  subtitle="Team leaders"
                  icon={<User />}
                  bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  textColor="text-white"
                  loading={loading}
                />

                <UserSummaryCard
                  title="Employee"
                  value={users.filter((user) => user.role === "employee").length}
                  subtitle="Regular users"
                  icon={<Briefcase />}
                  bgGradient="bg-gradient-to-br from-green-500 to-green-600"
                  textColor="text-white"
                  loading={loading}
                />

                <UserSummaryCard
                  title="Disabled"
                  value={users.filter((user) => user.role === "disabled").length}
                  subtitle="Inactive"
                  icon={<UserX />}
                  bgGradient="bg-gradient-to-br from-red-500 to-red-600"
                  textColor="text-white"
                  loading={loading}
                />

                <UserSummaryCard
                  title="Active"
                  value={users.filter((user) => user.role !== "disabled").length}
                  subtitle="Currently active"
                  icon={<UserCheck />}
                  bgGradient="bg-gradient-to-br from-teal-500 to-teal-600"
                  textColor="text-white"
                  loading={loading}
                />
              </div>
            </motion.div>

            {/* Filters Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8 bg-gradient-to-r from-white to-slate-50 shadow-lg border-0 ring-1 ring-slate-200">
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    {/* Search Bar */}
                    <div className="relative w-full xl:w-80">
                      <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl shadow-sm transition-all duration-200"
                      />
                    </div>

                    {/* Role Filters */}
                    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">
                          Filter by role:
                        </span>
                      </div>
                      {["overall", "supervisor", "employee", "disabled"].map(
                        (role) => (
                          <div
                            key={role}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`role-${role}`}
                              checked={selectedRoles.includes(role)}
                              onCheckedChange={() => handleRoleChange(role)}
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <label
                              htmlFor={`role-${role}`}
                              className="text-sm font-medium text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors duration-200"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </label>
                          </div>
                        )
                      )}
                    </div>

                    {/* Status and Per Page Selectors */}
                    <div className="flex items-center gap-4">
                      <Select
                        value={activityFilter}
                        onValueChange={setActivityFilter}
                      >
                        <SelectTrigger className="w-48 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl shadow-sm transition-all duration-200">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="all"
                            className="hover:bg-emerald-50"
                          >
                            All Users
                          </SelectItem>
                          <SelectItem
                            value="active"
                            className="hover:bg-emerald-50"
                          >
                            Active Users
                          </SelectItem>
                          <SelectItem
                            value="disabled"
                            className="hover:bg-emerald-50"
                          >
                            Disabled Users
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
{/* Enhanced Users Table */}
{error ? (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg">
      <div className="p-8">
        <div className="text-red-600 flex flex-col items-center justify-center py-8">
          <div className="bg-red-100 rounded-full p-4 mb-4">
            <UserX className="h-8 w-8 text-red-600" />
          </div>
          <p className="mb-4 font-semibold text-lg">{error}</p>
          <Button
            onClick={() =>
              loggedInUser?.organization?.id &&
              dispatch(fetchUsers(loggedInUser.organization.id))
            }
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
) : (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="w-full"
  >
    {/* Enhanced Smart Table */}
    <div className="bg-white rounded-lg shadow-md overflow-auto">
      <div className="min-w-[1200px]"> {/* Set minimum width to ensure content fits */}
        <table className="w-full text-sm text-left text-gray-600">
<thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
  <tr>
    <th scope="col" className="px-4 py-3 font-semibold">
      <div className="flex items-center gap-2">
        <span>#</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[180px]">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-500" /> {/* blue = document */}
        <span>User Name</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[150px]">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-indigo-500" /> {/* indigo = company/structure */}
        <span>Company</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[150px]">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-green-600" /> {/* green = stats/growth */}
        <span>Department</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[150px]">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-orange-500" /> {/* orange = work/role */}
        <span>Position</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[180px]">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-teal-500" /> {/* teal = person/supervisor */}
        <span>Direct Supervisor</span>
      </div>
    </th>
    <th scope="col" className="px-4 py-3 font-semibold min-w-[120px]">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-red-500" /> {/* red = level/protection */}
        <span>Level</span>
      </div>
    </th>
    {loggedInUser?.role !== "overall" && (
      <th scope="col" className="px-4 py-3 font-semibold min-w-[150px]">
        <div className="flex items-center gap-2">
          <span>Actions</span>
        </div>
      </th>
    )}
  </tr>
</thead>

          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {currentUsers.map((tableUser, index) => (
                <motion.tr
                  key={tableUser.id}
                  className="bg-white hover:bg-gray-50 transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                      {indexOfFirstUser + index + 1}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">

                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {tableUser.username}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {tableUser.company?.name ||
                      loggedInUser?.organization?.name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700" title={tableUser.company?.name || loggedInUser?.organization?.name}>
                          {tableUser.company?.name || loggedInUser?.organization?.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {tableUser.department?.name ? (
                      <span className="text-sm text-gray-700">
                        {tableUser.department.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {tableUser.position?.title ? (
                      <span className="text-sm text-gray-700">
                        {tableUser.position.title}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">
                        {tableUser.position?.directSupervisor
                          ? `${tableUser.position.directSupervisor.title}`
                          : "Top level Supervisor"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {tableUser.supervisoryLevel?.level ? (
                      <span className="text-sm text-gray-700">
                        {tableUser.supervisoryLevel.level}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  {loggedInUser?.role !== "overall" && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateUser(tableUser)}
                          className="flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                          title="Edit User"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="ml-1">Edit</span>
                        </button>

                        <button
                          onClick={() => setUserToDeactivate(tableUser.id)}
                          className={`flex items-center px-3 py-1.5 text-xs font-medium rounded transition duration-150 shadow ${
                            tableUser.isActive 
                              ? "bg-red-600 text-white hover:bg-red-700" 
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          title={tableUser.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {tableUser.isActive ? (
                            <UserX className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                          <span className="ml-1">
                            {tableUser.isActive ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls />
    </div>
  </motion.div>
)}
          </>
        )}

{/* Update User Modal - Enhanced modern styling */}
        <Dialog
          open={isUpdateModalVisible}
          onOpenChange={setIsUpdateModalVisible}
        >
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-0 shadow-2xl rounded-2xl w-[92vw] max-w-6xl max-h-[92vh] overflow-hidden z-50">
            {/* Compact Smart Header */}
            <DialogHeader className="sticky top-0 bg-gradient-to-r from-white via-slate-50 to-white z-20 px-6 py-4 border-b border-slate-200 shadow-sm">
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-2.5 mr-3 border border-blue-200">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="block text-lg">Update User</span>
                  <span className="text-sm font-medium text-slate-600 block">
                    {userToUpdate?.username}
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto max-h-[calc(92vh-140px)] px-6 py-4">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                      <div className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg p-2 mr-3">
                        <User className="h-4 w-4 text-slate-700" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="h-0.5 bg-slate-300 rounded-full">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-12 transition-all duration-300"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        First Name
                      </label>
                      <Input
                        value={updateFormData.firstName}
                        onChange={(e) =>
                          handleUpdateFormChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Last Name
                      </label>
                      <Input
                        value={updateFormData.lastName}
                        onChange={(e) =>
                          handleUpdateFormChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={updateFormData.email}
                        onChange={(e) =>
                          handleUpdateFormChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        className="bg-slate-100 border border-slate-300 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Telephone
                      </label>
                      <Input
                        value={updateFormData.telephone}
                        onChange={(e) =>
                          handleUpdateFormChange("telephone", e.target.value)
                        }
                        placeholder="Enter telephone number"
                        className="bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:border-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                      <div className="bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg p-2 mr-3">
                        <Briefcase className="h-4 w-4 text-blue-700" />
                      </div>
                      Company Information
                    </h3>
                    <div className="h-0.5 bg-blue-300 rounded-full">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full w-16 transition-all duration-300"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Company Selection (only if has subsidiaries) */}
                    {hasSubsidiaries && organizationStructure?.subsidiaries && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Company
                        </label>
                        <Select
                          value={updateFormData.company_id}
                          onValueChange={(value) =>
                            handleUpdateFormChange("company_id", value)
                          }
                        >
                          <SelectTrigger className="bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:border-slate-400">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-48">
                            <SelectItem
                              value="none"
                              className="rounded-md text-sm py-2 hover:bg-slate-50"
                            >
                              No Company
                            </SelectItem>
                            {organizationStructure.subsidiaries.map(
                              (company: any) => (
                                <SelectItem
                                  key={company.id}
                                  value={company.id.toString()}
                                  className="rounded-md text-sm py-2 hover:bg-slate-50"
                                >
                                  {company.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Position Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Position
                      </label>
                      <Select
                        value={updateFormData.position_id}
                        onValueChange={(value) =>
                          handleUpdateFormChange("position_id", value)
                        }
                      >
                        <SelectTrigger className="bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:border-slate-400">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-48">
                          <SelectItem
                            value="none"
                            className="rounded-md text-sm py-2 hover:bg-slate-50"
                          >
                            No Position
                          </SelectItem>
                          {getFilteredPositions().map((position) => (
                            <SelectItem
                              key={position.id}
                              value={position.id.toString()}
                              className="rounded-md text-sm py-2 hover:bg-slate-50"
                            >
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Direct Supervisor Position Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Direct Supervisor Position
                      </label>
                      <Select
                        value={updateFormData.directSupervisorPositionId}
                        onValueChange={(value) =>
                          handleUpdateFormChange("directSupervisorPositionId", value)
                        }
                        disabled={updateFormData.position_id === "none"}
                      >
                        <SelectTrigger
                          className={`bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            updateFormData.position_id === "none"
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : "hover:border-slate-400"
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              updateFormData.position_id === "none"
                                ? "Select position first"
                                : "Select direct supervisor position"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-48">
                          <SelectItem
                            value="none"
                            className="rounded-md text-sm py-2 hover:bg-slate-50"
                          >
                            No Supervisor Position
                          </SelectItem>
                          {positions
                            .filter((pos) => 
                              pos.id !== Number(updateFormData.position_id) &&
                              (updateFormData.company_id === "none" || 
                               pos.company?.id === Number(updateFormData.company_id))
                            )
                            .map((position) => (
                              <SelectItem
                                key={position.id}
                                value={position.id.toString()}
                                className="rounded-md text-sm py-2 hover:bg-slate-50"
                              >
                                {position.title} ({position.department?.name || "No Department"})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Department
                      </label>
                      <Select
                        value={updateFormData.department_id}
                        onValueChange={(value) =>
                          handleUpdateFormChange("department_id", value)
                        }
                        disabled={updateFormData.position_id !== "none"}
                      >
                        <SelectTrigger
                          className={`bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${updateFormData.position_id !== "none"
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : "hover:border-slate-400"
                            }`}
                        >
                          <SelectValue
                            placeholder={
                              updateFormData.position_id !== "none"
                                ? "Auto-filled from position"
                                : "Select department"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-48">
                          <SelectItem
                            value="none"
                            className="rounded-md text-sm py-2 hover:bg-slate-50"
                          >
                            No Department
                          </SelectItem>
                          {getDepartmentOptions().map((dept: any) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                              className="rounded-md text-sm py-2 hover:bg-slate-50"
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updateFormData.position_id !== "none" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-2">
                          <p className="text-xs text-blue-700 font-medium flex items-center">
                            <svg
                              className="h-3 w-3 mr-2 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Department is automatically filled based on selected position
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Supervisory Level Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Supervisory Level
                      </label>
                      <Select
                        value={updateFormData.supervisoryLevelId}
                        onValueChange={(value) =>
                          handleUpdateFormChange("supervisoryLevelId", value)
                        }
                        disabled={updateFormData.position_id !== "none"}
                      >
                        <SelectTrigger
                          className={`bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${updateFormData.position_id !== "none"
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : "hover:border-slate-400"
                            }`}
                        >
                          <SelectValue
                            placeholder={
                              updateFormData.position_id !== "none"
                                ? "Auto-filled from position"
                                : "Select supervisory level"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg max-h-48">
                          <SelectItem
                            value="none"
                            className="rounded-md text-sm py-2 hover:bg-slate-50"
                          >
                            No Level
                          </SelectItem>
                          {supervisoryLevels.map((level) => (
                            <SelectItem
                              key={level.id}
                              value={level.id.toString()}
                              className="rounded-md text-sm py-2 hover:bg-slate-50"
                            >
                              {level.level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updateFormData.position_id !== "none" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-2">
                          <p className="text-xs text-blue-700 font-medium flex items-center">
                            <svg
                              className="h-3 w-3 mr-2 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Supervisory level is automatically filled based on selected position
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Smart Footer */}
            <DialogFooter className="sticky bottom-0 bg-gradient-to-r from-white via-slate-50 to-white z-20 flex justify-end gap-3 px-6 py-4 border-t border-slate-200 shadow-sm">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUpdateModalVisible(false);
                  setUserToUpdate(null);
                  resetUpdateForm();
                }}
                className="border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 h-10 px-6 rounded-lg font-semibold text-sm"
                disabled={updateLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUpdate}
                disabled={updateLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 h-10 px-8 rounded-lg font-semibold text-sm"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleVisible} onOpenChange={setIsEditRoleVisible}>
          <DialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Change Role for{" "}
                {selectedUsers.length > 1
                  ? `${selectedUsers.length} Users`
                  : "User"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select onValueChange={setNewRole}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl py-3">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="admin" className="hover:bg-emerald-50">
                    Admin
                  </SelectItem>
                  <SelectItem
                    value="supervisor"
                    className="hover:bg-emerald-50"
                  >
                    Supervisor
                  </SelectItem>
                  <SelectItem value="employee" className="hover:bg-emerald-50">
                    Employee
                  </SelectItem>
                  <SelectItem value="disabled" className="hover:bg-emerald-50">
                    Disabled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditRoleVisible(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdateRole}
                disabled={!newRole}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={() => setUserToDelete(null)}
        >
          <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
            <AlertDialogHeader className="pb-4">
              <AlertDialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                This action will permanently delete the user account and cannot
                be undone. All associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-200"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
          open={!!userToDeactivate}
          onOpenChange={() => setUserToDeactivate(null)}
        >
          <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
            <AlertDialogHeader className="pb-4">
              <AlertDialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                This action will deactivate the user account and cannot be undone. All associated data will be preserved but the user will not be able to log in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateUser}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-200"
              >
                Deactivate User
              </AlertDialogAction>
            </AlertDialogFooter>
            {deactivateMessage && (
              <div className="mt-4 text-center text-sm text-red-600">{deactivateMessage}</div>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ManageUser;
