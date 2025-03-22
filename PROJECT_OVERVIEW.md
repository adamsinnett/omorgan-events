# Omorgan Events - Project Overview

## Introduction

Omorgan Events is a simple, private event management platform designed to replace Facebook Events functionality. It allows event creators to create events, manage RSVPs, and host discussions, all without requiring users to create accounts.

## Core Features

### Event Management

- Create and manage events with essential details (title, date/time, location, description)
- Admin-only event creation interface
- Option to allow attendees to generate invites

### Magic Link System

- Unique, event-specific access links for each attendee
- No expiration on links
- Functions as a simple authentication system
- Manual link distribution (platform distribution planned for future)

### Discussion Wall

- Text-based discussions with threading support
- Message pinning functionality
- Like/react to messages
- Admin moderation capabilities
- Extensible to rich text format in future

### RSVP System

- Standard RSVP options (Going/Not Going/Maybe)
- Ability to change RSVP status
- Guest count tracking
- RSVP notes
- Visible attendee list
- Admin view of RSVP history

## Target Users

- Primary: Event creators (admin users)
- Secondary: Event attendees (access via magic links)

## Key Differentiators

- No user accounts required for attendees
- Simple, focused interface
- Mobile-first design
- Private platform for specific user group

## Future Considerations

- Platform-based link distribution
- Rich text support for discussions
- Analytics and reporting features
- Inter-event interaction capabilities

## Technical Stack

- Frontend: Next.js with Tailwind UI
- State Management: Zustand
- Data Fetching: Tanstack Query
- Backend: Hasura
- Hosting: Next.js free tier (frontend), Hasura free tier (backend)
