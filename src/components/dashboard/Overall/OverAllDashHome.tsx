// @ts-nocheck

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';

import { useAppDispatch, useAppSelector } from '../../../Redux/hooks';
import { logout } from '../../../Redux/Slices/LoginSlices';
import { useNavigate } from 'react-router-dom';
import { 
  fetchSummaryreportOfOrganization, 
  getTaskStatusOverview, 
  getEmployeePerformance 
} from '../../../Redux/Slices/SystemLeaderSlice';
// Import the new styled components
import AdminDashboardHeader from '../Client/AdminDashboardHeader';
import AdminSummaryCards from '../Client/AdminSummaryCards';
import axios from 'axios';
import Loader from '../../ui/Loader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OverAllDashHome = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [summaryReport, setSummaryReport] = useState(null);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.login);
  const apiUrl = `${import.meta.env.VITE_BASE_URL}`;

  const handleAutoLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(fetchSummaryreportOfOrganization()).unwrap().then(setSummaryReport),
        dispatch(getTaskStatusOverview()).unwrap().then((result) => {
          if (result?.taskStatusOverview) setTaskStatusData(result.taskStatusOverview);
        }),
        dispatch(getEmployeePerformance()).unwrap().then((result) => {
          if (result) {
            if (result.employeePerformance) setEmployeeData(result.employeePerformance);
            if (result.summary) setEmployeeSummary(result.summary);
          }
        }),
      ]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!user || !token) {
          handleAutoLogout();
          return;
        }

        if (user.organization && !user.organization.isActive) {
          handleAutoLogout();
          return;
        }

        await axios.get(`${import.meta.env.VITE_BASE_URL}/user/validate-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      } catch (error) {
        handleAutoLogout();
      }
    };

    checkAuthStatus();

    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        await Promise.all([
          dispatch(fetchSummaryreportOfOrganization()).unwrap().then(setSummaryReport),
          dispatch(getTaskStatusOverview()).unwrap().then((result) => {
            if (result?.taskStatusOverview) setTaskStatusData(result.taskStatusOverview);
          }),
          dispatch(getEmployeePerformance()).unwrap().then((result) => {
            if (result) {
              if (result.employeePerformance) setEmployeeData(result.employeePerformance);
              if (result.summary) setEmployeeSummary(result.summary);
            }
          }),
        ]);
      } catch (error) {
        // Handle errors if necessary
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();

    const intervalId = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, token, dispatch, navigate, apiUrl]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Loader />;
     // Show loader while data is being fetched
  }
  
  return (
    <div className="w-full p-4 md:p-6">
      <AdminDashboardHeader
        organizationName={summaryReport?.organization?.name || "System"}
        organizationStatus={summaryReport?.organization?.status || "Active"}
        handleRefresh={handleRefresh}
      />
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage your organization's performance</p>
      </div>

  {/* Summary Cards */}
      <AdminSummaryCards 
        summaryReport={summaryReport}
        loading={loading}
      />
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-white">Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData.length > 0 ? taskStatusData : [
                  { month: 'Jan', completed: 0, pending: 0, inProgress: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="completed" fill="#0088FE" />
                  <Bar dataKey="pending" fill="#00C49F" />
                  <Bar dataKey="inProgress" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-white">Employee Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={employeeData.length > 0 ? employeeData : [
                  { name: 'No Data', tasks: 0, completion: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="completion" stroke="#0088FE" />
                  <Line type="monotone" dataKey="tasks" stroke="#00C49F" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {employeeSummary && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Total Employees: {employeeSummary.totalEmployees} | Average Completion: {employeeSummary.averageCompletion}% | Total Tasks: {employeeSummary.totalTasks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default OverAllDashHome;