// Shared constants for profile forms
// These are imported by both Convex functions and React components

// Property type options for investors
export const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "land", label: "Land" },
] as const;

// Israeli cities/regions for location selection
export const ISRAELI_LOCATIONS = [
  "Tel Aviv",
  "Jerusalem",
  "Haifa",
  "Netanya",
  "Herzliya",
  "Ra'anana",
  "Ashdod",
  "Beer Sheva",
  "Eilat",
  "Tiberias",
  "Nahariya",
  "Petah Tikva",
  "Rishon LeZion",
  "Bat Yam",
  "Holon",
] as const;

// Risk tolerance options for investors
export const RISK_TOLERANCE_OPTIONS = [
  { value: "conservative", label: "Conservative", description: "Lower risk, stable returns" },
  { value: "moderate", label: "Moderate", description: "Balanced risk and returns" },
  { value: "aggressive", label: "Aggressive", description: "Higher risk, higher potential returns" },
] as const;

// Investment timeline options
export const INVESTMENT_TIMELINE_OPTIONS = [
  { value: "short_term", label: "Short Term", description: "Less than 2 years" },
  { value: "medium_term", label: "Medium Term", description: "2-5 years" },
  { value: "long_term", label: "Long Term", description: "5+ years" },
] as const;

// Specializations by provider type with icons
export const BROKER_SPECIALIZATIONS = [
  { value: "residential", label: "Residential", icon: "Home01Icon" },
  { value: "commercial", label: "Commercial", icon: "Building02Icon" },
  { value: "luxury", label: "Luxury Properties", icon: "Diamond01Icon" },
  { value: "new_construction", label: "New Construction", icon: "CraneIcon" },
  { value: "investment", label: "Investment Properties", icon: "ChartLineData01Icon" },
] as const;

export const MORTGAGE_ADVISOR_SPECIALIZATIONS = [
  { value: "first_time_buyers", label: "First Time Buyers", icon: "UserAdd01Icon" },
  { value: "refinancing", label: "Refinancing", icon: "RefreshIcon" },
  { value: "investment_properties", label: "Investment Properties", icon: "ChartLineData01Icon" },
  { value: "foreign_nationals", label: "Foreign Nationals", icon: "Globe02Icon" },
] as const;

export const LAWYER_SPECIALIZATIONS = [
  { value: "real_estate_transactions", label: "Real Estate Transactions", icon: "Agreement01Icon" },
  { value: "contracts", label: "Contract Review", icon: "File01Icon" },
  { value: "due_diligence", label: "Due Diligence", icon: "Search01Icon" },
  { value: "tax_planning", label: "Tax Planning", icon: "Calculator01Icon" },
] as const;

// Get specializations by provider type
export function getSpecializationsForType(providerType: string) {
  switch (providerType) {
    case "broker":
      return BROKER_SPECIALIZATIONS;
    case "mortgage_advisor":
      return MORTGAGE_ADVISOR_SPECIALIZATIONS;
    case "lawyer":
      return LAWYER_SPECIALIZATIONS;
    default:
      return [];
  }
}

// Service areas (same as locations)
export const SERVICE_AREAS = ISRAELI_LOCATIONS;

// Languages options with flags
export const LANGUAGE_OPTIONS = [
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "hebrew", label: "Hebrew", flag: "🇮🇱" },
  { value: "russian", label: "Russian", flag: "🇷🇺" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
] as const;

// Contact preference options
export const CONTACT_PREFERENCE_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

// Property status options
export const PROPERTY_STATUS = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
] as const;

// USD to ILS exchange rate (approximate, for display purposes)
export const USD_TO_ILS_RATE = 3.7;

// Property amenities for Yad2-style property pages
export const PROPERTY_AMENITIES = [
  { value: "airConditioning", label: "Air Conditioning", icon: "AirConditioning" },
  { value: "elevator", label: "Elevator", icon: "Elevator" },
  { value: "parking", label: "Parking", icon: "Car" },
  { value: "storage", label: "Storage", icon: "Storage" },
  { value: "balcony", label: "Balcony", icon: "Balcony" },
  { value: "security", label: "Security", icon: "Security" },
  { value: "gym", label: "Gym", icon: "Gym" },
  { value: "pool", label: "Pool", icon: "Pool" },
  { value: "garden", label: "Garden", icon: "Garden" },
  { value: "renovated", label: "Renovated", icon: "Renovated" },
  { value: "furnished", label: "Furnished", icon: "Furniture" },
  { value: "petFriendly", label: "Pet Friendly", icon: "Pet" },
  { value: "accessible", label: "Accessible", icon: "Accessible" },
  { value: "safeRoom", label: "Safe Room", icon: "SafeRoom" },
  { value: "solar", label: "Solar", icon: "Solar" },
] as const;

// User roles for role-switching dropdown
export const USER_ROLES = [
  { value: "investor", label: "Investor" },
  { value: "broker", label: "Broker" },
  { value: "mortgage_advisor", label: "Mortgage Advisor" },
  { value: "lawyer", label: "Lawyer" },
  { value: "admin", label: "Admin" },
] as const;
