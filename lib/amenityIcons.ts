import {
  Car,
  Waves,
  Dumbbell,
  Shield,
  Zap,
  ArrowUpFromLine,
  Trees,
  Home,
  Baby,
  Camera,
  Phone,
  Flame,
  Droplet,
  ParkingCircle,
  Wrench,
  CheckCircle,
  LucideIcon,
  Activity,
  LandPlot,
  Accessibility,
  Trophy,
  BookOpen,
  Dribbble,
  Music,
  Utensils,
  Gamepad2,
  Snowflake,
  Flower,
  UtensilsCrossed,
  Footprints,
  PartyPopper,
  Armchair,
  Sparkles,
  Layers,
  CookingPot,
  Video,
  Gem,
  Lock,
  BatteryCharging,
  Sun,
} from "lucide-react";

// Categorized Amenities
export const externalAmenities: Record<string, LucideIcon> = {
  // Existing External
  Parking: Car,
  "Swimming Pool": Waves,
  Gym: Dumbbell,
  Security: Shield,
  "Power Backup": Zap,
  Lift: ArrowUpFromLine,
  Garden: Trees,
  "Club House": Home,
  "Children's Play Area": Baby,
  CCTV: Camera,
  Intercom: Phone,
  "Fire Safety": Flame,
  "Rainwater Harvesting": Droplet,
  "Visitor Parking": ParkingCircle,
  "Maintenance Staff": Wrench,

  // New External Amenities
  "Jogging Track": Activity,
  "Multipurpose Court": LandPlot,
  "Senior Citizen Area": Accessibility,
  "Kids Pool": Baby,
  "Net Cricket": Trophy,
  "Tennis Court": Activity,
  "Cricket Pitch": Trophy,
  Library: BookOpen,
  "Basketball Court": Dribbble, // or Activity if Dribbble not available
  Amphitheater: Music,
  "Banquet Hall": Utensils,
  "Table Tennis": Gamepad2,
  "Indoor Games": Gamepad2,
  "Badminton Court": Activity,
  "Skating Rink": Snowflake,
  "Meditation Zone": Flower,
  "BBQ Lawn": UtensilsCrossed,
  "Acupressure Pathway": Footprints,
  "Party Lawn": PartyPopper,
  "Seating Area": Armchair,
  "Private Spa": Sparkles,
};

export const internalAmenities: Record<string, LucideIcon> = {
  "Vitrified Tiles": Layers,
  "Granite Kitchen Platform": CookingPot,
  "Stainless Steel Sink": Droplet,
  "Video Door Phone": Video,
  "Branded Fittings": Gem,
  "Digital Lock": Lock,
  "D.G Backup": BatteryCharging,
  "Solar Water Heater": Sun,
  "Gas Pipe Line": Flame,
};

// Combined mapping for backward compatibility and generic lookups
export const amenityIconMap: Record<string, LucideIcon> = {
  ...externalAmenities,
  ...internalAmenities,
};

/**
 * Get the Lucide icon component for an amenity name.
 * Returns CheckCircle as fallback for custom/unknown amenities.
 */
export function getAmenityIcon(amenityName: string): LucideIcon {
  return amenityIconMap[amenityName] || CheckCircle;
}

/**
 * List of default amenities with their icons for admin forms
 * @deprecated Use categories instead
 */
export const defaultAmenitiesWithIcons = Object.entries(amenityIconMap).map(
  ([name, Icon]) => ({
    name,
    Icon,
  })
);

/**
 * Helper to get amenities as array of objects for iteration
 */
export const getExternalAmenitiesList = () =>
  Object.entries(externalAmenities).map(([name, Icon]) => ({ name, Icon }));

export const getInternalAmenitiesList = () =>
  Object.entries(internalAmenities).map(([name, Icon]) => ({ name, Icon }));

/**
 * List of default amenity names for filtering custom amenities
 */
export const defaultAmenityNames = Object.keys(amenityIconMap);
