// Predefined mix combinations that suggest likely outputs
const mixCombinations = [
  {
    inputs: ['Water', 'Cement'],
    outputs: [
      { name: 'Cement Paste', type: 'Material', unit: 'm³', quantity: 1 },
    ],
  },
  {
    inputs: ['Water', 'Cement', 'Sand'],
    outputs: [{ name: 'Mortar', type: 'Material', unit: 'm³', quantity: 1 }],
  },
  {
    inputs: ['Water', 'Cement', 'Sand', 'Crushed Stone'],
    outputs: [{ name: 'Concrete', type: 'Material', unit: 'm³', quantity: 1 }],
  },
  {
    inputs: ['Sand', 'Clay'],
    outputs: [
      { name: 'Brick Clay', type: 'Material', unit: 'kg', quantity: 10 },
    ],
  },
  {
    inputs: ['Brick Clay'],
    outputs: [{ name: 'Brick', type: 'Component', unit: 'piece', quantity: 1 }],
  },
  {
    inputs: ['Wood'],
    outputs: [
      { name: 'Timber', type: 'Component', unit: 'piece', quantity: 1 },
    ],
  },
  {
    inputs: ['Glass'],
    outputs: [
      { name: 'Glass Panel', type: 'Component', unit: 'm²', quantity: 1 },
    ],
  },
]

// Demolish combinations
const demolishCombinations = [
  {
    inputs: ['Wall'],
    outputs: [
      {
        name: 'Concrete From Demolished Wall',
        type: 'Material',
        unit: 'm³',
        quantity: 1,
      },
      { name: 'Waste', type: 'Waste', unit: 'tonnes', quantity: 0.2 },
    ],
  },
  {
    inputs: ['Floor'],
    outputs: [
      {
        name: 'Concrete From Demolished Floor',
        type: 'Material',
        unit: 'm³',
        quantity: 1,
      },
      { name: 'Waste', type: 'Waste', unit: 'tonnes', quantity: 0.2 },
    ],
  },
  {
    inputs: ['Window'],
    outputs: [
      { name: 'Glass', type: 'Material', unit: 'm²', quantity: 1 },
      { name: 'Frame', type: 'Component', unit: 'piece', quantity: 1 },
    ],
  },
]

// Pour combinations
const pourCombinations = [
  {
    inputs: ['Concrete'],
    outputs: [{ name: 'Wall', type: 'Component', unit: 'piece', quantity: 1 }],
  },
  {
    inputs: ['Mortar', 'Brick'],
    outputs: [{ name: 'Wall', type: 'Component', unit: 'piece', quantity: 1 }],
  },
]

// Main suggestion function
export function suggestOutputs(inputs: any[], processType: string): any[] {
  // Extract just the names for comparison
  const inputNames = inputs.map((input) => input.name)

  // Select the right combination set based on process type
  let combinations = []
  switch (processType) {
    case 'Mix':
      combinations = mixCombinations
      break
    case 'Demolish':
      combinations = demolishCombinations
      break
    case 'Pour':
      combinations = pourCombinations
      break
    default:
      return []
  }

  // Find the best matching combination
  // First try to find an exact match (all inputs match exactly)
  const exactMatch = combinations.find((combo) => {
    if (combo.inputs.length !== inputNames.length) return false
    return combo.inputs.every((input) => inputNames.includes(input))
  })

  if (exactMatch) {
    return exactMatch.outputs
  }

  // If no exact match, find a partial match (all inputs in our combination are in the provided inputs)
  const partialMatch = combinations.find((combo) => {
    return combo.inputs.every((input) => inputNames.includes(input))
  })

  if (partialMatch) {
    return partialMatch.outputs
  }

  // No match found
  return []
}
