import PageHeader from "@/components/common/page-header";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRIP_API, ACTIVE_EMPLOYEE, ACTIVE_SITE } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import moment from "moment";
import { Loader2, ArrowLeft, Boxes } from "lucide-react";


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateTrip = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { trigger, loading: isSubmitting } = useApiMutation();

  const { data: employeesData } = useGetApiMutation({
    url: ACTIVE_EMPLOYEE.list,
    queryKey: ["active-employees"],
  });

  const { data: sitesData } = useGetApiMutation({
    url: ACTIVE_SITE.list,
    queryKey: ["active-sites"],
  });

  const activeEmployees = employeesData?.data?.data || employeesData?.data || [];
  const activeSites = sitesData?.data?.data || sitesData?.data || [];

  const [formData, setFormData] = useState({
    trips_date: new Date().toISOString().split("T")[0],
    trips_time: moment().format("HH:mm"),
    user_id: "",
    trips_from_id: "",
    trips_to_id: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.trips_date) {
      newErrors.trips_date = "Date is required";
      isValid = false;
    }
    if (!formData.trips_time) {
      newErrors.trips_time = "Time is required";
      isValid = false;
    }
    if (!formData.user_id) {
      newErrors.user_id = "Employee is required";
      isValid = false;
    }
    if (!formData.trips_from_id) {
      newErrors.trips_from_id = "From Site is required";
      isValid = false;
    }
    if (!formData.trips_to_id) {
      newErrors.trips_to_id = "To Site is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    try {
      const res = await trigger({
        url: TRIP_API.create,
        method: "post",
        data: formDataObj,
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Trip created successfully");
        queryClient.invalidateQueries(["trip-list"]);
        navigate("/trip");

      } else {
        toast.error(res?.message || "Failed to create trip");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Boxes}
        title="Add New Trip"
        description="Enter the details below to create a new trip record."
        rightContent={
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/trip")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-trip-form"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
          </div>
        }
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-trip-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="trips_date" className="text-sm font-semibold">
                  Date <Redstar />
                </Label>
                <Input
                  id="trips_date"
                  name="trips_date"
                  type="date"
                  value={formData.trips_date}
                  onChange={handleInputChange}
                  className={errors.trips_date ? "border-red-500" : ""}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.trips_date && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.trips_date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trips_time" className="text-sm font-semibold">
                  Time <Redstar />
                </Label>
                <Input
                  id="trips_time"
                  name="trips_time"
                  type="time"
                  value={formData.trips_time}
                  onChange={handleInputChange}
                  className={errors.trips_time ? "border-red-500" : ""}
                />
                {errors.trips_time && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.trips_time}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_id" className="text-sm font-semibold">
                  Employee <Redstar />
                </Label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.user_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Employee</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.user_id}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="trips_km" className="text-sm font-semibold">
                  KM Reading <Redstar />
                </Label>
                <Input
                  id="trips_km"
                  name="trips_km"
                  type="number"
                  min={0}
                  placeholder="Enter KM"
                  value={formData.trips_km}
                  onChange={handleInputChange}
                  className={errors.trips_km ? "border-red-500" : ""}
                />
                {errors.trips_km && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.trips_km}
                  </p>
                )}
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="trips_from_id" className="text-sm font-semibold">
                  From Site <Redstar />
                </Label>
                <select
                  id="trips_from_id"
                  name="trips_from_id"
                  value={formData.trips_from_id}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.trips_from_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select From Site</option>
                  {activeSites
                    .filter((site) => site.id != formData.trips_to_id)
                    .map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.site_name}
                      </option>
                    ))}
                </select>
                {errors.trips_from_id && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.trips_from_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trips_to_id" className="text-sm font-semibold">
                  To Site <Redstar />
                </Label>
                <select
                  id="trips_to_id"
                  name="trips_to_id"
                  value={formData.trips_to_id}
                  onChange={handleInputChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.trips_to_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select To Site</option>
                  {activeSites
                    .filter((site) => site.id != formData.trips_from_id)
                    .map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.site_name}
                      </option>
                    ))}
                </select>
                {errors.trips_to_id && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.trips_to_id}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  );
};

export default CreateTrip;
