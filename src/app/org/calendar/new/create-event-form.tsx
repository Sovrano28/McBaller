"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createEvent } from "@/lib/actions/events";
import { getOrganizationVenues } from "@/lib/actions/venues";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface CreateEventFormProps {
  teams: any[];
  organizationId: string;
  venues: any[];
}

export default function CreateEventForm({ teams, organizationId, venues }: CreateEventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as "practice" | "game" | "tournament" | "meeting",
      startTime: startDate!,
      endTime: endDate!,
      location: formData.get("location") as string,
      isAllDay: isAllDay,
      teamId: formData.get("team") && formData.get("team") !== "none" 
        ? formData.get("team") as string 
        : undefined,
      venueId: selectedVenueId && selectedVenueId !== "none"
        ? selectedVenueId
        : undefined,
    };

    try {
      const result = await createEvent(organizationId, eventData);
      
      if (result.success && result.event) {
        toast({
          title: "Success",
          description: "Event created successfully!",
        });
        router.push("/org/calendar");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/org/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-4xl font-bold">New Event</h1>
          <p className="text-muted-foreground">
            Schedule a practice, game, tournament, or meeting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Event Information</CardTitle>
            <CardDescription>
              Fill in the details for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Team Practice, Match vs Eagles FC"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add any additional details about the event..."
                rows={4}
              />
            </div>

            {/* Date & Time */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date & Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP p")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date & Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP p")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* All Day Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={isAllDay}
                onCheckedChange={(checked) => setIsAllDay(checked as boolean)}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            {/* Venue Selection */}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue (Optional)</Label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No venue / Custom location</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                      {venue.address && ` - ${venue.address}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {venues.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No venues available.{" "}
                  <Link href="/org/venues/new" className="text-blue-600 hover:underline">
                    Create a venue
                  </Link>
                </p>
              )}
            </div>

            {/* Location (shown if no venue selected) */}
            {(!selectedVenueId || selectedVenueId === "none") && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Main Field, Training Ground #2"
                />
              </div>
            )}

            {/* Team Selection */}
            <div className="space-y-2">
              <Label htmlFor="team">Team (Optional)</Label>
              <Select name="team">
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Organization-wide event</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/org/calendar">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading || !startDate || !endDate}>
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

