import { generateUUIDv7 } from './utils'
import { hotelModelsData } from './hotel-models'

// Helper function to find model UUID by name
const getModelUuidByName = (name: string) => {
  const model = hotelModelsData.find((model) => model.name === name)
  return model?.uuid || null
}

// Generate a complex hotel structure
export const generateHotelData = () => {
  // ===== Helper functions =====

  // Create a single property with a single value
  const createProperty = (key: string, value: string) => {
    return {
      uuid: generateUUIDv7(),
      key,
      values: [
        {
          uuid: generateUUIDv7(),
          value,
          files: [],
        },
      ],
      files: [],
    }
  }

  // Create an object
  const createObject = (
    name: string,
    properties: any[],
    children: any[] = [],
    modelName?: string,
    description?: string,
    version?: string,
    abbreviation?: string
  ) => {
    const modelUuid = modelName ? getModelUuidByName(modelName) : undefined
    const model = modelName
      ? hotelModelsData.find((model) => model.name === modelName)
      : null

    return {
      uuid: generateUUIDv7(),
      name,
      abbreviation:
        abbreviation ||
        model?.abbreviation ||
        name.substring(0, 2).toUpperCase(),
      description: description || model?.description || `${name} component`,
      version: version || model?.version || '1.0',
      properties,
      children,
      modelUuid,
      files: [],
      creator: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // ===== Technology & Amenity Creation =====
  const createRoomTechnology = (name: string, type: string, room: string) => {
    return createObject(
      name,
      [
        createProperty('Technology Type', type),
        createProperty(
          'Manufacturer',
          type === 'Smart TV'
            ? 'Samsung'
            : type === 'Climate Control'
              ? 'Nest'
              : 'SmartHome Inc'
        ),
        createProperty(
          'Model',
          type === 'Smart TV'
            ? 'QE55Q80T'
            : type === 'Climate Control'
              ? 'Learning Thermostat'
              : 'SH-2000'
        ),
        createProperty('Installation Date', '2021-06-15'),
        createProperty('Warranty Expiration', '2026-06-15'),
      ],
      [],
      'Room Technology',
      '',
      '',
      ''
    )
  }

  const createRoomAmenity = (
    name: string,
    type: string,
    brand: string,
    room: string
  ) => {
    return createObject(
      name,
      [
        createProperty('Amenity Type', type),
        createProperty('Brand', brand),
        createProperty('Description', `Premium ${type} for guest use`),
        createProperty(
          'Replacement Schedule',
          'Daily' + (type === 'Toiletries' ? ' or upon request' : '')
        ),
      ],
      [],
      'Room Amenity',
      '',
      '',
      ''
    )
  }

  // ===== Furniture Items =====
  const createFurnitureItem = (
    name: string,
    type: string,
    material: string,
    dimensions: string
  ) => {
    return createObject(
      name,
      [
        createProperty('Item Type', type),
        createProperty('Material', material),
        createProperty('Dimensions', dimensions),
        createProperty('Manufacturer', 'Furniture Corp'),
        createProperty('Year Purchased', '2022'),
        createProperty('Version', '1.0'),
        createProperty('Warranty', '5 years'),
        createProperty('Country of Origin', 'Italy'),
        createProperty('Assembly Required', 'No'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )
  }

  // ===== Bathroom Fixtures =====
  const createBathroom = (
    name: string,
    type: string,
    size: string,
    fixtures: string
  ) => {
    // Create fixtures
    const toilet = createFurnitureItem(
      'Toilet',
      'Toilet',
      'Porcelain',
      '700x400x800mm'
    )

    const sink = createFurnitureItem(
      'Sink',
      'Sink',
      'Porcelain with Chrome Fixtures',
      '600x450x850mm'
    )

    let bathtubOrShower
    if (fixtures.includes('Bathtub')) {
      bathtubOrShower = createFurnitureItem(
        'Bathtub',
        'Bathtub',
        'Acrylic',
        '1700x750x550mm'
      )
    } else {
      bathtubOrShower = createFurnitureItem(
        'Shower Cabin',
        'Shower',
        'Glass and Chrome',
        '900x900x2000mm'
      )
    }

    // Create plumbing system
    const plumbing = createObject(
      'Plumbing System',
      [
        createProperty('System Type', 'Hot and Cold Water Supply'),
        createProperty('Material', 'Copper and PVC'),
        createProperty('Installation Date', '2021-04-10'),
        createProperty('Service Area', name),
        createProperty('Maintenance Schedule', 'Annual Inspection'),
        createProperty('Version', '1.2'),
        createProperty('Manufacturer', 'PlumbTech Solutions'),
        createProperty('Installation Contractor', 'BuildRight Plumbing Inc.'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    // Add water fixtures as children of plumbing system
    const waterHeater = createObject(
      'Water Heater',
      [
        createProperty('Type', 'Tankless'),
        createProperty('Capacity', '12 L/min'),
        createProperty('Energy Source', 'Electric'),
        createProperty('Power Rating', '18 kW'),
        createProperty('Manufacturer', 'AquaHeat'),
        createProperty('Model', 'AH-3500E'),
        createProperty('Installation Date', '2021-04-12'),
        createProperty('Warranty', '10 years'),
        createProperty('Efficiency Rating', 'A+'),
        createProperty('Version', '2.1'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    const shutoffValve = createObject(
      'Shutoff Valve',
      [
        createProperty('Type', 'Quarter-Turn Ball Valve'),
        createProperty('Material', 'Brass'),
        createProperty('Size', '19mm'),
        createProperty('Pressure Rating', '16 bar'),
        createProperty('Manufacturer', 'FlowControl'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    const drainSystem = createObject(
      'Drain System',
      [
        createProperty('Type', 'PVC Drainage'),
        createProperty('Pipe Diameter', '50mm'),
        createProperty('Configuration', 'P-Trap'),
        createProperty('Material', 'PVC'),
        createProperty('Installation Date', '2021-04-11'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    // Add components to drain system (additional level)
    const pTrap = createObject(
      'P-Trap',
      [
        createProperty('Material', 'PVC'),
        createProperty('Size', '50mm'),
        createProperty('Type', 'Floor Drain'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    const cleanout = createObject(
      'Cleanout',
      [
        createProperty('Material', 'PVC'),
        createProperty('Access Type', 'Screw Cap'),
        createProperty('Location', 'Floor Level'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Plumbing System',
      '',
      '',
      ''
    )

    // Add components to drain system
    drainSystem.children = [pTrap, cleanout]

    // Add water fixtures to plumbing
    plumbing.children = [waterHeater, shutoffValve, drainSystem]

    // Create amenities for luxury bathrooms
    const amenities: ReturnType<typeof createObject>[] = []
    if (type === 'Luxury') {
      amenities.push(
        createRoomAmenity(
          'Premium Toiletries',
          'Toiletries',
          "L'Occitane",
          name
        ),
        createRoomAmenity('Bathrobes', 'Bathrobe', 'Egyptian Cotton', name),
        createRoomAmenity('Slippers', 'Slippers', 'Premium Spa', name)
      )
    }

    // Add fixture components (creating deeper hierarchy)
    const sinkComponents = []
    const sinkFaucet = createObject(
      'Faucet',
      [
        createProperty('Type', 'Mixer Tap'),
        createProperty('Finish', 'Chrome'),
        createProperty('Style', 'Modern'),
        createProperty('Flow Rate', '8 L/min'),
        createProperty('Material', 'Brass with Chrome Plating'),
        createProperty('Manufacturer', 'LuxTaps'),
        createProperty('Water Saving', 'Yes'),
        createProperty('Version', '2.5'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const sinkDrain = createObject(
      'Sink Drain',
      [
        createProperty('Type', 'Pop-up'),
        createProperty('Material', 'Stainless Steel'),
        createProperty('Finish', 'Chrome'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    // Add components to sink
    sinkComponents.push(sinkFaucet, sinkDrain)
    sink.children = sinkComponents

    // Add components to toilet (creating deeper hierarchy)
    const toiletComponents = []
    const flushSystem = createObject(
      'Flush System',
      [
        createProperty('Type', 'Dual Flush'),
        createProperty('Water Usage', '3/6L'),
        createProperty('Mechanism', 'Button Actuated'),
        createProperty('Material', 'Plastic'),
        createProperty('Manufacturer', 'EcoFlush'),
        createProperty('Energy Rating', 'A'),
        createProperty('Version', '3.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const toiletSeat = createObject(
      'Toilet Seat',
      [
        createProperty('Material', 'Polypropylene'),
        createProperty('Type', 'Soft Close'),
        createProperty('Color', 'White'),
        createProperty('Removable', 'Yes'),
        createProperty('Version', '2.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    toiletComponents.push(flushSystem, toiletSeat)
    toilet.children = toiletComponents

    // Create bathroom
    return createObject(
      name,
      [
        createProperty('Bathroom Type', type),
        createProperty('Size', size),
        createProperty('Fixtures', fixtures),
        createProperty('Flooring Material', 'Ceramic Tile'),
        createProperty('Wall Material', 'Ceramic Tile and Glass'),
        createProperty('Version', '2.0'),
        createProperty('Designer', 'Interior Solutions Ltd'),
        createProperty('Renovation Date', '2021-03'),
        createProperty(
          'Color Scheme',
          type === 'Luxury'
            ? 'Neutral Beige with Gold Accents'
            : 'White and Light Gray'
        ),
        createProperty(
          'Ventilation',
          'Mechanical Exhaust Fan with Humidity Sensor'
        ),
      ],
      [toilet, sink, bathtubOrShower, plumbing, ...amenities],
      'Bathroom',
      '',
      '',
      ''
    )
  }

  // ===== Room Creation =====
  const createHotelRoom = (
    name: string,
    roomNumber: string,
    area: string,
    bedType: string,
    maxOccupancy: string,
    viewType: string,
    modelName: string,
    hasMasterBathroom: boolean = false
  ) => {
    // Create bathroom with simplified naming
    const bathroom = createBathroom(
      'Bathroom',
      modelName === 'Suite' ? 'Luxury' : 'Standard',
      modelName === 'Suite' ? '8 sqm' : '6 sqm',
      modelName === 'Suite'
        ? 'Toilet, Sink, Bathtub, Bidet'
        : 'Toilet, Sink, Shower'
    )

    // Create furniture with simplified naming
    const bed = createFurnitureItem(
      'Bed',
      bedType,
      'Wood and Fabric',
      bedType === 'King'
        ? '200x200cm'
        : bedType === 'Queen'
          ? '180x200cm'
          : '90x200cm'
    )

    // Add mattress and bedding as children of bed (deeper hierarchy)
    const mattress = createObject(
      'Mattress',
      [
        createProperty('Type', 'Memory Foam'),
        createProperty('Thickness', '25cm'),
        createProperty('Firmness', 'Medium-Firm'),
        createProperty('Brand', 'SleepWell'),
        createProperty('Material', 'High-Density Foam with Cooling Gel Layer'),
        createProperty('Warranty', '10 years'),
        createProperty('Hypoallergenic', 'Yes'),
        createProperty('Version', '4.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const bedding = createObject(
      'Bedding',
      [
        createProperty('Thread Count', '400'),
        createProperty('Material', '100% Egyptian Cotton'),
        createProperty('Color', 'White'),
        createProperty('Pieces', 'Duvet, 4 Pillows, Sheets'),
        createProperty('Manufacturer', 'LuxLinen'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const bedFrame = createObject(
      'Bed Frame',
      [
        createProperty('Material', 'Solid Oak'),
        createProperty('Style', 'Platform'),
        createProperty('Color', 'Dark Walnut'),
        createProperty('Features', 'Integrated Storage'),
        createProperty('Manufacturer', 'FurniCraft'),
        createProperty('Version', '2.1'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    // Add components to bed
    bed.children = [mattress, bedding, bedFrame]

    const wardrobe = createFurnitureItem(
      'Wardrobe',
      'Wardrobe',
      'Wood and Metal',
      '120x60x200cm'
    )

    // Add components to wardrobe (deeper hierarchy)
    const wardrobeComponents = []
    const hangingRail = createObject(
      'Hanging Rail',
      [
        createProperty('Material', 'Stainless Steel'),
        createProperty('Length', '100cm'),
        createProperty('Capacity', '25kg'),
        createProperty('Type', 'Adjustable'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const drawers = createObject(
      'Drawers',
      [
        createProperty('Count', '3'),
        createProperty('Material', 'Oak Veneer'),
        createProperty('Slide Type', 'Soft Close'),
        createProperty('Handle Type', 'Recessed'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const mirror = createObject(
      'Wardrobe Mirror',
      [
        createProperty('Type', 'Full Length'),
        createProperty('Material', 'Glass with Wood Frame'),
        createProperty('Dimensions', '40x150cm'),
        createProperty('Mounting', 'Interior Door'),
        createProperty('Version', '1.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    wardrobeComponents.push(hangingRail, drawers, mirror)
    wardrobe.children = wardrobeComponents

    const desk = createFurnitureItem(
      'Desk',
      'Desk',
      'Wood and Metal',
      '100x60x75cm'
    )

    // Add components to desk (deeper hierarchy)
    const deskComponents = []
    const deskLamp = createObject(
      'Desk Lamp',
      [
        createProperty('Type', 'LED Task Light'),
        createProperty('Color Temperature', '3000K-5000K Adjustable'),
        createProperty('Power', '8W'),
        createProperty('Material', 'Aluminum'),
        createProperty('Adjustable', 'Yes'),
        createProperty('Version', '2.0'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    const deskChair = createObject(
      'Chair',
      [
        createProperty('Type', 'Office Chair'),
        createProperty('Material', 'Fabric and Mesh'),
        createProperty('Color', 'Dark Gray'),
        createProperty('Adjustable', 'Height and Tilt'),
        createProperty('Version', '1.5'),
      ],
      [],
      'Furniture Item',
      '',
      '',
      ''
    )

    deskComponents.push(deskLamp, deskChair)
    desk.children = deskComponents

    const tv = createFurnitureItem(
      'Television',
      'Television',
      'Electronic',
      '55 inch LED'
    )

    // Create technology with simplified naming
    const smartTV = createRoomTechnology('Smart TV', 'Smart TV', '')
    const climateControl = createRoomTechnology(
      'Climate Control',
      'Climate Control',
      ''
    )
    const soundSystem =
      modelName !== 'Standard Room'
        ? createRoomTechnology('Sound System', 'Sound System', '')
        : null

    // Create electrical system with simplified naming
    const electrical = createObject(
      'Electrical System',
      [
        createProperty('System Type', 'Room Power Distribution'),
        createProperty('Capacity', '32A'),
        createProperty('Installation Date', '2021-04-15'),
        createProperty('Service Area', name),
        createProperty('Backup Systems', 'Emergency Generator Backup'),
        createProperty('Version', '2.0'),
        createProperty('Certification', 'ISO 9001:2015'),
        createProperty('Last Inspection', '2023-03-10'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    // Add electrical components (deeper hierarchy)
    const electricalComponents = []
    const mainPanel = createObject(
      'Distribution Panel',
      [
        createProperty('Type', 'Consumer Unit'),
        createProperty('Circuits', '8'),
        createProperty('Rating', '32A'),
        createProperty('Manufacturer', 'ElectraSafe'),
        createProperty('Protection', 'RCBO per Circuit'),
        createProperty('Version', '3.0'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    const outlets = createObject(
      'Power Outlets',
      [
        createProperty('Count', '12'),
        createProperty('Type', 'Type F Schuko'),
        createProperty('Rating', '16A'),
        createProperty('Features', 'USB Charging Ports'),
        createProperty('Version', '2.0'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    const lighting = createObject(
      'Lighting System',
      [
        createProperty('Type', 'LED Recessed'),
        createProperty('Control', 'Smart Dimmer'),
        createProperty('Count', '8 Fixtures'),
        createProperty('Color Temperature', 'Adjustable 2700K-5000K'),
        createProperty('Manufacturer', 'LumaTech'),
        createProperty('Version', '2.5'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    // Add additional level to lighting system
    const lightingControls = createObject(
      'Lighting Controls',
      [
        createProperty('Type', 'Smart Switch'),
        createProperty('Protocol', 'Zigbee'),
        createProperty('Manufacturer', 'SmartLife'),
        createProperty('Features', 'Voice Control, App Control, Scheduling'),
        createProperty('Version', '3.1'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    const lightFixtures = createObject(
      'Light Fixtures',
      [
        createProperty('Type', 'Recessed Downlight'),
        createProperty('Count', '8'),
        createProperty('Wattage', '9W each'),
        createProperty('Beam Angle', '120 degrees'),
        createProperty('Dimmable', 'Yes'),
        createProperty('Version', '2.0'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    lighting.children = [lightingControls, lightFixtures]
    electricalComponents.push(mainPanel, outlets, lighting)
    electrical.children = electricalComponents

    // Create security system with simplified naming
    const security = createObject(
      'Security System',
      [
        createProperty('System Type', 'Electronic Door Lock'),
        createProperty('Coverage Area', name),
        createProperty('Manufacturer', 'SecuTech'),
        createProperty('Installation Date', '2021-05-20'),
        createProperty('Maintenance Schedule', 'Bi-annual Check'),
        createProperty('Version', '2.1'),
        createProperty('Access Control', 'RFID Card + Mobile App'),
        createProperty('Monitoring', '24/7 Central Station'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )

    // Add security components (deeper hierarchy)
    const securityComponents = []
    const doorLock = createObject(
      'Electronic Lock',
      [
        createProperty('Type', 'RFID Card Lock'),
        createProperty('Brand', 'SecurEntryPro'),
        createProperty('Features', 'Mobile App Control, Emergency Override'),
        createProperty('Battery Life', '12 months'),
        createProperty('Audit Trail', 'Yes - 1000 events'),
        createProperty('Version', '4.2'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )

    const motionSensor = createObject(
      'Motion Sensor',
      [
        createProperty('Type', 'PIR'),
        createProperty('Coverage', '8m range, 110° angle'),
        createProperty('Mounting', 'Ceiling'),
        createProperty('Connectivity', 'Wireless - Z-Wave'),
        createProperty('Battery', 'CR123A'),
        createProperty('Version', '2.0'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )

    const safeBox = createObject(
      'Room Safe',
      [
        createProperty('Type', 'Electronic In-Room Safe'),
        createProperty('Size', '40x35x20cm'),
        createProperty('Lock Type', 'Digital PIN + Emergency Key'),
        createProperty('Material', 'Steel'),
        createProperty('Mounting', 'Floor or Wall'),
        createProperty('Version', '3.0'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )

    securityComponents.push(doorLock, motionSensor, safeBox)
    security.children = securityComponents

    // Additional items for deluxe and suites
    const additionalItems = []

    if (modelName === 'Deluxe Room' || modelName === 'Suite') {
      additionalItems.push(
        createFurnitureItem('Minibar', 'Minibar', 'Electronic', '60x50x80cm'),
        createFurnitureItem(
          'Sofa',
          'Sofa',
          'Fabric',
          modelName === 'Suite' ? '220x90x85cm' : '180x80x85cm'
        ),
        createRoomAmenity(
          'Premium Amenities',
          'Toiletries Kit',
          'Luxury Brand',
          ''
        ),
        createRoomAmenity('Bathrobe', 'Bathrobe', 'Egyptian Cotton', '')
      )

      // Add sofa components (deeper hierarchy)
      const sofa = additionalItems.find((item) => item.name === 'Sofa')
      if (sofa) {
        const sofaComponents = []
        const sofaCushions = createObject(
          'Sofa Cushions',
          [
            createProperty('Count', '4'),
            createProperty('Material', 'High-Density Foam with Down Topper'),
            createProperty('Cover', 'Removable, Washable'),
            createProperty('Color', 'Neutral Beige'),
            createProperty('Version', '1.0'),
          ],
          [],
          'Furniture Item',
          '',
          '',
          ''
        )

        const sofaFrame = createObject(
          'Sofa Frame',
          [
            createProperty('Material', 'Hardwood'),
            createProperty('Construction', 'Kiln-Dried Engineered Wood'),
            createProperty('Warranty', '10 years'),
            createProperty('Version', '1.0'),
          ],
          [],
          'Furniture Item',
          '',
          '',
          ''
        )

        sofaComponents.push(sofaCushions, sofaFrame)
        sofa.children = sofaComponents
      }
    }

    // Master bathroom for suites
    if (hasMasterBathroom) {
      const masterBathroom = createBathroom(
        'Master Bathroom',
        'Luxury',
        '10 sqm',
        'Toilet, Sink, Bathtub, Shower, Bidet'
      )
      additionalItems.push(masterBathroom)
    }

    // Room specific properties
    const properties = [
      createProperty('Room Number', roomNumber),
      createProperty('Room Area', area),
      createProperty('Bed Type', bedType),
      createProperty('Max Occupancy', maxOccupancy),
      createProperty('View Type', viewType),
      createProperty(
        'Version',
        modelName === 'Suite'
          ? '3.0'
          : modelName === 'Deluxe Room'
            ? '2.5'
            : '2.0'
      ),
      createProperty('Last Renovation', '2021-02'),
      createProperty(
        'Sound Insulation',
        modelName === 'Suite' ? 'Premium' : 'Standard'
      ),
      createProperty('Ceiling Height', '2.7m'),
      createProperty('Internet', 'High-Speed Wi-Fi (200 Mbps)'),
    ]

    // Add premium features for deluxe rooms
    if (modelName === 'Deluxe Room') {
      properties.push(
        createProperty(
          'Premium Features',
          'Minibar, Bathrobe, Premium Toiletries'
        )
      )
    }

    // Add special features for suites
    if (modelName === 'Suite') {
      properties.push(createProperty('Bedrooms', '1'))
      properties.push(
        createProperty('Bathrooms', hasMasterBathroom ? '2' : '1')
      )
      properties.push(
        createProperty(
          'Special Features',
          'Separate Living Area, Premium Amenities, Welcome Champagne'
        )
      )
    }

    // Combine all children
    const allChildren = [
      bathroom,
      bed,
      wardrobe,
      desk,
      tv,
      smartTV,
      climateControl,
      electrical,
      security,
      ...(soundSystem ? [soundSystem] : []),
      ...additionalItems,
    ]

    // Create room
    return createObject(name, properties, allChildren, modelName, '', '', '')
  }

  // ===== Floor Creation =====
  const createHotelFloor = (
    floorNumber: number,
    standardRooms: number,
    deluxeRooms: number,
    suites: number
  ) => {
    const floorChildren = []
    let roomCounter = 1

    // Add standard rooms
    for (let i = 1; i <= standardRooms; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`
      floorChildren.push(
        createHotelRoom(
          `Room ${roomNumber}`,
          roomNumber,
          '28 sqm',
          i % 2 === 0 ? 'Queen' : 'Twin',
          i % 2 === 0 ? '2' : '2',
          floorNumber < 4 ? 'City View' : 'Garden View',
          'Standard Room'
        )
      )
      roomCounter++
    }

    // Add deluxe rooms
    for (let i = 1; i <= deluxeRooms; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`
      floorChildren.push(
        createHotelRoom(
          `Deluxe Room ${roomNumber}`,
          roomNumber,
          '35 sqm',
          'King',
          '2',
          floorNumber < 5 ? 'City View Premium' : 'Sea View',
          'Deluxe Room'
        )
      )
      roomCounter++
    }

    // Add suites
    for (let i = 1; i <= suites; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`
      floorChildren.push(
        createHotelRoom(
          `Suite ${roomNumber}`,
          roomNumber,
          '55 sqm',
          'King',
          '2',
          'Premium Sea View',
          'Suite',
          true // Has master bathroom
        )
      )
      roomCounter++
    }

    // Add elevator access
    const elevatorAccess = createObject(
      `Floor ${floorNumber} Elevator Access`,
      [
        createProperty('Elevator Number', '1, 2, 3'),
        createProperty('Type', 'Main Guest Elevators'),
        createProperty('Access Type', 'Keycard'),
      ],
      [],
      'Elevator',
      '',
      '',
      ''
    )
    floorChildren.push(elevatorAccess)

    // Add service elevator
    const serviceElevator = createObject(
      `Floor ${floorNumber} Service Elevator`,
      [
        createProperty('Elevator Number', 'S1'),
        createProperty('Type', 'Service Elevator'),
        createProperty('Access Type', 'Staff Keycard Only'),
      ],
      [],
      'Elevator',
      '',
      '',
      ''
    )
    floorChildren.push(serviceElevator)

    // Add HVAC units
    const hvacUnit = createObject(
      `Floor ${floorNumber} HVAC Unit`,
      [
        createProperty('Unit Number', `HVAC-F${floorNumber}`),
        createProperty('Type', 'Centralized'),
        createProperty('Capacity', '120 kW'),
        createProperty('Manufacturer', 'ClimaTech'),
        createProperty('Installation Date', '2021-05-10'),
      ],
      [],
      'HVAC Unit',
      '',
      '',
      ''
    )
    floorChildren.push(hvacUnit)

    // Add electrical system
    const electrical = createObject(
      `Floor ${floorNumber} Electrical System`,
      [
        createProperty('System Type', 'Floor Distribution Panel'),
        createProperty('Capacity', '400A'),
        createProperty('Installation Date', '2021-04-05'),
        createProperty('Service Area', `Floor ${floorNumber}`),
        createProperty('Backup Systems', 'Emergency Generator Backup'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )
    floorChildren.push(electrical)

    // Add security system
    const security = createObject(
      `Floor ${floorNumber} Security System`,
      [
        createProperty('System Type', 'CCTV and Access Control'),
        createProperty(
          'Coverage Area',
          `Hallways and Common Areas Floor ${floorNumber}`
        ),
        createProperty('Manufacturer', 'SecuTech'),
        createProperty('Installation Date', '2021-05-15'),
        createProperty('Maintenance Schedule', 'Quarterly Check'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )
    floorChildren.push(security)

    // Create the floor
    return createObject(
      `Floor ${floorNumber}`,
      [
        createProperty('Floor Number', floorNumber.toString()),
        createProperty('Floor Area', '1200 sqm'),
        createProperty(
          'Room Count',
          (standardRooms + deluxeRooms + suites).toString()
        ),
        createProperty('Ceiling Height', '3 m'),
        createProperty('Emergency Exits', '2'),
      ],
      floorChildren,
      'Hotel Floor',
      '',
      '',
      ''
    )
  }

  // ===== Facility Creation =====
  const createFacility = (
    name: string,
    type: string,
    location: string,
    size: string,
    capacity: string
  ) => {
    // Set facility-specific attributes
    let description = `${type} facility for hotel guests`
    let version = '1.5'
    let abbreviation = type.substring(0, 2).toUpperCase()

    if (type === 'Restaurant') {
      description =
        'Fine dining establishment with premium cuisine and bar service'
      version = '2.0'
      abbreviation = 'RES'
    } else if (type === 'Gym') {
      description = 'Fitness facility with modern equipment for guest workouts'
      version = '1.8'
      abbreviation = 'GYM'
    } else if (type === 'Pool') {
      description =
        'Swimming facility with premium amenities and lounging areas'
      version = '2.2'
      abbreviation = 'POL'
    } else if (type === 'Spa') {
      description = 'Wellness center offering massage and relaxation treatments'
      version = '1.9'
      abbreviation = 'SPA'
    } else if (type === 'Conference') {
      description = 'Business meeting space with presentation equipment'
      version = '1.7'
      abbreviation = 'CNF'
    }

    const furnitureItems = []

    // Add facility-specific furniture
    if (type === 'Restaurant') {
      for (let i = 1; i <= 20; i++) {
        furnitureItems.push(
          createFurnitureItem(
            `${name} Table ${i}`,
            'Dining Table',
            'Wood',
            '120x80x75cm'
          )
        )
      }

      furnitureItems.push(
        createFurnitureItem(
          `${name} Bar Counter`,
          'Bar Counter',
          'Marble and Wood',
          '500x80x110cm'
        )
      )
    } else if (type === 'Gym') {
      const gymEquipment = [
        'Treadmill',
        'Elliptical Trainer',
        'Stationary Bike',
        'Weight Bench',
        'Multi Gym Machine',
        'Free Weights Rack',
      ]

      gymEquipment.forEach((item, i) => {
        furnitureItems.push(
          createFurnitureItem(
            `${name} ${item}`,
            item,
            'Metal and Plastic',
            'Various'
          )
        )
      })
    } else if (type === 'Pool') {
      furnitureItems.push(
        createFurnitureItem(
          `${name} Pool Loungers`,
          'Loungers',
          'Metal and Fabric',
          '200x65x40cm'
        ),
        createFurnitureItem(
          `${name} Pool Bar`,
          'Bar Counter',
          'Tile and Stainless Steel',
          '300x80x110cm'
        )
      )
    }

    // Add systems for the facility
    const hvac = createObject(
      `${name} HVAC System`,
      [
        createProperty(
          'Unit Number',
          `HVAC-${type.substring(0, 2).toUpperCase()}`
        ),
        createProperty('Type', 'Dedicated Facility System'),
        createProperty(
          'Capacity',
          type === 'Restaurant'
            ? '100 kW'
            : type === 'Pool'
              ? '150 kW'
              : '80 kW'
        ),
        createProperty('Manufacturer', 'ClimaTech'),
        createProperty('Installation Date', '2021-05-05'),
      ],
      [],
      'HVAC Unit',
      '',
      '',
      ''
    )

    const electrical = createObject(
      `${name} Electrical System`,
      [
        createProperty('System Type', 'Facility Power Distribution'),
        createProperty(
          'Capacity',
          type === 'Restaurant' ? '250A' : type === 'Pool' ? '300A' : '200A'
        ),
        createProperty('Installation Date', '2021-04-01'),
        createProperty('Service Area', name),
        createProperty('Backup Systems', 'Emergency Generator Backup'),
      ],
      [],
      'Electrical System',
      '',
      '',
      ''
    )

    const security = createObject(
      `${name} Security System`,
      [
        createProperty('System Type', 'CCTV and Access Control'),
        createProperty('Coverage Area', name),
        createProperty('Manufacturer', 'SecuTech'),
        createProperty('Installation Date', '2021-05-12'),
        createProperty('Maintenance Schedule', 'Quarterly Check'),
      ],
      [],
      'Security System',
      '',
      '',
      ''
    )

    if (type === 'Pool') {
      const plumbing = createObject(
        `${name} Plumbing System`,
        [
          createProperty('System Type', 'Pool Filtration and Water Management'),
          createProperty('Material', 'PVC and Stainless Steel'),
          createProperty('Installation Date', '2021-04-08'),
          createProperty('Service Area', name),
          createProperty('Maintenance Schedule', 'Weekly Check'),
        ],
        [],
        'Plumbing System',
        '',
        '',
        ''
      )
      furnitureItems.push(plumbing)
    }

    // Create the facility
    return createObject(
      name,
      [
        createProperty('Facility Type', type),
        createProperty('Location', location),
        createProperty('Size', size),
        createProperty('Capacity', capacity),
        createProperty(
          'Opening Hours',
          type === 'Pool'
            ? '7:00-22:00'
            : type === 'Restaurant'
              ? '6:30-23:00'
              : '24 hours'
        ),
      ],
      [...furnitureItems, hvac, electrical, security],
      'Facility',
      description,
      version,
      abbreviation
    )
  }

  // ===== Create the Grand Hotel =====

  // Create facilities
  const restaurant = createFacility(
    'The Grand Restaurant',
    'Restaurant',
    'Ground Floor',
    '300 sqm',
    '80 guests'
  )

  const gym = createFacility(
    'Fitness Center',
    'Gym',
    'Lower Ground Floor',
    '150 sqm',
    '30 people'
  )

  const pool = createFacility(
    'Rooftop Infinity Pool',
    'Pool',
    'Rooftop',
    '200 sqm',
    '50 people'
  )

  const spa = createFacility(
    'Wellness Spa',
    'Spa',
    'Lower Ground Floor',
    '180 sqm',
    '20 people'
  )

  const conferenceRoom = createFacility(
    'Business Conference Center',
    'Conference',
    'Mezzanine Floor',
    '250 sqm',
    '100 people'
  )

  // Create hotel floors with varying room configurations
  // Lower floors have more standard rooms, upper floors have more premium rooms
  const floorCount = 12
  const floors = []

  for (let i = 1; i <= floorCount; i++) {
    const standardRooms = i <= 3 ? 16 : i <= 6 ? 12 : i <= 9 ? 10 : 8
    const deluxeRooms = i <= 3 ? 4 : i <= 6 ? 6 : i <= 9 ? 8 : 6
    const suites = i <= 3 ? 0 : i <= 6 ? 2 : i <= 9 ? 2 : i <= 11 ? 3 : 6

    floors.push(createHotelFloor(i, standardRooms, deluxeRooms, suites))
  }

  // Create main elevators
  const mainElevators = createObject(
    'Main Elevators',
    [
      createProperty('Elevator Number', '1, 2, 3'),
      createProperty('Type', 'Passenger'),
      createProperty('Capacity', '1000 kg / 13 persons'),
      createProperty('Manufacturer', 'ElevaTech'),
      createProperty('Installation Date', '2021-03-15'),
    ],
    [],
    'Elevator',
    '',
    '',
    ''
  )

  const serviceElevators = createObject(
    'Service Elevators',
    [
      createProperty('Elevator Number', 'S1, S2'),
      createProperty('Type', 'Service'),
      createProperty('Capacity', '1500 kg / 20 persons'),
      createProperty('Manufacturer', 'ElevaTech'),
      createProperty('Installation Date', '2021-03-15'),
    ],
    [],
    'Elevator',
    '',
    '',
    ''
  )

  const mainHVAC = createObject(
    'Main HVAC System',
    [
      createProperty('Unit Number', 'HVAC-MAIN'),
      createProperty('Type', 'Centralized Building System'),
      createProperty('Capacity', '1200 kW'),
      createProperty('Manufacturer', 'ClimaTech'),
      createProperty('Installation Date', '2021-04-10'),
    ],
    [],
    'HVAC Unit',
    '',
    '',
    ''
  )

  const mainElectrical = createObject(
    'Main Electrical System',
    [
      createProperty('System Type', 'Building Electrical Distribution'),
      createProperty('Capacity', '2000A, 3-phase'),
      createProperty('Installation Date', '2021-03-20'),
      createProperty('Service Area', 'Entire Building'),
      createProperty('Backup Systems', 'Diesel Generator, 800kW'),
    ],
    [],
    'Electrical System',
    '',
    '',
    ''
  )

  const mainPlumbing = createObject(
    'Main Plumbing System',
    [
      createProperty('System Type', 'Building Water Supply and Drainage'),
      createProperty('Material', 'Copper, PVC, Cast Iron'),
      createProperty('Installation Date', '2021-03-25'),
      createProperty('Service Area', 'Entire Building'),
      createProperty('Maintenance Schedule', 'Quarterly Inspection'),
    ],
    [],
    'Plumbing System',
    '',
    '',
    ''
  )

  const mainSecurity = createObject(
    'Building Security System',
    [
      createProperty('System Type', 'Integrated Building Security'),
      createProperty('Coverage Area', 'All Public Areas and Access Points'),
      createProperty('Manufacturer', 'SecuTech Enterprise'),
      createProperty('Installation Date', '2021-05-01'),
      createProperty('Maintenance Schedule', 'Monthly Check'),
    ],
    [],
    'Security System',
    '',
    '',
    ''
  )

  // Create the Grand Hotel
  return createObject(
    'The Grand Hotel',
    [
      createProperty('Total Floors', floorCount.toString()),
      createProperty('Building Height', '52 m'),
      createProperty('Construction Year', '2021'),
      createProperty('Building Class', 'Luxury'),
      createProperty('Energy Rating', 'A'),
      createProperty('Total Rooms', '204'),
      createProperty('Standard Rooms', '132'),
      createProperty('Deluxe Rooms', '54'),
      createProperty('Suites', '18'),
    ],
    [
      ...floors,
      restaurant,
      gym,
      pool,
      spa,
      conferenceRoom,
      mainElevators,
      serviceElevators,
      mainHVAC,
      mainElectrical,
      mainPlumbing,
      mainSecurity,
    ],
    'Hotel Building',
    'Luxury hotel with 12 floors containing guest rooms and premium facilities',
    '2.1',
    'TGH'
  )
}

// Export the hotel data
export const hotelData = generateHotelData()
