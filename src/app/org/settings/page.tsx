import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrgSettingsClient from "./org-settings-client";

export default async function OrgSettingsPage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgSession.organizationId },
    select: {
      id: true,
      name: true,
      logo: true,
      email: true,
      phone: true,
      address: true,
      website: true,
      description: true,
    },
  });

  if (!organization) {
    redirect("/login");
  }

  return <OrgSettingsClient organization={organization} />;
}
