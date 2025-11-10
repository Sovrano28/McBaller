import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import { TemplateManager } from "@/components/communications/template-manager";

export default async function SuperAdminTemplatesPage() {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <div>
      <TemplateManager />
    </div>
  );
}

