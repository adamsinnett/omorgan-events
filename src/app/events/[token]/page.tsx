"use client";

import { useState, useEffect, use } from "react";
import { graphqlRequest } from "@/lib/graphql";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GET_EVENT_BY_TOKEN } from "@/lib/queries";
import { CREATE_MESSAGE } from "@/lib/mutations";
import type { Event } from "@/types/event";
import type { Message } from "@/types/messages";

interface InvitationResponse {
  invitations: Array<{
    id: string;
    event: Event;
  }>;
}

interface MessageResponse {
  insert_messages_one: Message;
}

interface EventPageProps {
  params: Promise<{ token: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const { token } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchEvent = async () => {
    try {
      const response = await graphqlRequest<InvitationResponse>(
        GET_EVENT_BY_TOKEN,
        {
          token,
        }
      );
      const invitation = response.invitations[0];

      if (!invitation) {
        setError("Event not found");
        setLoading(false);
        return;
      }

      setEvent(invitation.event);
    } catch (err) {
      setError("Failed to load event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !newMessage.trim()) return;

    try {
      const response = await graphqlRequest<MessageResponse>(CREATE_MESSAGE, {
        eventId: event.id,
        content: newMessage.trim(),
      });

      const newMessageData = response.insert_messages_one;
      setEvent((prev) => ({
        ...prev!,
        messages: [newMessageData, ...(prev!.messages || [])],
      }));
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <p className="text-gray-600">
            Please contact the event organizer for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Date & Time</h3>
            <p>
              {new Date(event.start_time).toLocaleString()} -{" "}
              {new Date(event.end_time).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{event.location}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Event Wall</h2>
        <form onSubmit={handleCreateMessage} className="mb-6">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            rows={3}
          />
          <Button type="submit">Post</Button>
        </form>

        <div className="space-y-4">
          {event.messages?.map((message) => (
            <div key={message.id} className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{message.created_by}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                {message.is_pinned && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-gray-700">{message.content}</p>
              {message.reactions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {message.reactions.map((reaction) => (
                    <span
                      key={reaction.id}
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      {reaction.reaction_type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
