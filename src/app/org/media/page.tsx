import { getOrganizationMedia } from "@/lib/actions/media";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Plus, Upload } from "lucide-react";
import { format } from "date-fns";

export default async function MediaPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const media = await getOrganizationMedia(
    orgSession.organizationId
  ).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media & Files</h1>
          <p className="text-muted-foreground">
            Share photos, videos, and documents with your teams
          </p>
        </div>
        <Button asChild>
          <Link href="/org/media/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload File
          </Link>
        </Button>
      </div>

      {media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Media Files</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload photos, videos, or documents to share with your teams
            </p>
            <Button asChild>
              <Link href="/org/media/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {media.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="text-base">{file.title}</CardTitle>
                <CardDescription>
                  {format(new Date(file.createdAt), "PPp")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{file.fileType}</Badge>
                  {file.category && (
                    <Badge variant="secondary">{file.category}</Badge>
                  )}
                  {file.team && (
                    <Badge variant="outline">{file.team.name}</Badge>
                  )}
                </div>
                {file.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {file.description}
                  </p>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

