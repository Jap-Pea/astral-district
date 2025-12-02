// src/services/mockData/crimes.ts
import type { Crime, CrimeResult, ItemFound } from '../../types/crime.types'
import { getCrimeBonus } from '../../utils/timeOfDay'

export const mockCrimes: Crime[] = [
  // LEVEL 0-5: Petty Space Crimes (Small Credits)
  {
    id: 'scavenge_debris',
    name: 'Scavenge Space Debris',
    description:
      'Float through abandoned sectors looking for salvageable parts. Dirty work in zero-g.',
    heartRateCost: 5,
    energyCost: 2,
    requiredLevel: 0,
    minReward: 10,
    maxReward: 50,
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
    id: 'panhandle_docks',
    name: 'Panhandle at Docks',
    description:
      'Beg for credits at the spaceport. Not glamorous, but everyone starts somewhere.',
    heartRateCost: 5,
    energyCost: 2,
    requiredLevel: 0,
    minReward: 15,
    maxReward: 75,
    experienceGain: 3,
    baseSuccessRate: 90,
  },
  {
    id: 'steal_rations',
    name: 'Steal Food Rations',
    description:
      'Swipe protein bars and nutrient packs from supply crates in the cargo bay.',
    heartRateCost: 8,
    energyCost: 4,
    requiredLevel: 1,
    minReward: 25,
    maxReward: 100,
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
    id: 'pickpocket_tourist',
    name: 'Pickpocket Tourist',
    description:
      'Lift credit chips from distracted tourists at observation decks. Quick fingers required.',
    heartRateCost: 10,
    energyCost: 5,
    requiredLevel: 1,
    minReward: 75,
    maxReward: 250,
    experienceGain: 8,
    baseSuccessRate: 75,
  },
  {
    id: 'steal_shipment',
    name: 'Steal Small Shipment',
    description: 'Grab unattended cargo from loading docks before anyone notices.',
    heartRateCost: 10,
    energyCost: 5,
    requiredLevel: 2,
    minReward: 150,
    maxReward: 400,
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

  // LEVEL 6-10: Small-time Space Crime
  {
    id: 'mug_worker',
    name: 'Mug Station Worker',
    description: 'Rob someone in the maintenance tunnels. Intimidation is key.',
    heartRateCost: 14,
    energyCost: 6,
    requiredLevel: 3,
    minReward: 250,
    maxReward: 900,
    experienceGain: 15,
    baseSuccessRate: 70,
  },
  {
    id: 'steal_speeder',
    name: 'Steal Hover Speeder',
    description: 'Hotwire a personal transport and sell it for parts.',
    heartRateCost: 15,
    energyCost: 6,
    requiredLevel: 7,
    minReward: 400,
    maxReward: 1200,
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
    id: 'break_ship_window',
    name: 'Break Into Docked Ship',
    description: 'Smash viewports and grab valuables from parked shuttles.',
    heartRateCost: 18,
    energyCost: 6,
    requiredLevel: 8,
    minReward: 500,
    maxReward: 1400,
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
    id: 'steal_tech',
    name: 'Steal Tech Equipment',
    description:
      'Lift valuable electronics from tech shops. High risk, higher reward.',
    heartRateCost: 10,
    energyCost: 6,
    requiredLevel: 9,
    minReward: 600,
    maxReward: 1800,
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

  // LEVEL 11-15: Mid-tier Space Crime
  {
    id: 'burglary_quarters',
    name: 'Burgle Living Quarters',
    description:
      'Break into residential modules and steal valuables. Watch for security drones.',
    heartRateCost: 20,
    energyCost: 8,
    requiredLevel: 11,
    minReward: 1200,
    maxReward: 4000,
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
    id: 'steal_shuttle',
    name: 'Steal Personal Shuttle',
    description:
      "Hijack a small spacecraft. Need to know bypass codes and flight systems.",
    heartRateCost: 18,
    energyCost: 8,
    requiredLevel: 13,
    minReward: 1800,
    maxReward: 4500,
    experienceGain: 40,
    baseSuccessRate: 50,
  },
  {
    id: 'rob_fuel_station',
    name: 'Rob Fuel Station',
    description: 'Armed robbery of a refueling depot. Dangerous but profitable.',
    heartRateCost: 25,
    energyCost: 10,
    requiredLevel: 15,
    minReward: 2500,
    maxReward: 6000,
    experienceGain: 50,
    baseSuccessRate: 45,
    possibleItems: [
      { itemId: 'weapon_001', dropChance: 10, minQuantity: 1, maxQuantity: 1 },
    ],
  },

  // LEVEL 16-20: Serious Space Crime
  {
    id: 'steal_cargo_ship',
    name: 'Hijack Cargo Ship',
    description: 'Commandeer a small freight vessel and sell it to pirates.',
    heartRateCost: 26,
    energyCost: 10,
    requiredLevel: 16,
    minReward: 3500,
    maxReward: 9000,
    experienceGain: 60,
    baseSuccessRate: 50,
  },
  {
    id: 'rob_jeweler',
    name: 'Rob Luxury Jeweler',
    description:
      'Hit a high-end jewelry shop on the promenade. Security is tight, but the payoff is worth it.',
    heartRateCost: 24,
    energyCost: 9,
    requiredLevel: 18,
    minReward: 6000,
    maxReward: 14000,
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
    id: 'smuggle_contraband',
    name: 'Smuggle Contraband',
    description:
      'Transport illegal substances through customs checkpoints. High profit, high heat.',
    heartRateCost: 25,
    energyCost: 8,
    requiredLevel: 20,
    minReward: 5000,
    maxReward: 12000,
    experienceGain: 70,
    baseSuccessRate: 45,
  },

  // LEVEL 21-25: Professional Space Crime
  {
    id: 'blackmail_executive',
    name: 'Blackmail Corporate Executive',
    description: 'Extort credits from a corpo exec with compromising data files.',
    heartRateCost: 20,
    energyCost: 10,
    requiredLevel: 22,
    minReward: 10000,
    maxReward: 20000,
    experienceGain: 90,
    baseSuccessRate: 40,
  },
  {
    id: 'armed_robbery_casino',
    name: 'Rob Luxury Casino',
    description: "Hit a high-stakes gambling den with heavy firepower. Don't get caught.",
    heartRateCost: 28,
    energyCost: 14,
    requiredLevel: 24,
    minReward: 12000,
    maxReward: 25000,
    experienceGain: 100,
    baseSuccessRate: 35,
    possibleItems: [
      { itemId: 'weapon_002', dropChance: 8, minQuantity: 1, maxQuantity: 1 },
    ],
  },

  // LEVEL 26-30: Major Space Crime
  {
    id: 'hijack_freighter',
    name: 'Hijack Supply Freighter',
    description:
      'Board and steal an entire cargo freighter full of goods. Big score if you pull it off.',
    heartRateCost: 30,
    energyCost: 15,
    requiredLevel: 26,
    minReward: 18000,
    maxReward: 40000,
    experienceGain: 120,
    baseSuccessRate: 35,
  },
  {
    id: 'rob_district_bank',
    name: 'Rob District Bank',
    description: 'Plan and execute a bank heist in the financial sector. This is the big leagues.',
    heartRateCost: 35,
    energyCost: 16,
    requiredLevel: 28,
    minReward: 30000,
    maxReward: 60000,
    experienceGain: 150,
    baseSuccessRate: 25,
    cooldown: 3600,
  },

  // LEVEL 31-40: Elite Space Crime
  {
    id: 'steal_artifact',
    name: 'Steal Ancient Artifact',
    description: 'Heist a priceless alien relic from a museum or private vault.',
    heartRateCost: 35,
    energyCost: 16,
    requiredLevel: 32,
    minReward: 40000,
    maxReward: 85000,
    experienceGain: 180,
    baseSuccessRate: 20,
    cooldown: 3600,
  },
  {
    id: 'assassinate_target',
    name: 'Assassinate VIP Target',
    description: 'Eliminate a high-value corporate or political target. No witnesses, no trace.',
    heartRateCost: 28,
    energyCost: 18,
    requiredLevel: 35,
    minReward: 60000,
    maxReward: 120000,
    experienceGain: 250,
    baseSuccessRate: 15,
    cooldown: 7200,
    possibleItems: [
      { itemId: 'weapon_003', dropChance: 5, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: 'heist_military_transport',
    name: 'Heist Military Transport',
    description:
      'The ultimate score. Intercept a military convoy and steal classified tech and credits.',
    heartRateCost: 36,
    energyCost: 18,
    requiredLevel: 40,
    minReward: 90000,
    maxReward: 180000,
    experienceGain: 350,
    baseSuccessRate: 10,
    cooldown: 10800,
  },

  // BONUS CRIMES: Special/Rare
  {
    id: 'hack_corpo_mainframe',
    name: 'Hack Corporate Mainframe',
    description:
      'Infiltrate a mega-corporation\'s network and siphon credits directly from their accounts.',
    heartRateCost: 22,
    energyCost: 12,
    requiredLevel: 25,
    minReward: 15000,
    maxReward: 35000,
    experienceGain: 110,
    baseSuccessRate: 30,
    cooldown: 7200,
    possibleItems: [
      {
        itemId: 'material_003',
        dropChance: 30,
        minQuantity: 2,
        maxQuantity: 4,
      },
    ],
  },
  {
    id: 'sabotage_competitor',
    name: 'Sabotage Rival Operation',
    description:
      'Destroy a competitor\'s operations for a paying client. Corporate warfare at its finest.',
    heartRateCost: 30,
    energyCost: 14,
    requiredLevel: 30,
    minReward: 25000,
    maxReward: 55000,
    experienceGain: 140,
    baseSuccessRate: 25,
    cooldown: 3600,
  },
  {
    id: 'steal_quantum_core',
    name: 'Steal Quantum Core',
    description:
      'Heist a quantum computing core from a research facility. Extremely valuable, extremely dangerous.',
    heartRateCost: 38,
    energyCost: 20,
    requiredLevel: 38,
    minReward: 70000,
    maxReward: 150000,
    experienceGain: 300,
    baseSuccessRate: 12,
    cooldown: 14400,
    possibleItems: [
      {
        itemId: 'material_003',
        dropChance: 50,
        minQuantity: 3,
        maxQuantity: 6,
      },
    ],
  },
]

const successMessages = [
  'Mission accomplished! You slipped away undetected.',
  'Perfect execution! Security never saw you coming.',
  "Clean getaway through the maintenance tunnels. You're a natural.",
  'Flawless operation! The station\'s security AI didn\'t even log your presence.',
  "Smooth as a vacuum. You're getting good at this.",
  'Job done. No alarms, no witnesses, no problems.',
  'You vanished into the crowd before anyone knew what happened.',
]

const failureMessages = [
  'Security drones spotted you! Station police are on their way.',
  'Someone triggered the alarm! You barely made it to an escape pod.',
  'Things went sideways and you had to abort empty-handed.',
  'Security was tighter than intel suggested. Mission failed.',
  'You were detected by surveillance and had to flee through the ventilation system.',
  'The target was better protected than expected. Time to lay low.',
  'A patrol caught you mid-operation. Run!',
]

const criticalMessages = [
  'CRITICAL SUCCESS! You found a hidden stash of extra credits!',
  'JACKPOT! The safe had way more than expected!',
  'INCREDIBLE! You stumbled upon classified tech worth a fortune!',
  'PERFECT SCORE! Everything went better than planned!',
  'MASSIVE HAUL! You hit the motherlode!',
  'LEGENDARY! This will go down in criminal history!',
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
  return mockCimes.find((crime) => crime.id === id)
}