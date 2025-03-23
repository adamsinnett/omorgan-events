# Technical Architecture

## System Overview

The application is built as a modern web application using Next.js for the frontend and Hasura for the backend. The architecture follows a serverless approach with minimal backend complexity.

## Frontend Architecture

### Next.js Application

- **Framework**: Next.js with App Router
- **UI Framework**: Tailwind UI
- **State Management**: Zustand
- **Data Fetching**: Tanstack Query
- **Authentication**: Magic link-based system

### Key Components

1. **Admin Interface**

   - Event list view
   - Event creation form
   - Event management dashboard

2. **Event Pages**

   - Event details section
   - RSVP interface
   - Discussion wall
   - Attendee list

3. **Shared Components**
   - Navigation
   - Loading states
   - Error boundaries
   - Common UI elements

## Backend Architecture

### Hasura GraphQL Engine

- **Database**: Neon PostgreSQL (managed by Hasura)
- **API**: Hasura
- **Authentication**: JWT-based with magic links

### Database Schema

#### Core Tables

1. **events**

   ```sql
   - id: uuid (primary key)
   - title: text
   - date_time: timestamp
   - location: text
   - description: text
   - created_at: timestamp
   - updated_at: timestamp
   - allow_guest_invites: boolean
   ```

2. **attendees**

   ```sql
   - id: uuid (primary key)
   - event_id: uuid (foreign key)
   - magic_link: text (unique)
   - name: text
   - rsvp_status: enum
   - guest_count: integer
   - rsvp_note: text
   - created_at: timestamp
   - updated_at: timestamp
   ```

3. **messages**

   ```sql
   - id: uuid (primary key)
   - event_id: uuid (foreign key)
   - attendee_id: uuid (foreign key)
   - content: text
   - parent_id: uuid (self-reference)
   - is_pinned: boolean
   - created_at: timestamp
   - updated_at: timestamp
   ```

4. **reactions**
   ```sql
   - id: uuid (primary key)
   - message_id: uuid (foreign key)
   - attendee_id: uuid (foreign key)
   - type: text
   - created_at: timestamp
   ```

### API Endpoints

#### GraphQL Queries

- `getEvents`
- `getEvent`
- `getEventAttendees`
- `getEventMessages`
- `getMessageThread`

#### GraphQL Mutations

- `createEvent`
- `updateEvent`
- `createAttendee`
- `updateRSVP`
- `createMessage`
- `updateMessage`
- `createReaction`
- `deleteReaction`

## Authentication Flow

### Magic Link System

1. Generate unique magic link for attendee
2. Store link in database with event association
3. Validate link on access
4. Create/update attendee session

### Admin Authentication

- Credentials stored in environment variables
- JWT-based session management
- Protected admin routes

## Data Flow

### Event Creation

1. Admin creates event through form
2. Frontend validates data
3. GraphQL mutation creates event
4. UI updates to show new event

### RSVP Process

1. Attendee accesses event via magic link
2. Frontend validates link
3. Attendee submits RSVP
4. GraphQL mutation updates status
5. UI updates to reflect changes

### Discussion Wall

1. Attendee posts message
2. Frontend validates input
3. GraphQL mutation creates message
4. UI updates with new message
5. Real-time updates for other attendees

## Deployment

### Frontend Deployment

- Next.js application deployed to Vercel
- Environment variables for configuration
- Automatic deployments from main branch

### Backend Deployment

- Hasura instance on free tier
- Database backups managed by Hasura
- Environment variables for configuration

## Development Workflow

### Local Development

1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Run development server
5. Connect to local Hasura instance

### Testing

- Unit tests for components
- Integration tests for API interactions
- E2E tests for critical flows

### CI/CD

- Automated testing on pull requests
- Automatic deployment on merge to main
- Environment variable management

## Security Considerations

### Data Protection

- Magic links are unique and event-specific
- No sensitive data in client-side storage
- Secure admin credentials

### API Security

- GraphQL query complexity limits
- Rate limiting on mutations
- Input validation on all forms

## Monitoring and Maintenance

### Error Handling

- Client-side error boundaries
- API error handling
- Form validation

### Performance

- Image optimization
- Code splitting
- Caching strategies
