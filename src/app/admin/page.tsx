"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { graphqlRequest } from "@/lib/graphql";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  is_private: boolean;
}

const GET_EVENTS = `
  query GetEvents {
    events(order_by: { created_at: desc }) {
      id
      title
      description
      start_time
      end_time
      location
      max_attendees
      created_at
      updated_at
      created_by
      status
      is_private
    }
  }
`;

const CREATE_EVENT = `
  mutation CreateEvent(
    $title: String!
    $description: String!
    $start_time: timestamptz!
    $end_time: timestamptz!
    $location: String!
    $max_attendees: Int!
    $status: String!
    $is_private: Boolean!
  ) {
    insert_events_one(
      object: {
        title: $title
        description: $description
        start_time: $start_time
        end_time: $end_time
        location: $location
        max_attendees: $max_attendees
        created_by: "admin"
        status: $status
        is_private: $is_private
      }
    ) {
      id
      title
      description
      start_time
      end_time
      location
      max_attendees
      created_at
      updated_at
      created_by
      status
      is_private
    }
  }
`;

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    max_attendees: 1,
    status: "draft",
    is_private: false,
  });

  const fetchEvents = async () => {
    try {
      const response = await graphqlRequest<{ events: Event[] }>(GET_EVENTS);
      setEvents(response.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await graphqlRequest<{ insert_events_one: Event }>(
        CREATE_EVENT,
        {
          ...newEvent,
          start_time: new Date(newEvent.start_time).toISOString(),
          end_time: new Date(newEvent.end_time).toISOString(),
        }
      );
      setEvents([response.insert_events_one, ...events]);
      setShowCreateForm(false);
      setNewEvent({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        max_attendees: 1,
        status: "draft",
        is_private: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showCreateForm ? "Cancel" : "Create Event"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateEvent}
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
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
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
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              rows={3}
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
              <Input
                type="datetime-local"
                id="start_time"
                value={newEvent.start_time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start_time: e.target.value })
                }
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
              <Input
                type="datetime-local"
                id="end_time"
                value={newEvent.end_time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end_time: e.target.value })
                }
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
            <Input
              type="text"
              id="location"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
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
            <Input
              type="number"
              id="max_attendees"
              value={newEvent.max_attendees}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  max_attendees: parseInt(e.target.value),
                })
              }
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
              value={newEvent.status}
              onChange={(e) =>
                setNewEvent({ ...newEvent, status: e.target.value })
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
            <Input
              type="checkbox"
              id="is_private"
              checked={newEvent.is_private}
              onChange={(e) =>
                setNewEvent({ ...newEvent, is_private: e.target.checked })
              }
            />
            <label
              htmlFor="is_private"
              className="ml-2 block text-sm text-gray-900"
            >
              Private Event
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/admin/events/${event.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {event.description}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
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
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(event.start_time).toLocaleString()} -{" "}
                        {new Date(event.end_time).toLocaleString()}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {event.location}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Max attendees: {event.max_attendees}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
