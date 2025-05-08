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

# IOB - Intelligent Object Browser

## About

IOB is a web-based tool for managing and visualizing hierarchical object data. It provides a flexible interface for working with object trees, properties, and relationships.

## Features

- **Multiple Object Views**: Table, Explorer, and Columns views for different ways to interact with objects
- **Object Management**: Create, edit, and delete objects with a rich interface
- **Property Management**: Add, edit, and manage object properties
- **File Attachments**: Attach and manage files for objects
- **Object Models**: Define and use object models as templates
- **Import/Export**: Import and export objects in JSON format
- **Multi-Import**: Import multiple objects at once with the option to choose a parent object
- **Object Graph**: Visualize object relationships in an interactive graph

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Import/Export

The application supports importing and exporting object data in JSON format.

### Export Objects

1. Click the Import/Export button in the main toolbar
2. Select the Export tab
3. The JSON data for all objects will be displayed in the text area
4. Click "Download JSON" to save the data to a file

### Import Objects

1. Click the Import/Export button in the main toolbar
2. Select the Import tab
3. Either:
   - Upload a JSON file by clicking "Select File"
   - Paste JSON directly into the text area
4. Choose import option:
   - Import as root objects: Objects will be added at the root level
   - Import as children of: Objects will be added as children of the selected parent object
5. Click "Import Objects" to complete the import

## Development

### Project Structure

- `/app`: Next.js app router pages and components
- `/components`: Reusable UI components
- `/lib`: Utility functions and data
- `/public`: Static assets
- `/styles`: Global styles

### Key Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Lucide Icons
