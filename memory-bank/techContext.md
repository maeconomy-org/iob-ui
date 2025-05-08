# Technical Context

## Technology Stack

- **Frontend Framework**: Next.js 14 with React 18, utilizing the App Router
- **UI Framework**: Custom UI built on Radix UI primitives with Tailwind CSS
- **State Management**: React's built-in hooks (useState, useContext)
- **Type Safety**: TypeScript for strong typing
- **Data Visualization**: Custom components for process flows and object hierarchies
- **Component Library**: Reusable UI components with shadcn/ui conventions

## Key Dependencies

1. **UI Components**

   - Radix UI for accessible primitives
   - Tailwind CSS for styling
   - Lucide icons for iconography
   - Shadcn/ui pattern for component organization

2. **Data Management**

   - React Hook Form for form handling
   - Zod for schema validation
   - UUID v7 for unique identifiers
   - JSON for data structure

3. **Visualization**
   - Custom table components
   - Hierarchical explorer views
   - Column-based Kanban views
   - Process flow visualization

## Component Structure

The application is structured around reusable components:

```
components/
├── forms/              # Form components
│   ├── process-form-v2.tsx
│   ├── quick-object-form.tsx
│   └── property-field.tsx
├── modals/             # Modal dialogs
│   ├── process-details-modal.tsx
│   ├── property-management-modal.tsx
│   └── delete-confirmation-dialog.tsx
├── object-views/       # Object visualization
│   ├── explorer-view.tsx
│   ├── columns-view.tsx
│   └── view-container.tsx
├── sheets/             # Slide-in sheets
│   ├── object-details-sheet.tsx
│   ├── object-edit-sheet.tsx
│   └── process-form-sheet.tsx
├── tables/             # Table views
│   ├── objects-table.tsx
│   └── process-table.tsx
└── ui/                 # Base UI components
    ├── button.tsx
    ├── dialog.tsx
    ├── sheet.tsx
    └── index.ts        # Centralized exports
```

## Data Models

### Object Model

Objects follow a flexible property-based model:

```typescript
interface IoObject {
  uuid: string // Unique identifier (UUIDv7)
  name: string // Display name
  type?: string // Object type classification
  properties: Property[] // Flexible property list
  children?: IoObject[] // Hierarchical structure
  files?: File[] // Attached documents
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}
```

### Process Model

Processes track material transformations:

```typescript
interface Process {
  uuid: string // Unique identifier
  name: string // Process name
  inputs: ProcessMaterial[] // Input materials with quantities
  outputs: ProcessMaterial[] // Output materials with quantities
  properties: Property[] // Process properties
  createdAt: string // Creation timestamp
  updatedAt: string // Update timestamp
}
```

## Technical Implementation Details

1. **Component Imports**

   - Using index.ts for centralized exports
   - Clean imports from UI components
   - Consistent module organization

2. **UUID Generation**

   - Using UUID v7 for time-based ordering
   - Generated client-side for new objects
   - Used for relationship tracking

3. **Form Handling**

   - Controlled components with React state
   - Dynamic form fields for properties
   - Template-based quick object creation

4. **View Navigation**
   - Multiple view types (table, explorer, columns)
   - Consistent action patterns across views
   - Hierarchical navigation for nested objects

## Technical Constraints

1. **Performance Considerations**

   - Large object hierarchies might impact rendering
   - Complex process visualizations need optimization
   - State management for deeply nested objects

2. **Browser Compatibility**

   - Modern browser support only (Chrome, Firefox, Safari, Edge)
   - Reliance on modern CSS features
   - ES6+ JavaScript features

3. **Data Persistence**
   - Currently using in-memory data
   - Prepared for API integration
   - UUID-based relationships for future backend

## Development Environment

- **Node.js**: v18+ environment
- **Package Manager**: npm or yarn
- **Development Server**: Next.js dev server
- **Build System**: Next.js build system
- **Deployment Target**: Static site or Node.js server

## Future Technical Considerations

1. **Data Persistence**

   - API integration for data storage
   - Real-time updates with WebSockets
   - Offline support with local storage

2. **Performance Optimizations**

   - Virtual lists for large data sets
   - Optimistic UI updates
   - Incremental static regeneration

3. **Advanced Features**
   - Advanced process visualization
   - Material flow analysis
   - Data import/export capabilities
   - Reporting and analytics
