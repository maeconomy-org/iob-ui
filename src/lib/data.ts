import { generateUUIDv7 } from './utils'
import { hotelData } from './hotel-data'
import { schoolData } from './school-data'
import { hotelModelsData } from './hotel-models'
import { schoolModelsData } from './school-models'

// Object model templates data
export const objectModelsData = [
  {
    uuid: '018ce47e-a4ac-75c0-8a2d-f15d72cb33fe',
    name: 'Wall',
    abbreviation: 'WL',
    version: '1.0',
    description: 'Standard wall model for exterior and interior walls',
    creator: 'System',
    createdAt: '2023-10-15T10:00:00.000Z',
    updatedAt: '2023-10-15T10:00:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4b0-7538-9c26-d2bffe9cb4f4',
        key: 'Height',
        values: [
          {
            uuid: '018ce47e-a4b0-7cee-8e73-8d1a2a658f8a',
            value: '3000',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b1-72f7-a3ce-3b6b18a318b8',
        key: 'Length',
        values: [
          {
            uuid: '018ce47e-a4b1-7801-908a-8cc0881cad5e',
            value: '5000',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b2-7ff4-b4b9-bde37cea5aad',
        key: 'Thickness',
        values: [
          {
            uuid: '018ce47e-a4b2-7482-ba7e-aa86324c68df',
            value: '200',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b3-766a-a48c-49c28ecf2cf2',
        key: 'Material',
        values: [
          {
            uuid: '018ce47e-a4b3-7f1c-8f9a-0d1ba5c45ced',
            value: 'Concrete',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  {
    uuid: '018ce47e-a4b5-708f-8b28-0b2f7c3bf0e5',
    name: 'Door',
    abbreviation: 'DR',
    version: '1.0',
    description: 'Standard door model for interior and exterior doors',
    creator: 'System',
    createdAt: '2023-10-15T10:30:00.000Z',
    updatedAt: '2023-10-15T10:30:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4b5-7d15-9cea-7eac39cdac3a',
        key: 'Height',
        values: [
          {
            uuid: '018ce47e-a4b6-7258-a22c-dfc5878fc22e',
            value: '2100',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b6-7c60-adf6-0dc92f48b13d',
        key: 'Width',
        values: [
          {
            uuid: '018ce47e-a4b7-7143-90b1-b55a2cba73c4',
            value: '900',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b7-7c1d-bcbd-3cf91d19a1a8',
        key: 'Material',
        values: [
          {
            uuid: '018ce47e-a4b8-7169-b42e-e9dfd07c5d28',
            value: 'Wood',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4b8-7f2f-9f7f-8a4c05f4f98a',
        key: 'Type',
        values: [
          {
            uuid: '018ce47e-a4b9-7d88-b764-c9eec22c3c6e',
            value: 'Swing',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  {
    uuid: '018ce47e-a4b9-7fcb-8d28-edb172b3a7a8',
    name: 'Window',
    abbreviation: 'WN',
    version: '1.0',
    description: 'Standard window model for various window types',
    creator: 'System',
    createdAt: '2023-10-15T11:00:00.000Z',
    updatedAt: '2023-10-15T11:00:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4ba-7b44-aa7e-bed1d86a86f3',
        key: 'Height',
        values: [
          {
            uuid: '018ce47e-a4ba-78c6-a9c6-1c1be6f3ca53',
            value: '1200',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4bb-77bb-b21d-0ac4a5d82e4c',
        key: 'Width',
        values: [
          {
            uuid: '018ce47e-a4bb-70dc-bd3e-4b13aa0097f5',
            value: '900',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4bc-731a-a659-acfd96649c97',
        key: 'Glass Type',
        values: [
          {
            uuid: '018ce47e-a4bc-78c5-a782-fc17b84b70bb',
            value: 'Double Glazed',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  {
    uuid: '018ce47e-a4bd-7f42-9f59-57a79e54c642',
    name: 'Roof',
    abbreviation: 'RF',
    version: '1.0',
    description: 'Standard roof model for building tops',
    creator: 'System',
    createdAt: '2023-10-15T11:30:00.000Z',
    updatedAt: '2023-10-15T11:30:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4be-7c1b-b13e-b2879acd3a7c',
        key: 'Type',
        values: [
          {
            uuid: '018ce47e-a4be-7b3a-b9c4-5a17da6c8fe2',
            value: 'Gable',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4bf-7a36-a6ac-bf1cb77272b8',
        key: 'Material',
        values: [
          {
            uuid: '018ce47e-a4bf-7649-a467-c8ce20e0e86a',
            value: 'Tiles',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4c0-75b7-85d3-6f9b77b4271f',
        key: 'Pitch',
        values: [
          {
            uuid: '018ce47e-a4c0-7414-bad3-a82e0c01e9a9',
            value: '25°',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  {
    uuid: '018ce47e-a4c1-71ab-9c70-ba76c2e15e13',
    name: 'Foundation',
    abbreviation: 'FN',
    version: '1.0',
    description: 'Standard foundation model for buildings',
    creator: 'System',
    createdAt: '2023-10-15T12:00:00.000Z',
    updatedAt: '2023-10-15T12:00:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4c1-77f9-a30e-77cc7cfbb0de',
        key: 'Type',
        values: [
          {
            uuid: '018ce47e-a4c2-7d10-b9fd-dbc3a7eb88e9',
            value: 'Concrete Slab',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4c2-7eab-a3c1-fc8dd3eb5f83',
        key: 'Thickness',
        values: [
          {
            uuid: '018ce47e-a4c3-7f41-a301-eb55de50f11c',
            value: '300',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  {
    uuid: '018ce47e-a4c3-7a67-85f4-21bdc0f7bfcf',
    name: 'House',
    abbreviation: 'HS',
    version: '1.0',
    description: 'Standard house model template',
    creator: 'System',
    createdAt: '2023-10-15T12:30:00.000Z',
    updatedAt: '2023-10-15T12:30:00.000Z',
    properties: [
      {
        uuid: '018ce47e-a4c4-7b92-bc7a-a33a53fc1d9d',
        key: 'Floors',
        values: [
          {
            uuid: '018ce47e-a4c4-7fb2-bc75-05bfff3eb981',
            value: '2',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4c5-7cd8-8f31-c8e53ca80f25',
        key: 'Area',
        values: [
          {
            uuid: '018ce47e-a4c5-71b2-ad1a-59e2ba1ca5d3',
            value: '180',
            files: [],
          },
        ],
        files: [],
      },
      {
        uuid: '018ce47e-a4c6-77d1-af5c-8a91a7e72d49',
        key: 'Bedrooms',
        values: [
          {
            uuid: '018ce47e-a4c6-7c4a-8afe-bb8dd6af4c37',
            value: '3',
            files: [],
          },
        ],
        files: [],
      },
    ],
    files: [],
  },
  ...hotelModelsData,
  ...schoolModelsData,
]

// Generate demo objects based on the models
const generateDemoUUID = (index: number): string => {
  return generateUUIDv7()
}

export const generateObjectsData = () => {
  // Property creation helper
  const createProperty = (key: string, values: string[]) => {
    return {
      uuid: generateUUIDv7(),
      key,
      values: values.map((value) => ({
        uuid: generateUUIDv7(),
        value,
        files: [],
        creator: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      files: [],
      creator: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // Create a single property with a single value
  const createSingleProperty = (key: string, value: string) => {
    return createProperty(key, [value])
  }

  // Object creation helper
  const createObject = (
    name: string,
    properties: any[],
    children: any[] = [],
    modelUuid?: string
  ) => {
    return {
      uuid: generateUUIDv7(),
      name,
      properties,
      children,
      modelUuid,
      files: [],
      creator: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // Create wall objects
  const createWalls = (
    roomName: string,
    width: string,
    length: string,
    height: string
  ) => {
    const wallModelUuid = objectModelsData[0].uuid // Wall model

    // North wall
    const northWall = createObject(
      `${roomName} North Wall`,
      [
        createSingleProperty('Width', width),
        createSingleProperty('Height', height),
        createSingleProperty('Thickness', '200'),
        createSingleProperty('Material', 'Concrete'),
      ],
      [],
      wallModelUuid
    )

    // East wall
    const eastWall = createObject(
      `${roomName} East Wall`,
      [
        createSingleProperty('Width', length),
        createSingleProperty('Height', height),
        createSingleProperty('Thickness', '200'),
        createSingleProperty('Material', 'Concrete'),
      ],
      [],
      wallModelUuid
    )

    // South wall
    const southWall = createObject(
      `${roomName} South Wall`,
      [
        createSingleProperty('Width', width),
        createSingleProperty('Height', height),
        createSingleProperty('Thickness', '200'),
        createSingleProperty('Material', 'Concrete'),
      ],
      [],
      wallModelUuid
    )

    // West wall
    const westWall = createObject(
      `${roomName} West Wall`,
      [
        createSingleProperty('Width', length),
        createSingleProperty('Height', height),
        createSingleProperty('Thickness', '200'),
        createSingleProperty('Material', 'Concrete'),
      ],
      [],
      wallModelUuid
    )

    return [northWall, eastWall, southWall, westWall]
  }

  // Create window objects
  const createWindows = (roomName: string, count: number) => {
    const windowModelUuid = objectModelsData[2].uuid // Window model

    const windows = []
    for (let i = 1; i <= count; i++) {
      windows.push(
        createObject(
          `${roomName} Window ${i}`,
          [
            createSingleProperty('Height', '1200'),
            createSingleProperty('Width', '900'),
            createSingleProperty('Glass Type', 'Double Glazed'),
          ],
          [],
          windowModelUuid
        )
      )
    }
    return windows
  }

  // Create door objects
  const createDoors = (roomName: string, count: number) => {
    const doorModelUuid = objectModelsData[1].uuid // Door model

    const doors = []
    for (let i = 1; i <= count; i++) {
      doors.push(
        createObject(
          `${roomName} Door ${i}`,
          [
            createSingleProperty('Height', '2100'),
            createSingleProperty('Width', '900'),
            createSingleProperty('Material', 'Wood'),
            createSingleProperty('Type', 'Swing'),
          ],
          [],
          doorModelUuid
        )
      )
    }
    return doors
  }

  // Create room objects
  const createRoom = (
    name: string,
    area: string,
    width: string,
    length: string,
    height: string,
    windowCount: number,
    doorCount: number
  ) => {
    // Create walls, windows, and doors
    const walls = createWalls(name, width, length, height)
    const windows = createWindows(name, windowCount)
    const doors = createDoors(name, doorCount)

    // Create and return the room
    return createObject(
      name,
      [
        createSingleProperty('Area', area),
        createSingleProperty('Width', width),
        createSingleProperty('Length', length),
        createSingleProperty('Height', height),
      ],
      [...walls, ...windows, ...doors]
    )
  }

  // Create floor objects
  const createFloor = (name: string, area: string, rooms: any[]) => {
    return createObject(name, [createSingleProperty('Area', area)], rooms)
  }

  // Create house objects
  const createHouse = (
    name: string,
    width: string,
    length: string,
    height: string,
    floors: any[]
  ) => {
    const houseModelUuid = objectModelsData[5].uuid // House model

    // Create roof
    const roofModelUuid = objectModelsData[3].uuid // Roof model
    const roof = createObject(
      `${name} Roof`,
      [
        createSingleProperty('Type', 'Gable'),
        createSingleProperty('Material', 'Tiles'),
        createSingleProperty('Pitch', '25°'),
      ],
      [],
      roofModelUuid
    )

    // Create foundation
    const foundationModelUuid = objectModelsData[4].uuid // Foundation model
    const foundation = createObject(
      `${name} Foundation`,
      [
        createSingleProperty('Type', 'Concrete Slab'),
        createSingleProperty('Thickness', '300'),
      ],
      [],
      foundationModelUuid
    )

    // Calculate the total area
    const area = (
      parseFloat(width) *
      parseFloat(length) *
      floors.length
    ).toString()

    // Create and return the house
    return createObject(
      name,
      [
        createSingleProperty('Width', width),
        createSingleProperty('Length', length),
        createSingleProperty('Height', height),
        createSingleProperty('Floors', floors.length.toString()),
        createSingleProperty('Area', area),
      ],
      [...floors, roof, foundation],
      houseModelUuid
    )
  }

  // Create a demo house
  const livingRoom = createRoom(
    'Living Room',
    '30',
    '5000',
    '6000',
    '2700',
    2,
    1
  )
  const kitchen = createRoom('Kitchen', '20', '4000', '5000', '2700', 1, 1)
  const bathroom = createRoom('Bathroom', '8', '2000', '4000', '2700', 1, 1)

  const masterBedroom = createRoom(
    'Master Bedroom',
    '25',
    '5000',
    '5000',
    '2700',
    2,
    1
  )
  const bedroom2 = createRoom('Bedroom 2', '20', '4000', '5000', '2700', 1, 1)
  const bathroom2 = createRoom('Bathroom 2', '8', '2000', '4000', '2700', 1, 1)

  const groundFloor = createFloor('Ground Floor', '58', [
    livingRoom,
    kitchen,
    bathroom,
  ])
  const firstFloor = createFloor('First Floor', '53', [
    masterBedroom,
    bedroom2,
    bathroom2,
  ])

  const demoHouse = createHouse('Demo House', '14000', '12000', '5600', [
    groundFloor,
    firstFloor,
  ])

  // Return all objects
  return [demoHouse]
}

// Generate and export objects data
export const objectsData = [hotelData, schoolData, ...generateObjectsData()]

// Generate process data (placeholder)
export const generateProcessData = () => {
  // Material creation helper
  const createMaterial = (
    name: string,
    unit: string,
    quantity: string,
    inputs: any[] = [],
    outputs: any[] = []
  ) => {
    return {
      uuid: generateUUIDv7(),
      name,
      unit,
      quantity,
      inputs,
      outputs,
      properties: [
        {
          uuid: generateUUIDv7(),
          key: 'Unit',
          values: [{ uuid: generateUUIDv7(), value: unit, files: [] }],
          files: [],
        },
        {
          uuid: generateUUIDv7(),
          key: 'Quantity',
          values: [{ uuid: generateUUIDv7(), value: quantity, files: [] }],
          files: [],
        },
      ],
      files: [],
      creator: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // Basic materials
  const water = createMaterial('Water', 'liters', '5000')
  const cement = createMaterial('Cement', 'kg', '2000')
  const sand = createMaterial('Sand', 'tonnes', '4')
  const crushedStone = createMaterial('Crushed Stone', 'tonnes', '6')

  // Processed materials - concrete mix with realistic proportions
  const concrete = createMaterial('Concrete', 'm³', '15', [
    {
      id: water.uuid,
      name: water.name,
      process: 'Mix',
      quantity: 2000,
      unit: 'liters',
    },
    {
      id: cement.uuid,
      name: cement.name,
      process: 'Mix',
      quantity: 750,
      unit: 'kg',
    },
    {
      id: sand.uuid,
      name: sand.name,
      process: 'Mix',
      quantity: 1.5,
      unit: 'tonnes',
    },
    {
      id: crushedStone.uuid,
      name: crushedStone.name,
      process: 'Mix',
      quantity: 2.2,
      unit: 'tonnes',
    },
  ])

  // Update outputs for basic materials
  water.outputs = [
    {
      id: concrete.uuid,
      name: concrete.name,
      process: 'Mix',
      quantity: 2000,
      unit: 'liters',
    },
  ]
  cement.outputs = [
    {
      id: concrete.uuid,
      name: concrete.name,
      process: 'Mix',
      quantity: 750,
      unit: 'kg',
    },
  ]
  sand.outputs = [
    {
      id: concrete.uuid,
      name: concrete.name,
      process: 'Mix',
      quantity: 1.5,
      unit: 'tonnes',
    },
  ]
  crushedStone.outputs = [
    {
      id: concrete.uuid,
      name: concrete.name,
      process: 'Mix',
      quantity: 2.2,
      unit: 'tonnes',
    },
  ]

  // Create a wall component from the concrete
  const wall = createMaterial('Wall Section', 'piece', '1', [
    {
      id: concrete.uuid,
      name: concrete.name,
      process: 'Pour',
      quantity: 3.5,
      unit: 'm³',
    },
  ])

  // Update concrete outputs
  concrete.outputs = [
    {
      id: wall.uuid,
      name: wall.name,
      process: 'Pour',
      quantity: 3.5,
      unit: 'm³',
    },
  ]

  // Create waste material from demolishing a wall
  const concreteWaste = createMaterial('Concrete Waste', 'tonnes', '8')
  const metalWaste = createMaterial('Metal Waste', 'kg', '250')

  // Create a demolished wall that produces waste
  const demolishedWall = createMaterial(
    'Demolished Wall',
    'piece',
    '1',
    [],
    [
      {
        id: concreteWaste.uuid,
        name: concreteWaste.name,
        process: 'Demolish',
        quantity: 8,
        unit: 'tonnes',
      },
      {
        id: metalWaste.uuid,
        name: metalWaste.name,
        process: 'Demolish',
        quantity: 250,
        unit: 'kg',
      },
    ]
  )

  // Update waste inputs
  concreteWaste.inputs = [
    {
      id: demolishedWall.uuid,
      name: demolishedWall.name,
      process: 'Demolish',
      quantity: 1,
      unit: 'piece',
    },
  ]
  metalWaste.inputs = [
    {
      id: demolishedWall.uuid,
      name: demolishedWall.name,
      process: 'Demolish',
      quantity: 1,
      unit: 'piece',
    },
  ]

  return [
    water,
    cement,
    sand,
    crushedStone,
    concrete,
    wall,
    demolishedWall,
    concreteWaste,
    metalWaste,
  ]
}

// Generate and export process data
export const processData = generateProcessData()
