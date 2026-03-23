import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { TRIP_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, PlusCircle, Boxes } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TripList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { trigger: deleteTrigger } = useApiMutation();
  const user = useSelector((state) => state.auth.user);
  const userType = Number(user?.user_type);

  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: TRIP_API.list,
    queryKey: ["trip-list"],
  });

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: TRIP_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Trip deleted successfully");
        queryClient.invalidateQueries(["trip-list"]);
        refetch();
      } else {
        toast.error(res?.message || "Failed to delete trip");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "trips_date",
      cell: ({ row }) => (
        <span className="font-medium">
          {moment(row.original.trips_date).format("DD-MM-YYYY")}
        </span>
      ),
    },
    {
      header: "Time",
      accessorKey: "trips_time",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.trips_time}</span>
      ),
    },
    {
      header: "Employee",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original?.name || "N/A"}
        </div>
      ),
    },
    {
      header: "From Site",
      accessorKey: "from_site",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.from_site || "N/A"}</span>
      ),
    },
    {
      header: "To Site",
      accessorKey: "to_site",
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.to_site || "N/A"}</span>
      ),
    },
    {
      header: "KM",
      accessorKey: "trips_km",
      cell: ({ row }) => <div>{row.original.trips_km} KM</div>,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Edit
            className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => navigate(`/edit-trip/${row.original.id}`)}
          />

          {(userType === 4 || userType === 5) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the trip record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.original.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
      searchPlaceholder="Search trips..."
      addButton={{
        to: "/create-trip",
        label: "Add Trip",
      }}
    />
  );
};

export default TripList;
