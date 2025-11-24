// src/services/mockData/crimes.ts
import type { Crime, CrimeResult, ItemFound } from '../../types/crime.types'
import { getCrimeBonus } from '../../utils/timeOfDay'

export const mockCrimes: Crime[] = [
  // LEVEL 1-5: Petty Crimes (cents to low dollars)
  {
    id: 'searchDumpsters',
    name: 'Search Dumpsters',
    description:
      'Dig through trash looking for anything valuable. Dirty work, but it pays... barely.',
    heartRateCost: 5,
    energyCost: 2,
    requiredLevel: 0,
    minReward: 5,
    maxReward: 25,
    experienceGain: 2,
    baseSuccessRate: 95,
    possibleItems: [
      {
        itemId: 'material_001',
        dropChance: 15,
        minQuantity: 1,
        maxQuantity: 2,
      },
      {
        itemId: 'material_002',
        dropChance: 10,
        minQuantity: 1,
        maxQuantity: 1,
      },
    ],
  },
  {
    id: 'crime_002',
    name: 'Panhandle',
    description:
      'Beg for spare change on street corners. Not glamorous, but everyone starts somewhere.',
    heartRateCost: 5,
    energyCost: 2,
    requiredLevel: 0,
    minReward: 10,
    maxReward: 50,
    experienceGain: 3,
    baseSuccessRate: 90,
  },
  {
    id: 'crime_003',
    name: 'Shoplift Snacks',
    description:
      'Steal small items from a convenience store. Candy bars, chips, cigarettes.',
    heartRateCost: 8,
    energyCost: 4,
    requiredLevel: 1,
    minReward: 15,
    maxReward: 75,
    experienceGain: 5,
    baseSuccessRate: 85,
    possibleItems: [
      {
        itemId: 'consumable_004',
        dropChance: 20,
        minQuantity: 1,
        maxQuantity: 3,
      },
    ],
  },
  {
    id: 'crime_004',
    name: 'Pickpocket',
    description:
      'Steal wallets from distracted pedestrians. Quick fingers required.',
    heartRateCost: 10,
    energyCost: 5,
    requiredLevel: 1,
    minReward: 50,
    maxReward: 200,
    experienceGain: 8,
    baseSuccessRate: 75,
  },
  {
    id: 'crime_005',
    name: 'Steal Packages',
    description: 'Grab packages from doorsteps before the owners get home.',
    heartRateCost: 10,
    energyCost: 5,
    requiredLevel: 2,
    minReward: 100,
    maxReward: 350,
    experienceGain: 10,
    baseSuccessRate: 80,
    possibleItems: [
      {
        itemId: 'material_002',
        dropChance: 25,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
  },

  // LEVEL 6-10: Small-time Crime ($200-$1000)
  {
    id: 'crime_006',
    name: 'Mug Someone',
    description: 'Rob someone in a dark alley. Intimidation is key.',
    heartRateCost: 14,
    energyCost: 6,
    requiredLevel: 3,
    minReward: 200,
    maxReward: 800,
    experienceGain: 15,
    baseSuccessRate: 70,
  },
  {
    id: 'crime_007',
    name: 'Steal Bike',
    description: 'Cut a bike lock and sell it for parts or whole.',
    heartRateCost: 15,
    energyCost: 6,
    requiredLevel: 7,
    minReward: 300,
    maxReward: 1000,
    experienceGain: 18,
    baseSuccessRate: 75,
    possibleItems: [
      {
        itemId: 'material_001',
        dropChance: 30,
        minQuantity: 2,
        maxQuantity: 4,
      },
    ],
  },
  {
    id: 'crime_008',
    name: 'Break Car Window',
    description: 'Smash and grab valuables from parked cars.',
    heartRateCost: 18,
    energyCost: 6,
    requiredLevel: 8,
    minReward: 400,
    maxReward: 1200,
    experienceGain: 20,
    baseSuccessRate: 65,
    possibleItems: [
      {
        itemId: 'material_002',
        dropChance: 20,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: 'material_001',
        dropChance: 15,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
  },
  {
    id: 'crime_009',
    name: 'Shoplift Electronics',
    description:
      'Steal valuable electronics from retail stores. Higher risk, higher reward.',
    heartRateCost: 10,
    energyCost: 6,
    requiredLevel: 9,
    minReward: 500,
    maxReward: 1500,
    experienceGain: 25,
    baseSuccessRate: 60,
    possibleItems: [
      {
        itemId: 'material_002',
        dropChance: 35,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
  },

  // LEVEL 11-15: Mid-tier Crime ($1000-$5000)
  {
    id: 'crime_010',
    name: 'Burglary',
    description:
      'Break into a house and steal valuables. Watch for alarm systems.',
    heartRateCost: 20,
    energyCost: 8,
    requiredLevel: 11,
    minReward: 1000,
    maxReward: 3500,
    experienceGain: 35,
    baseSuccessRate: 55,
    possibleItems: [
      {
        itemId: 'material_003',
        dropChance: 20,
        minQuantity: 1,
        maxQuantity: 1,
      },
      {
        itemId: 'material_002',
        dropChance: 25,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
  },
  {
    id: 'crime_011',
    name: 'Steal Motorcycle',
    description:
      "Hotwire and steal a motorcycle. Need to know what you're doing.",
    heartRateCost: 18,
    energyCost: 8,
    requiredLevel: 13,
    minReward: 1500,
    maxReward: 4000,
    experienceGain: 40,
    baseSuccessRate: 50,
  },
  {
    id: 'crime_012',
    name: 'Rob Gas Station',
    description: 'Armed robbery of a gas station. Dangerous but profitable.',
    heartRateCost: 25,
    energyCost: 10,
    requiredLevel: 15,
    minReward: 2000,
    maxReward: 5000,
    experienceGain: 50,
    baseSuccessRate: 45,
    possibleItems: [
      { itemId: 'weapon_001', dropChance: 10, minQuantity: 1, maxQuantity: 1 },
    ],
  },

  // LEVEL 16-20: Serious Crime ($5000-$15000)
  {
    id: 'crime_013',
    name: 'Steal Car',
    description: 'Steal a car and sell it to a chop shop.',
    heartRateCost: 26,
    energyCost: 10,
    requiredLevel: 16,
    minReward: 3000,
    maxReward: 8000,
    experienceGain: 60,
    baseSuccessRate: 50,
  },
  {
    id: 'crime_014',
    name: 'Rob Jewelry Store',
    description:
      'Hit a jewelry store. Security is tight, but the payoff is worth it.',
    heartRateCost: 24,
    energyCost: 9,
    requiredLevel: 18,
    minReward: 5000,
    maxReward: 12000,
    experienceGain: 75,
    baseSuccessRate: 40,
    possibleItems: [
      {
        itemId: 'material_003',
        dropChance: 40,
        minQuantity: 2,
        maxQuantity: 5,
      },
    ],
  },
  {
    id: 'crime_015',
    name: 'Deal Drugs',
    description:
      'Sell illegal substances on the street. High profit, high heat.',
    heartRateCost: 25,
    energyCost: 8,
    requiredLevel: 20,
    minReward: 4000,
    maxReward: 10000,
    experienceGain: 70,
    baseSuccessRate: 45,
  },

  // LEVEL 21-25: Professional Crime ($10000-$25000)
  {
    id: 'crime_016',
    name: 'Blackmail',
    description: 'Extort money from someone with compromising information.',
    heartRateCost: 20,
    energyCost: 10,
    requiredLevel: 22,
    minReward: 8000,
    maxReward: 18000,
    experienceGain: 90,
    baseSuccessRate: 40,
  },
  {
    id: 'crime_017',
    name: 'Armed Robbery',
    description: "Rob a high-end store with a weapon. Don't get caught.",
    heartRateCost: 28,
    energyCost: 14,
    requiredLevel: 24,
    minReward: 10000,
    maxReward: 22000,
    experienceGain: 100,
    baseSuccessRate: 35,
    possibleItems: [
      { itemId: 'weapon_002', dropChance: 8, minQuantity: 1, maxQuantity: 1 },
    ],
  },

  // LEVEL 26-30: Major Crime ($20000-$50000)
  {
    id: 'crime_018',
    name: 'Hijack Truck',
    description:
      'Steal a cargo truck full of goods. Big score if you pull it off.',
    heartRateCost: 30,
    energyCost: 15,
    requiredLevel: 26,
    minReward: 15000,
    maxReward: 35000,
    experienceGain: 120,
    baseSuccessRate: 35,
  },
  {
    id: 'crime_019',
    name: 'Rob Bank',
    description: 'Plan and execute a bank robbery. This is the big leagues.',
    heartRateCost: 35,
    energyCost: 16,
    requiredLevel: 28,
    minReward: 25000,
    maxReward: 50000,
    experienceGain: 150,
    baseSuccessRate: 25,
    cooldown: 3600,
  },

  // LEVEL 31-40: Elite Crime ($40000-$100000+)
  {
    id: 'crime_020',
    name: 'Art Heist',
    description: 'Steal priceless art from a museum or private collection.',
    heartRateCost: 35,
    energyCost: 16,
    requiredLevel: 32,
    minReward: 35000,
    maxReward: 75000,
    experienceGain: 180,
    baseSuccessRate: 20,
    cooldown: 3600,
  },
  {
    id: 'crime_021',
    name: 'Assassinate Target',
    description: 'Take out a high-value target for money. No witnesses.',
    heartRateCost: 28,
    energyCost: 18,
    requiredLevel: 35,
    minReward: 50000,
    maxReward: 100000,
    experienceGain: 250,
    baseSuccessRate: 15,
    cooldown: 7200,
    possibleItems: [
      { itemId: 'weapon_003', dropChance: 5, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'crime_022',
    name: 'Armored Car Heist',
    description:
      'The ultimate score. Intercept an armored car and take everything.',
    heartRateCost: 36,
    energyCost: 18,
    requiredLevel: 40,
    minReward: 75000,
    maxReward: 150000,
    experienceGain: 350,
    baseSuccessRate: 10,
    cooldown: 10800,
  },
]

const successMessages = [
  'You successfully completed the crime and got away clean!',
  'Perfect execution! Nobody saw a thing.',
  "The job went smoothly. You're a natural.",
  'Clean getaway! The cops never knew what hit them.',
  "Flawless! You're getting good at this.",
]

const failureMessages = [
  'You got caught! The police arrested you.',
  'Someone called the cops! You barely escaped.',
  'Things went wrong and you had to flee empty-handed.',
  'Security was tighter than expected. Mission failed.',
  'You were spotted and had to abort the operation.',
]

const criticalMessages = [
  'CRITICAL SUCCESS! You found extra loot!',
  'JACKPOT! This was your lucky day!',
  'AMAZING! You hit the motherload!',
  'PERFECT! Everything went better than planned!',
]

export const attemptCrime = (crime: Crime): CrimeResult => {
  const timeBonus = getCrimeBonus(crime.id)
  const adjustedSuccessRate = Math.min(crime.baseSuccessRate + timeBonus, 100)

  const roll = Math.random() * 100
  const isCritical = roll > 95
  const isSuccess = roll < adjustedSuccessRate

  let moneyEarned = 0
  let message = ''
  const itemsFound: ItemFound[] = []

  if (isSuccess) {
    const baseAmount = Math.floor(
      Math.random() * (crime.maxReward - crime.minReward) + crime.minReward
    )

    if (isCritical) {
      moneyEarned = baseAmount * 2
      message =
        criticalMessages[Math.floor(Math.random() * criticalMessages.length)]
    } else {
      moneyEarned = baseAmount
      message =
        successMessages[Math.floor(Math.random() * successMessages.length)]
    }

    if (crime.possibleItems) {
      crime.possibleItems.forEach((itemDrop) => {
        const dropRoll = Math.random() * 100
        if (dropRoll < itemDrop.dropChance) {
          const quantity = Math.floor(
            Math.random() * (itemDrop.maxQuantity - itemDrop.minQuantity + 1) +
              itemDrop.minQuantity
          )
          itemsFound.push({
            itemId: itemDrop.itemId,
            itemName: itemDrop.itemId,
            quantity,
          })
        }
      })
    }
  } else {
    message =
      failureMessages[Math.floor(Math.random() * failureMessages.length)]
  }

  return {
    success: isSuccess,
    critical: isCritical,
    injured: false,
    crime,
    moneyEarned,
    experienceEarned: isSuccess
      ? crime.experienceGain
      : Math.floor(crime.experienceGain * 0.1),
    itemsFound: itemsFound.length > 0 ? itemsFound : undefined,
    healthLost: 0,
    message,
    timestamp: new Date(),
  }
}

export const getAvailableCrimes = (userLevel: number): Crime[] => {
  return mockCrimes.filter((crime) => crime.requiredLevel <= userLevel)
}

export const getCrimeById = (id: string): Crime | undefined => {
  return mockCrimes.find((crime) => crime.id === id)
}
