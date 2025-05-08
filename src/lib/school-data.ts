import { generateUUIDv7 } from './utils'
import { schoolModelsData } from './school-models'

// Helper function to find model UUID by name
const getModelUuidByName = (name: string) => {
  const model = schoolModelsData.find((model) => model.name === name)
  return model?.uuid || null
}

// Generate a complex school structure
export const generateSchoolData = () => {
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
      ? schoolModelsData.find((model) => model.name === modelName)
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

  // Create a classroom with furniture and equipment
  const createClassroom = (
    name: string,
    roomNumber: string,
    subject: string,
    gradeLevel: string,
    area: string,
    occupancy: string
  ) => {
    // Create furniture
    const desks = []
    const numDesks = parseInt(occupancy)

    for (let i = 1; i <= numDesks; i++) {
      const desk = createObject(
        `Desk ${i}`,
        [
          createProperty('Type', 'Student Desk'),
          createProperty('Material', 'Wood and Metal'),
          createProperty('Dimensions', '60x40x75cm'),
          createProperty('Adjustable', 'No'),
          createProperty('Manufacturer', 'SchoolFurniture Inc.'),
        ],
        [],
        'Desk'
      )

      const chair = createObject(
        `Chair ${i}`,
        [
          createProperty('Type', 'Student Chair'),
          createProperty('Material', 'Plastic and Metal'),
          createProperty('Dimensions', '40x40x45cm'),
          createProperty('Adjustable', 'No'),
          createProperty('Manufacturer', 'SchoolFurniture Inc.'),
        ],
        [],
        'Chair'
      )

      desk.children = [chair]
      desks.push(desk)
    }

    // Create teacher's desk
    const teacherDesk = createObject(
      "Teacher's Desk",
      [
        createProperty('Type', 'Teacher Desk'),
        createProperty('Material', 'Wood and Metal'),
        createProperty('Dimensions', '120x60x75cm'),
        createProperty('Adjustable', 'No'),
        createProperty('Manufacturer', 'SchoolFurniture Inc.'),
      ],
      [],
      'Desk'
    )

    const teacherChair = createObject(
      "Teacher's Chair",
      [
        createProperty('Type', 'Office Chair'),
        createProperty('Material', 'Fabric and Metal'),
        createProperty('Dimensions', '60x60x110cm'),
        createProperty('Adjustable', 'Yes - Height and Tilt'),
        createProperty('Manufacturer', 'OfficePro'),
      ],
      [],
      'Chair'
    )

    teacherDesk.children = [teacherChair]

    // Create educational technology
    const smartboard = createObject(
      'Interactive Whiteboard',
      [
        createProperty('Device Type', 'Smart Board'),
        createProperty('Manufacturer', 'EduTech'),
        createProperty('Model', 'ET-5000'),
        createProperty('Purchase Date', '2022-08-15'),
        createProperty('Warranty', '3 years'),
      ],
      [],
      'Educational Technology'
    )

    const projector = createObject(
      'Projector',
      [
        createProperty('Device Type', 'Ceiling Projector'),
        createProperty('Manufacturer', 'Epson'),
        createProperty('Model', 'EB-685W'),
        createProperty('Purchase Date', '2022-08-15'),
        createProperty('Warranty', '2 years'),
      ],
      [],
      'Educational Technology'
    )

    // Create systems
    const hvac = createObject(
      `${name} HVAC`,
      [
        createProperty('System Type', 'Split Unit'),
        createProperty('Capacity', '9000 BTU'),
        createProperty('Manufacturer', 'Carrier'),
        createProperty('Installation Date', '2021-07-10'),
        createProperty('Energy Efficiency', 'A+'),
      ],
      [],
      'HVAC System'
    )

    const electrical = createObject(
      `${name} Electrical System`,
      [
        createProperty('System Type', 'Classroom Distribution'),
        createProperty('Capacity', '30A'),
        createProperty('Panel Locations', 'North Wall'),
        createProperty('Installation Date', '2021-06-20'),
        createProperty('Last Inspection', '2023-01-15'),
      ],
      [],
      'Electrical System'
    )

    // Create classroom object
    return createObject(
      name,
      [
        createProperty('Room Number', roomNumber),
        createProperty('Room Area', area),
        createProperty('Occupancy', occupancy),
        createProperty('Subject', subject),
        createProperty('Grade Level', gradeLevel),
      ],
      [...desks, teacherDesk, smartboard, projector, hvac, electrical],
      'Classroom'
    )
  }

  // Create a specialized room - science lab
  const createScienceLab = (
    name: string,
    roomNumber: string,
    labType: string,
    area: string,
    occupancy: string,
    safetyFeatures: string
  ) => {
    // Create lab workstations
    const workstations = []
    const numStations = Math.floor(parseInt(occupancy) / 2) // Typically students work in pairs

    for (let i = 1; i <= numStations; i++) {
      const workstation = createObject(
        `Lab Station ${i}`,
        [
          createProperty('Station Type', 'Science Workbench'),
          createProperty('Material', 'Chemical-Resistant Surface'),
          createProperty('Dimensions', '180x80x90cm'),
          createProperty('Features', 'Gas Valve, Sink, Power Outlets'),
          createProperty('Manufacturer', 'LabEquip'),
        ],
        [],
        'Laboratory Equipment'
      )

      // Add equipment to workstation
      const equipment = [
        createObject(
          `Microscope ${i}`,
          [
            createProperty('Equipment Type', 'Binocular Microscope'),
            createProperty('Manufacturer', 'OpticsPlus'),
            createProperty('Model', 'BioView 3000'),
            createProperty('Acquisition Date', '2022-01-15'),
            createProperty('Safety Rating', 'Class 1'),
          ],
          [],
          'Laboratory Equipment'
        ),
        createObject(
          `Bunsen Burner ${i}`,
          [
            createProperty('Equipment Type', 'Gas Burner'),
            createProperty('Manufacturer', 'LabFlame'),
            createProperty('Model', 'BunsenPro'),
            createProperty('Acquisition Date', '2022-01-15'),
            createProperty('Safety Rating', 'Class 2'),
          ],
          [],
          'Laboratory Equipment'
        ),
      ]

      workstation.children = equipment
      workstations.push(workstation)
    }

    // Create safety equipment
    const safetyEquipment = [
      createObject(
        'Emergency Shower',
        [
          createProperty('Equipment Type', 'Safety Shower'),
          createProperty('Manufacturer', 'SafetyFirst'),
          createProperty('Model', 'QuickDrench 500'),
          createProperty('Acquisition Date', '2021-12-10'),
          createProperty('Safety Rating', 'ANSI Z358.1'),
        ],
        [],
        'Laboratory Equipment'
      ),
      createObject(
        'Eyewash Station',
        [
          createProperty('Equipment Type', 'Eye Wash'),
          createProperty('Manufacturer', 'SafetyFirst'),
          createProperty('Model', 'EyeGuard 300'),
          createProperty('Acquisition Date', '2021-12-10'),
          createProperty('Safety Rating', 'ANSI Z358.1'),
        ],
        [],
        'Laboratory Equipment'
      ),
      createObject(
        'Fire Extinguisher',
        [
          createProperty('Equipment Type', 'ABC Dry Chemical'),
          createProperty('Manufacturer', 'FireStop'),
          createProperty('Model', 'TriClass 5kg'),
          createProperty('Acquisition Date', '2021-12-10'),
          createProperty('Safety Rating', 'UL Listed'),
        ],
        [],
        'Laboratory Equipment'
      ),
    ]

    // Create systems
    const ventilation = createObject(
      'Fume Hood System',
      [
        createProperty('System Type', 'Chemical Fume Extraction'),
        createProperty('Capacity', '1000 CFM'),
        createProperty('Manufacturer', 'AirSafe'),
        createProperty('Installation Date', '2021-07-15'),
        createProperty('Last Inspection', '2023-02-10'),
      ],
      [],
      'HVAC System'
    )

    const electrical = createObject(
      `${name} Electrical System`,
      [
        createProperty('System Type', 'Lab Distribution with Emergency Cutoff'),
        createProperty('Capacity', '60A'),
        createProperty('Panel Locations', 'East Wall'),
        createProperty('Installation Date', '2021-06-25'),
        createProperty('Last Inspection', '2023-01-20'),
      ],
      [],
      'Electrical System'
    )

    // Create lab object
    return createObject(
      name,
      [
        createProperty('Room Number', roomNumber),
        createProperty('Room Area', area),
        createProperty('Lab Type', labType),
        createProperty('Occupancy', occupancy),
        createProperty('Safety Features', safetyFeatures),
      ],
      [...workstations, ...safetyEquipment, ventilation, electrical],
      'Science Lab'
    )
  }

  // Create a floor with rooms
  const createSchoolFloor = (
    floorNumber: number,
    standardClassrooms: number,
    scienceLabs: number,
    computerLabs: number
  ) => {
    const floorChildren = []
    let roomCounter = 1

    // Add standard classrooms
    for (let i = 1; i <= standardClassrooms; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`
      const subject = ['Mathematics', 'English', 'History', 'Languages', 'Art'][
        i % 5
      ]
      const gradeLevel = `Grade ${Math.floor(Math.random() * 6) + 7}`

      floorChildren.push(
        createClassroom(
          `Classroom ${roomNumber}`,
          roomNumber,
          subject,
          gradeLevel,
          '50 sqm',
          '25'
        )
      )
      roomCounter++
    }

    // Add science labs
    for (let i = 1; i <= scienceLabs; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`
      const labType = ['Biology', 'Chemistry', 'Physics'][i % 3]

      floorChildren.push(
        createScienceLab(
          `${labType} Lab ${roomNumber}`,
          roomNumber,
          labType,
          '75 sqm',
          '24',
          'Emergency Shower, Eyewash Station, Fire Extinguisher, Gas Shutoff'
        )
      )
      roomCounter++
    }

    // Add computer labs (simplified implementation)
    for (let i = 1; i <= computerLabs; i++) {
      const roomNumber = `${floorNumber}${roomCounter.toString().padStart(2, '0')}`

      const computerLab = createObject(
        `Computer Lab ${roomNumber}`,
        [
          createProperty('Room Number', roomNumber),
          createProperty('Room Area', '65 sqm'),
          createProperty('Workstations', '30'),
          createProperty('Network Type', 'Gigabit Ethernet and WiFi'),
          createProperty(
            'Software',
            'Office Suite, Programming IDEs, Educational Software'
          ),
        ],
        [],
        'Computer Lab'
      )

      // Add workstations (simplified)
      const workstations = []
      for (let j = 1; j <= 30; j++) {
        const workstation = createObject(
          `Computer Workstation ${j}`,
          [
            createProperty('Computer Type', 'Desktop PC'),
            createProperty('Operating System', 'Windows 11 Education'),
            createProperty('Processor', 'Intel i5-12400'),
            createProperty('RAM', '16GB'),
            createProperty('Storage', '512GB SSD'),
          ],
          [],
          'Computer Workstation'
        )
        workstations.push(workstation)
      }

      computerLab.children = workstations
      floorChildren.push(computerLab)
      roomCounter++
    }

    // Add floor systems
    const electrical = createObject(
      `Floor ${floorNumber} Electrical System`,
      [
        createProperty('System Type', 'Floor Distribution Panel'),
        createProperty('Capacity', '200A'),
        createProperty('Installation Date', '2021-05-15'),
        createProperty('Service Area', `Floor ${floorNumber}`),
        createProperty('Last Inspection', '2023-01-05'),
      ],
      [],
      'Electrical System'
    )

    const hvac = createObject(
      `Floor ${floorNumber} HVAC Unit`,
      [
        createProperty('System Type', 'Central Air Handler'),
        createProperty('Capacity', '50 tons'),
        createProperty('Manufacturer', 'Trane'),
        createProperty('Installation Date', '2021-05-20'),
        createProperty('Energy Efficiency', 'SEER 18'),
      ],
      [],
      'HVAC System'
    )

    floorChildren.push(electrical, hvac)

    // Create the floor
    return createObject(
      `Floor ${floorNumber}`,
      [
        createProperty('Floor Number', floorNumber.toString()),
        createProperty('Floor Area', '1000 sqm'),
        createProperty(
          'Room Count',
          (standardClassrooms + scienceLabs + computerLabs).toString()
        ),
        createProperty('Ceiling Height', '3 m'),
        createProperty('Emergency Exits', '4'),
      ],
      floorChildren,
      'School Floor'
    )
  }

  // Create school facilities (simplified)
  const createLibrary = () => {
    return createObject(
      'Main Library',
      [
        createProperty('Size', '300 sqm'),
        createProperty('Book Capacity', '50000'),
        createProperty('Seating Capacity', '100'),
        createProperty(
          'Digital Resources',
          'Online Catalog, E-books, Research Databases'
        ),
        createProperty(
          'Special Collections',
          'Local History, Reference Materials'
        ),
      ],
      [],
      'Library'
    )
  }

  const createGymnasium = () => {
    return createObject(
      'Main Gymnasium',
      [
        createProperty('Size', '800 sqm'),
        createProperty('Floor Type', 'Hardwood'),
        createProperty('Ceiling Height', '8 m'),
        createProperty(
          'Equipment',
          'Basketball Hoops, Volleyball Net, Gymnastics Equipment'
        ),
        createProperty('Spectator Capacity', '300'),
      ],
      [],
      'Gymnasium'
    )
  }

  const createCafeteria = () => {
    return createObject(
      'School Cafeteria',
      [
        createProperty('Size', '500 sqm'),
        createProperty('Seating Capacity', '400'),
        createProperty('Kitchen Size', '150 sqm'),
        createProperty('Serving Stations', '6'),
        createProperty(
          'Special Features',
          'Allergy-Free Zone, Outdoor Seating'
        ),
      ],
      [],
      'Cafeteria'
    )
  }

  const createAdminOffice = () => {
    return createObject(
      'Administration Office',
      [
        createProperty('Office Type', 'Main Administration'),
        createProperty('Room Number', '101'),
        createProperty('Size', '200 sqm'),
        createProperty('Occupancy', '15'),
        createProperty(
          'Equipment',
          'Computers, Printers, Communication Systems'
        ),
      ],
      [],
      'Administrative Office'
    )
  }

  // Generate main school building

  // Create 3 floors with different room configurations
  const floors = [
    createSchoolFloor(1, 10, 3, 2), // Ground floor: 10 classrooms, 3 science labs, 2 computer labs
    createSchoolFloor(2, 12, 2, 1), // Second floor: 12 classrooms, 2 science labs, 1 computer lab
    createSchoolFloor(3, 15, 0, 0), // Third floor: 15 classrooms, no labs
  ]

  // Create main facilities
  const facilities = [
    createLibrary(),
    createGymnasium(),
    createCafeteria(),
    createAdminOffice(),
  ]

  // Create main building systems
  const mainElectrical = createObject(
    'Main Electrical System',
    [
      createProperty('System Type', 'Building Distribution'),
      createProperty('Capacity', '1000A, 3-phase'),
      createProperty('Installation Date', '2021-04-10'),
      createProperty('Service Area', 'Entire Building'),
      createProperty('Last Inspection', '2023-01-01'),
    ],
    [],
    'Electrical System'
  )

  const mainHVAC = createObject(
    'Main HVAC System',
    [
      createProperty('System Type', 'Central Building System'),
      createProperty('Capacity', '200 tons'),
      createProperty('Manufacturer', 'Carrier'),
      createProperty('Installation Date', '2021-04-15'),
      createProperty('Energy Efficiency', 'High Efficiency'),
    ],
    [],
    'HVAC System'
  )

  // Create the main school
  return createObject(
    'Madison High School',
    [
      createProperty('Total Floors', '3'),
      createProperty('Building Height', '15 m'),
      createProperty('Construction Year', '2021'),
      createProperty('Building Class', 'Educational'),
      createProperty('Energy Rating', 'A'),
    ],
    [...floors, ...facilities, mainElectrical, mainHVAC],
    'School Building',
    'Secondary education facility with classrooms, labs, and student facilities',
    '2.0',
    'MHS'
  )
}

// Export the school data
export const schoolData = generateSchoolData()
