// Shared constants for profile forms
// These are imported by both Convex functions and React components

// Property type options for investors
export const PROPERTY_TYPES = [
  { value: "residential", labelKey: "common.propertyTypes.residential" },
  { value: "commercial", labelKey: "common.propertyTypes.commercial" },
  { value: "mixed_use", labelKey: "common.propertyTypes.mixedUse" },
  { value: "land", labelKey: "common.propertyTypes.land" },
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
  { value: "conservative", labelKey: "common.riskTolerance.conservative.label", descriptionKey: "common.riskTolerance.conservative.description" },
  { value: "moderate", labelKey: "common.riskTolerance.moderate.label", descriptionKey: "common.riskTolerance.moderate.description" },
  { value: "aggressive", labelKey: "common.riskTolerance.aggressive.label", descriptionKey: "common.riskTolerance.aggressive.description" },
] as const;

// Investment timeline options
export const INVESTMENT_TIMELINE_OPTIONS = [
  { value: "short_term", labelKey: "common.investmentTimeline.shortTerm.label", descriptionKey: "common.investmentTimeline.shortTerm.description" },
  { value: "medium_term", labelKey: "common.investmentTimeline.mediumTerm.label", descriptionKey: "common.investmentTimeline.mediumTerm.description" },
  { value: "long_term", labelKey: "common.investmentTimeline.longTerm.label", descriptionKey: "common.investmentTimeline.longTerm.description" },
] as const;

// Specializations by provider type with icons
export const BROKER_SPECIALIZATIONS = [
  { value: "residential", labelKey: "common.specializations.broker.residential", icon: "Home01Icon" },
  { value: "commercial", labelKey: "common.specializations.broker.commercial", icon: "Building02Icon" },
  { value: "luxury", labelKey: "common.specializations.broker.luxury", icon: "Diamond01Icon" },
  { value: "new_construction", labelKey: "common.specializations.broker.newConstruction", icon: "CraneIcon" },
  { value: "investment", labelKey: "common.specializations.broker.investment", icon: "ChartLineData01Icon" },
] as const;

export const MORTGAGE_ADVISOR_SPECIALIZATIONS = [
  { value: "first_time_buyers", labelKey: "common.specializations.mortgageAdvisor.firstTimeBuyers", icon: "UserAdd01Icon" },
  { value: "refinancing", labelKey: "common.specializations.mortgageAdvisor.refinancing", icon: "RefreshIcon" },
  { value: "investment_properties", labelKey: "common.specializations.mortgageAdvisor.investmentProperties", icon: "ChartLineData01Icon" },
  { value: "foreign_nationals", labelKey: "common.specializations.mortgageAdvisor.foreignNationals", icon: "Globe02Icon" },
] as const;

export const LAWYER_SPECIALIZATIONS = [
  { value: "real_estate_transactions", labelKey: "common.specializations.lawyer.realEstateTransactions", icon: "Agreement01Icon" },
  { value: "contracts", labelKey: "common.specializations.lawyer.contracts", icon: "File01Icon" },
  { value: "due_diligence", labelKey: "common.specializations.lawyer.dueDiligence", icon: "Search01Icon" },
  { value: "tax_planning", labelKey: "common.specializations.lawyer.taxPlanning", icon: "Calculator01Icon" },
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
  { value: "english", labelKey: "common.languages.english", flag: "🇺🇸" },
  { value: "hebrew", labelKey: "common.languages.hebrew", flag: "🇮🇱" },
  { value: "russian", labelKey: "common.languages.russian", flag: "🇷🇺" },
  { value: "french", labelKey: "common.languages.french", flag: "🇫🇷" },
  { value: "spanish", labelKey: "common.languages.spanish", flag: "🇪🇸" },
] as const;

// Contact preference options
export const CONTACT_PREFERENCE_OPTIONS = [
  { value: "email", labelKey: "common.contactPreferences.email" },
  { value: "phone", labelKey: "common.contactPreferences.phone" },
  { value: "whatsapp", labelKey: "common.contactPreferences.whatsapp" },
] as const;

// Property status options
export const PROPERTY_STATUS = [
  { value: "available", labelKey: "common.propertyStatus.available" },
  { value: "pending", labelKey: "common.propertyStatus.pending" },
  { value: "sold", labelKey: "common.propertyStatus.sold" },
] as const;

// USD to ILS exchange rate (approximate, for display purposes)
export const USD_TO_ILS_RATE = 3.7;

// Property amenities for Yad2-style property pages
export const PROPERTY_AMENITIES = [
  { value: "airConditioning", labelKey: "common.amenities.airConditioning", icon: "AirConditioning" },
  { value: "elevator", labelKey: "common.amenities.elevator", icon: "Elevator" },
  { value: "parking", labelKey: "common.amenities.parking", icon: "Car" },
  { value: "storage", labelKey: "common.amenities.storage", icon: "Storage" },
  { value: "balcony", labelKey: "common.amenities.balcony", icon: "Balcony" },
  { value: "security", labelKey: "common.amenities.security", icon: "Security" },
  { value: "gym", labelKey: "common.amenities.gym", icon: "Gym" },
  { value: "pool", labelKey: "common.amenities.pool", icon: "Pool" },
  { value: "garden", labelKey: "common.amenities.garden", icon: "Garden" },
  { value: "renovated", labelKey: "common.amenities.renovated", icon: "Renovated" },
  { value: "furnished", labelKey: "common.amenities.furnished", icon: "Furniture" },
  { value: "petFriendly", labelKey: "common.amenities.petFriendly", icon: "Pet" },
  { value: "accessible", labelKey: "common.amenities.accessible", icon: "Accessible" },
  { value: "safeRoom", labelKey: "common.amenities.safeRoom", icon: "SafeRoom" },
  { value: "solar", labelKey: "common.amenities.solar", icon: "Solar" },
] as const;

// User roles for role-switching dropdown
export const USER_ROLES = [
  { value: "investor", labelKey: "common.roles.investor" },
  { value: "broker", labelKey: "common.roles.broker" },
  { value: "mortgage_advisor", labelKey: "common.roles.mortgageAdvisor" },
  { value: "lawyer", labelKey: "common.roles.lawyer" },
  { value: "admin", labelKey: "common.roles.admin" },
] as const;
