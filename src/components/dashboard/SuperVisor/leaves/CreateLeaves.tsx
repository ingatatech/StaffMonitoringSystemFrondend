"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../Redux/store";
import { createLeave } from "../../../../Redux/Slices/leaveSlice";
import { fetchAllUsers } from "../../../../Redux/Slices/teamManagementSlice";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import {
    Loader2,
    Check,
    AlertCircle,
    User,
    Calendar,
    Clock,
    FileText,
    ArrowLeft,
    Paperclip
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FileUpload from "../../Employee/FileUpload";
export default function CreateLeavePage() {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector((state: RootState) => state.teamManagement.users);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const loading = useSelector((state: RootState) => state.leave.loading);

    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        leave_type: "",
        reason: "",
        reviewer_id: ""
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [calculatedDays, setCalculatedDays] = useState(0);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            if (end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setCalculatedDays(diffDays);
            } else {
                setCalculatedDays(0);
            }
        } else {
            setCalculatedDays(0);
        }
    }, [formData.start_date, formData.end_date]);

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFilesChange = (files: File[]) => {
        setSelectedFiles(files);
    };

    const handleReset = () => {
        setFormData({
            start_date: "",
            end_date: "",
            leave_type: "",
            reason: "",
            reviewer_id: ""
        });
        setSelectedFiles([]);
        setSuccess(false);
        setError("");
        setCalculatedDays(0);
    };

    const validateForm = () => {
        if (!formData.start_date || !formData.end_date || !formData.leave_type) {
            setError("Please fill in all required fields");
            return false;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError("End date cannot be before start date");
            return false;
        }

        // Check if start date is in the past (except for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(formData.start_date);

        if (startDate < today) {
            setError("Start date cannot be in the past");
            return false;
        }

        return true;
    };


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        toast.error(error);
        return;
    }

    try {
        const leaveData = {
            start_date: formData.start_date,
            end_date: formData.end_date,
            leave_type: formData.leave_type,
            reason: formData.reason.trim() || undefined,
            reviewer_id: formData.reviewer_id ? parseInt(formData.reviewer_id) : undefined,
            // Change field name from 'files' to 'attached_documents'
            attached_documents: selectedFiles // <--- THIS LINE CHANGED
        };

        const resultAction = await dispatch(createLeave(leaveData));

        // @ts-ignore
        if (createLeave.fulfilled.match(resultAction)) {
            setSuccess(true);
            setError("");
            toast.success("Leave request created successfully!");
        } else {
            setError(resultAction.payload as string || "Failed to create leave request");
            toast.error(resultAction.payload as string || "Failed to create leave request");
        }
    } catch (err) {
        setError("An error occurred while creating the leave request");
        toast.error("An error occurred while creating the leave request");
    }
};

    const leaveTypes = [
        { value: "annual", label: "Annual Leave", color: "bg-blue-100 text-blue-800" },
        { value: "sick", label: "Sick Leave", color: "bg-orange-100 text-orange-800" },
        { value: "maternity", label: "Maternity Leave", color: "bg-pink-100 text-pink-800" },
        { value: "paternity", label: "Paternity Leave", color: "bg-purple-100 text-purple-800" },
        { value: "emergency", label: "Emergency Leave", color: "bg-red-100 text-red-800" },
        { value: "unpaid", label: "Unpaid Leave", color: "bg-gray-100 text-gray-800" }
    ];

    // Filter reviewers (users with supervisor, admin, or overall roles)
    const reviewers = users.filter((user: any) =>
        ["supervisor", "admin", "overall"].includes(user.role)
    );

    const renderSuccessMessage = () => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
                    <Check className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    Leave Request Submitted Successfully!
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Your leave request has been submitted and is now pending approval.
                </p>
                <div className="mt-8 flex gap-4 justify-center">
                    <Button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Create Another Request
                    </Button>
                    <Link to="/supervisor/leaves">
                        <Button variant="outline" className="border-white bg-transparent">
                            Back to Leave Management
                        </Button>
                    </Link>
                </div>
            </motion.div>
        );
    };

    const renderErrorMessage = () => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-400 to-red-600 shadow-lg">
                    <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Error Occurred
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">{error}</p>
                <div className="mt-8">
                    <Button
                        onClick={() => setError("")}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Try Again
                    </Button>
                </div>
            </motion.div>
        );
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
                        <CardContent className="p-8">{renderSuccessMessage()}</CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
                        <CardContent className="p-8">{renderErrorMessage()}</CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/supervisor/leaves">
                        <Button variant="outline" size="icon" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            Create Leave Request
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Submit a new leave request for approval
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                Leave Request Details
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-8">
                            {/* Employee Info Display */}
                            {currentUser && (
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Employee
                                    </Label>
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-blue-700 dark:text-blue-300">
                                                {currentUser.firstName} {currentUser.lastName}
                                            </span>
                                            <span className="text-sm text-blue-600 dark:text-blue-400">{currentUser.email}</span>
                                            <span className="text-xs text-blue-500 dark:text-blue-400 capitalize">{currentUser.role}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="start_date"
                                        className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        Start Date *
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => handleChange("start_date", e.target.value)}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-700/70"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="end_date"
                                        className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        End Date *
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => handleChange("end_date", e.target.value)}
                                        required
                                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                                        className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-700/70"
                                    />
                                </div>

                                {/* Leave Type */}
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Leave Type *
                                    </Label>
                                    <Select value={formData.leave_type} onValueChange={(value) => handleChange("leave_type", value)}>
                                        <SelectTrigger className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200">
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600">
                                            {leaveTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${type.color.split(' ')[0]}`} />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Reviewer Selection */}
                                <div className="space-y-2">
                                    <Label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Reviewer 
                                    </Label>
                                    <Select
                                        value={formData.reviewer_id}
                                        onValueChange={(value) => handleChange("reviewer_id", value)}
                                    >
                                        <SelectTrigger className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200">
                                            <SelectValue placeholder="Select reviewer" />
                                        </SelectTrigger>
                                        <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600">
                                            {reviewers.map((reviewer: any) => (
                                                <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span>{reviewer.firstName} {reviewer.lastName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Duration Display */}
                                {calculatedDays > 0 && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Duration
                                        </Label>
                                        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                                            </div>
                                            <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                                Total leave duration
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reason */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label
                                        htmlFor="reason"
                                        className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Reason
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        value={formData.reason}
                                        onChange={(e) => handleChange("reason", e.target.value)}
                                        placeholder="Please provide a reason for your leave request..."
                                        rows={4}
                                        className="border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 dark:hover:bg-gray-700/70 resize-none"
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        Leave Approved Documents (Optional)
                                    </Label>

                                    <FileUpload
                                        files={selectedFiles}
                                        onFilesChange={handleFilesChange}
                                        disabled={loading}
                                        maxFiles={1}
                                        maxFileSize={10}
                                    />
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 justify-start pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="submit"
                                    disabled={loading || calculatedDays === 0}
                                    className="px-8 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting Request...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Check className="h-5 w-5 mr-2" />
                                            Submit Leave Request
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </motion.div>
        </div>
    );
}