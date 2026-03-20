"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GroupButton({ options = [], value, onChange, className }) {
  return (
    <div
      role="group"
      className={cn("inline-flex rounded-md border bg-background", className)}
    >
      {options.map((option, index) => {
        const isActive = value === option.value;
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "default" : "outline"}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-none gap-2",
              index === 0 && "rounded-l-md",
              index === options.length - 1 && "rounded-r-md",
              isActive && "bg-primary text-primary-foreground",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
