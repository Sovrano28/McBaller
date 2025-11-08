"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startImpersonation } from "@/lib/actions/super-admin/impersonation";
import { getAllUsers } from "@/lib/actions/super-admin/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertTriangle, Search } from "lucide-react";

export default function ImpersonateUserPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setSearching(true);
    setError("");
    
    try {
      const { users: foundUsers } = await getAllUsers({
        search: searchTerm,
        limit: 20,
      });
      setUsers(foundUsers);
    } catch (err) {
      setError("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleImpersonate = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to impersonate ${userEmail}? This action will be logged.`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await startImpersonation(userId);

      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === "player") {
          router.push("/dashboard");
        } else {
          router.push("/org/dashboard");
        }
      } else {
        setError(result.error || "Failed to start impersonation");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    player: "bg-green-100 text-green-800",
    org_admin: "bg-blue-100 text-blue-800",
    coach: "bg-purple-100 text-purple-800",
    finance: "bg-yellow-100 text-yellow-800",
    analyst: "bg-pink-100 text-pink-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impersonate User</h1>
        <p className="text-muted-foreground">
          Temporarily log in as another user to view their experience
        </p>
      </div>

      <Alert variant="destructive" className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> All impersonation actions are logged and audited.
          Only impersonate users when necessary for support or debugging purposes.
        </AlertDescription>
      </Alert>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>
            Search by email to find a user to impersonate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !searchTerm}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {users.length} user{users.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          {user.player && (
                            <p className="text-xs text-muted-foreground">
                              {user.player.name} (@{user.player.username})
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"}>
                          {user.role.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization ? (
                          <span className="text-sm">{user.organization.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Independent</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role === "super_admin" ? (
                          <Badge variant="outline" className="text-xs">
                            Cannot impersonate
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImpersonate(user.id, user.email)}
                            disabled={loading}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Impersonate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

