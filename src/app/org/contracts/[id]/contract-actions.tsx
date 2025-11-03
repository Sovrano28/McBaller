"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, RotateCcw, X, Calendar } from "lucide-react";
import { renewContract, terminateContract } from "@/lib/actions/contracts";
import Link from "next/link";

interface ContractActionsProps {
  contract: any;
  organizationId: string;
}

export default function ContractActions({
  contract,
  organizationId,
}: ContractActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [renewOpen, setRenewOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [renewData, setRenewData] = useState({
    newEndDate: "",
    updatedSalary: "",
  });

  const [terminateData, setTerminateData] = useState({
    terminationDate: new Date().toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  const handleRenew = async () => {
    if (!renewData.newEndDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a new end date",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await renewContract(
        organizationId,
        contract.id,
        new Date(renewData.newEndDate),
        renewData.updatedSalary
          ? parseFloat(renewData.updatedSalary)
          : undefined
      );

      if (result.success && result.contract) {
        toast({
          title: "Contract Renewed",
          description: "Contract has been renewed successfully",
        });
        setRenewOpen(false);
        router.push(`/org/contracts/${result.contract.id}`);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to renew contract",
        });
      }
    } catch (error) {
      console.error("Renew contract error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!terminateData.reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a termination reason",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await terminateContract(
        organizationId,
        contract.id,
        new Date(terminateData.terminationDate),
        terminateData.reason,
        terminateData.notes || undefined
      );

      if (result.success) {
        toast({
          title: "Contract Terminated",
          description: "Contract has been terminated successfully",
        });
        setTerminateOpen(false);
        router.push("/org/contracts");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to terminate contract",
        });
      }
    } catch (error) {
      console.error("Terminate contract error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canRenew =
    contract.status === "active" || contract.status === "expired";
  const canTerminate = contract.status === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Manage this contract</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {contract.status === "active" && (
            <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Renew Contract
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renew Contract</DialogTitle>
                  <DialogDescription>
                    Create a new contract extension for {contract.player.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="newEndDate">New End Date *</Label>
                    <Input
                      id="newEndDate"
                      type="date"
                      value={renewData.newEndDate}
                      onChange={e =>
                        setRenewData({
                          ...renewData,
                          newEndDate: e.target.value,
                        })
                      }
                      min={
                        contract.endDate
                          ? new Date(
                              new Date(contract.endDate).getTime() +
                                24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .split("T")[0]
                          : new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="updatedSalary">Updated Salary (₦)</Label>
                    <Input
                      id="updatedSalary"
                      type="number"
                      placeholder={
                        contract.salary
                          ? Number(contract.salary).toLocaleString()
                          : "0.00"
                      }
                      value={renewData.updatedSalary}
                      onChange={e =>
                        setRenewData({
                          ...renewData,
                          updatedSalary: e.target.value,
                        })
                      }
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Leave empty to keep current salary
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRenewOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRenew} disabled={isLoading}>
                    {isLoading ? "Renewing..." : "Renew Contract"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canTerminate && (
            <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <X className="mr-2 h-4 w-4" />
                  Terminate Contract
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terminate Contract</DialogTitle>
                  <DialogDescription>
                    This will end the contract for {contract.player.name}. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="terminationDate">Termination Date *</Label>
                    <Input
                      id="terminationDate"
                      type="date"
                      value={terminateData.terminationDate}
                      onChange={e =>
                        setTerminateData({
                          ...terminateData,
                          terminationDate: e.target.value,
                        })
                      }
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Select
                      value={terminateData.reason}
                      onValueChange={value =>
                        setTerminateData({
                          ...terminateData,
                          reason: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mutual">Mutual Agreement</SelectItem>
                        <SelectItem value="breach">
                          Breach of Contract
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes (optional)"
                      value={terminateData.notes}
                      onChange={e =>
                        setTerminateData({
                          ...terminateData,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setTerminateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleTerminate}
                    disabled={isLoading}
                  >
                    {isLoading ? "Terminating..." : "Terminate Contract"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
