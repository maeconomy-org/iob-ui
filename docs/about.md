# Project Overview: Internet of Buildings (IoB)

Based on the information in the Memory Bank, I can provide a comprehensive overview of the Internet of Buildings (IoB) project:

## Project Purpose

IoB is a Material Management System designed to track and manage building components and materials throughout their lifecycle. The system focuses on:

1. **Building Component Management**: Tracking building hierarchy, material properties, and component relationships
2. **Material Process Management**: Monitoring construction processes, material lifecycles, and demolition planning
3. **Authentication System**: Using certificate-based authentication for secure access

## Technical Architecture

### Frontend Framework

- **Next.js 15.2.4**: Server-side rendering and routing
- **React 19**: Component-based UI architecture
- **TypeScript**: Type safety throughout the application

### UI/UX

- **Tailwind CSS**: Utility-first styling
- **Radix UI Components**: Accessible UI primitives
- **Lucide React Icons**: Consistent iconography

### Security

- **mTLS (Mutual TLS) Authentication**: Certificate-based security
- **Client Certificates**: Browser certificate integration
- **Secure Communication**: HTTPS with client certificates

### Project Structure

```
src/
├── app/                # Next.js app router pages
│   ├── page.tsx       # Auth page
│   ├── objects/       # Main application pages
│   ├── process/       # Process management pages
│   └── help/          # Help & documentation
├── components/        # React components
│   ├── ui/           # Shared UI components
│   └── ...           # Feature components
├── lib/              # Utilities
└── hooks/            # React hooks
```

### Routing Structure

- `/` - Authentication page
- `/objects` - Objects list view
- `/objects/[uuid]` - Object details
- `/process` - Process list view
- `/process/[uuid]` - Process details
- `/help` - Help & documentation

## Current Development Status

### What Works

1. **Project Structure**

   - Source code organization in `src` directory
   - Clean import paths with `@` alias
   - Component organization
   - TypeScript configuration

2. **Authentication**

   - Basic authentication page
   - Certificate selector component
   - Help link integration
   - Redirect to objects page

3. **Components**
   - CertificateSelector
   - UI components library
   - Modal system
   - Table components

### What's Left to Build

1. **Authentication System**

   - Complete mTLS integration
   - Certificate validation
   - Session management
   - Error recovery

2. **Help System**

   - Comprehensive documentation
   - Certificate management guide
   - Troubleshooting guide
   - User onboarding

3. **User Experience**
   - Certificate expiration notifications
   - Certificate renewal flow
   - Advanced search features
   - Data visualization

## Current Focus

1. **Authentication System**

   - Certificate-based authentication
   - Browser certificate integration
   - Help documentation
   - User guidance

2. **Project Structure**
   - Source organization in `src`
   - Clean import paths
   - Component organization
   - Feature modularity

## Key Components

### Authentication

- **AuthPage**: Landing page with certificate selection
- **CertificateSelector**: UI for selecting and viewing certificates
- **Help Documentation**: Guidance for certificate management

### Object Management

- **ObjectsTable**: Display and management of building components
- **ObjectDetailsModal**: Detailed view of object properties
- **AddObjectModal**: Creation of new objects
- **PropertyDetailsModal**: Management of object properties

### Process Management

- **ProcessTable**: Display and management of material processes
- **ProcessDetailsModal**: Detailed view of process information
- **AddMaterialModal**: Adding materials to processes
- **ProcessForm**: Creation and editing of processes

## Development Approach

The project follows a modern React-based architecture with:

- Component-based design
- TypeScript for type safety
- Clean import paths with aliases
- Feature-based organization
- Modal-based interactions for detailed views
- Table-based display of data
- Hierarchical navigation

## Next Steps

1. **Immediate**

   - Complete mTLS integration
   - Add certificate validation
   - Improve error handling
   - Add help content

2. **Short Term**

   - Implement session management
   - Add certificate notifications
   - Enhance error messages
   - Complete documentation

3. **Long Term**
   - Add advanced features
   - Optimize performance
   - Enhance security
   - Improve scalability

This project represents a comprehensive material management system for buildings, with a strong focus on security through certificate-based authentication and a well-structured, component-based architecture.
