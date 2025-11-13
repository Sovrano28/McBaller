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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { flagPost, deletePost } from "@/lib/actions/super-admin/moderation";
import { Flag, Trash2 } from "lucide-react";

interface PostModerationActionsProps {
  postId: string;
  isFlagged: boolean;
}

export function PostModerationActions({
  postId,
  isFlagged,
}: PostModerationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for flagging this post",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await flagPost(postId, flagReason);
      if (result.success) {
        toast({
          title: "Success",
          description: "Post has been flagged as inappropriate",
        });
        setFlagDialogOpen(false);
        setFlagReason("");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to flag post",
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
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for deleting this post",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await deletePost(postId, deleteReason);
      if (result.success) {
        toast({
          title: "Success",
          description: "Post has been deleted",
        });
        setDeleteDialogOpen(false);
        setDeleteReason("");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete post",
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
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={isFlagged ? "destructive" : "outline"}
          size="sm"
          onClick={() => setFlagDialogOpen(true)}
          disabled={loading}
        >
          <Flag className="h-4 w-4 mr-1" />
          {isFlagged ? "Flagged" : "Flag"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Post as Inappropriate</DialogTitle>
            <DialogDescription>
              Provide a reason for flagging this post. The post will be marked
              for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flag-reason">Reason</Label>
              <Textarea
                id="flag-reason"
                placeholder="e.g., Contains offensive content, spam, etc."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFlagDialogOpen(false);
                setFlagReason("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleFlag} disabled={loading}>
              {loading ? "Flagging..." : "Flag Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone. Please provide a reason for deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for Deletion</Label>
              <Textarea
                id="delete-reason"
                placeholder="e.g., Violates community guidelines, spam, etc."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

