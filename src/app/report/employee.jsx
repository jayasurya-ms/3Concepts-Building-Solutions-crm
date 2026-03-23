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
import { REPORT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { FileSpreadsheet, Users } from "lucide-react";

const EmployeeReport = () => {
  const [reportData, setReportData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("__ALL__");
  const { trigger: fetchReport, loading: isLoading } = useApiMutation();

  const getReport = async () => {
    try {
      const res = await fetchReport({
        url: REPORT_API.employee,
        method: "get",
      });
      setReportData(res?.data?.data || res?.data || []);
    } catch (error) {
      console.error("Report fetch failed", error);
      setReportData([]);
    }
  };

  useEffect(() => {
    getReport();
  }, []);

  const filteredData = useMemo(() => {
    if (statusFilter === "__ALL__") return reportData;
    return reportData.filter((item) => item.status === statusFilter);
  }, [reportData, statusFilter]);

  const handleExportExcel = () => {
    const wsData = filteredData.map((row) => ({
      "Employee Name": row.name,
      Email: row.email,
      Mobile: row.mobile,
      "Employee Code": row.employee_code,
      Position: row.user_position || "N/A",
      Status: row.status,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Report");

    // Browser-safe download
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
    a.download = `Employee_Report_${moment().format("DD-MM-YYYY")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "Employee",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <div className="text-gray-600 font-medium">{row.original.email}</div>
      ),
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      cell: ({ row }) => (
        <div className="text-gray-600">{row.original.mobile}</div>
      ),
    },
    {
      header: "Code",
      accessorKey: "employee_code",
      cell: ({ row }) => (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
          {row.original.employee_code}
        </code>
      ),
    },
    {
      header: "Position",
      accessorKey: "user_position",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.user_position || "N/A"}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const isStatusActive =
          row.original.status === "Active" || row.original.status == 1;
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isStatusActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.original.status}
          </span>
        );
      },
    },
  ];

  const toolbarExtras = (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px] h-9 bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__ALL__">All Status</SelectItem>
          <SelectItem value="Active" className="text-green-500">
            Active
          </SelectItem>
          <SelectItem value="Inactive" className="text-red-500">
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={handleExportExcel}
        className="h-9 flex items-center gap-2 px-6"
        disabled={isLoading || filteredData.length === 0}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Users}
        title="Employee Report"
        description="View and export employee status reports"
        rightContent={toolbarExtras}
      />
      <DataTable
        data={filteredData}
        columns={columns}
        pageSize={10}
        hideSearch={true}
        hideColumns={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EmployeeReport;
