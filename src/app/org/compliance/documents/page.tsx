import { getOrganizationDocuments } from "@/lib/actions/compliance";
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
import { FolderOpen, Plus } from "lucide-react";
import { format } from "date-fns";

export default async function DocumentsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const documents = await getOrganizationDocuments(
    orgSession.organizationId
  ).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage medical forms, insurance documents, and participant data
          </p>
        </div>
        <Button asChild>
          <Link href="/org/compliance/documents/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload and manage important documents securely
            </p>
            <Button asChild>
              <Link href="/org/compliance/documents/upload">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{doc.title}</CardTitle>
                      <Badge variant="outline">{doc.category}</Badge>
                      {doc.isConfidential && (
                        <Badge className="bg-red-100 text-red-800">
                          Confidential
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {format(new Date(doc.createdAt), "PPp")}
                      {doc.player && ` • ${doc.player.name}`}
                      {doc.user && ` • ${doc.user.email}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {doc.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {doc.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

