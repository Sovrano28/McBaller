"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RecipientSelector } from "./recipient-selector";
import { Mail, MessageSquare, Calendar as CalendarIcon, Send, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getMessageTemplates } from "@/lib/actions/communications/templates";

interface MessageComposerProps {
  initialData?: any;
  onSubmit: (data: any, action: "save" | "send") => Promise<void>;
  loading?: boolean;
}

export function MessageComposer({ initialData, onSubmit, loading = false }: MessageComposerProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    messageType: initialData?.messageType || "both",
    recipientType: initialData?.recipientType || "all",
    recipientGroups: initialData?.recipientGroups || [],
    recipientIds: initialData?.recipientIds || [],
    emailSubject: initialData?.emailSubject || "",
    emailBody: initialData?.emailBody || "",
    whatsappMessage: initialData?.whatsappMessage || "",
    whatsappMediaUrl: initialData?.whatsappMediaUrl || "",
    priority: initialData?.priority || "normal",
    scheduledFor: initialData?.scheduledFor ? new Date(initialData.scheduledFor) : undefined,
    attachments: initialData?.attachments || [],
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      const result = await getMessageTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
      setLoadingTemplates(false);
    }
    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        emailSubject: template.emailSubject || formData.emailSubject,
        emailBody: template.emailBody || formData.emailBody,
        whatsappMessage: template.whatsappMessage || formData.whatsappMessage,
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleSubmit = async (action: "save" | "send") => {
    await onSubmit(formData, action);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="title">Message Title*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Brief Description*</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide a brief description of this message"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="messageType">Message Type*</Label>
              <Select
                value={formData.messageType}
                onValueChange={(value) => setFormData({ ...formData, messageType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Only
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp Only
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <MessageSquare className="h-4 w-4" />
                      Both
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Schedule Delivery (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledFor && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledFor ? (
                    format(formData.scheduledFor, "PPP 'at' p")
                  ) : (
                    <span>Send immediately</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduledFor}
                  onSelect={(date) => setFormData({ ...formData, scheduledFor: date })}
                  initialFocus
                />
                {formData.scheduledFor && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, scheduledFor: undefined })}
                    >
                      Clear Schedule
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Recipients</h3>
          <RecipientSelector
            value={{
              recipientType: formData.recipientType,
              recipientGroups: formData.recipientGroups,
              recipientIds: formData.recipientIds,
            }}
            onChange={(value) => setFormData({ ...formData, ...value })}
          />
        </CardContent>
      </Card>

      {/* Message Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Label>Use Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder={loadingTemplates ? "Loading templates..." : "Select a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" disabled={formData.messageType === "whatsapp"}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" disabled={formData.messageType === "email"}>
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="emailSubject">Email Subject*</Label>
                <Input
                  id="emailSubject"
                  value={formData.emailSubject}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  placeholder="Enter email subject"
                  required={formData.messageType !== "whatsapp"}
                />
              </div>

              <div>
                <Label htmlFor="emailBody">Email Body*</Label>
                <Textarea
                  id="emailBody"
                  value={formData.emailBody}
                  onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                  placeholder="Compose your email message..."
                  rows={10}
                  required={formData.messageType !== "whatsapp"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use variables like {"{"}{"{"} name {"}"}{"}"}, {"{"}{"{"} email {"}"}{"}"}, {"{"}{"{"} date {"}"}{"}"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <div>
                <Label htmlFor="whatsappMessage">WhatsApp Message*</Label>
                <Textarea
                  id="whatsappMessage"
                  value={formData.whatsappMessage}
                  onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                  placeholder="Compose your WhatsApp message..."
                  rows={10}
                  required={formData.messageType !== "email"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it concise. Max 1600 characters recommended.
                </p>
              </div>

              <div>
                <Label htmlFor="whatsappMediaUrl">Media URL (Optional)</Label>
                <Input
                  id="whatsappMediaUrl"
                  value={formData.whatsappMediaUrl}
                  onChange={(e) => setFormData({ ...formData, whatsappMediaUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add an image or video URL to include with your message
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => handleSubmit("save")}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
        <Button
          onClick={() => handleSubmit("send")}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : formData.scheduledFor ? (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

