"use client"

import React from 'react';
import { motion } from "framer-motion";
import { Building2, Users, FileText, Briefcase, Eye } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  loading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
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
      <Card className={`${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-20`}>
        <div className="h-full flex items-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/10 opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full"></div>

          <div className="flex items-center justify-between w-full h-full relative z-10 px-4">
            {/* Icon Section */}
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
              <motion.div
                className={`${textColor} text-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {icon}
              </motion.div>
            </div>

            {/* Text Content Section */}
            <div className="flex-1 flex flex-col justify-center ml-3">
              <p className={`${textColor} text-xs font-medium opacity-90 mb-0.5`}>{title}</p>
              <p className={`${textColor} text-xl font-bold`}>
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
              {subtitle && <p className={`${textColor} text-xs opacity-75 -mt-0.5`}>{subtitle}</p>}
            </div>

            {/* Eye Icon Section */}
            <div className={`${textColor} opacity-60 self-center`}>
              <Eye className="text-sm h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const CompanySummaryReport = () => {
  const { companies, loading } = useSelector((state: RootState) => state.companies);
  
  // Calculate totals for summary cards
  const totalCompanies = companies?.length || 0;
  const totalUsers = companies?.reduce((sum, company) => sum + (company.userCount || 0), 0) || 0;
  const totalDepartments = companies?.reduce((sum, company) => sum + (company.departments?.length || 0), 0) || 0;
  
  // Group companies by group
  const groupedCompanies = companies?.reduce((acc, company) => {
    const groupName = company.group?.name || 'Independent';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(company);
    return acc;
  }, {} as Record<string, typeof companies>) || {};

  // Get unique groups
  const uniqueGroups = Object.keys(groupedCompanies).length;

  return (
    <div className="space-y-6 mb-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Company Overview</h2>
        <p className="text-sm text-gray-600">Summary of all companies and their statistics</p>
      </motion.div>

      {/* Summary Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Companies"
          value={totalCompanies}
          subtitle="Active companies"
          icon={<Building2 className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-white"
          loading={loading}
        />
        
        <SummaryCard
          title="Departments"
          value={totalDepartments}
          subtitle="All departments"
          icon={<Briefcase className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-white"
          loading={loading}
        />
        
        <SummaryCard
          title="Organizations"
          value={uniqueGroups}
          subtitle="Group entities"
          icon={<FileText className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-amber-500 to-amber-600"
          textColor="text-white"
          loading={loading}
        />

        <SummaryCard
          title="Total Users"
          value={totalUsers}
          subtitle="Across all companies"
          icon={<Users className="h-5 w-5" />}
          bgGradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-white"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CompanySummaryReport;