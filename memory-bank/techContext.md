# Technical Context

## Technology Stack

1. Frontend Framework

   - Next.js 15.2.4
   - React 19
   - TypeScript

2. UI Libraries

   - Tailwind CSS
   - Radix UI Components
   - Lucide React Icons

3. Form Management

   - React Hook Form
   - Zod Validation

4. Data Visualization

   - Recharts

5. Security
   - mTLS (Mutual TLS) Authentication
   - Client certificates
   - Secure API communication

## Project Structure

1. Source Organization

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

2. Path Configuration
   - `@/*` aliases to `src/*`
   - Direct imports from source
   - Example: `@/components/ui/button`

## Development Setup

1. Package Manager

   - pnpm

2. Development Tools

   - TypeScript
   - ESLint
   - PostCSS
   - Tailwind CSS

3. Build Tools

   - Next.js Build System
   - PostCSS
   - Tailwind CSS

4. Security Tools
   - Certificate management
   - mTLS configuration
   - Browser certificate storage

## Technical Constraints

1. Browser Support

   - Modern browsers with Web Crypto API support
   - Certificate storage capabilities
   - Secure context (HTTPS) required

2. Performance

   - Client-side rendering
   - Optimized bundle size
   - Efficient state management

3. Security

   - mTLS certificate validation
   - Secure certificate storage
   - Certificate lifecycle management

4. Accessibility
   - WCAG compliance
   - Keyboard navigation
   - Screen reader support

## Dependencies

1. Core Dependencies

   - next
   - react
   - react-dom
   - typescript

2. UI Dependencies

   - @radix-ui/\* components
   - tailwindcss
   - lucide-react

3. Security Dependencies

   - node-forge (for certificate handling)
   - @peculiar/x509 (for certificate parsing)
   - web-crypto-tools

4. Utility Dependencies
   - date-fns
   - zod
   - react-hook-form
   - recharts

## Authentication Flow

1. Certificate Management

   - Browser certificate store integration
   - Certificate selection UI
   - Certificate validation

2. API Communication

   - Secure WebSocket connections
   - HTTPS requests with client certificates
   - Certificate error handling

3. User Experience
   - Certificate installation guide
   - Certificate status indicators
   - Error recovery flows

## Routing Structure

1. Main Routes
   - `/` - Authentication page
   - `/objects` - Objects list view
   - `/objects/[uuid]` - Object details
   - `/process` - Process list view
   - `/process/[uuid]` - Process details
   - `/help` - Help & documentation
