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
import { FileSpreadsheet, LandPlot } from "lucide-react";

const SiteReport = () => {
  const [reportData, setReportData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("__ALL__");
  const { trigger: fetchReport, loading: isLoading } = useApiMutation();

  const getReport = async () => {
    try {
      const res = await fetchReport({
        url: REPORT_API.site,
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
    return reportData.filter((item) => item.site_status === statusFilter);
  }, [reportData, statusFilter]);

  const handleExportExcel = () => {
    const wsData = filteredData.map((row) => ({
      "Site Name": row.site_name,
      Location: row.site_url || "N/A",
      Address: row.site_address || "N/A",
      Status: row.site_status,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "10B981" } },
          alignment: { horizontal: "center" },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Site Report");

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
    a.download = `Site_Report_${moment().format("DD-MM-YYYY")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "Site Name",
      accessorKey: "site_name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.site_name}
        </div>
      ),
    },
    {
      header: "Location",
      accessorKey: "site_url",
      cell: ({ row }) => (
        <span className="text-gray-600">
          <a
            href={row.original.site_url}
            target="new"
            className="text-blue-600"
          >
            {row.original.site_url || "N/A"}
          </a>
        </span>
      ),
    },
    {
      header: "Address",
      accessorKey: "site_address",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-gray-500">
          {row.original.site_address || "N/A"}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "site_status",
      cell: ({ row }) => {
        const isStatusActive =
          row.original.site_status === "Active" ||
          row.original.site_status == 1;
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isStatusActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.original.site_status}
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
        icon={LandPlot}
        title="Site Report"
        description="View and export site status reports"
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

export default SiteReport;
