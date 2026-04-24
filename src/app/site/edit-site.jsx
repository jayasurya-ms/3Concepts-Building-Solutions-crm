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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditSite = ({ isOpen, onOpenChange, siteId }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    site_name: "",
    site_type: "",
    site_address: "",
    site_url: "",
    place_id: "",
    site_status: "Active",
  });

  const [errors, setErrors] = useState({});
  const autoCompleteRef = useRef(null);
  const autoCompleteInstance = useRef(null);
  const lastSelectedAddress = useRef("");

  const handlePlaceSelect = async () => {
    const addressObject = await autoCompleteInstance.current.getPlace();
    const query = addressObject.formatted_address;
    const url = addressObject.url;
    const place_id = addressObject.place_id;

    lastSelectedAddress.current = query || "";
    setFormData((prev) => ({
      ...prev,
      site_address: query || "",
      site_url: url || prev.site_url,
      place_id: place_id || prev.place_id,
    }));
  };

  const handleScriptLoad = async () => {
    if (!autoCompleteRef.current) {
      console.log("Autocomplete ref not ready yet");
      return;
    }
    try {
      console.log("Initializing Google Maps Autocomplete for Edit Mode...");
      const { Autocomplete } = await window.google.maps.importLibrary("places");

      // Clear old instance if it exists
      if (autoCompleteInstance.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autoCompleteInstance.current,
        );
      }

      autoCompleteInstance.current = new Autocomplete(autoCompleteRef.current, {
        componentRestrictions: { country: "IN" },
      });

      autoCompleteInstance.current.addListener("place_changed", () => {
        handlePlaceSelect();
      });
      console.log("Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error loading Google Maps library:", error);
    }
  };

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
    let checkGoogle;
    if (isOpen && !isLoading) {
      if (window.google && window.google.maps) {
        setTimeout(handleScriptLoad, 100);
      } else {
        checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            setTimeout(handleScriptLoad, 100);
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
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (siteData && isOpen) {
      const data = siteData.data?.data || siteData.data;
      if (data) {
        setFormData({
          site_name: data.site_name || "",
          site_type: data.site_type || "",
          site_address: data.site_address || "",
          site_url: data.site_url || "",
          place_id: data.place_id || "",
          site_status: data.site_status || "Active",
        });
        lastSelectedAddress.current = data.site_address || "";
      }
    }
  }, [siteData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "site_address") {
        if (value !== lastSelectedAddress.current) {
          updated.site_url = "";
          updated.place_id = "";
        }
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

    if (!formData.site_type) {
      newErrors.site_type = "Site type is required";
      isValid = false;
    }

    if (!formData.site_address.trim()) {
      newErrors.site_address = "Site address is required";
      isValid = false;
    }
    if (!formData.site_url) {
      newErrors.site_address = "Site address is not valid";
      isValid = false;
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateForm();

    if (!isValid) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fill in required fields");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("site_name", formData.site_name);
    formDataObj.append("site_type", formData.site_type);
    formDataObj.append("site_address", formData.site_address);
    formDataObj.append("site_url", formData.site_url);
    formDataObj.append("place_id", formData.place_id);
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
      <DialogContent
        className="max-w-2xl"
        onPointerDownOutside={(e) => {
          if (e.target.closest(".pac-container")) {
            e.preventDefault();
          }
        }}
      >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    htmlFor="site_type"
                    className="text-sm font-semibold flex items-center gap-1 text-gray-700"
                  >
                    Site Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.site_type}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          site_type: value,
                        }));

                        if (errors.site_type) {
                          setErrors((prev) => ({
                            ...prev,
                            site_type: "",
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Original">Original</SelectItem>
                        <SelectItem value="Temp">Temp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.site_type && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.site_type}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="site_address"
                    className="text-sm font-semibold flex items-center gap-1 text-gray-700"
                  >
                    Site Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="site_address"
                    name="site_address"
                    ref={autoCompleteRef}
                    placeholder="Search site address"
                    value={formData.site_address}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setFormData((prev) => {
                          if (!prev.place_id && !prev.site_url) {
                            if (errors.site_address) {
                              setErrors((errorsPrev) => ({
                                ...errorsPrev,
                                site_address: "",
                              }));
                            }
                            return { ...prev, site_address: "" };
                          }
                          return prev;
                        });
                      }, 200);
                    }}
                    className={
                      errors.site_address
                        ? "border-red-500 shadow-sm shadow-red-100"
                        : ""
                    }
                  />
                  {formData.site_url && (
                    <p className="text-xs font-medium text-gray-500 pt-1">
                      <a
                        href={formData.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {formData.site_url}
                      </a>
                    </p>
                  )}
                  {errors.site_address && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.site_address}
                    </p>
                  )}
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
