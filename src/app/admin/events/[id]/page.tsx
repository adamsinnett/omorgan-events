"use client";

import { useState, useEffect, useCallback, use } from "react";
import { graphqlRequest } from "@/lib/graphql";
import { generateInvitationToken, getInvitationUrl } from "@/lib/invitations";
import { GET_EVENT } from "@/lib/queries";
import { Event, EventResponse } from "@/types/event";
import { Invitation } from "@/types/invitation";
import {
  UPDATE_EVENT,
  DELETE_EVENT,
  CREATE_INVITATION,
  DELETE_INVITATION,
} from "@/lib/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [newInvitation, setNewInvitation] = useState<Invitation | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await graphqlRequest<EventResponse>(GET_EVENT, {
        id,
      });

      if (!response.events_by_pk) {
        setError("Event not found");
        setIsLoading(false);
        return;
      }

      setEvent(response.events_by_pk);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch event");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent, id]);

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      const response = await graphqlRequest<{ update_events_by_pk: Event }>(
        UPDATE_EVENT,
        {
          id: event.id,
          ...editedEvent,
        }
      );
      setEvent(response.update_events_by_pk);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await graphqlRequest(DELETE_EVENT, { id: event.id });
      window.location.href = "/admin/events";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  const handleCreateInvitation = async () => {
    if (!event) return;

    try {
      const token = generateInvitationToken();

      const response = await graphqlRequest<{
        insert_invitations_one: Invitation;
      }>(CREATE_INVITATION, {
        event_id: event.id,
        token,
      });

      setNewInvitation(response.insert_invitations_one);
      fetchEvent(); // Refresh the event data to get the new invitation
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create invitation"
      );
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) {
      return;
    }

    try {
      await graphqlRequest(DELETE_INVITATION, { id: invitationId });
      setEvent({
        ...event!,
        invitations: event?.invitations?.filter(
          (inv) => inv.id !== invitationId
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete invitation"
      );
    }
  };

  if (isLoading) {
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

  const currentEvent = isEditing ? { ...event, ...editedEvent } : event;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Event: {event.title}
        </h2>
        {!isEditing ? (
          <div className="flex space-x-3">
            <Button onClick={() => setIsEditing(true)}>Edit Event</Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete Event
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({event.invitations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="attendees">
            Attendees ({event.attendees?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="wall">
            Wall ({event.messages?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="bg-white rounded-lg shadow">
          {isEditing ? (
            <form onSubmit={handleUpdateEvent} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  value={currentEvent.title}
                  onChange={(e) =>
                    setEditedEvent({ ...editedEvent, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentEvent.description}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    type="datetime-local"
                    id="start_time"
                    value={new Date(currentEvent.start_time)
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setEditedEvent({
                        ...editedEvent,
                        start_time: new Date(e.target.value).toISOString(),
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    type="datetime-local"
                    id="end_time"
                    value={new Date(currentEvent.end_time)
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setEditedEvent({
                        ...editedEvent,
                        end_time: new Date(e.target.value).toISOString(),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  value={currentEvent.location}
                  onChange={(e) =>
                    setEditedEvent({ ...editedEvent, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_attendees">Maximum Attendees</Label>
                <Input
                  type="number"
                  id="max_attendees"
                  value={currentEvent.max_attendees}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      max_attendees: parseInt(e.target.value),
                    })
                  }
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentEvent.status}
                  onValueChange={(value) =>
                    setEditedEvent({ ...editedEvent, status: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_private"
                  checked={currentEvent.is_private}
                  onCheckedChange={(checked) =>
                    setEditedEvent({
                      ...editedEvent,
                      is_private: checked === true,
                    })
                  }
                />
                <Label htmlFor="is_private">Private Event</Label>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="overflow-hidden">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {event.description}
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === "published"
                              ? "bg-green-100 text-green-800"
                              : event.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Date & Time
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(event.start_time).toLocaleString()} -{" "}
                        {new Date(event.end_time).toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Location
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {event.location}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Maximum Attendees
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {event.max_attendees}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Visibility
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {event.is_private ? "Private" : "Public"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Created By
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {event.created_by}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Created At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(event.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Last Updated
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(event.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Invitations</h3>
              <Button onClick={handleCreateInvitation}>
                Create Invitation
              </Button>
            </div>

            {newInvitation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  New Invitation Created!
                </h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    readOnly
                    value={getInvitationUrl(newInvitation.token)}
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        getInvitationUrl(newInvitation.token)
                      );
                      alert("Link copied to clipboard!");
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {event?.invitations?.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      Created:{" "}
                      {new Date(invitation.created_at).toLocaleString()}
                    </p>
                    {invitation.attendee && (
                      <p className="text-sm text-gray-600">
                        Claimed by {invitation.attendee.email}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          getInvitationUrl(invitation.token)
                        );
                        alert("Link copied to clipboard!");
                      }}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="bg-white rounded-lg shadow">
          <div className="overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-semibold">Registered Attendees</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {event.attendees?.map((attendee) => (
                  <li key={attendee.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {attendee.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attendee.email}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            attendee.status === "attending"
                              ? "bg-green-100 text-green-800"
                              : attendee.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {attendee.status}
                        </span>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {attendee.guest_count}{" "}
                          {attendee.guest_count === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          RSVP&apos;d on{" "}
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wall" className="bg-white rounded-lg shadow">
          <div className="overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-semibold">Discussion Wall</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {event.messages?.map((message) => (
                  <li key={message.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-700 font-medium">
                            {message.created_by[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600">
                          {message.created_by}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {message.content}
                        </p>
                        <div className="mt-2 flex items-center space-x-4">
                          <p className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            {message.reactions?.map((reaction) => (
                              <span
                                key={reaction.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100"
                              >
                                {reaction.reaction_type}{" "}
                                <span className="ml-1 text-gray-500">
                                  {reaction.user_email}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
