import ApiErrorPage from "@/components/api-error/api-error";
import PageHeader from "@/components/common/page-header";
import Redstar from "@/components/Redstar";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { KM_API, ACTIVE_EMPLOYEE } from "@/constants/apiConstants";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EditKMReading = ({ isOpen, onOpenChange, readingId }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    km_readings_date: "",
    user_id: "",
    km_readings: "",
  });

  const [errors, setErrors] = useState({});

  const {
    data: readingData,
    isLoading: isLoadingReading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: readingId ? KM_API.byId(readingId) : null,
    queryKey: ["km-reading", readingId],
    enabled: !!readingId && isOpen,
  });

  const [activeEmployees, setActiveEmployees] = useState([]);

  const fetchActiveEmployees = async () => {
    try {
      const res = await trigger({
        url: ACTIVE_EMPLOYEE.list,
        method: "get",
      });
      const employees = res?.data?.data || res?.data || [];
      const active = employees.filter((emp) => emp.status === "Active");
      setActiveEmployees(active);
    } catch (error) {
      console.error("Error fetching active employees:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (readingData?.data) {
      const data = readingData.data;
      setFormData({
        km_readings_date: data.km_readings_date || "",
        user_id: data.user_id || "",
        km_readings: data.km_readings || "",
      });
    }
  }, [readingData]);

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

    if (!formData.km_readings_date) {
      newErrors.km_readings_date = "Date is required";
      isValid = false;
    }
    if (!formData.user_id) {
      newErrors.user_id = "Employee is required";
      isValid = false;
    }
    if (!formData.km_readings) {
      newErrors.km_readings = "KM reading is required";
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
    formDataObj.append("km_readings_date", formData.km_readings_date);
    formDataObj.append("user_id", formData.user_id);
    formDataObj.append("km_readings", formData.km_readings);

    try {
      const res = await trigger({
        url: KM_API.updateById(readingId),
        method: "post",
        data: formDataObj,
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "KM Reading updated successfully");
        queryClient.invalidateQueries(["km-reading-list"]);
        queryClient.invalidateQueries(["km-reading", readingId]);
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update KM Reading");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoadingReading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit KM Reading</DialogTitle>
        </DialogHeader>

        {isLoadingReading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-red-500">Failed to load reading</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <form
            id="edit-km-reading-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="km_readings_date"
                  className="text-sm font-semibold"
                >
                  Date <Redstar />
                </Label>
                <Input
                  id="km_readings_date"
                  name="km_readings_date"
                  type="date"
                  value={formData.km_readings_date}
                  onChange={handleInputChange}
                  className={errors.km_readings_date ? "border-red-500" : ""}
                />
                {errors.km_readings_date && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.km_readings_date}
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
                <Label htmlFor="km_readings" className="text-sm font-semibold">
                  KM Reading <Redstar />
                </Label>
                <Input
                  id="km_readings"
                  name="km_readings"
                  type="number"
                  min={0}
                  placeholder="Enter KM reading"
                  value={formData.km_readings}
                  onChange={handleInputChange}
                  className={errors.km_readings ? "border-red-500" : ""}
                />
                {errors.km_readings && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.km_readings}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditKMReading;
