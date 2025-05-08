# Product Context

## Purpose

The IoB (Internet of Buildings) application serves as a platform for tracking and managing building materials, components, and processes for government and municipal use. It provides a comprehensive system for creating digital material passports, monitoring material flows, and managing the lifecycle of building components.

## Core Problems Solved

1. **Material Tracking Challenges**

   - Tracking materials throughout their lifecycle from raw materials to components
   - Managing complex hierarchical relationships between building objects
   - Documenting material transformations through manufacturing processes
   - Maintaining material properties and metadata throughout changes

2. **Process Management Complexity**

   - Connecting inputs and outputs across multiple processes
   - Tracking quantities and units through transformation processes
   - Documenting manufacturing methods and parameters
   - Creating consistent material passports across different processes

3. **Data Organization**
   - Organizing building components in meaningful hierarchies
   - Managing extensive property sets for various materials
   - Establishing relationships between objects and processes
   - Maintaining consistent object identification across the system

## User Experience Goals

1. **Intuitive Material Flow Management**

   - Simple process creation with input/output relationships
   - Quick material creation through templates and suggestions
   - Visual representation of material transformations
   - Efficient quantity and unit tracking

2. **Flexible Object Organization**

   - Multiple views (table, explorer, columns) for different use cases
   - Hierarchical navigation of building components
   - Consistent object management across all views
   - Easy property management for all objects

3. **Efficient Workflow**
   - Streamlined process for common operations
   - Consistent UI patterns across different features
   - Intelligent suggestions for outputs based on inputs
   - Template-based approaches for repeated tasks

## Key User Journeys

1. **Material Passport Creation**

   ```mermaid
   graph LR
     A[Create Building Object] --> B[Add Properties]
     B --> C[Define Subcomponents]
     C --> D[Link to Processes]
     D --> E[Generate Passport]
   ```

2. **Process Flow Documentation**

   ```mermaid
   graph LR
     A[Select Input Materials] --> B[Define Quantities]
     B --> C[Specify Process]
     C --> D[Create Output Materials]
     D --> E[Document Properties]
   ```

3. **Building Hierarchy Management**
   ```mermaid
   graph TD
     A[Create Building] --> B[Define Floors]
     B --> C[Add Rooms]
     C --> D[Specify Components]
     D --> E[Link Materials]
   ```

## Business Value

1. **Regulatory Compliance**

   - Material passport documentation for building regulations
   - Lifecycle tracking for environmental compliance
   - Documentation of material properties for safety standards
   - Chain of custody for certified materials

2. **Resource Optimization**

   - Tracking material quantities through processes
   - Identifying reuse opportunities
   - Documenting material transformations
   - Managing material properties for optimal use

3. **Sustainability Metrics**
   - Documentation of material origins
   - Tracking recyclable components
   - Monitoring embodied carbon through processes
   - Enabling circular economy principles
