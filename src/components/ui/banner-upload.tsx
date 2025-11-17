"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => Promise<void>;
  folder?: string;
  entityName?: string;
  className?: string;
}

export function BannerUpload({
  currentImageUrl,
  onUploadComplete,
  folder,
  entityName = "profile",
  className,
}: BannerUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Update via callback
      await onUploadComplete(data.url);
      
      toast({
        title: "Upload successful",
        description: `${entityName} banner updated successfully.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
      });
      // Reset preview on error
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;
    
    setIsUploading(true);
    try {
      await onUploadComplete("");
      setPreview(null);
      toast({
        title: "Banner removed",
        description: `${entityName} banner has been removed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove banner. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden border bg-muted">
        {preview ? (
          <img
            src={preview}
            alt={`${entityName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No banner image</p>
            </div>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {preview && preview !== currentImageUrl ? "Change Banner" : "Upload Banner"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP. Max size 5MB. Recommended aspect ratio: 3:1 (e.g., 1200x400px).
      </p>
    </div>
  );
}

