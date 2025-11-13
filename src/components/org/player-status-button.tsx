"use client";

import { useState } from "react";
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
import { togglePlayerStatus } from "@/lib/actions/organizations";
import { Power, CheckCircle2, XCircle } from "lucide-react";

interface PlayerStatusButtonProps {
  playerId: string;
  isActive: boolean;
  playerName: string;
  subscriptionTier: string;
}

export function PlayerStatusButton({
  playerId,
  isActive,
  playerName,
  subscriptionTier,
}: PlayerStatusButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if player has premium subscription (pro or elite)
  const hasPremium = subscriptionTier === "pro" || subscriptionTier === "elite";

  const handleToggleStatus = async () => {
    // Prevent deactivation of premium players
    if (isActive && hasPremium) {
      toast({
        title: "Cannot Deactivate",
        description: `Cannot deactivate ${playerName} because they have a premium subscription (${subscriptionTier.toUpperCase()}). Premium players who paid individually cannot be deactivated by the organization.`,
        variant: "destructive",
      });
      setShowConfirm(false);
      return;
    }

    setLoading(true);
    const action = isActive ? "deactivate" : "activate";
    const result = await togglePlayerStatus(playerId, isActive);
    if (result.success) {
      toast({
        title: "Success",
        description: `Player ${playerName} has been ${action}d.`,
        variant: "default",
      });
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result.error || `Failed to ${action} player.`,
        variant: "destructive",
      });
    }
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant={isActive ? "destructive" : "default"}
        onClick={() => setShowConfirm(true)}
        disabled={loading || (isActive && hasPremium)}
        size="sm"
      >
        <Power className="h-4 w-4 mr-2" />
        {isActive ? "Deactivate" : "Activate"} Player
      </Button>

      {isActive && hasPremium && (
        <p className="text-xs text-muted-foreground mt-1">
          Premium subscription active - cannot deactivate
        </p>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Deactivate" : "Activate"} Player Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will {isActive ? "deactivate" : "activate"} the account for{" "}
              <span className="font-semibold">{playerName}</span>. They will{" "}
              {isActive ? "not be able to log in" : "be able to log in"} until their status is changed again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={loading}
              className={isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {loading
                ? isActive
                  ? "Deactivating..."
                  : "Activating..."
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

