import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import ImageCell from "@/components/common/ImageCell";
import LoadingBar from "@/components/loader/loading-bar";
import ToggleStatus from "@/components/toogle/status-toogle";
import { EMPLOYEE_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeList = () => {
  const navigate = useNavigate();
  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: EMPLOYEE_API.list,
    queryKey: ["employee-list"],
  });

  const imageUrlArray = data?.image_url || data?.data?.image_url || [];
  const IMAGE_FOR = "Employee";
  const employeeBaseUrl =
    getImageBaseUrl(imageUrlArray, "User") ||
    getImageBaseUrl(imageUrlArray, "Employee") ||
    getImageBaseUrl(imageUrlArray, "Member");
  const noImageUrl = getNoImageUrl(imageUrlArray);

  const columns = [
    {
      header: "Image",
      accessorKey: "user_image",
      cell: ({ row }) => {
        const fileName = row.original.user_image;
        const src = fileName ? `${employeeBaseUrl}${fileName}` : noImageUrl;

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
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },
    {
      header: "Employee Code",
      accessorKey: "employee_code",
      enableSorting: true,
    },
    {
      header: "Email",
      accessorKey: "email",
      enableSorting: true,
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      enableSorting: false,
    },
    {
      header: "Designation",
      accessorKey: "user_position",
      enableSorting: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`w-fit px-3 rounded-full text-xs font-medium flex items-center justify-center ${
            row.original.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <ToggleStatus
            initialStatus={row.original.status}
            apiUrl={EMPLOYEE_API.updateStatus(row.original.id)}
            payloadKey="status"
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
          <Edit
            className=" h-4 w-4 hover:text-blue-600 cursor-pointer"
            onClick={() => navigate(`/edit-employee/${row.original.id}`)}
          />
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <DataTable
      data={data?.data?.data || []}
      columns={columns}
      pageSize={10}
      searchPlaceholder="Search Employee..."
      addButton={{
        to: "/create-employee",
        label: "Add Employee",
      }}
    />
  );
};

export default EmployeeList;
