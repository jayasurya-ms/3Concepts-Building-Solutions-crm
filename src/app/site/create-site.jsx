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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CreateSite = ({ isOpen, onOpenChange }) => {
  const queryClient = useQueryClient();
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    site_name: "",
    site_address: "",
    site_url: "",
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
    if (!formData.site_address.trim()) {
      newErrors.site_address = "Site address is required";
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
          site_address: "",
          site_url: "",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>

        <form
          id="create-site-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                  className={`pl-3 ${errors.site_address ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
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
