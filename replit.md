# Overview

This is a React-based sustainability quiz application that allows users to answer questions about their environmental habits and view their sustainability score. The application features a card-swipe interface for answering questions, detailed reason collection for responses, and an admin dashboard for viewing analytics and user data. Built with a modern tech stack including React, Express.js, PostgreSQL with Drizzle ORM, and Tailwind CSS with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development features
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui component library for consistent, accessible UI components
- **Framer Motion** for smooth animations and transitions in the quiz interface
- **React Query (TanStack Query)** for efficient server state management and caching
- **Wouter** as a lightweight client-side router

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **RESTful API** design with clear separation between public quiz endpoints and authenticated admin routes
- **Session-based authentication** using express-session with PostgreSQL session storage
- **Replit Authentication** integration for secure admin access
- **Structured route organization** with centralized error handling and request logging

## Data Storage
- **PostgreSQL** database with connection pooling via Neon serverless
- **Drizzle ORM** for type-safe database queries and schema management
- **Zod** schemas for runtime data validation on both client and server
- **Separate tables** for users, quiz sessions, question responses, and session storage
- **Analytics-focused data structure** enabling comprehensive reporting and insights

## Authentication & Authorization
- **Replit OAuth integration** for admin authentication with automatic user provisioning
- **Session management** with secure cookie configuration and PostgreSQL storage
- **Protected admin routes** with middleware-based authentication checks
- **Public quiz endpoints** allowing anonymous participation while maintaining data integrity

## Quiz System Design
- **Card-based interface** with swipe gestures and button interactions for user engagement
- **Reason collection system** capturing detailed feedback for both positive and negative responses
- **Session tracking** maintaining user progress and enabling analytics
- **Responsive design** optimized for mobile-first usage patterns

## Admin Dashboard
- **Real-time analytics** showing participation rates, completion statistics, and demographic breakdowns
- **Question performance metrics** tracking response patterns and success rates
- **Export functionality** for data analysis and reporting
- **Responsive data visualization** with placeholder components ready for chart integration

# External Dependencies

## Database & Infrastructure
- **Neon Database** (PostgreSQL serverless) for scalable data storage
- **Replit hosting environment** with integrated development and deployment workflow

## UI & Animation Libraries
- **Radix UI primitives** providing accessible, unstyled components as foundation
- **shadcn/ui** component system built on Radix for consistent design language
- **Framer Motion** for declarative animations and gesture handling
- **Lucide React** for consistent iconography throughout the application

## Development & Build Tools
- **Vite** with React plugin for fast development experience and optimized builds
- **TypeScript** for static type checking and enhanced developer experience
- **PostCSS & Autoprefixer** for CSS processing and browser compatibility
- **ESBuild** for server-side bundling and optimization

## Authentication & Session Management
- **Replit OpenID Connect** for secure admin authentication
- **Passport.js** with OpenID Client strategy for OAuth flow handling
- **connect-pg-simple** for PostgreSQL session store integration

## Data Validation & API
- **Zod** for schema validation and type inference
- **React Hook Form** with Hookform Resolvers for form management
- **TanStack React Query** for server state management and caching