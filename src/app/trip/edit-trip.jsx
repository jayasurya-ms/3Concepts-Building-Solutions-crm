import PageHeader from "@/components/common/page-header";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApiErrorPage from "@/components/api-error/api-error";
import LoadingBar from "@/components/loader/loading-bar";
import {
  TRIP_API,
  ACTIVE_EMPLOYEE,
  ACTIVE_SITE,
} from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { Loader2, Boxes } from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import moment from "moment";

const EditTrip = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const navigate = useNavigate();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    trips_date: "",
    trips_time: "",
    user_id: "",
    trips_from_id: "",
    trips_to_id: "",
    trips_km: "",
  });

  const [errors, setErrors] = useState({});

  const {
    data: tripData,
    isLoading: isLoadingTrip,
    isError,
    refetch,
  } = useGetApiMutation({
    url: id ? TRIP_API.byId(id) : null,
    queryKey: ["trip", id],
  });

  const { data: employeesData } = useGetApiMutation({
    url: ACTIVE_EMPLOYEE.list,
    queryKey: ["active-employees"],
  });

  const { data: sitesData } = useGetApiMutation({
    url: ACTIVE_SITE.list,
    queryKey: ["active-sites"],
  });

  const activeEmployees =
    employeesData?.data?.data || employeesData?.data || [];
  const activeSites = sitesData?.data?.data || sitesData?.data || [];

  useEffect(() => {
    if (tripData?.data) {
      const data = tripData.data;
      setFormData({
        trips_date: data.trips_date || "",
        trips_time: data.trips_time || "",
        user_id: data.user_id || "",
        trips_from_id: data.trips_from_id || "",
        trips_to_id: data.trips_to_id || "",
      });
    }
  }, [tripData]);

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
        url: TRIP_API.updateById(id),
        method: "post",
        data: formDataObj,
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Trip updated successfully");
        queryClient.invalidateQueries(["trip-list"]);
        queryClient.invalidateQueries(["trip", id]);
        navigate("/trip");
      } else {
        toast.error(res?.message || "Failed to update trip");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoadingTrip) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Boxes}
        title="Edit Trip"
        description="Update the trip details and save changes."
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
              form="edit-trip-form"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Trip"
              )}
            </Button>
          </div>
        }
      />

      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="edit-trip-form"
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

              <div className="space-y-2">
                <Label
                  htmlFor="trips_from_id"
                  className="text-sm font-semibold"
                >
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

export default EditTrip;
