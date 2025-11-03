import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="McSportng Logo"
        width={24}
        height={24}
        className="h-6 w-6"
      />
      <span className="font-headline text-xl font-bold text-foreground">
        McSportng
      </span>
    </div>
  );
}
