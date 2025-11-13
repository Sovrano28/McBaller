"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { toggleUserStatus } from "@/lib/actions/super-admin/users";
import { Shield, ShieldOff } from "lucide-react";

interface UserStatusButtonProps {
  userId: string;
  isActive: boolean;
  userEmail: string;
}

export function UserStatusButton({
  userId,
  isActive,
  userEmail,
}: UserStatusButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleUserStatus(userId, !isActive);
      if (result.success) {
        toast({
          title: "Success",
          description: `User account has been ${isActive ? "deactivated" : "activated"}.`,
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update user status",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant={isActive ? "destructive" : "default"}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {isActive ? (
          <>
            <ShieldOff className="mr-2 h-4 w-4" />
            Deactivate Account
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Activate Account
          </>
        )}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Deactivate User Account?" : "Activate User Account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive ? (
                <>
                  Are you sure you want to deactivate the account for{" "}
                  <strong>{userEmail}</strong>? The user will not be able to
                  log in until the account is reactivated.
                </>
              ) : (
                <>
                  Are you sure you want to activate the account for{" "}
                  <strong>{userEmail}</strong>? The user will be able to log in
                  again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={loading}
              className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {loading
                ? "Processing..."
                : isActive
                ? "Deactivate"
                : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

