import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPLOYEE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateEmployee = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { trigger, loading: isSubmitting } = useApiMutation();
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

    if (formData.user_image instanceof File) {
      formDataObj.append("user_image", formData.user_image);
    } else {
      formDataObj.append("user_image", "");
    }

    try {
      const res = await trigger({
        url: EMPLOYEE_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Employee created successfully");
        queryClient.invalidateQueries(["employee-list"]);
        navigate("/employee");
      } else {
        toast.error(res?.message || "Failed to create employee");
      }
    } catch (error) {
      const errors = error?.response?.data?.message;
      toast.error(errors || "Something went wrong");
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        icon={Users}
        title="Add New Employee"
        description="Fill in the details to register a new employee"
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
              form="create-employee-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-employee-form"
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
                Image
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

export default CreateEmployee;
