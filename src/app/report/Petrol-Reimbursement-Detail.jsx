import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import XLSX from "xlsx-js-style";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { REPORT_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { FileSpreadsheet, Printer, ArrowLeft, Boxes } from "lucide-react";

const PetrolReimbursementDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);

  const from_date = searchParams.get("from_date");
  const to_date = searchParams.get("to_date");

  const { trigger: fetchReport, loading: isLoading } = useApiMutation();

  const getReport = async () => {
    try {
      const formData = new FormData();
      formData.append("from_date", from_date);
      formData.append("to_date", to_date);
      formData.append("employee_id", id);

      const res = await fetchReport({
        url: REPORT_API.trip,
        method: "post",
        data: formData,
      });
      setReportData(res?.data?.data || res?.data || null);
    } catch (error) {
      console.error("Report fetch failed", error);
    }
  };

  useEffect(() => {
    if (id && from_date && to_date) {
      getReport();
    }
  }, [id, from_date, to_date]);

  const trips = reportData?.trips || [];
  const manager = reportData?.manager;
  const user = trips[0]?.user;

  const totalKm = trips.reduce(
    (acc, curr) => acc + parseFloat(curr.trips_km || 0),
    0,
  );
  const totalAmount = trips.reduce(
    (acc, curr) =>
      acc + parseFloat(curr.trips_km || 0) * parseFloat(curr.trips_price || 0),
    0,
  );

  const handleExportExcel = () => {
    const wsData = [
      ["Petrol Reimbursement"],
      [`Period: ${from_date} to ${to_date}`],
      [],
      [
        "Employee Name:",
        user?.name || "N/A",
        "Employee Code:",
        user?.employee_code || "N/A",
        "Designation:",
        user?.user_position || "N/A",
      ],
      [
        "Reporting Manager:",
        manager?.name || "N/A",
        "Starting KM:",
        reportData?.open_km || "0",
        "Closing KM:",
        reportData?.close_km || "0",
      ],
      [],
      [
        "Date",
        "Description of Traveling",
        "Kilometers Travelled",
        "Per Kilometer (Rs.)",
        "Total Amount",
        "Cost Center",
      ],
      ...trips.map((row) => [
        moment(row.trips_date).format("DD.MM.YYYY"),
        `${row.fromsite?.site_name || "N/A"} TO ${row.tosite?.site_name || "N/A"}`,
        row.trips_km,
        row.trips_price,
        (parseFloat(row.trips_km) * parseFloat(row.trips_price)).toFixed(2),
        row.fromsite?.site_name || "N/A",
      ]),
      ["TOTAL", "", totalKm.toFixed(2), "", totalAmount.toFixed(2), ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply some basic styling to Excel
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: 6, c: col });
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Petrol Reimbursement");

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
    a.download = `Petrol_Reimbursement_${user?.name || "Report"}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-6 min-h-screen bg-gray-50/50 print:bg-white print:p-0">
      {/* Hide on Print */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Filter
        </Button>
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            variant="default"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5 hover:text-primary"
            disabled={isLoading || trips.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
        .voucher-table th, .voucher-table td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
        .voucher-header { border: 1px solid #000; border-bottom: none; }
      `,
        }}
      />

      {/* Printable Area */}
      <div className="printable-area bg-white shadow-lg mx-auto max-w-5xl print:shadow-none print:max-w-none">
        <div className="p-8 print:p-4">
          {/* Main Title */}
          <div className="border border-black p-1 text-center font-bold text-sm bg-gray-50">
            Petrol Reimbursement
          </div>
          <div className="border border-black border-t-0 p-1 text-center font-bold text-xs text-red-600">
            Period: {moment(from_date).format("DD-MM-YYYY")} to{" "}
            {moment(to_date).format("DD-MM-YYYY")}
          </div>

          {/* Header Info */}
          <div className="grid grid-cols-12 text-[11px] border border-black border-t-0">
            <div className="col-span-4 border-r border-black p-1.5 flex gap-2">
              <span className="font-bold whitespace-nowrap">
                Employee Name:
              </span>
              <span className="uppercase truncate">{user?.name || "N/A"}</span>
            </div>
            <div className="col-span-4 border-r border-black p-1.5 flex gap-2">
              <span className="font-bold">Employee Code:</span>
              <span>{user?.employee_code || "N/A"}</span>
            </div>
            <div className="col-span-4 p-1.5 flex gap-2">
              <span className="font-bold">Designation:</span>
              <span className="uppercase truncate">
                {user?.user_position || "COORDINATOR"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-12 text-[11px] border border-black border-t-0">
            <div className="col-span-4 border-r border-black p-1.5 flex gap-2">
              <span className="font-bold whitespace-nowrap">
                Reporting Manager:
              </span>
              <span className="uppercase truncate">
                {manager?.name || "N/A"}
              </span>
            </div>
            <div className="col-span-8 border-r border-black p-1.5 flex gap-4">
              <span className="font-bold">Month Reading:</span>
              <div className="flex gap-1">
                <span className="font-bold">Starting KM:</span>
                <span> {reportData?.open_km || "0"}</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold">Closing KM:</span>
                <span>{reportData?.close_km || "0"}</span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <table className="w-full voucher-table border-collapse mt-0">
            <thead className="bg-gray-50">
              <tr className="text-center font-bold">
                <th className="w-24">Date</th>
                <th>Description of Traveling</th>
                <th className="w-24">Kilometers Travelled</th>
                <th className="w-24">Per Kilometer (Rs.4)</th>
                <th className="w-28">Total Amount</th>
                <th className="w-32">Cost Center</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    Loading report data...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    No data found for this period.
                  </td>
                </tr>
              ) : (
                trips.map((row, idx) => (
                  <tr key={row.id || idx} className="text-[11px]">
                    <td className="text-center">
                      {moment(row.trips_date).format("DD.MM.YYYY")}
                    </td>
                    <td className="uppercase">
                      {row.fromsite?.site_name || "N/A"} TO{" "}
                      {row.tosite?.site_name || "N/A"}
                    </td>
                    <td className="text-center">{row.trips_km}</td>
                    <td className="text-center">{row.trips_price || "4"}</td>
                    <td className="text-center font-medium">
                      {(
                        parseFloat(row.trips_km || 0) *
                        parseFloat(row.trips_price || 4)
                      ).toFixed(0)}
                    </td>
                    <td className="text-center uppercase text-[9px]">
                      {row.fromsite?.site_name || "N/A"} {row.tosite?.site_name}
                    </td>
                  </tr>
                ))
              )}
              {/* Total Row */}
              <tr className="font-bold bg-gray-50 uppercase text-[11px]">
                <td colSpan="2" className="text-center">
                  TOTAL
                </td>
                <td className="text-center">{totalKm.toFixed(0)}</td>
                <td className="text-center"></td>
                <td className="text-center">{totalAmount.toFixed(0)}</td>
                <td className="text-center">-</td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div className="grid grid-cols-5 gap-4 mt-16 text-[10px] text-center font-bold uppercase overflow-hidden pb-4">
            <div className="space-y-12">
              <div className="mt-12 border-t border-black pt-1">
                Employee Signature
              </div>
              <div className="text-[10px] font-normal text-left px-2">
                Date: {moment().format("DD-MM-YYYY")}
                <br />
                Place: Bangalore
              </div>
            </div>
            <div>
              <div className="mt-12 border-t border-black pt-1">
                Accounts Department
              </div>
            </div>
            <div>
              <div className="mt-12 border-t border-black pt-1">
                Reporting Manager
              </div>
            </div>
            <div>
              <div className="mt-12 border-t border-black pt-1">
                Approval Authority 1
              </div>
            </div>
            <div>
              <div className="mt-12 border-t border-black pt-1">
                Approval Authority 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetrolReimbursementDetail;
