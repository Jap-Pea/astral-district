//src/data/items/fuel.ts
export const FUEL: Item[] = [
  {
    id: 'fuel_ion_propellant',
    name: 'Ion Propellant',
    description: 'Basic fuel for short-range space travel. Efficient but slow.',
    type: 'fuel',
    rarity: 'common',
    value: 1000,
    stackable: true,
    usable: false,
    category: 'fuel',
  },
  {
    id: 'fuel_fusion_core',
    name: 'Fusion Core Fuel',
    description:
      'Advanced fuel for medium-range travel. 25% faster and uses 66% less fuel.',
    type: 'fuel',
    rarity: 'uncommon',
    value: 5000,
    stackable: true,
    usable: false,
    category: 'fuel',
  },
  {
    id: 'fuel_quantum_flux',
    name: 'Quantum Flux',
    description:
      'Premium fuel for long-range travel. 50% faster and uses 83% less fuel.',
    type: 'fuel',
    rarity: 'rare',
    value: 20000,
    stackable: true,
    usable: false,
    category: 'fuel',
  },
]
