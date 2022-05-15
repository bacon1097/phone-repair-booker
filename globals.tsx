interface PhonePricingMapping {
  [key: string]: {
    [k in typeof REPAIR_TYPES[number]]?: number;
  };
}

export const REPAIR_TYPES = [
  "screen",
  "back camera",
  "front camera",
  "battery",
  "back camera glass",
] as const;

export const PHONE_PRICING: PhonePricingMapping = {
  "iPhone 6": {},
  "iPhone 6 Plus": {},
  "iPhone 6s": {},
  "iPhone 6s Plus": {},
  "iPhone 7": {},
  "iPhone 7 Plus": {},
  "iPhone 8": {},
  "iPhone 8 Plus": {},
  "iPhone X": {},
  "iPhone XR": {},
  "iPhone XS": {},
  "iPhone XS Max": {},
  "iPhone 11": {},
  "iPhone 11 Pro": {},
  "iPhone 11 Pro Max": {},
  "iPhone 12 mini": {},
  "iPhone 12": {},
  "iPhone 12 Pro": {},
  "iPhone 12 Pro Max": {},
  "iPhone 13 mini": {},
  "iPhone 13": {},
  "iPhone 13 Pro": {},
  "iPhone 13 Pro Max": {},
};

// Keep in 24-hour format
export const AVAILABLE_START_TIME = "09:00";
export const AVAILABLE_END_TIME = "18:00";

export const PHONE_MODELS = Object.keys(PHONE_PRICING);
