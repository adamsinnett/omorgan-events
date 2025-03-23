"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { graphqlRequest } from "@/lib/graphql";
import { generateInvitationToken, getInvitationUrl } from "@/lib/invitations";
import { GET_EVENT } from "@/lib/queries";
import { Event, Invitation, EventResponse } from "./types";
import {
  UPDATE_EVENT,
  DELETE_EVENT,
  CREATE_INVITATION,
  DELETE_INVITATION,
} from "@/lib/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EventDetailsPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [newInvitation, setNewInvitation] = useState<Invitation | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await graphqlRequest<EventResponse>(GET_EVENT, {
        id: params.id,
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
  }, [params.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent, params.id]);

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
        invitations: event!.invitations.filter(
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
        <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>Edit Event</Button>
              <Button onClick={handleDeleteEvent}>Delete Event</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isEditing ? (
        <form
          onSubmit={handleUpdateEvent}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
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

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={currentEvent.description}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_time"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="end_time"
                className="block text-sm font-medium text-gray-700"
              >
                End Time
              </label>
              <input
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={currentEvent.location}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="max_attendees"
              className="block text-sm font-medium text-gray-700"
            >
              Maximum Attendees
            </label>
            <input
              type="number"
              id="max_attendees"
              value={currentEvent.max_attendees}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  max_attendees: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="1"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              value={currentEvent.status}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, status: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_private"
              checked={currentEvent.is_private}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, is_private: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_private"
              className="ml-2 block text-sm text-gray-900"
            >
              Private Event
            </label>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      ) : (
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
                <dt className="text-sm font-medium text-gray-500">Status</dt>
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
                <dt className="text-sm font-medium text-gray-500">Location</dt>
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
      )}

      {/* Add this section after the event details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invitations</h2>
          <Button onClick={handleCreateInvitation}>Create Invitation</Button>
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
          {event?.invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">
                  Created: {new Date(invitation.created_at).toLocaleString()}
                </p>
              </div>
              <Button onClick={() => handleDeleteInvitation(invitation.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Attendees Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Attendees
          </h3>
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
                    <p className="text-sm text-gray-500">{attendee.email}</p>
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
    </div>
  );
}
