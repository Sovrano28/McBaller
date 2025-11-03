import { getSession } from "@/lib/actions/auth";
import { getOrganizationPlayers } from "@/lib/actions/organizations";
import { generateInvoiceNumber } from "@/lib/actions/invoices";
import { redirect } from "next/navigation";
import type { OrgAuthData } from "@/lib/auth-types";
import CreateInvoiceForm from "./create-invoice-form";

export default async function CreateInvoicePage() {
  const session = await getSession();

  if (!session || session.role === "player") {
    redirect("/login");
  }

  const orgSession = session as OrgAuthData;
  if (!orgSession.organizationId) {
    redirect("/login");
  }

  const [players, invoiceNumber] = await Promise.all([
    getOrganizationPlayers(orgSession.organizationId),
    generateInvoiceNumber(orgSession.organizationId),
  ]);

  return (
    <CreateInvoiceForm
      players={players}
      organizationId={orgSession.organizationId}
      defaultInvoiceNumber={invoiceNumber}
    />
  );
}
