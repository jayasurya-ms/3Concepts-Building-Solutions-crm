import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPLOYEE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { getImageBaseUrl } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";

const EditEmployee = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const {
    data: employeeData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: EMPLOYEE_API.byId(id),
    queryKey: ["employee", id],
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    employee_code: "",
    user_position: "",
    user_image: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    user_image: "",
  });

  useEffect(() => {
    if (employeeData) {
      // Defensive data extraction: some APIs nest the object under another 'data' key
      const data = employeeData.data?.data || employeeData.data;
      
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          employee_code: data.employee_code || "",
          user_position: data.user_position || "",
          user_image: data.user_image || "",
          status: data.status || "Active",
        });

        if (data.user_image) {
          // Check both root and nested image_url, and both "Employee" and "Member" tags
          const imageUrlArray = employeeData.image_url || employeeData.data?.image_url || [];
          const baseUrl = 
            getImageBaseUrl(imageUrlArray, "User") || 
            getImageBaseUrl(imageUrlArray, "Employee") || 
            getImageBaseUrl(imageUrlArray, "Member");
          
          if (baseUrl) {
            setPreview({
              user_image: `${baseUrl}${data.user_image}`,
            });
          }
        }
      }
    }
  }, [employeeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }
    if (!formData.mobile) {
      newErrors.mobile = "Mobile is required";
      isValid = false;
    }
    if (!formData.employee_code) {
      newErrors.employee_code = "Employee code is required";
      isValid = false;
    }
    if (!preview.user_image && !formData.user_image) {
      newErrors.user_image = "Image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [fieldName]: url });
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  const handleRemoveImage = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreview({ ...preview, [fieldName]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all the required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("mobile", formData.mobile);
    formDataObj.append("employee_code", formData.employee_code);
    formDataObj.append("user_position", formData.user_position);
    formDataObj.append("status", formData.status || "Active");

    if (formData.user_image instanceof File) {
      formDataObj.append("user_image", formData.user_image);
    }

    try {
      const res = await trigger({
        url: EMPLOYEE_API.updateById(id),
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Employee updated successfully");
        queryClient.invalidateQueries(["employee-list"]);
        queryClient.invalidateQueries(["employee", id]);
        navigate("/employee");
      } else {
        toast.error(res?.message || "Failed to update employee");
      }
    } catch (error) {
      const errors = error?.response?.data?.message;
      toast.error(errors || "Something went wrong");
    }
  };

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Users}
        title="Edit Employee"
        description="Update the details of existing employee"
        rightContent={
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              form="edit-employee-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="edit-employee-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <Redstar />
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <Redstar />
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile <Redstar />
              </Label>
              <Input
                id="mobile"
                name="mobile"
                type="text"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleInputChange}
                className={errors.mobile ? "border-red-500" : ""}
              />
              {errors.mobile && (
                <p className="text-sm text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_code" className="text-sm font-medium">
                Employee Code <Redstar />
              </Label>
              <Input
                id="employee_code"
                name="employee_code"
                type="text"
                placeholder="Enter employee code"
                value={formData.employee_code}
                onChange={handleInputChange}
                className={errors.employee_code ? "border-red-500" : ""}
              />
              {errors.employee_code && (
                <p className="text-sm text-red-500">{errors.employee_code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_position" className="text-sm font-medium">
                Position
              </Label>
              <Input
                id="user_position"
                name="user_position"
                type="text"
                placeholder="Enter employee position"
                value={formData.user_position}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="user_image" className="text-sm font-medium">
                Image <Redstar />
              </Label>
              <ImageUpload
                id="user_image"
                label=""
                selectedFile={formData.user_image}
                previewImage={preview.user_image}
                onFileChange={(e) =>
                  handleImageChange("user_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("user_image")}
                error={errors.user_image}
                maxSize={5}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEmployee;
