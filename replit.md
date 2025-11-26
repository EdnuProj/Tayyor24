# Do'kon - O'zbekcha E-Commerce Platform

## Overview

Do'kon is a modern e-commerce platform designed for the Uzbek market, providing a complete online shopping experience with product browsing, cart management, checkout, and administrative capabilities. The platform features a bilingual interface (Uzbek language support), modern design aesthetics inspired by contemporary e-commerce platforms, and a focus on frictionless commerce with seamless shopping flows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type safety and modern component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router
- Single-page application (SPA) architecture with client-side routing

**UI Component System**
- shadcn/ui component library (New York style variant) for consistent, accessible UI components
- Radix UI primitives for headless, accessible component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants
- Custom CSS variables for theming with light/dark mode support

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Context API for global UI state (theme, cart)
- Local component state with React hooks for UI interactions

**Design System**
- Purple-based color palette (#8B5CF6 primary) inspired by modern SaaS aesthetics
- Inter font family for typography
- Responsive design with mobile-first approach
- Custom elevation system with hover and active states
- Support for both light and dark themes via CSS custom properties

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for RESTful API endpoints
- Node.js HTTP server with middleware pattern
- Session-based cart management using session IDs
- Custom logging middleware for request/response tracking

**Development vs Production**
- Development: Vite dev server integrated via middleware for HMR
- Production: Static file serving from built assets
- Environment-specific entry points (index-dev.ts, index-prod.ts)

**API Design**
- RESTful endpoints organized by resource (/api/products, /api/cart, /api/orders, etc.)
- Consistent request/response patterns with JSON payloads
- Validation using Zod schemas derived from database schema
- Error handling with appropriate HTTP status codes

### Data Layer

**Database & ORM**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the database (via Neon serverless driver)
- Schema-first approach with TypeScript types generated from database schema
- Migrations managed via Drizzle Kit

**Data Models**
- Products: name, slug, price, images, variants (colors/sizes), stock, ratings
- Categories: hierarchical organization with icons and slugs
- Cart Items: session-based with product references and variant selections
- Orders: customer information, items, delivery/payment details
- Customers: contact information and order history
- Promo Codes: discount management with validation
- Reviews: product ratings and feedback
- Site Settings: global configuration

**Storage Abstraction**
- IStorage interface defining all data operations
- Separation of storage logic from route handlers
- Support for filtering, sorting, and pagination in queries

### Key Architectural Decisions

**Session-Based Cart Management**
- Problem: Anonymous users need shopping cart functionality before checkout
- Solution: Client-generated session IDs stored in localStorage, sent with cart operations
- Rationale: Enables cart persistence without requiring user authentication
- Trade-off: Carts are device-specific but simple to implement

**Type-Safe Schema Definition**
- Problem: Maintaining consistency between database, API, and frontend types
- Solution: Single source of truth in shared/schema.ts using Drizzle and Zod
- Rationale: Compile-time type checking across full stack, reduced runtime errors
- Benefit: Automatic validation schemas from insert schemas

**Component-Based UI Architecture**
- Problem: Maintaining consistent, reusable UI across the application
- Solution: shadcn/ui pattern with local component ownership and Radix primitives
- Rationale: Balance between pre-built components and customization flexibility
- Benefit: Full control over styling while maintaining accessibility

**Server-Side Rendering Strategy**
- Problem: Choose between SSR, SSG, or SPA
- Solution: Pure SPA with client-side routing via Wouter
- Rationale: Simpler deployment, suitable for admin-heavy features
- Trade-off: Initial load time vs. implementation complexity

**Monorepo Structure**
- Problem: Organize frontend, backend, and shared code
- Solution: Single repository with /client, /server, /shared directories
- Rationale: Simplified development workflow, shared type definitions
- Benefit: Single build process, easier dependency management

**Theme System Implementation**
- Problem: Support light/dark modes with consistent design tokens
- Solution: CSS custom properties with class-based theme switching
- Rationale: Native CSS solution, no JavaScript runtime cost
- Benefit: Smooth transitions, system preference detection

## External Dependencies

### Database & Backend Services
- **Neon PostgreSQL**: Serverless Postgres database hosting (@neondatabase/serverless)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component collection built on Radix (locally owned)
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional social media icons (SiTelegram, SiInstagram, etc.)

### Data Fetching & Forms
- **TanStack Query**: Server state management with automatic caching and refetching
- **React Hook Form**: Performant form validation with minimal re-renders
- **Zod**: Schema validation for runtime type checking
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant management
- **clsx**: Utility for conditional className construction
- **tailwind-merge**: Merging Tailwind classes without conflicts

### Date & Formatting
- **date-fns**: Modern date utility library for formatting and manipulation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking across the application
- **Drizzle Kit**: Database migration and schema management CLI
- **ESBuild**: Fast JavaScript bundler for production builds

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation in Replit
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Additional UI Libraries
- **cmdk**: Command palette component (Command+K interface)
- **embla-carousel-react**: Touch-friendly carousel for product image galleries
- **vaul**: Drawer/bottom sheet component for mobile interfaces
- **react-day-picker**: Calendar/date picker component
- **input-otp**: One-time password input component