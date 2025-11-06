import { getWaiver } from "@/lib/actions/waivers";
import { getSession } from "@/lib/actions/auth";
import { redirect, notFound } from "next/navigation";
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
import { ArrowLeft, FileCheck } from "lucide-react";
import { format } from "date-fns";

export default async function WaiverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let waiver;
  try {
    waiver = await getWaiver(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/compliance/waivers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{waiver.title}</h1>
            {waiver.isActive && (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Version {waiver.version} • {waiver._count.signatures} signatures
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waiver Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-sm">
                {waiver.content}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signatures ({waiver.signatures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {waiver.signatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No signatures yet
              </p>
            ) : (
              <div className="space-y-2">
                {waiver.signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="p-3 border rounded text-sm"
                  >
                    <p className="font-medium">
                      {signature.player?.name || signature.parentName || "Unknown"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Signed {format(new Date(signature.signedAt), "PPp")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

