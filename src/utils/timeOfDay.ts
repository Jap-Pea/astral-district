export const getTimeOfDay = (): 'day' | 'night' => {
  const hour = new Date().getHours()
  // Night time: 6 PM to 6 AM (20:00 to 06:00)
  if (hour >= 18 || hour < 6) {
    return 'night'
  }
  return 'day'
}

export const getCrimeBonus = (crimeId: string): number => {
  const timeOfDay = getTimeOfDay()

  // Crimes that are better at night
  const nightCrimes = [
    'searchDumpsters', // Search Dumpsters
    'crime_003', // Shoplift Snacks
    'crime_004', // Pickpocket
    'crime_005', // Steal Packages
    'crime_006', // Mug Someone
    'crime_007', // Steal Bike
    'crime_008', // Break Car Window
    'crime_010', // Burglary
    'crime_011', // Steal Motorcycle
    'crime_013', // Steal Car
    'crime_018', // Hijack Truck
    'crime_020', // Art Heist
    'crime_022', // Armored Car Heist
  ]

  // Crimes that are better during day
  const dayCrimes = [
    'crime_002', // Panhandle
    'crime_009', // Shoplift Electronics
    'crime_012', // Rob Gas Station
    'crime_014', // Rob Jewelry Store
    'crime_015', // Deal Drugs
    'crime_016', // Blackmail
    'crime_017', // Armed Robbery
    'crime_019', // Rob Bank
    'crime_021', // Assassinate Target
  ]

  if (timeOfDay === 'night' && nightCrimes.includes(crimeId)) {
    return 10 // +10% success rate bonus at night
  }

  if (timeOfDay === 'day' && dayCrimes.includes(crimeId)) {
    return 10 // +10% success rate bonus during day
  }

  return 0 // No bonus
}
