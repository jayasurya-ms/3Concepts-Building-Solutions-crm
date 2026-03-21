import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit, SquarePlus } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import CreateNotification from "./create-notification";
import EditNotification from "./edit-notification";

const NotificationList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: NOTIFICATION_API.list,
    queryKey: ["notification-list"],
  });

  const IMAGE_FOR = "Notification";
  const notificationBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

  const handleEdit = (id) => {
    setSelectedNotificationId(id);
    setIsEditOpen(true);
  };

  const columns = [
    {
      header: "Image",
      accessorKey: "notification_image",
      cell: ({ row }) => {
        const fileName = row.original.notification_image;
        const src = fileName ? `${notificationBaseUrl}${fileName}` : noImageUrl;

        return (
          <ImageCell
            src={src}
            fallback={noImageUrl}
            alt={`${IMAGE_FOR} Image`}
          />
        );
      },
      enableSorting: false,
    },
    {
      header: "Date",
      accessorKey: "notification_date",
      cell: ({ row }) => {
        return (
          <span>
            {moment(row.original.notification_date).format("DD-MM-YYYY")}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      header: "Heading",
      accessorKey: "notification_heading",
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "notification_status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.notification_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.notification_status}
            apiUrl={NOTIFICATION_API.updateStatus(row.original.id)}
            payloadKey="notification_status"
            onSuccess={refetch}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleEdit(row.original.id)}
            title="Edit Notification"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <>
      <DataTable
        data={data?.data?.data || []}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Notification..."
        extraButton={
          <Button
            variant="default"
            size="sm"
            className="h-9"
            onClick={() => setIsCreateOpen(true)}
          >
            <SquarePlus className="h-3 w-3 mr-2" />
            Add Notification
          </Button>
        }
      />
      <CreateNotification
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      <EditNotification
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        notificationId={selectedNotificationId}
      />
    </>
  );
};

export default NotificationList;
