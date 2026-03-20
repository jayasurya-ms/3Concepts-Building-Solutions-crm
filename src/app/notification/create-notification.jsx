import PageHeader from "@/components/common/page-header";
import ImageUpload from "@/components/image-upload/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BANNER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateNotification = () => {
  const { trigger, loading: isSubmitting } = useApiMutation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    notification_sort: "",
    notification_text: "",
    notification_link: "",
    notification_image_alt: "",
    notification_image: null,
  });

  const [errors, setErrors] = useState({});

  const [preview, setPreview] = useState({
    banner_image: "",
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

    if (!formData.banner_sort.trim()) {
      newErrors.banner_sort = "Sort order is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.banner_sort)) {
      newErrors.banner_sort = "Sort order must be a number";
      isValid = false;
    }

    if (formData.banner_link.trim() && !isValidUrl(formData.banner_link)) {
      newErrors.banner_link = "Please enter a valid URL";
      isValid = false;
    }

    if (!formData.banner_image_alt.trim()) {
      newErrors.banner_image_alt = "Alt text is required";
      isValid = false;
    }

    if (!preview.banner_image && !formData.banner_image) {
      newErrors.banner_image = "Banner image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
      toast.error("Please fix the errors in the form");
      return;
    }

    const formDataObj = new FormData();

    formDataObj.append("banner_sort", formData.banner_sort);
    formDataObj.append("banner_text", formData.banner_text);
    formDataObj.append("banner_link", formData.banner_link || "");
    formDataObj.append("banner_image_alt", formData.banner_image_alt);
    if (formData.banner_image instanceof File) {
      formDataObj.append("banner_image", formData.banner_image);
    }
    try {
      const res = await trigger({
        url: BANNER_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res?.code === 201) {
        toast.success(res?.msg || "Banner created successfully");

        setFormData({
          banner_sort: "",
          banner_text: "",
          banner_link: "",
          banner_image_alt: "",
        });
        setErrors({});

        const fileInput = document.getElementById("banner_image");
        if (fileInput) fileInput.value = "";
        queryClient.invalidateQueries(["banner-list"]);

        navigate("/banner-list");
      } else {
        toast.error(res?.msg || "Failed to create banner");
      }
    } catch (error) {
      const errors = error?.response?.data?.msg;

      toast.error(errors);
    }
  };

  return (
    <div className="max-w-full mx-auto  ">
      <PageHeader
        icon={Image}
        title="Add New Notification"
        description="Fill in the details below to create a new notification"
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
              form="create-notification-form"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Notification"
              )}
            </Button>
          </div>
        }
      />
      <Card className="mt-2">
        <CardContent className="p-4">
          <form
            id="create-notification-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <div className="space-y-2">
              <Label
                htmlFor="notification_text"
                className="text-sm font-medium"
              >
                Notification Text
              </Label>
              <Textarea
                id="notification_text"
                name="notification_text"
                placeholder="Enter notification text"
                value={formData.notification_text}
                onChange={handleInputChange}
                className={errors.notification_text ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notification_link"
                className="text-sm font-medium"
              >
                Notification Link
              </Label>
              <Textarea
                id="notification_link"
                name="notification_link"
                type="url"
                placeholder="https://example.com"
                value={formData.notification_link}
                onChange={handleInputChange}
                className={errors.notification_link ? "border-red-500" : ""}
              />
              {errors.notification_link && (
                <p className="text-sm text-red-500">
                  {errors.notification_link}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notification_image_alt"
                className="text-sm font-medium"
              >
                Image Alt Text *
              </Label>
              <Textarea
                id="notification_image_alt"
                name="notification_image_alt"
                placeholder="Describe the image for accessibility"
                value={formData.notification_image_alt}
                onChange={handleInputChange}
                className={
                  errors.notification_image_alt ? "border-red-500" : ""
                }
              />
              <div className="flex justify-between">
                {errors.notification_image_alt && (
                  <p className="text-sm text-red-500">
                    {errors.notification_image_alt}
                  </p>
                )}
              </div>
            </div>

            <div>
              <ImageUpload
                id="notification_image"
                label="Notification Image"
                required
                selectedFile={formData.notification_image}
                previewImage={preview.notification_image}
                onFileChange={(e) =>
                  handleImageChange("notification_image", e.target.files?.[0])
                }
                onRemove={() => handleRemoveImage("notification_image")}
                error={errors.notification_image}
                format="WEBP"
                allowedExtensions={["webp"]}
                dimensions="1920x858"
                maxSize={5}
                requiredDimensions={[1920, 858]}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNotification;
