import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import ToggleStatus from "@/components/toogle/status-toogle";
import { SITE_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import CreateSite from "./create-site";
import EditSite from "./edit-site";
import { Button } from "@/components/ui/button";

const SiteList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: SITE_API.list,
    queryKey: ["site-list"],
  });

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
      header: "Address",
      accessorKey: "site_address",
      cell: ({ row }) => (
        <div className="flex items-start gap-1 max-w-[250px]">
          <span className="text-sm text-gray-600 line-clamp-2">
            {row.original.site_address || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "URL",
      accessorKey: "site_url",
      cell: ({ row }) =>
        row.original.site_url ? (
          <a
            href={row.original.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
          >
            <span className="max-w-[150px] truncate">
              {row.original.site_url}
            </span>
          </a>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
    {
      header: "Status",
      accessorKey: "site_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.site_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.site_status}
            id={row.original.id}
            apiUrl={SITE_API.updateStatus(row.original.id)}
            payloadKey="site_status"
            method="patch"
          />
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Edit
            className="h-4 w-4 hover:text-blue-600 cursor-pointer"
            onClick={() => {
              setSelectedSiteId(row.original.id);
              setIsEditOpen(true);
            }}
          />
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="w-full">
      <DataTable
        data={data?.data?.data || []} // Assuming same nesting as employee
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search sites..."
        extraButton={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Site
          </Button>
        }
      />

      <CreateSite isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditSite
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        siteId={selectedSiteId}
      />
    </div>
  );
};

export default SiteList;
