// @ts-nocheck

"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  fetchAllDepartments,
  deleteDepartment,
  updateDepartment,
  setSelectedDepartment,
  clearSelectedDepartment,
  filterDepartments,
  clearDepartmentError,
  clearDepartmentSuccess,
  type Department,
} from "../../../../Redux/Slices/manageDepartmentSlice";
import type { AppDispatch, RootState } from "../../../../Redux/store";
import { Card } from "../../../ui/Card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Building,
  ChevronUp,
  ChevronDown,
  Loader,
  ListChecks,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MessageSquare,
  FileText,
  BarChart2,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Dialog, DialogContent } from "../../../ui/dialog";
import Loader2 from "../../../ui/Loader";
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
  company_id: Yup.number().nullable(),
});

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ICompany {
  id: number;
  name: string;
}

const DepartmentStatsCard: React.FC<{
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  loading?: boolean;
}> = ({ title, value, subtitle, icon, bgGradient, textColor, loading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-28`}>
        <div className="h-full flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            <div className="flex-1 flex flex-col justify-center ml-3">
              <p className={`${textColor} text-sm font-medium opacity-90 mb-1`}>{title}</p>
              <p className={`${textColor} text-2xl font-bold`}>
                {loading ? (
                  <motion.div
                    className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  value
                )}
              </p>
              {subtitle && <p className={`${textColor} text-xs opacity-75`}>{subtitle}</p>}
            </div>

            <div className={`${textColor} opacity-60 self-center`}>
              <Eye className="text-sm" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ManageDepartment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    departments,
    filteredDepartments,
    selectedDepartment,
    loading,
    error,
    success,
    successMessage,
    isEditing,
  } = useSelector((state: RootState) => state.departments);
  const { user } = useSelector((state: RootState) => state.login);
  const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  const [activeTab, setActiveTab] = useState("levels");
  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);

  const [departmentStats, setDepartmentStats] = useState({
    total: 0,
    withCompany: 0,
    withoutCompany: 0,
    byCompany: {} as Record<string, number>,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    dispatch(fetchAllDepartments());
    const organizationId = user?.organization?.id;

    if (!organizationId) {
      return;
    }

    axios
      .get<APIResponse<{ companies: ICompany[] }>>(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success && response.data.data.companies) {
          setCompanies(response.data.data.companies);
        } else {
          setCompanies([]);
        }
      })
      .catch((err) => {
        setCompanies([]);
      });
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(departments)) {
      const withCompany = departments.filter(
        (dept) => dept.company !== null
      ).length;
      const withoutCompany = departments.length - withCompany;

      const byCompany: Record<string, number> = {};
      departments.forEach((dept) => {
        if (dept.company) {
          const companyName = dept.company.name;
          byCompany[companyName] = (byCompany[companyName] || 0) + 1;
        }
      });

      setDepartmentStats({
        total: departments.length,
        withCompany,
        withoutCompany,
        byCompany,
      });
    }
  }, [departments]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearDepartmentSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(filterDepartments(value));
    setCurrentPage(1);
  };

  const handleEditClick = (department: Department) => {
    dispatch(setSelectedDepartment(department));
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDepartmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (departmentToDelete) {
      try {
        await dispatch(deleteDepartment(departmentToDelete)).unwrap();
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
      } catch (err) {
        // Error is handled in the slice
      }
    }
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedDepartments = () => {
    const sortableDepartments = Array.isArray(filteredDepartments)
      ? [...filteredDepartments]
      : [];

    if (sortConfig && sortableDepartments.length > 0) {
      sortableDepartments.sort((a, b) => {
        if (sortConfig.key === "company") {
          const aValue = a.company?.name || "";
          const bValue = b.company?.name || "";
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        } else {
          // @ts-ignore
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          // @ts-ignore
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableDepartments;
  };

  const sortedDepartments = getSortedDepartments();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartments = sortedDepartments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);

  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700 font-medium">
          <span className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, sortedDepartments.length)}</span> of{" "}
            <span className="font-semibold text-gray-900">{sortedDepartments.length}</span> departments
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
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
    );
  };

  return (
    <div className="px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Department Management</h1>
        <p className="text-sm text-gray-600">Manage departments, assign to companies</p>
      </motion.div>

      {/* Department Statistics Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DepartmentStatsCard
          title="Total Departments"
          value={departmentStats.total}
          subtitle="All departments"
          icon={<ListChecks className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentStatsCard
          title="With Company"
          value={departmentStats.withCompany}
          subtitle="Assigned to companies"
          icon={<Building className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />

        <DepartmentStatsCard
          title="Top Companies"
          value={Object.keys(departmentStats.byCompany).length > 0 ? "" : "No data"}
          subtitle={Object.keys(departmentStats.byCompany).length > 0 ? 
            Object.entries(departmentStats.byCompany)
              .slice(0, 2)
              .map(([company]) => company)
              .join(", ") : 
            "No company data"}
          icon={<Building className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />
      </div>

      {/* Main content area */}
      <Card className="w-full shadow-lg">
        <Card className="border-0">
          <div className="p-4">
            {error && (
              <div className="mb-4 p-3 border border-red-400 text-red-600 rounded-md flex gap-2 bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="text-sm">{error}</div>
                <button
                  onClick={() => dispatch(clearDepartmentError())}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 border border-green-400 text-green-600 rounded-md flex gap-2 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="text-sm">{successMessage}</div>
              </div>
            )}

            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search departments..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => dispatch(fetchAllDepartments())}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Department table or loading state */}
            {loading && !isEditing ? (
              <Loader2 />
            ) : !Array.isArray(filteredDepartments) ||
              filteredDepartments.length === 0 ? (
              <div className="text-center py-12 border rounded-md">
                <p className="text-gray-500">No departments found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
<thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
  <tr>
    <th scope="col" className="px-6 py-4 font-semibold">
      <div className="flex items-center gap-2">
        <span>#</span>
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer"
      onClick={() => requestSort("name")}
    >
      <div className="flex items-center gap-2">
        {/* Department Icon - Blue for information */}
        <FileText className="h-4 w-4 text-blue-500" />
        <span>Department Name</span>
        {sortConfig?.key === "name" &&
          (sortConfig.direction === "ascending" ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ))}
      </div>
    </th>

    <th
      scope="col"
      className="px-6 py-4 font-semibold cursor-pointer"
      onClick={() => requestSort("company")}
    >
      <div className="flex items-center gap-2">
        {/* Company Icon - Indigo for organization */}
        <Building className="h-4 w-4 text-indigo-500" />
        <span>Company</span>
        {sortConfig?.key === "company" &&
          (sortConfig.direction === "ascending" ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ))}
      </div>
    </th>

    {loggedInUser?.role !== "overall" && (
      <th scope="col" className="px-6 py-4 font-semibold text-right">
        Actions
      </th>
    )}
  </tr>
</thead>

                    <tbody className="divide-y divide-gray-100">
                      {currentDepartments.map((department, index) => (
                        <motion.tr
                          key={department.id}
                          className="bg-white hover:bg-gray-50 transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {department.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {department.company ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">
                                  {department.company.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          {loggedInUser?.role !== "overall" && (
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1">
                                <div className="flex items-center rounded-md gap-1">
                                  <button
                                    onClick={() => handleEditClick(department)}
                                    className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                                    title="Edit Department"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline ml-1">Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteClick(department.id)}
                                    className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-red-600 text-white hover:bg-red-700 transition duration-150 shadow"
                                    title="Delete Department"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline ml-1">Delete</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {Array.isArray(filteredDepartments) &&
                  filteredDepartments.length > itemsPerPage && <PaginationControls />}
              </div>
            )}
          </div>
        </Card>
      </Card>

      {/* Edit Department Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedDepartment && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Edit Department</h3>
                <Formik
                  initialValues={{
                    name: selectedDepartment.name,
                    company_id: selectedDepartment.company?.id || "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {
                    const departmentData = {
                      name: values.name,
                      company_id: values.company_id
                        ? Number(values.company_id)
                        : null,
                    };

                    try {
                      await dispatch(
                        updateDepartment({
                          id: selectedDepartment.id,
                          departmentData,
                        })
                      ).unwrap();
                      setIsEditModalOpen(false);
                      dispatch(clearSelectedDepartment());
                      dispatch(fetchAllDepartments());
                    } catch (err) {
                      // Error is handled in the slice
                    }
                  }}
                >
                  {({ values, isSubmitting }) => (
                    <Form className="space-y-4">
                      {/* Department Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Department Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="name"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>

                      {/* Company Selection */}
                      <div>
                        <label
                          htmlFor="company_id"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Company
                        </label>
                        <Field
                          as="select"
                          name="company_id"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Not Assigned to Any Company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Department"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditModalOpen(false);
                            dispatch(clearSelectedDepartment());
                          }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* View Users Modal */}
      <Dialog
        open={isViewUsersModalOpen}
        onOpenChange={setIsViewUsersModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Users in {selectedDepartment?.name}
            </h3>
            {selectedDepartment?.users &&
            selectedDepartment.users.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDepartment.users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users in this department</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsViewUsersModalOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this department. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDepartmentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageDepartment;