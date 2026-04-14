import React, { useState, useMemo } from "react";
import PageHeader from "@/components/common/page-header";
import XLSX from "xlsx-js-style";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { REPORT_API, ACTIVE_SITE } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { FileSpreadsheet, Gauge, Search, Loader2 } from "lucide-react";

const PlaceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [details, setDetails] = useState([]);
  const [isSummaryView, setIsSummaryView] = useState(true);

  const [filters, setFilters] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
  });

  const { trigger: fetchReport, loading: isSearching } = useApiMutation();

  // ✅ FETCH SITES (NO useMemo needed)
  const { data: sitesData } = useGetApiMutation({
    url: ACTIVE_SITE.list,
    queryKey: ["active-sites"],
  });

  const activeSites = (sitesData?.data?.data || sitesData?.data || []).filter(
    (site) => site.id !== 1,
  );

  // ✅ FETCH REPORT
  const getReport = async (siteOverride) => {
    try {
      const formData = new FormData();
      formData.append("from_date", filters.from_date);
      formData.append("to_date", filters.to_date);

      const finalSite =
        typeof siteOverride === "string" ? siteOverride : selectedSite;

      if (finalSite) {
        formData.append("site_id", finalSite);
      }

      const res = await fetchReport({
        url: REPORT_API.place,
        method: "post",
        data: formData,
      });

      setReportData(res?.data?.trips || []);
    } catch (error) {
      console.error("Report fetch failed", error);
      setReportData([]);
    }
  };

  // ✅ GROUPING (SITE → DATE)
  const groupedBySite = useMemo(() => {
    const grouped = {};

    reportData.forEach((item) => {
      const siteKey =
        item.trips_to_id !== 1 ? item.trips_to_id : item.trips_from_id;

      if (selectedSite && String(siteKey) !== String(selectedSite)) return;

      const siteName = item.trips_to_id !== 1 ? item.to_site : item.from_site;

      if (!grouped[siteKey]) {
        grouped[siteKey] = {
          name: siteName,
          dates: {},
          total: 0,
        };
      }

      const date = item.trips_date;

      if (!grouped[siteKey].dates[date]) {
        grouped[siteKey].dates[date] = 0;
      }

      const km = parseFloat(item.trips_km || 0);

      grouped[siteKey].dates[date] += km;
      grouped[siteKey].total += km;
    });

    return grouped;
  }, [reportData, selectedSite]);

  // ✅ EXPORT
  const handleExportExcel = () => {
    try {
      const wsData = [];

      if (isSummaryView) {
        Object.keys(groupedBySite)
          .sort()
          .forEach((siteKey) => {
            const site = groupedBySite[siteKey];
            const amount =
              Number(reportData[0]?.trips_price || 0) * Number(site.total);
            wsData.push({
              "Site Name": site.name,
              "Total KM": site.total.toFixed(2),
              "Per KM Rate": Number(reportData[0]?.trips_price || 0).toFixed(2),
              "Total Amount": amount.toFixed(2),
            });
          });
        if (Object.keys(groupedBySite).length > 0) {
          wsData.push({
            "Site Name": "Total",
            "Total KM": grandTotal.toFixed(2),
            "Per KM Rate": Number(reportData[0]?.trips_price || 0).toFixed(2),
            "Total Amount": totalAmount.toFixed(2),
          });
        }
      } else {
        Object.keys(groupedBySite)
          .sort()
          .forEach((siteKey) => {
            const site = groupedBySite[siteKey];
            Object.keys(site.dates)
              .sort()
              .forEach((date) => {
                wsData.push({
                  Site: site.name,
                  Date: moment(date).format("DD-MM-YYYY"),
                  "Total KM/Day": site.dates[date].toFixed(2),
                  "Per KM": Number(reportData[0]?.trips_price || 0).toFixed(2),
                  "Total Amount/Day": (
                    Number(reportData[0]?.trips_price || 0) *
                    Number(site.dates[date])
                  ).toFixed(2),
                });
              });
          });
      }

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Site Wise Report");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Site_Wise_Report_${moment().format("DD-MM-YYYY")}.xlsx`;
      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error Encountered:", err);
      alert("Export failed: " + err.message);
    }
  };

  // ✅ DRILL DOWN
  const handleRowClick = ({ date, site }) => {
    const filtered = reportData.filter((item) => {
      const siteName = item.trips_to_id !== 1 ? item.to_site : item.from_site;

      return item.trips_date === date && siteName === site;
    });

    setSelectedRow({ date, site });
    setDetails(filtered);
  };

  // ✅ GRAND TOTAL
  const grandTotal = Object.values(groupedBySite).reduce(
    (sum, site) => sum + site.total,
    0,
  );

  const totalAmount = Object.values(groupedBySite).reduce(
    (sum, site) => sum + site.total * Number(reportData[0]?.trips_price),
    0,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Gauge}
        title="Site Expenses Report"
        description="View Expenses grouped by date and site"
      />

      {/* FILTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-3 rounded-lg border shadow-sm">
        <div>
          <Label className="text-xs">From Date</Label>
          <Input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-xs">To Date</Label>
          <Input
            type="date"
            value={filters.to_date}
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2 col-span-3 items-end">
          {/* SITE FILTER */}
          <select
            className="border rounded-xl h-9 px-2 w-1/3"
            value={selectedSite}
            onChange={(e) => {
              setSelectedSite(e.target.value);
              getReport(e.target.value);
            }}
          >
            <option value="">All Sites</option>
            {activeSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.site_name}
              </option>
            ))}
          </select>

          <Button
            onClick={getReport}
            disabled={isSearching}
            className="w-1/3 flex gap-2"
          >
            {isSearching ? (
              <Loader2 className="animate-spin h-4" />
            ) : (
              <Search className="h-4" />
            )}
            Fetch
          </Button>

          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="w-1/3 flex gap-2"
            disabled={!Object.keys(groupedBySite).length}
          >
            <FileSpreadsheet className="h-4" />
            Export
          </Button>
        </div>
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 mb-4 text-violet-600" />
          <p>Loading report data...</p>
        </div>
      ) : (
        <>
          {/* GRAND TOTAL */}
          <div className="mx-5 grid grid-cols-3">
            {isSummaryView ? (
              <>
                <span></span>
                <span></span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-violet-700">
                  Total KM - {grandTotal.toFixed(2)}
                </span>
                <span className="text-lg font-semibold text-violet-700">
                  Total Amount - {totalAmount.toFixed(2)}
                </span>
              </>
            )}
            <span className="flex items-center justify-end pr-4 gap-2">
              <Label
                htmlFor="summary-mode"
                className="text-sm font-semibold cursor-pointer"
              >
                Detailed
              </Label>
              <Switch
                id="summary-mode"
                checked={isSummaryView}
                onCheckedChange={setIsSummaryView}
              />
              <Label
                htmlFor="summary-mode"
                className="text-sm font-semibold cursor-pointer"
              >
                Summary
              </Label>
            </span>
          </div>

          {/* REPORT UI */}
          {isSummaryView ? (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border text-left font-semibold">
                      Site Name
                    </th>
                    <th className="p-3 border text-left font-semibold">
                      Total KM
                    </th>
                    <th className="p-3 border text-left font-semibold">
                      Per KM Rate
                    </th>
                    <th className="p-3 border text-left font-semibold">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedBySite)
                    .sort()
                    .map((siteKey) => {
                      const site = groupedBySite[siteKey];
                      const amount =
                        Number(reportData[0]?.trips_price) * Number(site.total);
                      return (
                        <tr
                          key={siteKey}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 border text-violet-700 font-semibold">
                            {site.name}
                          </td>
                          <td className="p-3 border">
                            {site.total.toFixed(2)} KM
                          </td>
                          <td className="p-3 border">
                            ₹{Number(reportData[0]?.trips_price).toFixed(2)}
                          </td>
                          <td className="p-3 border font-semibold text-green-700">
                            ₹{amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  {Object.keys(groupedBySite).length > 0 && (
                    <tr>
                      <td className="p-3 border font-semibold text-violet-700">
                        Total
                      </td>
                      <td className="p-3 border font-semibold text-violet-700">
                        {grandTotal.toFixed(2)} KM
                      </td>
                      <td className="p-3 border font-semibold text-violet-700">
                        ₹{Number(reportData[0]?.trips_price).toFixed(2)}
                      </td>
                      <td className="p-3 border font-semibold text-violet-700">
                        ₹{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {Object.keys(groupedBySite).length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedBySite)
                .sort()
                .map((siteKey) => {
                  const site = groupedBySite[siteKey];

                  return (
                    <div
                      key={siteKey}
                      className="bg-white p-4 rounded-lg border shadow-sm"
                    >
                      <h2 className="flex justify-between mb-3">
                        <span className="text-lg font-semibold text-violet-700">
                          {site.name}
                        </span>
                        <span className="font-semibold">
                          Total KM/Site - {site.total.toFixed(2)}
                        </span>
                        <span className="font-semibold">
                          Total Amount/Site -{" "}
                          {Number(reportData[0]?.trips_price) *
                            Number(site.total)}
                        </span>
                      </h2>

                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-left">Date</th>
                            <th className="p-2 border text-left">
                              Total KM/Day
                            </th>
                            <th className="p-2 border text-left">Per KM</th>
                            <th className="p-2 border text-left">
                              Total Amount/Day
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {Object.keys(site.dates)
                            .sort()
                            .map((date, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="p-2 border">
                                  {moment(date).format("DD-MM-YYYY")}
                                </td>

                                <td
                                  className="p-2 border text-violet-600 font-semibold cursor-pointer underline"
                                  onClick={() =>
                                    handleRowClick({
                                      date,
                                      site: site.name,
                                    })
                                  }
                                >
                                  {site.dates[date].toFixed(2)} KM
                                </td>
                                <td className="p-2 border">
                                  {Number(reportData[0]?.trips_price)}
                                </td>
                                <td className="p-2 border">
                                  {(
                                    Number(reportData[0]?.trips_price) *
                                    Number(site.dates[date])
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-auto p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">
                Details for {selectedRow.site} on{" "}
                {moment(selectedRow.date).format("DD-MM-YYYY")}
              </h3>
              <button onClick={() => setSelectedRow(null)}>✕</button>
            </div>

            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Employee</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">KM</th>
                </tr>
              </thead>

              <tbody>
                {details.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2 border">
                      {item.name}
                      <div className="text-xs text-gray-500">
                        {item.employee_code}
                      </div>
                    </td>
                    <td className="p-2 border">{item.trips_time}</td>
                    <td className="p-2 border">{item.from_site}</td>
                    <td className="p-2 border">{item.to_site}</td>
                    <td className="p-2 border">
                      {parseFloat(item.trips_km).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right mt-3 font-semibold text-violet-600">
              Total:{" "}
              {details
                .reduce((sum, item) => sum + parseFloat(item.trips_km || 0), 0)
                .toFixed(2)}{" "}
              KM
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceReport;
