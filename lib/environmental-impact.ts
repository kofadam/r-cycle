// lib/environmental-impact.ts
// Environmental impact calculator for hardware reuse

export interface EnvironmentalImpact {
  co2SavedKg: number;
  treesEquivalent: number;
  milesNotDriven: number;
  pandasProtected: number;
  smartphonesCharged: number;
  daysOfElectricity: number;
}

// Carbon footprint data (manufacturing emissions in kg CO2e)
export const CARBON_FOOTPRINT = {
  Server: 1300,      // Average rack server
  Networking: 300,    // Switches, routers
  Storage: 800,       // Storage arrays, NAS
};

// Fun conversion factors (scientifically based)
const CONVERSIONS = {
  // One tree absorbs ~22 kg CO2 per year
  CO2_PER_TREE_YEAR: 22,
  
  // Average car emits ~0.4 kg CO2 per mile
  CO2_PER_MILE: 0.4,
  
  // Charging a smartphone: ~0.012 kg CO2
  CO2_PER_SMARTPHONE_CHARGE: 0.012,
  
  // Average home uses ~30 kg CO2 per day
  CO2_PER_HOME_DAY: 30,
  
  // Giant pandas need 20,000 hectares of bamboo forest
  // 1 hectare forest sequesters ~2 tons CO2/year
  // So protecting panda habitat = protecting CO2 sequestration
  // 1 panda = 40,000 kg CO2 sequestration capacity per year
  CO2_PER_PANDA_HABITAT: 40000,
};

/**
 * Calculate environmental impact of reusing hardware
 * instead of manufacturing new
 */
export function calculateImpact(category: string): EnvironmentalImpact {
  const co2SavedKg = CARBON_FOOTPRINT[category as keyof typeof CARBON_FOOTPRINT] || 500;
  
  return {
    co2SavedKg,
    treesEquivalent: Number((co2SavedKg / CONVERSIONS.CO2_PER_TREE_YEAR).toFixed(1)),
    milesNotDriven: Math.round(co2SavedKg / CONVERSIONS.CO2_PER_MILE),
    pandasProtected: Number((co2SavedKg / CONVERSIONS.CO2_PER_PANDA_HABITAT).toFixed(4)),
    smartphonesCharged: Math.round(co2SavedKg / CONVERSIONS.CO2_PER_SMARTPHONE_CHARGE),
    daysOfElectricity: Number((co2SavedKg / CONVERSIONS.CO2_PER_HOME_DAY).toFixed(1)),
  };
}

/**
 * Get a fun, friendly message about the impact
 */
export function getImpactMessage(impact: EnvironmentalImpact, category: string): string {
  const messages = [
    `🌳 Equivalent to ${impact.treesEquivalent} trees working for a year!`,
    `🚗 Like not driving ${impact.milesNotDriven} miles in a car!`,
    `🐼 You're protecting ${impact.pandasProtected.toFixed(4)} pandas worth of habitat!`,
    `📱 Could charge ${impact.smartphonesCharged.toLocaleString()} smartphones!`,
    `⚡ ${impact.daysOfElectricity} days of home electricity saved!`,
  ];
  
  // Return a random fun message
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get department statistics
 */
export interface DepartmentStats {
  department: string;
  itemsPosted: number;
  itemsClaimed: number;
  totalCO2SavedKg: number;
  totalTreesEquivalent: number;
  totalPandasProtected: number;
  rank?: number;
}

/**
 * Calculate total environmental impact for a department
 */
export function calculateDepartmentImpact(listings: any[]): EnvironmentalImpact {
  const totalCO2 = listings.reduce((sum, listing) => {
    const co2 = CARBON_FOOTPRINT[listing.category as keyof typeof CARBON_FOOTPRINT] || 500;
    return sum + co2;
  }, 0);
  
  return {
    co2SavedKg: totalCO2,
    treesEquivalent: Number((totalCO2 / CONVERSIONS.CO2_PER_TREE_YEAR).toFixed(1)),
    milesNotDriven: Math.round(totalCO2 / CONVERSIONS.CO2_PER_MILE),
    pandasProtected: Number((totalCO2 / CONVERSIONS.CO2_PER_PANDA_HABITAT).toFixed(4)),
    smartphonesCharged: Math.round(totalCO2 / CONVERSIONS.CO2_PER_SMARTPHONE_CHARGE),
    daysOfElectricity: Number((totalCO2 / CONVERSIONS.CO2_PER_HOME_DAY).toFixed(1)),
  };
}

/**
 * Get badge for environmental achievement
 */
export function getBadge(itemsPosted: number): { name: string; icon: string; color: string } | null {
  if (itemsPosted >= 20) {
    return { name: 'Planet Hero', icon: '🌍', color: 'text-green-600' };
  } else if (itemsPosted >= 10) {
    return { name: 'Sustainability Champion', icon: '♻️', color: 'text-green-500' };
  } else if (itemsPosted >= 5) {
    return { name: 'Green Warrior', icon: '🌿', color: 'text-green-400' };
  } else if (itemsPosted >= 1) {
    return { name: 'Eco Starter', icon: '🌱', color: 'text-green-300' };
  }
  return null;
}
