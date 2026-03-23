import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "@/components/common/page-header";
import XLSX from "xlsx-js-style";
import moment from "moment";
import DataTable from "@/components/common/data-table";
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
import { FileSpreadsheet, Gauge, Search, Loader2 } from "lucide-react";

const KMReadingReport = () => {
  const [reportData, setReportData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    employee_id: "",
  });
  const [errors, setErrors] = useState({});

  const { trigger: fetchReport, loading: isSearching } = useApiMutation();
  const { trigger: fetchEmployees } = useApiMutation();

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
        url: REPORT_API.kmReading,
        method: "post",
        data: formData,
      });
      setReportData(res?.data?.data || res?.data || []);
    } catch (error) {
      console.error("Report fetch failed", error);
      setReportData([]);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleExportExcel = () => {
    const wsData = reportData.map((row) => ({
      Date: moment(row.km_date).format("DD-MM-YYYY"),
      "Employee Name": row.name,
      "KM Reading": row.km_readings,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "8B5CF6" } },
          alignment: { horizontal: "center" },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KM Reading Report");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KM_Reading_Report_${moment().format("DD-MM-YYYY")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "km_date",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {moment(row.original.km_date).format("DD-MM-YYYY")}
        </div>
      ),
    },
    {
      header: "Employee",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.employee_code}
          </div>
        </div>
      ),
    },
    {
      header: "KM Reading",
      accessorKey: "km_readings",
      cell: ({ row }) => (
        <span className="font-semibold text-violet-600">
          {row.original.km_readings} KM
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Gauge}
        title="KM Reading Report"
        description="Filter and export kilometer reading reports by date and employee"
        // rightContent={toolbarExtras}
      />
      <div className="grid grid-cols-3 lg:grid-cols-5 items-end gap-3 bg-white p-3 rounded-lg border shadow-sm">
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
            className="h-9 w-full"
            value={filters.to_date}
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
          />
        </div>
        <div className="space-y-1">
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
              className={` h-9 bg-white ${
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
        <div className="flex gap-3 col-span-2">
          <Button
            onClick={getReport}
            disabled={isSearching}
            className="h-9 px-4 flex items-center gap-2 w-1/2"
          >
            {isSearching ? (
              <Loader2 className=" h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Fetch
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="h-9 px-4 flex items-center gap-2 border-primary text-primary hover:bg-primary/5 w-1/2"
            disabled={isSearching || reportData.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="px-2">
        <DataTable
          data={reportData}
          columns={columns}
          pageSize={10}
          hideSearch={true}
          hideColumns={true}
          isLoading={isSearching}
        />
      </div>
    </div>
  );
};

export default KMReadingReport;
