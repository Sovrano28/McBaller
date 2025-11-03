import { getContract } from "@/lib/actions/contracts";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, Calendar, DollarSign } from "lucide-react";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import ContractActions from "./contract-actions";

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  let contract;
  try {
    contract = await getContract(orgSession.organizationId, params.id);
  } catch (error) {
    notFound();
  }

  if (!contract) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "terminated":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Calculate duration
  let duration = "";
  if (contract.endDate) {
    const days = differenceInDays(
      new Date(contract.endDate),
      new Date(contract.startDate)
    );
    const months = differenceInMonths(
      new Date(contract.endDate),
      new Date(contract.startDate)
    );
    if (months > 0) {
      duration = `${months} month${months !== 1 ? "s" : ""}`;
    } else {
      duration = `${days} day${days !== 1 ? "s" : ""}`;
    }
  } else {
    const days = differenceInDays(new Date(), new Date(contract.startDate));
    const months = differenceInMonths(new Date(), new Date(contract.startDate));
    if (months > 0) {
      duration = `${months} month${months !== 1 ? "s" : ""} (ongoing)`;
    } else {
      duration = `${days} day${days !== 1 ? "s" : ""} (ongoing)`;
    }
  }

  // Check if expiring soon (within 30 days)
  const isExpiringSoon =
    contract.status === "active" &&
    contract.endDate &&
    new Date(contract.endDate) <=
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
    new Date(contract.endDate) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/org/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contract Details</h1>
            <p className="text-muted-foreground">
              Contract ID: {contract.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={getStatusVariant(contract.status)}
            className="text-sm"
          >
            {contract.status}
          </Badge>
          {isExpiringSoon && (
            <Badge variant="destructive" className="text-sm">
              Expiring Soon
            </Badge>
          )}
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={contract.player.avatar || undefined} />
                <AvatarFallback>
                  {contract.player.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/org/players/${contract.player.id}`}
                  className="font-medium hover:underline"
                >
                  {contract.player.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {contract.player.username}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{contract.organization.name}</p>
            <p className="text-sm text-muted-foreground">
              {contract.organization.email}
            </p>
          </CardContent>
        </Card>

        {contract.team && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{contract.team.name}</p>
              <p className="text-sm text-muted-foreground">
                {contract.team.slug}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contract Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Terms</CardTitle>
          <CardDescription>
            Contract duration and financial details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {format(new Date(contract.startDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {contract.endDate ? "End Date" : "Status"}
                </p>
                <p className="font-medium">
                  {contract.endDate
                    ? format(new Date(contract.endDate), "MMM dd, yyyy")
                    : "Ongoing"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{duration}</p>
            </div>
          </div>

          {contract.salary && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium text-lg">
                  ₦{Number(contract.salary).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {contract.terms && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Additional Terms</p>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                {JSON.stringify(contract.terms, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <ContractActions
        contract={contract}
        organizationId={orgSession.organizationId}
      />

      {/* Contract Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            Created:{" "}
            {format(new Date(contract.createdAt), "MMM dd, yyyy 'at' h:mm a")}
          </p>
          <p>
            Last Updated:{" "}
            {format(new Date(contract.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
