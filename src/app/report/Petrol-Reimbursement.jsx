import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REPORT_API, ACTIVE_EMPLOYEE } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { Boxes, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TripReport = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    employee_id: "",
  });
  const [errors, setErrors] = useState({});

  const { trigger: fetchEmployees } = useApiMutation();
  const { trigger: fetchReport, loading: isSearching } = useApiMutation();

  const getEmployees = async () => {
    try {
      const res = await fetchEmployees({
        url: ACTIVE_EMPLOYEE.list,
        method: "get",
      });
      setEmployees(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const getReport = async () => {
    if (!filters.employee_id) {
      setErrors({ employee_id: "Please select an employee" });
      return;
    }
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("from_date", filters.from_date);
      formData.append("to_date", filters.to_date);
      formData.append("employee_id", filters.employee_id);

      const res = await fetchReport({
        url: REPORT_API.trip,
        method: "post",
        data: formData,
      });

      const trips = res?.data?.trips || res?.data?.data?.trips || [];

      if (trips.length > 0) {
        navigate(
          `/report/petrol_reimbursement/${filters.employee_id}?from_date=${filters.from_date}&to_date=${filters.to_date}`,
        );
      } else {
        toast.error("No data found for the selected criteria");
      }
    } catch (error) {
      console.error("Report check failed", error);
      toast.error("Failed to check report data");
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Boxes}
        title="Petrol Reimbursement Report"
        description="Filter and export vehicle trip reports by date and employee"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-gray-500">
            From Date
          </Label>
          <Input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            className="h-9"
            value={filters.from_date}
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-gray-500">
            To Date
          </Label>
          <Input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            className="h-9"
            value={filters.to_date}
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
          />
        </div>
        <div className="relative space-y-1">
          <Label className="text-[10px] uppercase font-bold text-gray-500">
            Employee
          </Label>
          <Select
            value={filters.employee_id}
            onValueChange={(val) => {
              setFilters({ ...filters, employee_id: val });
              setErrors({ ...errors, employee_id: "" });
            }}
          >
            <SelectTrigger
              className={`h-9 bg-white ${
                errors.employee_id ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} ({emp.employee_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employee_id && (
            <p className="text-[10px] text-red-500 absolute -bottom-4">
              {errors.employee_id}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full">
          <Button
            onClick={getReport}
            disabled={isSearching}
            className="h-9 px-4 flex items-center gap-2 w-full"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Fetch Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripReport;
