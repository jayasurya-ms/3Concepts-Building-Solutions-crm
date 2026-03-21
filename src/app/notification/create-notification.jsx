import ImageUpload from "@/components/image-upload/image-upload";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NOTIFICATION_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CreateNotification = ({ isOpen, onOpenChange }) => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    notification_date: "",
    notification_heading: "",
    notification_image: "",
    notification_description: "",
  });

  const [errors, setErrors] = useState({});

  const [preview, setPreview] = useState({
    notification_image: "",
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

    if (!formData.notification_date) {
      newErrors.notification_date = "Notification date is required";
      isValid = false;
    }
    if (!formData.notification_heading) {
      newErrors.notification_heading = "Notification heading is required";
      isValid = false;
    }
    if (!preview.notification_image && !formData.notification_image) {
      newErrors.notification_image = "Notification image is required";
      isValid = false;
    }
    if (!formData.notification_description) {
      newErrors.notification_description =
        "Notification description is required";
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
      toast.error("Please fill all the fields");
      return;
    }

    const formDataObj = new FormData();

    formDataObj.append("notification_date", formData.notification_date);
    formDataObj.append("notification_heading", formData.notification_heading);
    formDataObj.append(
      "notification_description",
      formData.notification_description,
    );
    if (formData.notification_image instanceof File) {
      formDataObj.append("notification_image", formData.notification_image);
    }
    try {
      const res = await trigger({
        url: NOTIFICATION_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res?.code === 201) {
        toast.success(res?.message || "Notification created successfully");

        setFormData({
          notification_date: "",
          notification_heading: "",
          notification_description: "",
          notification_image: null,
        });
        setErrors({});
        setPreview({ notification_image: "" });

        queryClient.invalidateQueries(["notification-list"]);
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to create notification");
      }
    } catch (error) {
      const errors = error?.response?.data?.message;
      toast.error(errors || "Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Notification</DialogTitle>
        </DialogHeader>
        <form
          id="create-notification-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="notification_date"
                className="text-sm font-medium"
              >
                Date <Redstar />
              </Label>
              <Input
                id="notification_date"
                name="notification_date"
                type="date"
                placeholder="Select date"
                value={formData.notification_date}
                onChange={handleInputChange}
                className={errors.notification_date ? "border-red-500" : ""}
              />
              {errors.notification_date && (
                <p className="text-sm text-red-500">
                  {errors.notification_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notification_heading"
                className="text-sm font-medium"
              >
                Heading <Redstar />
              </Label>
              <Input
                id="notification_heading"
                name="notification_heading"
                type="text"
                placeholder="Enter notification heading"
                value={formData.notification_heading}
                onChange={handleInputChange}
                className={errors.notification_heading ? "border-red-500" : ""}
              />
              {errors.notification_heading && (
                <p className="text-sm text-red-500">
                  {errors.notification_heading}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notification_description"
              className="text-sm font-medium"
            >
              Description <Redstar />
            </Label>
            <Textarea
              id="notification_description"
              name="notification_description"
              placeholder="Enter notification description"
              value={formData.notification_description}
              onChange={handleInputChange}
              className={
                errors.notification_description ? "border-red-500" : ""
              }
              rows={4}
            />
            {errors.notification_description && (
              <p className="text-sm text-red-500">
                {errors.notification_description}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notification_image" className="text-sm font-medium">
              Image <Redstar />
            </Label>
            <ImageUpload
              id="notification_image"
              label=""
              selectedFile={formData.notification_image}
              previewImage={preview.notification_image}
              onFileChange={(e) =>
                handleImageChange("notification_image", e.target.files?.[0])
              }
              onRemove={() => handleRemoveImage("notification_image")}
              error={errors.notification_image}
              maxSize={5}
            />
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Notification"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotification;
