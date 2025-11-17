"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { updateOrganizationLogo } from "@/lib/actions/organizations";
import { useRouter } from "next/navigation";

interface OrgSettingsClientProps {
  organization: {
    id: string;
    name: string;
    logo: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    website: string | null;
    description: string | null;
  };
}

export default function OrgSettingsClient({
  organization,
}: OrgSettingsClientProps) {
  const router = useRouter();

  const handleLogoUpload = async (url: string) => {
    const result = await updateOrganizationLogo(organization.id, url);
    if (result.success) {
      router.refresh();
    } else {
      throw new Error(result.error || "Failed to update logo");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
          <CardDescription>
            Update your organization's profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentImageUrl={organization.logo}
            onUploadComplete={handleLogoUpload}
            folder="organizations"
            entityName={organization.name}
            size="lg"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="text-base">{organization.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-base">{organization.email}</p>
          </div>
          {organization.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <p className="text-base">{organization.phone}</p>
            </div>
          )}
          {organization.address && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Address
              </label>
              <p className="text-base">{organization.address}</p>
            </div>
          )}
          {organization.website && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Website
              </label>
              <p className="text-base">
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {organization.website}
                </a>
              </p>
            </div>
          )}
          {organization.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-base">{organization.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

