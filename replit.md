# NexusAI - Plataforma de Agentes de IA

## Overview

NexusAI is a comprehensive AI agents platform that allows users to interact with specialized virtual assistants through text and audio interfaces. The platform features 12 different types of AI agents for various industries (Commercial, Healthcare, Real Estate, Legal, Financial, etc.) and provides both a public-facing interface and an administrative dashboard for managing agents and prompts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript for type safety and modern development
- **Styling**: Hybrid approach using both Styled Components for component-level styling and Tailwind CSS for utility classes
- **UI Components**: Custom components built with Radix UI primitives for accessibility and shadcn/ui design system
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Audio Processing**: LameJS for MP3 encoding of voice messages
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Real-time Communication**: WebSocket server for live chat functionality
- **API Design**: RESTful APIs with proper error handling and validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL for relational data storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Connection Pooling**: Node.js pg pool for efficient database connections
- **Database Driver**: Neon Database serverless driver for PostgreSQL compatibility
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization

### Authentication and Authorization
- **Authentication Strategy**: Username/password with bcrypt-like scrypt hashing
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization Levels**: User and Admin roles with route-level protection
- **Password Security**: Crypto module with salt-based hashing using scrypt
- **Protected Routes**: React components with authentication guards

### External Service Integrations
- **WhatsApp Integration**: Environment-configurable webhook URLs for lead capture
- **Custom Webhooks**: Configurable webhook endpoints for external system integration
- **Logo Management**: Environment-variable based logo configuration
- **Session Tracking**: UUID-based session identification for chat continuity

### Key Architectural Decisions

#### Database Schema Design
- **Users Table**: Stores authentication credentials and admin flags
- **Agents Table**: Contains agent metadata (title, description, icons)
- **Agent Prompts Table**: Stores AI prompts linked to specific agents with active/inactive status
- **Relational Design**: Foreign key relationships between agents and their prompts

#### Real-time Communication
- **WebSocket Implementation**: Custom WebSocket server integrated with Express for live chat
- **Message Handling**: JSON-based message protocol for different message types
- **Connection Management**: Automatic reconnection logic with exponential backoff

#### Security Considerations
- **Password Hashing**: scrypt algorithm with random salts for secure password storage
- **Session Security**: HTTP-only cookies with PostgreSQL session store
- **CORS Configuration**: Properly configured for production deployment
- **Input Validation**: Zod schema validation for all API endpoints

#### Development and Production Setup
- **Build Process**: Separate client and server builds with Vite and esbuild
- **Environment Configuration**: dotenv for development with production environment variables
- **Static File Serving**: Development proxy with Vite, production static file serving
- **Error Handling**: Comprehensive error boundaries and API error responses