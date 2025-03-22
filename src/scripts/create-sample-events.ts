import { graphqlRequest } from "@/lib/graphql";

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

const CREATE_EVENT = `
  mutation CreateEvent(
    $title: String!
    $description: String!
    $start_time: timestamptz!
    $end_time: timestamptz!
    $location: String!
    $max_attendees: Int!
    $created_by: String!
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
        created_by: $created_by
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

const sampleEvents = [
  {
    title: "Team Building Event",
    description: "Join us for a fun day of team building activities and games!",
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    end_time: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
    ).toISOString(), // 4 hours duration
    location: "Central Park",
    max_attendees: 50,
    created_by: "admin@example.com",
    status: "published",
    is_private: false,
  },
  {
    title: "Product Launch Party",
    description:
      "Celebrate the launch of our new product with drinks and appetizers.",
    start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    end_time: new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
    ).toISOString(), // 3 hours duration
    location: "Downtown Lounge",
    max_attendees: 100,
    created_by: "admin@example.com",
    status: "published",
    is_private: false,
  },
  {
    title: "Tech Workshop",
    description: "Learn about the latest technologies in our industry.",
    start_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    end_time: new Date(
      Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
    ).toISOString(), // 6 hours duration
    location: "Conference Center",
    max_attendees: 75,
    created_by: "admin@example.com",
    status: "published",
    is_private: false,
  },
];

async function createSampleEvents() {
  try {
    for (const event of sampleEvents) {
      const { data } = await graphqlRequest<{ insert_events_one: Event }>(
        CREATE_EVENT,
        event
      );
      console.log("Created event:", data.insert_events_one.title);
    }
    console.log("All sample events created successfully!");
  } catch (error) {
    console.error("Error creating sample events:", error);
  }
}

createSampleEvents();
