"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { updateTeamLogo } from "@/lib/actions/teams";
import { useRouter } from "next/navigation";

interface TeamSettingsClientProps {
  teamId: string;
  organizationId: string;
  currentLogo: string | null;
  teamName: string;
}

export default function TeamSettingsClient({
  teamId,
  organizationId,
  currentLogo,
  teamName,
}: TeamSettingsClientProps) {
  const router = useRouter();

  const handleLogoUpload = async (url: string) => {
    const result = await updateTeamLogo(organizationId, teamId, url);
    if (result.success) {
      router.refresh();
    } else {
      throw new Error(result.error || "Failed to update logo");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Logo</CardTitle>
        <CardDescription>
          Update your team's profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AvatarUpload
          currentImageUrl={currentLogo}
          onUploadComplete={handleLogoUpload}
          folder="teams"
          entityName={teamName}
          size="lg"
        />
      </CardContent>
    </Card>
  );
}

