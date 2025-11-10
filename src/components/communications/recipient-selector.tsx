"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  getRecipientGroups, 
  getRecipientsByGroup, 
  searchRecipients,
  getRecipientCount,
  type Recipient 
} from "@/lib/actions/communications/get-recipients";
import { Building2, Users, UserCheck, User, X, Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipientSelectorProps {
  value: {
    recipientType: "all" | "selective" | "individual";
    recipientGroups?: string[];
    recipientIds?: string[];
  };
  onChange: (value: any) => void;
}

export function RecipientSelector({ value, onChange }: RecipientSelectorProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load available groups
  useEffect(() => {
    async function loadGroups() {
      const result = await getRecipientGroups();
      if (result.success && result.data) {
        setGroups(result.data);
      }
      setLoading(false);
    }
    loadGroups();
  }, []);

  // Update estimated count whenever selection changes
  useEffect(() => {
    async function updateCount() {
      const result = await getRecipientCount(
        value.recipientType,
        value.recipientGroups,
        value.recipientIds
      );
      if (result.success && result.count !== undefined) {
        setEstimatedCount(result.count);
      }
    }
    updateCount();
  }, [value]);

  const handleRecipientTypeChange = (type: "all" | "selective" | "individual") => {
    onChange({
      ...value,
      recipientType: type,
      recipientGroups: type === "selective" ? [] : undefined,
      recipientIds: type === "individual" ? [] : undefined,
    });
  };

  const handleGroupToggle = (groupValue: string) => {
    const currentGroups = value.recipientGroups || [];
    const newGroups = currentGroups.includes(groupValue)
      ? currentGroups.filter((g) => g !== groupValue)
      : [...currentGroups, groupValue];

    onChange({
      ...value,
      recipientGroups: newGroups,
    });
  };

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const result = await searchRecipients(query);
    if (result.success && result.data) {
      setSearchResults(result.data);
    }
    setSearching(false);
  };

  const handleAddRecipient = (recipient: Recipient) => {
    const currentIds = value.recipientIds || [];
    if (!currentIds.includes(recipient.id)) {
      const newRecipients = [...selectedRecipients, recipient];
      setSelectedRecipients(newRecipients);
      onChange({
        ...value,
        recipientIds: [...currentIds, recipient.id],
      });
    }
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleRemoveRecipient = (recipientId: string) => {
    const newRecipients = selectedRecipients.filter((r) => r.id !== recipientId);
    setSelectedRecipients(newRecipients);
    onChange({
      ...value,
      recipientIds: newRecipients.map((r) => r.id),
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="h-4 w-4" />;
      case "Users":
        return <Users className="h-4 w-4" />;
      case "UserCheck":
        return <UserCheck className="h-4 w-4" />;
      case "User":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case "organization":
        return "Organization";
      case "team":
        return "Team";
      case "user":
        return "Agent";
      case "player":
        return "Player";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Recipient Type</Label>
        <Select value={value.recipientType} onValueChange={handleRecipientTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Constituents</SelectItem>
            <SelectItem value="selective">Selective Groups</SelectItem>
            <SelectItem value="individual">Individual Recipients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.recipientType === "selective" && (
        <div>
          <Label>Select Groups</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {groups.map((group) => (
              <Card
                key={group.value}
                className={`p-3 cursor-pointer transition-colors ${
                  value.recipientGroups?.includes(group.value)
                    ? "border-primary bg-primary/5"
                    : "hover:border-gray-300"
                }`}
                onClick={() => handleGroupToggle(group.value)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={value.recipientGroups?.includes(group.value)}
                    onCheckedChange={() => handleGroupToggle(group.value)}
                  />
                  <div className="flex items-center space-x-2">
                    {getIcon(group.icon)}
                    <span className="font-medium">{group.label}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {value.recipientType === "individual" && (
        <div>
          <Label>Select Recipients</Label>
          <div className="mt-2 space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search and Add Recipients
            </Button>

            {selectedRecipients.length > 0 && (
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Selected Recipients ({selectedRecipients.length})
                </div>
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {selectedRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={recipient.avatar} />
                            <AvatarFallback>
                              {recipient.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{recipient.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {getRecipientTypeLabel(recipient.type)}
                              </Badge>
                              {recipient.email && (
                                <span className="ml-1">{recipient.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecipient(recipient.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <span className="text-sm font-medium">Estimated Recipients:</span>
        <Badge variant="default">{estimatedCount}</Badge>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search recipients..."
          onValueChange={handleSearch}
        />
        <CommandList>
          {searching && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {!searching && searchResults.length === 0 && (
            <CommandEmpty>No recipients found. Try a different search.</CommandEmpty>
          )}
          {!searching && searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((recipient) => (
                <CommandItem
                  key={recipient.id}
                  onSelect={() => handleAddRecipient(recipient)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipient.avatar} />
                      <AvatarFallback>
                        {recipient.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{recipient.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getRecipientTypeLabel(recipient.type)}
                        </Badge>
                        {recipient.email && <span>{recipient.email}</span>}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

