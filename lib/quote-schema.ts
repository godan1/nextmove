import { z } from "zod";

/**
 * Single source of truth for the quote form's shape. The Contact box
 * (contactBoxSchema) is always required; the "Get a precise quote" section
 * (preciseQuoteSchema) is optional with numeric defaults, so a submission
 * works whether or not the customer expands it. The API route
 * (app/api/quote/route.ts) re-validates the full quoteSchema server-side,
 * since client-side validation is a UX layer, not a security boundary.
 */

export const MOVE_SIZES = [
  "Studio or 1 bedroom",
  "2 bedroom",
  "3-4 bedroom",
  "5+ bedroom",
  "Office or business"
] as const;

export const PROPERTY_TYPES = ["House", "Apartment or condo", "Townhouse", "Office or business"] as const;

export const SPECIAL_ITEMS = [
  "Piano",
  "Safe",
  "Pool table",
  "Large appliances",
  "Gym equipment",
  "Artwork or antiques"
] as const;

/** The 4 box-size categories offered in the precise-quote inventory grid. */
export const BOX_TYPES = [
  { key: "boxSmall2cu", label: "Small (2 cu ft)", hint: "books, small items" },
  { key: "boxMedium3cu", label: "Medium (3 cu ft)", hint: "kitchen, general" },
  { key: "boxLarge5cu", label: "Large (5 cu ft)", hint: "bedding, bulky light items" },
  { key: "boxXLarge6cu", label: "Wardrobe / XL (6 cu ft)", hint: "hanging clothes" }
] as const;

const boxCount = z.coerce.number().int().min(0).max(200).default(0);
const smallCount = z.coerce.number().int().min(0).max(50).default(0);
const elevatorCount = z.coerce.number().int().min(0).max(6).default(0);
const stairCount = z.coerce.number().int().min(0).max(10).default(0);

export const contactBoxSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number so we can reach you.").max(20),
  date: z.string().trim().min(1, "Choose a preferred date."),
  size: z.enum(MOVE_SIZES, { errorMap: () => ({ message: "Select a move size." }) }),

  pickupStreet: z.string().trim().min(3, "Enter the street address (number & street)."),
  pickupCity: z.string().trim().min(2, "Enter the city."),
  pickupPostalCode: z.string().trim().max(10).optional().default(""),
  pickupFloor: z.string().trim().max(10).optional().default(""),
  pickupApt: z.string().trim().max(10).optional().default(""),

  destinationStreet: z.string().trim().min(3, "Enter the street address (number & street)."),
  destinationCity: z.string().trim().min(2, "Enter the city."),
  destinationPostalCode: z.string().trim().max(10).optional().default(""),
  destinationFloor: z.string().trim().max(10).optional().default(""),
  destinationApt: z.string().trim().max(10).optional().default("")
});

export const preciseQuoteSchema = z.object({
  propertyType: z.enum(PROPERTY_TYPES).default(PROPERTY_TYPES[0]),
  boxSmall2cu: boxCount,
  boxMedium3cu: boxCount,
  boxLarge5cu: boxCount,
  boxXLarge6cu: boxCount,
  totes: smallCount,
  beds: smallCount,
  dressers: smallCount,
  miscItems: z.string().trim().max(300).optional().default(""),
  specialItems: z.array(z.enum(SPECIAL_ITEMS)).default([]),
  pickupStairs: stairCount,
  deliveryStairs: stairCount,
  pickupElevators: elevatorCount,
  deliveryElevators: elevatorCount,
  notes: z.string().trim().max(1800).optional().default("")
});

export const photosSchema = z.object({
  photos: z.array(z.string().url()).max(6).default([])
});

export const quoteSchema = contactBoxSchema
  .and(preciseQuoteSchema)
  .and(photosSchema)
  .and(
    z.object({
      // Honeypot - real users never see or fill this field.
      company: z.string().max(0).optional().default("")
    })
  );

export type ContactBoxValues = z.infer<typeof contactBoxSchema>;
export type PreciseQuoteValues = z.infer<typeof preciseQuoteSchema>;
export type QuoteValues = z.infer<typeof quoteSchema>;

export const quoteDefaults: ContactBoxValues & PreciseQuoteValues & { photos: string[] } = {
  name: "",
  email: "",
  phone: "",
  date: "",
  size: MOVE_SIZES[0],
  pickupStreet: "",
  pickupCity: "",
  pickupPostalCode: "",
  pickupFloor: "",
  pickupApt: "",
  destinationStreet: "",
  destinationCity: "",
  destinationPostalCode: "",
  destinationFloor: "",
  destinationApt: "",
  propertyType: PROPERTY_TYPES[0],
  boxSmall2cu: 0,
  boxMedium3cu: 0,
  boxLarge5cu: 0,
  boxXLarge6cu: 0,
  totes: 0,
  beds: 0,
  dressers: 0,
  miscItems: "",
  specialItems: [],
  pickupStairs: 0,
  deliveryStairs: 0,
  pickupElevators: 0,
  deliveryElevators: 0,
  notes: "",
  photos: []
};
