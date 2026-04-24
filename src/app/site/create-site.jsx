import PageHeader from "@/components/common/page-header";
import Redstar from "@/components/Redstar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateSite = ({ isOpen, onOpenChange }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    site_name: "",
    site_type: "",
    site_address: "",
    site_url: "",
    place_id: "",
  });

  const [errors, setErrors] = useState({});
  const autoCompleteRef = useRef(null);
  const autoCompleteInstance = useRef(null);
  const lastSelectedAddress = useRef("");

  const handlePlaceSelect = () => {
    const place = autoCompleteInstance.current.getPlace();

    if (!place || !place.formatted_address) return;

    lastSelectedAddress.current = place.formatted_address;
    setFormData((prev) => ({
      ...prev,
      site_address: place.formatted_address,
      site_url: place.url || "",
      place_id: place.place_id || "",
    }));
  };

  const handleScriptLoad = useCallback(async () => {
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
  }, []);

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
  }, [isOpen, handleScriptLoad]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        site_name: "",
        site_type: "",
        site_address: "",
        site_url: "",
        place_id: "",
      });
      setErrors({});
    }
  }, [isOpen]);

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
    if (!formData.site_address.trim()) {
      newErrors.site_address = "Site address is required";
      isValid = false;
    }
    if (!formData.site_type) {
      newErrors.site_type = "Site type is required";
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

    try {
      const res = await trigger({
        url: SITE_API.create,
        method: "post",
        data: formDataObj,
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.message || "Site created successfully");
        setFormData({
          site_name: "",
          site_type: "",
          site_address: "",
          site_url: "",
          place_id: "",
        });
        setErrors({});
        queryClient.invalidateQueries(["site-list"]);
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to create site");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.error("Create site error:", error);
    }
  };

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
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>

        <form
          id="create-site-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="site_name"
                  className="text-sm font-semibold flex items-center gap-1"
                >
                  Site Name <Redstar />
                </Label>
                <div className="relative">
                  <Input
                    id="site_name"
                    name="site_name"
                    placeholder="Enter site name"
                    value={formData.site_name}
                    onChange={handleInputChange}
                    className={`pl-3 ${errors.site_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                </div>
                {errors.site_name && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.site_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="site_type"
                  className="text-sm font-semibold flex items-center gap-1"
                >
                  Site Type <Redstar />
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
              <div className="space-y-2 col-span-2">
                <Label
                  htmlFor="site_address"
                  className="text-sm font-semibold flex items-center gap-1 text-gray-700"
                >
                  Site Address <Redstar />
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
                  className={`pl-3 ${errors.site_address ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                "Create Site"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSite;
