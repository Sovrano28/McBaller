"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageComposer } from "@/components/communications/message-composer";
import {
  getMessages,
  getMessage,
  createMessage,
  sendMessage,
  getMessageStats,
} from "@/lib/actions/communications/messages";
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function CommunicationsClient() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadMessages();
  }, [statusFilter, typeFilter]);

  const loadMessages = async () => {
    setLoading(true);
    const result = await getMessages({
      status: statusFilter !== "all" ? statusFilter : undefined,
      messageType: typeFilter !== "all" ? typeFilter : undefined,
    });

    if (result.success && result.data) {
      setMessages(result.data);
    }
    setLoading(false);
  };

  const handleCompose = async (data: any, action: "save" | "send") => {
    setSubmitting(true);

    const result = await createMessage(data);

    if (result.success) {
      if (action === "send" && result.data) {
        const sendResult = await sendMessage(result.data.id);
        if (sendResult.success) {
          toast({
            title: "Success",
            description: data.scheduledFor
              ? "Message scheduled successfully"
              : "Message sent successfully",
          });
        } else {
          toast({
            title: "Warning",
            description: "Message saved but failed to send",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Draft saved successfully",
        });
      }

      setComposerOpen(false);
      loadMessages();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create message",
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  const handleViewDetails = async (messageId: string) => {
    const result = await getMessage(messageId);
    if (result.success && result.data) {
      setSelectedMessage(result.data);

      // Load stats if message is sent
      if (result.data.status === "sent") {
        const statsResult = await getMessageStats(messageId);
        if (statsResult.success && statsResult.data) {
          setMessageStats(statsResult.data);
        }
      }

      setViewDetailsOpen(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "sending":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "sent":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      case "sending":
        return "default";
      case "sent":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications Hub</h1>
          <p className="text-muted-foreground">
            Send messages to organizations, teams, agents, and players
          </p>
        </div>
        <Button onClick={() => setComposerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No messages found. Create your first message to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{message.title}</h3>
                      <Badge variant={getStatusVariant(message.status) as any}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(message.status)}
                          <span className="capitalize">{message.status}</span>
                        </div>
                      </Badge>
                      {message.priority === "urgent" && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      {message.priority === "high" && (
                        <Badge variant="default">High Priority</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {message.messageType === "email" && <Mail className="h-4 w-4" />}
                        {message.messageType === "whatsapp" && <MessageSquare className="h-4 w-4" />}
                        {message.messageType === "both" && (
                          <>
                            <Mail className="h-4 w-4" />
                            <MessageSquare className="h-4 w-4" />
                          </>
                        )}
                        <span className="capitalize">{message.messageType}</span>
                      </div>

                      <div>
                        Recipients: <span className="font-medium">{message.totalRecipients}</span>
                      </div>

                      {message.scheduledFor && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(message.scheduledFor), "PPp")}
                        </div>
                      )}

                      <div>
                        Created: {format(new Date(message.createdAt), "PPp")}
                      </div>
                    </div>

                    {message.status === "sent" && (
                      <div className="flex items-center gap-4 text-sm">
                        {message.emailsSent > 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Mail className="h-4 w-4" />
                            {message.emailsSent} sent
                          </div>
                        )}
                        {message.whatsappSent > 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <MessageSquare className="h-4 w-4" />
                            {message.whatsappSent} sent
                          </div>
                        )}
                        {message.failedCount > 0 && (
                          <div className="text-red-600">
                            {message.failedCount} failed
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(message.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Composer Dialog */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Message</DialogTitle>
            <DialogDescription>
              Compose and send messages to your constituents via email and WhatsApp
            </DialogDescription>
          </DialogHeader>
          <MessageComposer onSubmit={handleCompose} loading={submitting} />
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedMessage.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getStatusVariant(selectedMessage.status) as any}>
                    {selectedMessage.status}
                  </Badge>
                  <Badge variant="secondary">{selectedMessage.messageType}</Badge>
                  <Badge variant="outline">{selectedMessage.priority}</Badge>
                </div>
                <p className="text-muted-foreground">{selectedMessage.content}</p>
              </div>

              {selectedMessage.status === "sent" && messageStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Delivery Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Recipients</div>
                        <div className="text-2xl font-bold">{messageStats.total}</div>
                      </div>
                      {messageStats.emailSent > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground">Emails Sent</div>
                          <div className="text-2xl font-bold text-green-600">
                            {messageStats.emailSent}
                          </div>
                        </div>
                      )}
                      {messageStats.whatsappSent > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground">WhatsApp Sent</div>
                          <div className="text-2xl font-bold text-green-600">
                            {messageStats.whatsappSent}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedMessage.emailSubject && (
                <div>
                  <h4 className="font-medium mb-2">Email Content</h4>
                  <div className="border rounded-md p-4 space-y-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Subject:</div>
                      <div>{selectedMessage.emailSubject}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Body:</div>
                      <div className="whitespace-pre-wrap">{selectedMessage.emailBody}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMessage.whatsappMessage && (
                <div>
                  <h4 className="font-medium mb-2">WhatsApp Content</h4>
                  <div className="border rounded-md p-4">
                    <div className="whitespace-pre-wrap">{selectedMessage.whatsappMessage}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

