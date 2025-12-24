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
} from "lucide-react";

// Mapping of amenity names to Lucide icon components
const amenityIconMap: Record<string, LucideIcon> = {
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
 */
export const defaultAmenitiesWithIcons = Object.entries(amenityIconMap).map(
  ([name, Icon]) => ({
    name,
    Icon,
  })
);

/**
 * List of default amenity names for filtering custom amenities
 */
export const defaultAmenityNames = Object.keys(amenityIconMap);

export { amenityIconMap };
