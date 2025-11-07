"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, CalendarClock } from "lucide-react";

export default function CalendarSyncSettings() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    toast({
      title: "Google Calendar",
      description: "Redirecting to Google sign-in...",
    });
    // TODO: Implement Google OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
    }, 1000);
  };

  const handleConnectOutlook = async () => {
    setIsConnecting(true);
    toast({
      title: "Outlook Calendar",
      description: "Redirecting to Microsoft sign-in...",
    });
    // TODO: Implement Outlook OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
    }, 1000);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleConnectGoogle}
        disabled={isConnecting}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Connect Google Calendar
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleConnectOutlook}
        disabled={isConnecting}
      >
        <CalendarClock className="mr-2 h-4 w-4" />
        Connect Outlook Calendar
      </Button>
    </div>
  );
}

