import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SITE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ApiErrorPage from "@/components/api-error/api-error";
import { GroupButton } from "@/components/group-button";

const EditSite = ({ isOpen, onOpenChange, siteId }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    site_name: "",
    site_address: "",
    site_url: "",
    site_status: "Active",
  });

  const [errors, setErrors] = useState({});
  const autoCompleteRef = useRef(null);
  const autoCompleteInstance = useRef(null);

  const handlePlaceSelect = async () => {
    const addressObject = await autoCompleteInstance.current.getPlace();
    const query = addressObject.formatted_address;
    const url = addressObject.url;

    setFormData((prev) => ({
      ...prev,
      site_address: query || "",
      site_url: url || prev.site_url,
    }));
  };

  const handleScriptLoad = async () => {
    if (!autoCompleteRef.current) return;
    try {
      const { Autocomplete } = await window.google.maps.importLibrary("places");
      autoCompleteInstance.current = new Autocomplete(autoCompleteRef.current, {
        componentRestrictions: { country: "IN" },
      });

      autoCompleteInstance.current.addListener("place_changed", () => {
        handlePlaceSelect();
      });
    } catch (error) {
      console.error("Error loading Google Maps library:", error);
    }
  };

  useEffect(() => {
    let checkGoogle;
    if (isOpen) {
      if (window.google && window.google.maps) {
        handleScriptLoad();
      } else {
        checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            handleScriptLoad();
            clearInterval(checkGoogle);
          }
        }, 1000);
      }
    }

    return () => {
      if (checkGoogle) clearInterval(checkGoogle);
      if (autoCompleteInstance.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autoCompleteInstance.current,
        );
      }
    };
  }, [isOpen]);

  const {
    data: siteData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: siteId ? SITE_API.byId(siteId) : null,
    queryKey: ["site-edit", siteId],
    enabled: !!siteId && isOpen,
  });

  useEffect(() => {
    if (siteData && isOpen) {
      const data = siteData.data?.data || siteData.data;
      if (data) {
        setFormData({
          site_name: data.site_name || "",
          site_address: data.site_address || "",
          site_url: data.site_url || "",
          site_status: data.site_status || "Active",
        });
      }
    }
  }, [siteData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "site_address" && !value) {
        updated.site_url = "";
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.site_name.trim()) {
      newErrors.site_name = "Site name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("site_name", formData.site_name);
    formDataObj.append("site_address", formData.site_address);
    formDataObj.append("site_url", formData.site_url);
    formDataObj.append("site_status", formData.site_status);

    try {
      const res = await trigger({
        url: SITE_API.updateById(siteId),
        method: "post",
        data: formDataObj,
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.message || "Site updated successfully");
        queryClient.invalidateQueries(["site-list"]);
        queryClient.invalidateQueries(["site-edit", siteId]);
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update site");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.error("Update site error:", error);
    }
  };

  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-red-500">Failed to load site</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <form
            id="edit-site-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="site_name"
                    className="text-sm font-semibold flex items-center gap-1 text-gray-700"
                  >
                    Site Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    placeholder="Enter site name"
                    value={formData.site_name}
                    onChange={handleInputChange}
                    className={
                      errors.site_name
                        ? "border-red-500 shadow-sm shadow-red-100"
                        : ""
                    }
                  />
                  {errors.site_name && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.site_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="site_address"
                    className="text-sm font-semibold flex items-center gap-1 text-gray-700"
                  >
                    Site Address
                  </Label>
                  <Input
                    id="site_address"
                    name="site_address"
                    ref={autoCompleteRef}
                    placeholder="Search site address"
                    value={formData.site_address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Site Status{" "}
                </Label>
                <GroupButton
                  className="w-fit"
                  value={formData.site_status}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, site_status: value }))
                  }
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                />
              </div>
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
                    Updating...
                  </>
                ) : (
                  "Update Site"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSite;
