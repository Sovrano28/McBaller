import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type DetailHeaderProps = {
  backHref: string;
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
};

export function DetailHeader({ backHref, title, subtitle, meta }: DetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
    </div>
  );
}

