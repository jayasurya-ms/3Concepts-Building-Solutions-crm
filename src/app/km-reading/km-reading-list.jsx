import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import LoadingBar from "@/components/loader/loading-bar";
import { KM_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { Edit, Trash2, PlusCircle } from "lucide-react";
import moment from "moment";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";

import CreateKMReading from "./create-km-reading";
import EditKMReading from "./edit-km-reading";

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
import { Button } from "@/components/ui/button";

const KMReadingList = () => {
  const queryClient = useQueryClient();
  const { trigger: deleteTrigger } = useApiMutation();

  const user = useSelector((state) => state.auth.user);
  const userType = Number(user?.user_type);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReadingId, setSelectedReadingId] = useState(null);

  const {
    data: data,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: KM_API.list,
    queryKey: ["km-reading-list"],
  });

  const handleDelete = async (id) => {
    try {
      const res = await deleteTrigger({
        url: KM_API.deleteById(id),
        method: "delete",
      });
      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "KM Reading deleted successfully");
        queryClient.invalidateQueries(["km-reading-list"]);
        refetch();
      } else {
        toast.error(res?.message || "Failed to delete KM Reading");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "km_readings_date",
      cell: ({ row }) => {
        return (
          <span>
            {moment(row.original.km_readings_date).format("DD-MM-YYYY")}
          </span>
        );
      },
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
      header: "KM Reading",
      accessorKey: "km_readings",
      cell: ({ row }) => (
        <div className="text-gray-600 font-medium">
          {row.original.km_readings} KM
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Edit
            className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => {
              setSelectedReadingId(row.original.id);
              setIsEditOpen(true);
            }}
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
                    the KM reading record.
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
    <div className="w-full">
      <DataTable
        data={data?.data?.data || []}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search readings..."
        extraButton={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add KM Reading
          </Button>
        }
      />

      <CreateKMReading isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditKMReading
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        readingId={selectedReadingId}
      />
    </div>
  );
};

export default KMReadingList;
