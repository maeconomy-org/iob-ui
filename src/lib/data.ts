import { generateUUIDv7 } from './utils'

// Generate a UUID v7-like string for demo purposes
const generateDemoUUID = (index: number): string => {
  // Create a timestamp-based prefix (first part of UUID v7)
  // const timestamp = new Date().getTime()
  // const timestampHex = timestamp.toString(16).padStart(12, '0')

  // // Format the index to be 3 digits with leading zeros
  // const formattedIndex = index.toString().padStart(3, '0')

  // Construct a UUID v7-like string with the index embedded
  return generateUUIDv7()
}

// Create a more comprehensive object hierarchy
export const generateObjectsData = () => {
  let idCounter = 1

  // Helper function to create a property with multiple values
  const createProperty = (key: string, values: string[]) => {
    const propertyUuid = generateDemoUUID(idCounter++)

    return {
      uuid: propertyUuid,
      key,
      creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
      ).toISOString(),
      files: [],
      values: values.map((value) => ({
        uuid: generateDemoUUID(idCounter++),
        value,
        creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
        ).toISOString(),
        files: [],
      })),
    }
  }

  // Helper function to create an object with basic properties
  const createObject = (
    name: string,
    properties: any[],
    children: any[] = []
  ) => {
    const uuid = generateDemoUUID(idCounter++)
    return {
      uuid,
      name,
      creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
      ).toISOString(),
      isDeleted: false,
      properties,
      files: [],
      children,
    }
  }

  // Create walls for a room
  const createWalls = (
    roomName: string,
    width: string,
    length: string,
    height: string
  ) => {
    return [
      createObject(`${roomName} North Wall`, [
        createProperty('length', [width]),
        createProperty('height', [height]),
      ]),
      createObject(`${roomName} East Wall`, [
        createProperty('length', [length]),
        createProperty('height', [height]),
      ]),
      createObject(`${roomName} South Wall`, [
        createProperty('length', [width]),
        createProperty('height', [height]),
      ]),
      createObject(`${roomName} West Wall`, [
        createProperty('length', [length]),
        createProperty('height', [height]),
      ]),
    ]
  }

  // Create windows for a room
  const createWindows = (roomName: string, count: number) => {
    const windows = []
    for (let i = 1; i <= count; i++) {
      windows.push(
        createObject(`${roomName} Window ${i}`, [
          createProperty('width', [
            `${(0.8 + Math.random() * 0.4).toFixed(2)}m`,
          ]),
          createProperty('height', [
            `${(1.0 + Math.random() * 0.5).toFixed(2)}m`,
          ]),
        ])
      )
    }
    return windows
  }

  // Create doors for a room
  const createDoors = (roomName: string, count: number) => {
    const doors = []
    for (let i = 1; i <= count; i++) {
      doors.push(
        createObject(`${roomName} Door ${i}`, [
          createProperty('width', [
            `${(0.8 + Math.random() * 0.2).toFixed(2)}m`,
          ]),
          createProperty('height', ['2.1m']),
          createProperty('material', ['Wood', 'Metal']), // Example of multiple values
        ])
      )
    }
    return doors
  }

  // Create a room with walls, windows, and doors
  const createRoom = (
    name: string,
    area: string,
    width: string,
    length: string,
    height: string,
    windowCount: number,
    doorCount: number
  ) => {
    const walls = createWalls(name, width, length, height)
    const windows = createWindows(name, windowCount)
    const doors = createDoors(name, doorCount)

    return createObject(
      name,
      [
        createProperty('area', [area]),
        createProperty('width', [width]),
        createProperty('length', [length]),
      ],
      [...walls, ...windows, ...doors]
    )
  }

  // Create a floor with rooms
  const createFloor = (name: string, area: string, rooms: any[]) => {
    return createObject(name, [createProperty('area', [area])], rooms)
  }

  // Create a house with floors and foundation
  const createHouse = (
    name: string,
    width: string,
    length: string,
    height: string,
    floors: any[]
  ) => {
    const foundation = createObject(`${name} Foundation`, [
      createProperty('depth', ['2m']),
      createProperty('material', ['Concrete']),
      createProperty('area', [
        `${Number.parseInt(width) * Number.parseInt(length)}m²`,
      ]),
    ])

    const roof = createObject(`${name} Roof`, [
      createProperty('area', [
        `${Number.parseInt(width) * Number.parseInt(length)}m²`,
      ]),
      createProperty('material', ['Tile', 'Metal']), // Example of multiple values
      createProperty('slope', ['30°']),
    ])

    return createObject(
      name,
      [
        createProperty('width', [width]),
        createProperty('length', [length]),
        createProperty('height', [height]),
      ],
      [foundation, ...floors, roof]
    )
  }

  // Create House A
  const houseALivingRoom = createRoom(
    'Living Room',
    '30m²',
    '6m',
    '5m',
    '2.8m',
    2,
    1
  )
  const houseAKitchen = createRoom('Kitchen', '20m²', '5m', '4m', '2.8m', 1, 1)
  const houseABathroom = createRoom('Bathroom', '8m²', '4m', '2m', '2.8m', 1, 1)
  const houseAFirstFloor = createFloor('First Floor', '80m²', [
    houseALivingRoom,
    houseAKitchen,
    houseABathroom,
  ])

  const houseAMasterBedroom = createRoom(
    'Master Bedroom',
    '25m²',
    '5m',
    '5m',
    '2.8m',
    2,
    1
  )
  const houseABedroom2 = createRoom(
    'Bedroom 2',
    '16m²',
    '4m',
    '4m',
    '2.8m',
    1,
    1
  )
  const houseABathroom2 = createRoom(
    'Bathroom 2',
    '6m²',
    '3m',
    '2m',
    '2.8m',
    1,
    1
  )
  const houseASecondFloor = createFloor('Second Floor', '75m²', [
    houseAMasterBedroom,
    houseABedroom2,
    houseABathroom2,
  ])

  const houseA = createHouse('House A', '12m', '10m', '6m', [
    houseAFirstFloor,
    houseASecondFloor,
  ])

  // Create House B
  const houseBLivingRoom = createRoom(
    'Living Room',
    '35m²',
    '7m',
    '5m',
    '3m',
    3,
    1
  )
  const houseBKitchen = createRoom('Kitchen', '25m²', '5m', '5m', '3m', 1, 1)
  const houseBDiningRoom = createRoom(
    'Dining Room',
    '20m²',
    '5m',
    '4m',
    '3m',
    2,
    1
  )
  const houseBBathroom = createRoom('Bathroom', '10m²', '5m', '2m', '3m', 1, 1)
  const houseBFirstFloor = createFloor('First Floor', '100m²', [
    houseBLivingRoom,
    houseBKitchen,
    houseBDiningRoom,
    houseBBathroom,
  ])

  const houseBMasterBedroom = createRoom(
    'Master Bedroom',
    '30m²',
    '6m',
    '5m',
    '3m',
    2,
    1
  )
  const houseBBedroom2 = createRoom('Bedroom 2', '20m²', '5m', '4m', '3m', 1, 1)
  const houseBBedroom3 = createRoom(
    'Bedroom 3',
    '18m²',
    '4.5m',
    '4m',
    '3m',
    1,
    1
  )
  const houseBBathroom2 = createRoom(
    'Bathroom 2',
    '8m²',
    '4m',
    '2m',
    '3m',
    1,
    1
  )
  const houseBSecondFloor = createFloor('Second Floor', '95m²', [
    houseBMasterBedroom,
    houseBBedroom2,
    houseBBedroom3,
    houseBBathroom2,
  ])

  const houseB = createHouse('House B', '15m', '12m', '7m', [
    houseBFirstFloor,
    houseBSecondFloor,
  ])

  // Create House C (single floor)
  const houseCLivingRoom = createRoom(
    'Living Room',
    '25m²',
    '5m',
    '5m',
    '2.5m',
    2,
    1
  )
  const houseCKitchen = createRoom('Kitchen', '15m²', '5m', '3m', '2.5m', 1, 1)
  const houseCBedroom = createRoom('Bedroom', '20m²', '5m', '4m', '2.5m', 1, 1)
  const houseCBathroom = createRoom('Bathroom', '8m²', '4m', '2m', '2.5m', 1, 1)
  const houseCFirstFloor = createFloor('Main Floor', '80m²', [
    houseCLivingRoom,
    houseCKitchen,
    houseCBedroom,
    houseCBathroom,
  ])

  const houseC = createHouse('House C', '10m', '8m', '3.5m', [houseCFirstFloor])

  // Create House D (three floors)
  const houseDLivingRoom = createRoom(
    'Living Room',
    '40m²',
    '8m',
    '5m',
    '3m',
    3,
    1
  )
  const houseDKitchen = createRoom('Kitchen', '30m²', '6m', '5m', '3m', 2, 1)
  const houseDDiningRoom = createRoom(
    'Dining Room',
    '25m²',
    '5m',
    '5m',
    '3m',
    2,
    1
  )
  const houseDOffice = createRoom('Office', '15m²', '5m', '3m', '3m', 1, 1)
  const houseDFirstFloor = createFloor('First Floor', '120m²', [
    houseDLivingRoom,
    houseDKitchen,
    houseDDiningRoom,
    houseDOffice,
  ])

  const houseDMasterBedroom = createRoom(
    'Master Bedroom',
    '35m²',
    '7m',
    '5m',
    '3m',
    2,
    1
  )
  const houseDMasterBathroom = createRoom(
    'Master Bathroom',
    '15m²',
    '5m',
    '3m',
    '3m',
    1,
    1
  )
  const houseDGuestRoom = createRoom(
    'Guest Room',
    '25m²',
    '5m',
    '5m',
    '3m',
    1,
    1
  )
  const houseDGuestBathroom = createRoom(
    'Guest Bathroom',
    '10m²',
    '5m',
    '2m',
    '3m',
    1,
    1
  )
  const houseDSecondFloor = createFloor('Second Floor', '110m²', [
    houseDMasterBedroom,
    houseDMasterBathroom,
    houseDGuestRoom,
    houseDGuestBathroom,
  ])

  const houseDChildBedroom1 = createRoom(
    'Child Bedroom 1',
    '20m²',
    '5m',
    '4m',
    '3m',
    1,
    1
  )
  const houseDChildBedroom2 = createRoom(
    'Child Bedroom 2',
    '20m²',
    '5m',
    '4m',
    '3m',
    1,
    1
  )
  const houseDPlayroom = createRoom('Playroom', '30m²', '6m', '5m', '3m', 2, 1)
  const houseDThirdFloor = createFloor('Third Floor', '90m²', [
    houseDChildBedroom1,
    houseDChildBedroom2,
    houseDPlayroom,
  ])

  const houseD = createHouse('House D', '18m', '15m', '10m', [
    houseDFirstFloor,
    houseDSecondFloor,
    houseDThirdFloor,
  ])

  // Create House E (modern design)
  const houseELivingArea = createRoom(
    'Open Living Area',
    '60m²',
    '10m',
    '6m',
    '3.5m',
    4,
    1
  )
  const houseEKitchen = createRoom('Kitchen', '20m²', '5m', '4m', '3.5m', 1, 0)
  const houseEBathroom = createRoom(
    'Bathroom',
    '10m²',
    '5m',
    '2m',
    '3.5m',
    1,
    1
  )
  const houseEFirstFloor = createFloor('Main Floor', '100m²', [
    houseELivingArea,
    houseEKitchen,
    houseEBathroom,
  ])

  const houseEMasterSuite = createRoom(
    'Master Suite',
    '40m²',
    '8m',
    '5m',
    '3.5m',
    3,
    1
  )
  const houseEBedroom2 = createRoom(
    'Bedroom 2',
    '25m²',
    '5m',
    '5m',
    '3.5m',
    2,
    1
  )
  const houseEBathroom2 = createRoom(
    'Bathroom 2',
    '15m²',
    '5m',
    '3m',
    '3.5m',
    1,
    1
  )
  const houseESecondFloor = createFloor('Upper Floor', '90m²', [
    houseEMasterSuite,
    houseEBedroom2,
    houseEBathroom2,
  ])

  const houseE = createHouse('House E', '14m', '12m', '7.5m', [
    houseEFirstFloor,
    houseESecondFloor,
  ])

  return [houseA, houseB, houseC, houseD, houseE]
}

// Create process/material data
export const generateProcessData = () => {
  let idCounter = 1

  // Helper function to create a material/process
  const createMaterial = (
    name: string,
    unit: string,
    quantity: string,
    inputs: any[] = [],
    outputs: any[] = []
  ) => {
    const uuid = generateDemoUUID(100 + idCounter++)
    return {
      uuid,
      name,
      creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
      ).toISOString(),
      isDeleted: false,
      properties: [
        {
          uuid: generateDemoUUID(idCounter++),
          key: 'unit',
          creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
          ).toISOString(),
          files: [],
          values: [
            {
              uuid: generateDemoUUID(idCounter++),
              value: unit,
              creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
              createdAt: new Date(
                Date.now() -
                  Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() -
                  Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
              ).toISOString(),
              files: [],
            },
          ],
        },
        {
          uuid: generateDemoUUID(idCounter++),
          key: 'quantity',
          creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
          ).toISOString(),
          files: [],
          values: [
            {
              uuid: generateDemoUUID(idCounter++),
              value: quantity,
              creator: idCounter % 3 === 0 ? 'Jane Smith' : 'John Doe',
              createdAt: new Date(
                Date.now() -
                  Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() -
                  Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
              ).toISOString(),
              files: [],
            },
          ],
        },
      ],
      files: [],
      inputs,
      outputs,
    }
  }

  // Basic materials
  const water = createMaterial('Water', 'liters', '5000')
  const cement = createMaterial('Cement', 'kg', '2000')
  const sand = createMaterial('Sand', 'tonnes', '4')
  const crushedStone = createMaterial('Crushed Stone', 'tonnes', '6')
  const steel = createMaterial('Steel Rebar', 'tonnes', '1.5')
  const wood = createMaterial('Wood', 'm³', '8')
  const glass = createMaterial('Glass', 'm²', '50')
  const paint = createMaterial('Paint', 'liters', '200')
  const insulation = createMaterial('Insulation', 'm²', '300')
  const bricks = createMaterial('Bricks', 'piece', '5000')
  const tiles = createMaterial('Tiles', 'm²', '120')

  // Processed materials
  const concrete = createMaterial('Concrete', 'm³', '15', [
    { uuid: water.uuid, name: water.name, process: 'Mix' },
    { uuid: cement.uuid, name: cement.name, process: 'Mix' },
    { uuid: sand.uuid, name: sand.name, process: 'Mix' },
    { uuid: crushedStone.uuid, name: crushedStone.name, process: 'Mix' },
  ])

  const mortar = createMaterial('Mortar', 'm³', '3', [
    { uuid: water.uuid, name: water.name, process: 'Mix' },
    { uuid: cement.uuid, name: cement.name, process: 'Mix' },
    { uuid: sand.uuid, name: sand.name, process: 'Mix' },
  ])

  // Update outputs for basic materials
  water.outputs = [
    { uuid: concrete.uuid, name: concrete.name, process: 'Mix' },
    { uuid: mortar.uuid, name: mortar.name, process: 'Mix' },
  ]

  cement.outputs = [
    { uuid: concrete.uuid, name: concrete.name, process: 'Mix' },
    { uuid: mortar.uuid, name: mortar.name, process: 'Mix' },
  ]

  sand.outputs = [
    { uuid: concrete.uuid, name: concrete.name, process: 'Mix' },
    { uuid: mortar.uuid, name: mortar.name, process: 'Mix' },
  ]

  crushedStone.outputs = [
    { uuid: concrete.uuid, name: concrete.name, process: 'Mix' },
  ]

  // Building components
  const foundation = createMaterial('Foundation', 'piece', '5', [
    { uuid: concrete.uuid, name: concrete.name, process: 'Pour' },
    { uuid: steel.uuid, name: steel.name, process: 'Pour' },
  ])

  const walls = createMaterial('Walls', 'm²', '500', [
    { uuid: bricks.uuid, name: bricks.name, process: 'Pour' },
    { uuid: mortar.uuid, name: mortar.name, process: 'Pour' },
    { uuid: insulation.uuid, name: insulation.name, process: 'Pour' },
  ])

  const windows = createMaterial('Windows', 'piece', '30', [
    { uuid: glass.uuid, name: glass.name, process: 'Pour' },
    { uuid: wood.uuid, name: wood.name, process: 'Pour' },
  ])

  const floors = createMaterial('Floors', 'm²', '300', [
    { uuid: concrete.uuid, name: concrete.name, process: 'Pour' },
    { uuid: tiles.uuid, name: tiles.name, process: 'Pour' },
  ])

  // Update outputs for processed materials
  concrete.outputs = [
    { uuid: foundation.uuid, name: foundation.name, process: 'Pour' },
    { uuid: floors.uuid, name: floors.name, process: 'Pour' },
  ]

  mortar.outputs = [{ uuid: walls.uuid, name: walls.name, process: 'Pour' }]

  // Update outputs for other materials
  steel.outputs = [
    { uuid: foundation.uuid, name: foundation.name, process: 'Pour' },
  ]

  bricks.outputs = [{ uuid: walls.uuid, name: walls.name, process: 'Pour' }]

  glass.outputs = [{ uuid: windows.uuid, name: windows.name, process: 'Pour' }]

  wood.outputs = [{ uuid: windows.uuid, name: windows.name, process: 'Pour' }]

  insulation.outputs = [{ uuid: walls.uuid, name: walls.name, process: 'Pour' }]

  tiles.outputs = [{ uuid: floors.uuid, name: floors.name, process: 'Pour' }]

  return [
    water,
    cement,
    sand,
    crushedStone,
    steel,
    wood,
    glass,
    paint,
    insulation,
    bricks,
    tiles,
    concrete,
    mortar,
    foundation,
    walls,
    windows,
    floors,
  ]
}

// Export the initial data
export const objectsData = generateObjectsData()
export const processData = generateProcessData()
