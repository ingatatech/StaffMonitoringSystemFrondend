"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { updateOrganization } from "../../../Redux/Slices/SystemLeaderSlice"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import { isValidEmail, isValidUrl, isValidPhone, isValidDate } from "../../../utils/formValidation"

interface EditOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  organization: any
}

const EditOrganizationModal = ({ isOpen, onClose, organization }: EditOrganizationModalProps) => {
  const dispatch = useAppDispatch()
  const { updateLoading } = useAppSelector((state) => state.systemLeader)
  const [activeTab, setActiveTab] = useState("basic")

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    status: "",
    sectorOfBusiness: "",

    // Company Information
    companyInfo: {
      address: "",
      city: "",
      country: "",
      roadNumber: "",
      poBox: "",
      telephone: "",
      email: "",
      website: "",
    },

    // Contact Person
    contactPerson: {
      name: "",
      position: "",
      telephone: "",
      email: "",
      dateOfRegistration: "",
      registrationNumber: "",
    },

    // System Admin
    systemAdmin: {
      firstName: "",
      lastName: "",
      email: "",
      telephone: "",
    },
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        status: organization.status || "Active",
        sectorOfBusiness: organization.sectorOfBusiness || "",

        companyInfo: {
          address: organization.companyInfo?.address || "",
          city: organization.companyInfo?.city || "",
          country: organization.companyInfo?.country || "",
          roadNumber: organization.companyInfo?.roadNumber || "",
          poBox: organization.companyInfo?.poBox || "",
          telephone: organization.companyInfo?.telephone || "",
          email: organization.companyInfo?.email || "",
          website: organization.companyInfo?.website || "",
        },

        contactPerson: {
          name: organization.contactPerson?.name || "",
          position: organization.contactPerson?.position || "",
          telephone: organization.contactPerson?.telephone || "",
          email: organization.contactPerson?.email || "",
          dateOfRegistration: organization.contactPerson?.dateOfRegistration
            ? new Date(organization.contactPerson.dateOfRegistration).toISOString().split("T")[0]
            : "",
          registrationNumber: organization.contactPerson?.registrationNumber || "",
        },

        systemAdmin: {
          firstName: organization.systemAdmin?.firstName || "",
          lastName: organization.systemAdmin?.lastName || "",
          email: organization.systemAdmin?.email || "",
          telephone: organization.systemAdmin?.telephone || "",
        },
      })

      // Clear errors when organization changes
      setErrors({})
    }
  }, [organization])

  // Handle input changes for basic fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Handle input changes for nested objects
  const handleNestedInputChange = (
    section: "companyInfo" | "contactPerson" | "systemAdmin",
    field: string,
    value: string,
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    })

    // Clear error for this field
    const errorKey = `${section}.${field}`
    if (errors[errorKey]) {
      setErrors({
        ...errors,
        [errorKey]: "",
      })
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate basic fields
    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required"
    }

    // Validate company info
    if (formData.companyInfo.email && !isValidEmail(formData.companyInfo.email)) {
      newErrors["companyInfo.email"] = "Invalid email format"
    }

    if (formData.companyInfo.website && !isValidUrl(formData.companyInfo.website)) {
      newErrors["companyInfo.website"] = "Invalid website URL"
    }

    if (formData.companyInfo.telephone && !isValidPhone(formData.companyInfo.telephone)) {
      newErrors["companyInfo.telephone"] = "Invalid phone number"
    }

    // Validate contact person
    if (formData.contactPerson.email && !isValidEmail(formData.contactPerson.email)) {
      newErrors["contactPerson.email"] = "Invalid email format"
    }

    if (formData.contactPerson.telephone && !isValidPhone(formData.contactPerson.telephone)) {
      newErrors["contactPerson.telephone"] = "Invalid phone number"
    }

    if (formData.contactPerson.dateOfRegistration && !isValidDate(formData.contactPerson.dateOfRegistration)) {
      newErrors["contactPerson.dateOfRegistration"] = "Invalid date"
    }

    // Validate system admin
    if (formData.systemAdmin.email && !isValidEmail(formData.systemAdmin.email)) {
      newErrors["systemAdmin.email"] = "Invalid email format"
    }

    if (formData.systemAdmin.telephone && !isValidPhone(formData.systemAdmin.telephone)) {
      newErrors["systemAdmin.telephone"] = "Invalid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      // Find the first tab with errors and switch to it
      if (errors.name || errors.description || errors.sectorOfBusiness) {
        setActiveTab("basic")
      } else if (
        errors["companyInfo.address"] ||
        errors["companyInfo.city"] ||
        errors["companyInfo.country"] ||
        errors["companyInfo.roadNumber"] ||
        errors["companyInfo.poBox"] ||
        errors["companyInfo.telephone"] ||
        errors["companyInfo.email"] ||
        errors["companyInfo.website"]
      ) {
        setActiveTab("company")
      } else if (
        errors["contactPerson.name"] ||
        errors["contactPerson.position"] ||
        errors["contactPerson.telephone"] ||
        errors["contactPerson.email"] ||
        errors["contactPerson.dateOfRegistration"] ||
        errors["contactPerson.registrationNumber"]
      ) {
        setActiveTab("contact")
      } else if (
        errors["systemAdmin.firstName"] ||
        errors["systemAdmin.lastName"] ||
        errors["systemAdmin.email"] ||
        errors["systemAdmin.telephone"]
      ) {
        setActiveTab("admin")
      }

      toast.error("Please fix the errors in the form")
      return
    }

    try {
      // Format the data for the API
      const updatedData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        sectorOfBusiness: formData.sectorOfBusiness,
        companyInfo: formData.companyInfo,
        contactPerson: {
          ...formData.contactPerson,
          dateOfRegistration: formData.contactPerson.dateOfRegistration
            ? new Date(formData.contactPerson.dateOfRegistration).toISOString()
            : null,
        },
        systemAdmin: formData.systemAdmin,
      }

      await dispatch(updateOrganization({ id: organization.id, data: updatedData })).unwrap()
      toast.success("Organization updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update organization")
    }
  }

  // Helper to render error message
  const renderError = (field: string) => {
    if (!errors[field]) return null

    return (
      <div className="flex items-center mt-1 text-red text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        {errors[field]}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update the organization details. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="company">Company Info</TabsTrigger>
              <TabsTrigger value="contact">Contact Person</TabsTrigger>
              <TabsTrigger value="admin">System Admin</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto pr-1">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="flex items-center">
                      Organization Name <span className="text-red ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? "border-red" : ""}
                      required
                    />
                    {renderError("name")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sectorOfBusiness">Sector of Business</Label>
                    <Input
                      id="sectorOfBusiness"
                      name="sectorOfBusiness"
                      value={formData.sectorOfBusiness}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="company" className="mt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="companyAddress">Address</Label>
                    <Input
                      id="companyAddress"
                      value={formData.companyInfo.address}
                      onChange={(e) => handleNestedInputChange("companyInfo", "address", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyCity">City</Label>
                    <Input
                      id="companyCity"
                      value={formData.companyInfo.city}
                      onChange={(e) => handleNestedInputChange("companyInfo", "city", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyCountry">Country</Label>
                    <Input
                      id="companyCountry"
                      value={formData.companyInfo.country}
                      onChange={(e) => handleNestedInputChange("companyInfo", "country", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyRoadNumber">Road Number</Label>
                    <Input
                      id="companyRoadNumber"
                      value={formData.companyInfo.roadNumber}
                      onChange={(e) => handleNestedInputChange("companyInfo", "roadNumber", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyPoBox">P.O. Box</Label>
                    <Input
                      id="companyPoBox"
                      value={formData.companyInfo.poBox}
                      onChange={(e) => handleNestedInputChange("companyInfo", "poBox", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyTelephone">Telephone</Label>
                    <Input
                      id="companyTelephone"
                      value={formData.companyInfo.telephone}
                      onChange={(e) => handleNestedInputChange("companyInfo", "telephone", e.target.value)}
                      className={errors["companyInfo.telephone"] ? "border-red" : ""}
                    />
                    {renderError("companyInfo.telephone")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.companyInfo.email}
                      onChange={(e) => handleNestedInputChange("companyInfo", "email", e.target.value)}
                      className={errors["companyInfo.email"] ? "border-red" : ""}
                    />
                    {renderError("companyInfo.email")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyInfo.website}
                      onChange={(e) => handleNestedInputChange("companyInfo", "website", e.target.value)}
                      className={errors["companyInfo.website"] ? "border-red" : ""}
                    />
                    {renderError("companyInfo.website")}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Contact Person Name</Label>
                    <Input
                      id="contactName"
                      value={formData.contactPerson.name}
                      onChange={(e) => handleNestedInputChange("contactPerson", "name", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactPosition">Position</Label>
                    <Input
                      id="contactPosition"
                      value={formData.contactPerson.position}
                      onChange={(e) => handleNestedInputChange("contactPerson", "position", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactTelephone">Telephone</Label>
                    <Input
                      id="contactTelephone"
                      value={formData.contactPerson.telephone}
                      onChange={(e) => handleNestedInputChange("contactPerson", "telephone", e.target.value)}
                      className={errors["contactPerson.telephone"] ? "border-red" : ""}
                    />
                    {renderError("contactPerson.telephone")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => handleNestedInputChange("contactPerson", "email", e.target.value)}
                      className={errors["contactPerson.email"] ? "border-red" : ""}
                    />
                    {renderError("contactPerson.email")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="registrationDate">Date of Registration</Label>
                    <Input
                      id="registrationDate"
                      type="date"
                      value={formData.contactPerson.dateOfRegistration}
                      onChange={(e) => handleNestedInputChange("contactPerson", "dateOfRegistration", e.target.value)}
                      className={errors["contactPerson.dateOfRegistration"] ? "border-red" : ""}
                    />
                    {renderError("contactPerson.dateOfRegistration")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.contactPerson.registrationNumber}
                      onChange={(e) => handleNestedInputChange("contactPerson", "registrationNumber", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="mt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="adminFirstName">First Name</Label>
                    <Input
                      id="adminFirstName"
                      value={formData.systemAdmin.firstName}
                      onChange={(e) => handleNestedInputChange("systemAdmin", "firstName", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adminLastName">Last Name</Label>
                    <Input
                      id="adminLastName"
                      value={formData.systemAdmin.lastName}
                      onChange={(e) => handleNestedInputChange("systemAdmin", "lastName", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.systemAdmin.email}
                      onChange={(e) => handleNestedInputChange("systemAdmin", "email", e.target.value)}
                      className={errors["systemAdmin.email"] ? "border-red" : ""}
                    />
                    {renderError("systemAdmin.email")}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="adminTelephone">Telephone</Label>
                    <Input
                      id="adminTelephone"
                      value={formData.systemAdmin.telephone}
                      onChange={(e) => handleNestedInputChange("systemAdmin", "telephone", e.target.value)}
                      className={errors["systemAdmin.telephone"] ? "border-red" : ""}
                    />
                    {renderError("systemAdmin.telephone")}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateLoading} className="bg-green text-white">
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditOrganizationModal
