import { getSession } from "@/lib/actions/auth";
import { getUnverifiedStats } from "@/lib/actions/super-admin/moderation";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default async function StatsVerificationPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  const { stats, total } = await getUnverifiedStats({
    limit: 50,
  }).catch(() => ({ stats: [], total: 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stats Verification</h1>
          <p className="text-muted-foreground">
            Review and verify player statistics submissions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Pending: {total}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unverified Statistics</CardTitle>
          <CardDescription>
            Player-submitted stats awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unverified stats found</p>
            ) : (
              stats.map((stat) => (
                <div key={stat.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm">{stat.player.name}</p>
                        <Badge variant="outline">{stat.season}</Badge>
                        <Badge variant="outline">{stat.club}</Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Apps</p>
                          <p className="font-medium">{stat.appearances}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Goals</p>
                          <p className="font-medium">{stat.goals}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assists</p>
                          <p className="font-medium">{stat.assists}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Yellow</p>
                          <p className="font-medium">{stat.yellowCards}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Red</p>
                          <p className="font-medium">{stat.redCards}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 cursor-pointer" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

