import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import { NOTIFICATION_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";

const NotificationList = () => {
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: NOTIFICATION_API.list,
    queryKey: ["notification-list"],
  });
  // console.log(data?.data);
  const IMAGE_FOR = "Notification";
  const notificationBaseUrl = getImageBaseUrl(data?.image_url, IMAGE_FOR);
  const noImageUrl = getNoImageUrl(data?.image_url);

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
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.notification_status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.notification_status}
        </span>
      ),
      enableSorting: false,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div>
          <Link
            title="notification edit"
            to={`/edit-notification/${row.original.id}`}
            className="cursor-pointer"
          >
            <Edit className=" h-4 w-4 hover:text-blue-600" />
          </Link>
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
        addButton={{
          to: "/add-notification",
          label: "Add Notification",
        }}
      />
    </>
  );
};

export default NotificationList;
