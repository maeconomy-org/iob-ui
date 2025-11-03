// lib/data-generator.ts
import { MaterialObject, MaterialRelationship } from '@/types'
import { generateUUIDv7 } from './utils'

export function generateComprehensiveData(): {
  materials: MaterialObject[]
  relationships: MaterialRelationship[]
} {
  // Core construction materials with realistic hierarchy
  const materials: MaterialObject[] = [
    // PRIMARY INPUTS (Left side - distinct colors)
    {
      uuid: generateUUIDv7(),
      name: 'Water',
      type: 'input',
      category: 'Basic Resources',
      color: '#1976d2',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Portland Cement',
      type: 'input',
      category: 'Binders',
      color: '#8d6e63',
    },
    {
      uuid: generateUUIDv7(),
      name: 'River Sand',
      type: 'input',
      category: 'Aggregates',
      color: '#ff9800',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Crushed Stone',
      type: 'input',
      category: 'Aggregates',
      color: '#607d8b',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Steel Rebar',
      type: 'input',
      category: 'Reinforcement',
      color: '#424242',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Timber Beams',
      type: 'input',
      category: 'Structural',
      color: '#795548',
    },

    // RECYCLED MATERIALS (Input cycle - positioned as inputs)
    {
      uuid: generateUUIDv7(),
      name: 'Recycled Concrete Aggregate',
      type: 'input',
      category: 'Recycled Materials',
      color: '#a5d6a7',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Recycled Steel',
      type: 'input',
      category: 'Recycled Materials',
      color: '#c8e6c9',
    },

    // INTERMEDIATE PROCESSES (Center - lighter tones)
    {
      uuid: generateUUIDv7(),
      name: 'Ready-Mix Concrete',
      type: 'intermediate',
      category: 'Composite Materials',
      color: '#f5f5f5',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Reinforced Concrete',
      type: 'intermediate',
      category: 'Structural Elements',
      color: '#eeeeee',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Processed Timber',
      type: 'intermediate',
      category: 'Building Materials',
      color: '#d7ccc8',
    },

    // FINAL OUTPUTS (Right side - greens)
    {
      uuid: generateUUIDv7(),
      name: 'Foundation',
      type: 'output',
      category: 'Structural Components',
      color: '#66bb6a',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Structural Walls',
      type: 'output',
      category: 'Structural Components',
      color: '#4caf50',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Floor Systems',
      type: 'output',
      category: 'Structural Components',
      color: '#81c784',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Completed Building',
      type: 'output',
      category: 'Final Product',
      color: '#2e7d32',
    },

    // WASTE & RECYCLING (Bottom - reds and light greens)
    {
      uuid: generateUUIDv7(),
      name: 'Concrete Waste',
      type: 'output',
      category: 'Waste Stream',
      color: '#ffcdd2',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Steel Scrap',
      type: 'output',
      category: 'Waste Stream',
      color: '#ffab91',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Mixed Construction Debris',
      type: 'output',
      category: 'Waste Stream',
      color: '#ffccbc',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Landfill Disposal',
      type: 'output',
      category: 'Final Waste',
      color: '#ef5350',
    },

    // ENVIRONMENTAL OUTPUTS
    {
      uuid: generateUUIDv7(),
      name: 'CO2 Emissions',
      type: 'output',
      category: 'Environmental Impact',
      color: '#f8bbd9',
    },
    {
      uuid: generateUUIDv7(),
      name: 'Water Runoff',
      type: 'output',
      category: 'Environmental Impact',
      color: '#b3e5fc',
    },
  ]

  // Store material UUIDs for relationship references
  const materialMap = new Map<string, string>()
  materials.forEach((material) => {
    materialMap.set(material.name, material.uuid)
  })

  // Helper function to get material reference
  const getMaterialRef = (name: string) => {
    const uuid = materialMap.get(name)
    if (!uuid) {
      console.warn(`Material not found: ${name}`)
      return { uuid: generateUUIDv7(), name }
    }
    return { uuid, name }
  }

  // Complete relationships showing circular economy
  const relationships: MaterialRelationship[] = [
    // CONCRETE PRODUCTION (Major flows)
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Water'),
      object: getMaterialRef('Ready-Mix Concrete'),
      quantity: 180,
      unit: 'L/m³',
      processName: 'Concrete Mixing',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Portland Cement'),
      object: getMaterialRef('Ready-Mix Concrete'),
      quantity: 450,
      unit: 'kg/m³',
      processName: 'Concrete Mixing',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('River Sand'),
      object: getMaterialRef('Ready-Mix Concrete'),
      quantity: 650,
      unit: 'kg/m³',
      processName: 'Concrete Mixing',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Crushed Stone'),
      object: getMaterialRef('Ready-Mix Concrete'),
      quantity: 1200,
      unit: 'kg/m³',
      processName: 'Concrete Mixing',
    },

    // RECYCLED INPUTS (Key circular economy flows)
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Recycled Concrete Aggregate'),
      object: getMaterialRef('Ready-Mix Concrete'),
      quantity: 300,
      unit: 'kg/m³',
      processName: 'Sustainable Concrete Mix',
    },

    // REINFORCED CONCRETE
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Ready-Mix Concrete'),
      object: getMaterialRef('Reinforced Concrete'),
      quantity: 2500,
      unit: 'kg/m³',
      processName: 'Reinforcement Installation',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Steel Rebar'),
      object: getMaterialRef('Reinforced Concrete'),
      quantity: 120,
      unit: 'kg/m³',
      processName: 'Reinforcement Installation',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Recycled Steel'),
      object: getMaterialRef('Reinforced Concrete'),
      quantity: 80,
      unit: 'kg/m³',
      processName: 'Sustainable Reinforcement',
    },

    // TIMBER PROCESSING
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Timber Beams'),
      object: getMaterialRef('Processed Timber'),
      quantity: 800,
      unit: 'kg',
      processName: 'Timber Processing',
    },

    // STRUCTURAL ELEMENTS
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Reinforced Concrete'),
      object: getMaterialRef('Foundation'),
      quantity: 3000,
      unit: 'kg',
      processName: 'Foundation Construction',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Reinforced Concrete'),
      object: getMaterialRef('Structural Walls'),
      quantity: 2000,
      unit: 'kg',
      processName: 'Wall Construction',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Reinforced Concrete'),
      object: getMaterialRef('Floor Systems'),
      quantity: 1500,
      unit: 'kg',
      processName: 'Floor Construction',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Processed Timber'),
      object: getMaterialRef('Floor Systems'),
      quantity: 600,
      unit: 'kg',
      processName: 'Timber Floor Installation',
    },

    // FINAL ASSEMBLY
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Foundation'),
      object: getMaterialRef('Completed Building'),
      quantity: 1,
      unit: 'structure',
      processName: 'Building Assembly',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Structural Walls'),
      object: getMaterialRef('Completed Building'),
      quantity: 1,
      unit: 'structure',
      processName: 'Building Assembly',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Floor Systems'),
      object: getMaterialRef('Completed Building'),
      quantity: 1,
      unit: 'structure',
      processName: 'Building Assembly',
    },

    // WASTE GENERATION
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Ready-Mix Concrete'),
      object: getMaterialRef('Concrete Waste'),
      quantity: 150,
      unit: 'kg',
      processName: 'Construction Waste',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Steel Rebar'),
      object: getMaterialRef('Steel Scrap'),
      quantity: 25,
      unit: 'kg',
      processName: 'Steel Processing Waste',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Processed Timber'),
      object: getMaterialRef('Mixed Construction Debris'),
      quantity: 120,
      unit: 'kg',
      processName: 'Timber Processing Waste',
    },

    // WASTE TO LANDFILL
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Concrete Waste'),
      object: getMaterialRef('Landfill Disposal'),
      quantity: 50,
      unit: 'kg',
      processName: 'Waste Disposal',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Mixed Construction Debris'),
      object: getMaterialRef('Landfill Disposal'),
      quantity: 80,
      unit: 'kg',
      processName: 'Waste Disposal',
    },

    // RECYCLING LOOPS (Key circular economy flows)
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Concrete Waste'),
      object: getMaterialRef('Recycled Concrete Aggregate'),
      quantity: 100,
      unit: 'kg',
      processName: 'Concrete Recycling',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Steel Scrap'),
      object: getMaterialRef('Recycled Steel'),
      quantity: 22,
      unit: 'kg',
      processName: 'Steel Recycling',
    },

    // ENVIRONMENTAL IMPACTS
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Portland Cement'),
      object: getMaterialRef('CO2 Emissions'),
      quantity: 380,
      unit: 'kg CO2e',
      processName: 'Cement Production Emissions',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Ready-Mix Concrete'),
      object: getMaterialRef('CO2 Emissions'),
      quantity: 180,
      unit: 'kg CO2e',
      processName: 'Concrete Production Emissions',
    },
    {
      predicate: 'IS_INPUT_OF',
      subject: getMaterialRef('Completed Building'),
      object: getMaterialRef('Water Runoff'),
      quantity: 500,
      unit: 'L',
      processName: 'Construction Site Runoff',
    },
  ]

  return { materials, relationships }
}
