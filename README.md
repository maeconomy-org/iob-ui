# IoB (Internet of Buildings)

A modern web application for tracking and managing building materials, components, and structures for government and municipal use.

## Overview

IoB (Internet of Buildings) enables governments and municipalities to create digital material passports for buildings, track their components, and manage associated processes. The platform supports circular economy principles by providing detailed insights into building materials throughout their lifecycle.

## Features

### Building Object Management

- Hierarchical structure management (building → floors → rooms → components)
- Material properties and metadata tracking
- Component relationship mapping
- CRUD operations for all building elements

### Secure Authentication

- Certificate-based mTLS authentication
- Browser certificate integration
- Secure API communication

## Technology Stack

- **Frontend Framework**: Next.js 15.2.4, React 19
- **Language**: TypeScript
- **UI Libraries**: Tailwind CSS, Radix UI Components
- **Form Management**: React Hook Form, Zod validation
- **Data Visualization**: Recharts
- **Security**: mTLS (Mutual TLS) Authentication

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- NPM/PNPM package manager
- HTTPS certificates for local development

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/recheck-io/iob-ui.git
   cd iob-ui
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Setup HTTPS certificates

4. Start the development server

   ```bash
   pnpm dev
   ```

5. Open your browser
   Navigate to `https://localhost:3000`

## Project Structure

```
src/
├── app/                # Next.js app router pages
│   ├── page.tsx       # Auth page
│   ├── objects/       # Objects management
│   ├── process/       # Process management
│   └── help/          # Help documentation
├── components/        # React components
│   ├── ui/           # Shared UI components
│   └── ...           # Feature components
├── lib/              # Utilities
├── hooks/            # React hooks
├── contexts/         # React contexts
└── constants/        # Application constants
```

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting with Prettier

## Authentication

IoB uses certificate-based mTLS authentication. To access the system:

1. Install the required client certificate in your browser
2. Select the certificate when prompted on the login page
3. Follow on-screen instructions if you encounter any issues

## License

This project is licensed under the [MIT License](LICENSE)
