import { getSession } from "@/lib/actions/auth";
import { getOrganizationContracts } from "@/lib/actions/contracts";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default async function OrgContractsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const contracts = await getOrganizationContracts(orgSession.organizationId);

  const activeContracts = contracts.filter(c => c.status === "active").length;
  const expiredContracts = contracts.filter(c => c.status === "expired").length;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            Manage player contracts and agreements
          </p>
        </div>
        <Button asChild>
          <Link href="/org/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredContracts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts by player name..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length > 0 ? (
        <div className="space-y-4">
          {contracts.map(contract => (
            <Card
              key={contract.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/org/contracts/${contract.id}`}
                          className="font-medium hover:underline"
                        >
                          {contract.player.name}
                        </Link>
                        {contract.team && (
                          <Badge variant="outline">{contract.team.name}</Badge>
                        )}
                        <Badge variant={getStatusVariant(contract.status)}>
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>
                          {format(new Date(contract.startDate), "MMM dd, yyyy")}
                        </span>
                        {contract.endDate ? (
                          <>
                            {" - "}
                            <span>
                              {format(
                                new Date(contract.endDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="ml-2">(Ongoing)</span>
                        )}
                      </div>
                      {contract.salary && (
                        <div className="text-sm font-medium mt-1">
                          Salary: ₦{Number(contract.salary).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/contracts/${contract.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first contract to get started
            </p>
            <Button asChild>
              <Link href="/org/contracts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Contract
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
