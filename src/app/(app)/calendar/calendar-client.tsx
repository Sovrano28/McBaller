"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarClientProps {
  events: any[];
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  practice: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  game: {
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
  },
  tournament: {
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
  },
  meeting: {
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
  },
};

const CREATOR_ROLE_COLORS: Record<string, string> = {
  org_admin: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
  coach: "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200",
  finance: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
  analyst: "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200",
};

export default function CalendarClient({ events: initialEvents }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events by type
  const filteredEvents = selectedType === "all"
    ? initialEvents
    : initialEvents.filter((e) => e.type === selectedType);

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? filteredEvents.filter((e) => isSameDay(new Date(e.startTime), selectedDate))
    : [];

  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const dateKey = format(new Date(event.startTime), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    setSelectedDate(null);
  };

  const eventTypes = ["all", "practice", "game", "tournament", "meeting"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Events</h1>
          <p className="text-muted-foreground">
            View your upcoming matches, training sessions, and meetings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Events" : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {/* Days of the month */}
              {daysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate[dateKey] || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-1 rounded-md border transition-colors
                      ${isCurrentDay ? "bg-primary/10 border-primary" : ""}
                      ${isSelected ? "ring-2 ring-primary" : "border-border hover:bg-accent"}
                      ${dayEvents.length > 0 ? "font-semibold" : ""}
                    `}
                  >
                    <div className="text-sm mb-1">{format(day, "d")}</div>
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {dayEvents.slice(0, 3).map((event, idx) => {
                        const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.practice;
                        return (
                          <div
                            key={event.id}
                            className={`h-1.5 w-1.5 rounded-full ${colors.bg} ${colors.border} border`}
                            title={event.title}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Events - ${format(selectedDate, "MMM d, yyyy")}`
                : "Upcoming Events"}
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? "s" : ""}`
                : `${filteredEvents.length} total event${filteredEvents.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {(selectedDate ? selectedDateEvents : filteredEvents.slice(0, 10)).map((event) => {
                const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.practice;
                const creatorRole = event.createdBy?.role;
                const creatorColor = creatorRole
                  ? CREATOR_ROLE_COLORS[creatorRole] || ""
                  : "";

                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${colors.border} ${colors.bg} space-y-2`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${colors.text}`}>{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={colors.text}>
                            {event.type}
                          </Badge>
                          {event.team && (
                            <Badge variant="secondary" className="text-xs">
                              {event.team.name}
                            </Badge>
                          )}
                          {creatorRole && (
                            <Badge className={`text-xs ${creatorColor}`}>
                              {creatorRole.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(event.startTime), "h:mm a")}
                          {event.endTime &&
                            ` - ${format(new Date(event.endTime), "h:mm a")}`}
                        </span>
                      </div>
                      {(event.location || event.venue) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{event.venue?.address || event.location}</span>
                        </div>
                      )}
                      {event.team && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{event.team.name}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No events found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

