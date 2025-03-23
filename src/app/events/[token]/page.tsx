"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import { graphqlRequest } from "@/lib/graphql";
import { GET_EVENT_BY_TOKEN } from "@/lib/queries";
import {
  CREATE_ATTENDEE,
  CREATE_MESSAGE,
  CREATE_REACTION,
  DELETE_REACTION,
} from "@/lib/mutations";
import { Event } from "@/types/event";
import { Attendee } from "@/types/attendee";
import { Message, Reaction } from "@/types/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";

interface EventPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function EventPage({ params }: EventPageProps) {
  const { token: invitationToken } = use(params);
  const { loginInvitee, isLoading: isAuthLoading, token } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [rsvpForm, setRsvpForm] = useState({
    name: "",
    email: "",
    status: "attending",
    guest_count: 1,
  });

  const fetchEvent = useCallback(async () => {
    try {
      const response = await graphqlRequest<{
        invitations: Array<{ event: Event }>;
      }>(GET_EVENT_BY_TOKEN, {
        token: invitationToken,
      });

      if (!response.invitations?.[0]?.event) {
        setIsLoading(false);
        return;
      }

      const eventData = response.invitations[0].event;
      setEvent(eventData);

      // Check if there's an existing attendee with this invitation token
      const existingAttendee = eventData.attendees?.find(
        (attendee) => attendee.invitation_token === invitationToken
      );
      if (existingAttendee) {
        setCurrentAttendee(existingAttendee);
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [invitationToken]);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        await loginInvitee(invitationToken);
      }
      debugger;
      await fetchEvent();
    };
    initialize();
  }, [loginInvitee, fetchEvent, invitationToken, token]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      const response = await graphqlRequest<{
        insert_attendees_one: Attendee;
      }>(CREATE_ATTENDEE, {
        event_id: event.id,
        ...rsvpForm,
        invitation_token: invitationToken,
      });

      setCurrentAttendee(response.insert_attendees_one);
      setShowRSVPForm(false);
      fetchEvent(); // Refresh event data to get updated attendee list
    } catch {
      // Handle error silently
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !currentAttendee) return;

    try {
      await graphqlRequest(CREATE_MESSAGE, {
        event_id: event.id,
        content: newMessage,
        created_by: currentAttendee.email,
      });

      setNewMessage("");
      fetchEvent(); // Refresh event data to get new message
    } catch {
      // Handle error silently
    }
  };

  const handleReaction = async (messageId: string, reactionType: string) => {
    if (!currentAttendee) return;

    try {
      // Check if user already has a reaction
      const message = event?.messages?.find((m) => m.id === messageId);
      if (!message) return;

      const existingReaction = message.reactions.find(
        (r) => r.user_email === currentAttendee.email
      );

      if (existingReaction) {
        // If user already has this reaction, delete it
        if (existingReaction.reaction_type === reactionType) {
          await graphqlRequest(DELETE_REACTION, {
            id: existingReaction.id,
          });
        } else {
          // If user has a different reaction, delete it and create the new one
          await graphqlRequest(DELETE_REACTION, {
            id: existingReaction.id,
          });
          await graphqlRequest(CREATE_REACTION, {
            message_id: messageId,
            user_email: currentAttendee.email,
            reaction_type: reactionType,
          });
        }
      } else {
        // Create new reaction
        await graphqlRequest(CREATE_REACTION, {
          message_id: messageId,
          user_email: currentAttendee.email,
          reaction_type: reactionType,
        });
      }

      fetchEvent(); // Refresh event data to get updated reactions
    } catch {
      // Handle error silently
    }
  };

  const getReactionCount = (message: Message, reactionType: string): number => {
    return message.reactions.filter(
      (r: Reaction) => r.reaction_type === reactionType
    ).length;
  };

  const hasUserReacted = (message: Message, reactionType: string): boolean => {
    return message.reactions.some(
      (r: Reaction) =>
        r.reaction_type === reactionType &&
        r.user_email === currentAttendee?.email
    );
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        <p className="mt-2 text-gray-600">
          The event you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {new Date(event.start_time).toLocaleString()} -{" "}
            {new Date(event.end_time).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">{event.description}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant={event.status === "published" ? "default" : "secondary"}
              >
                {event.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {event.location} • Max {event.max_attendees} attendees
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSVP Section */}
      {!currentAttendee && !showRSVPForm ? (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={() => setShowRSVPForm(true)}>RSVP to Event</Button>
          </CardContent>
        </Card>
      ) : showRSVPForm ? (
        <Card>
          <CardHeader>
            <CardTitle>RSVP to Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRSVP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={rsvpForm.name}
                  onChange={(e) =>
                    setRsvpForm({ ...rsvpForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={rsvpForm.email}
                  onChange={(e) =>
                    setRsvpForm({ ...rsvpForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={rsvpForm.status}
                  onValueChange={(value) =>
                    setRsvpForm({ ...rsvpForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_count">Number of Guests</Label>
                <Input
                  type="number"
                  id="guest_count"
                  value={rsvpForm.guest_count}
                  onChange={(e) =>
                    setRsvpForm({
                      ...rsvpForm,
                      guest_count: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max={event.max_attendees}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Submit RSVP</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRSVPForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {/* Discussion Wall */}
      {currentAttendee && (
        <Card>
          <CardHeader>
            <CardTitle>Discussion Wall</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message..."
                  required
                />
              </div>
              <Button type="submit">Send Message</Button>
            </form>

            <Separator className="my-6" />

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {event.messages?.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${message.created_by}`}
                        />
                        <AvatarFallback>
                          {message.created_by[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{message.created_by}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                    <div className="flex gap-2">
                      {["👍", "❤️", "🎉", "👏"].map((emoji) => {
                        const count = getReactionCount(message, emoji);
                        const isReacted = hasUserReacted(message, emoji);
                        return (
                          <Button
                            key={emoji}
                            variant={isReacted ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleReaction(message.id, emoji)}
                            className="flex items-center gap-1"
                          >
                            <span>{emoji}</span>
                            {count > 0 && (
                              <span className="text-sm">{count}</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Attendees List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
          <CardDescription>
            {event.attendees?.length || 0} people have RSVP&apos;d
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {event.attendees?.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{attendee.name}</p>
                  <p className="text-sm text-gray-500">{attendee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      attendee.status === "attending"
                        ? "default"
                        : attendee.status === "maybe"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {attendee.status}
                  </Badge>
                  {attendee.guest_count > 1 && (
                    <span className="text-sm text-gray-500">
                      +{attendee.guest_count - 1} guests
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
