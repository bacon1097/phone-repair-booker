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

export const PICK_UP_CHARGE = 10;

export const MAX_PICK_UP_DISTANCE_KM = 10;

// Keep in 24-hour format
export const AVAILABLE_START_TIME = "09:00";
export const AVAILABLE_END_TIME = "18:00";

export const PHONE_PRICING: PhonePricingMapping = {
  "iPhone 6": {
    screen: 40,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 6 Plus": {
    screen: 40,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 6s": {
    screen: 40,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 6s Plus": {
    screen: 40,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 7": {
    screen: 50,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 7 Plus": {
    screen: 50,
    battery: 30,
    "back camera": 20,
  },
  "iPhone 8": {
    screen: 50,
    battery: 20,
    "back camera": 20,
  },
  "iPhone 8 Plus": {
    screen: 50,
    battery: 30,
    "back camera": 20,
  },
  "iPhone X": {
    screen: 90,
    battery: 30,
    "back camera": 70,
  },
  "iPhone XR": {
    screen: 95,
    battery: 35,
    "back camera": 85,
  },
  "iPhone XS": {
    screen: 250,
    "back camera": 95,
  },
  "iPhone XS Max": {
    screen: 250,
    "back camera": 95,
  },
  "iPhone 11": {
    screen: 250,
    "back camera": 95,
  },
  "iPhone 11 Pro": {
    screen: 250,
    "back camera": 150,
  },
  "iPhone 11 Pro Max": {
    screen: 250,
    "back camera": 150,
  },
  "iPhone 12 mini": {
    screen: 250,
  },
  "iPhone 12": {
    screen: 250,
  },
  "iPhone 12 Pro": {
    screen: 250,
  },
  "iPhone 12 Pro Max": {
    screen: 290,
    "back camera": 170,
  },
  "iPhone 13 mini": {
    screen: 250,
  },
  "iPhone 13": {
    screen: 250,
  },
  "iPhone 13 Pro": {
    screen: 250,
  },
  "iPhone 13 Pro Max": {
    screen: 250,
  },
};

export const PHONE_MODELS = Object.keys(PHONE_PRICING);
