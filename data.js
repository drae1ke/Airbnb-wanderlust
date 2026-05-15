const roomImages = {
  executive:
    "https://plus.unsplash.com/premium_photo-1661964402307-02267d1423f5?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  modern:
    "https://plus.unsplash.com/premium_photo-1664299335717-71d868cd964e?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  studio:
    "https://plus.unsplash.com/premium_photo-1661962739798-0af59dc30d14?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  luxury:
    "https://plus.unsplash.com/premium_photo-1661877303180-19a028c21048?auto=format&fit=crop&fm=jpg&q=80&w=1600",
};

const sampleListings = [
  {
    title: "Westlands Executive King Room",
    description:
      "A polished king room near Sarit Centre with a work desk, fast Wi-Fi, blackout curtains, and easy access to Nairobi business hubs.",
    image: {
      filename: "westlands-executive-king-room",
      url: roomImages.executive,
    },
    price: 8500,
    location: "Westlands",
    county: "Nairobi",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Workspace", "Breakfast", "Secure parking"],
    pricing: {
      cleaningFee: 1200,
      serviceFeePercent: 8,
      minStay: 1,
      occupancyTarget: 75,
    },
  },
  {
    title: "Kilimani Modern Studio Suite",
    description:
      "A compact serviced studio close to Yaya Centre with a kitchenette, queen bed, smart TV, and reliable backup power.",
    image: {
      filename: "kilimani-modern-studio-suite",
      url: roomImages.modern,
    },
    price: 6200,
    location: "Kilimani",
    county: "Nairobi",
    country: "Kenya",
    roomType: "Studio",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Kitchenette", "Backup power", "Self check-in"],
    pricing: {
      cleaningFee: 1000,
      serviceFeePercent: 8,
      minStay: 1,
      occupancyTarget: 80,
    },
  },
  {
    title: "Karen Garden View Guest Room",
    description:
      "A calm room in leafy Karen with garden views, ensuite bathroom, breakfast service, and quick access to the Giraffe Centre.",
    image: {
      filename: "karen-garden-view-guest-room",
      url: roomImages.luxury,
    },
    price: 7800,
    location: "Karen",
    county: "Nairobi",
    country: "Kenya",
    roomType: "Guest suite",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Garden", "Breakfast", "Secure parking"],
    pricing: {
      cleaningFee: 1100,
      serviceFeePercent: 8,
      minStay: 1,
      occupancyTarget: 70,
    },
  },
  {
    title: "Nyali Coastal Double Room",
    description:
      "A bright double room in Nyali with air conditioning, pool access, and short rides to City Mall and the beach.",
    image: {
      filename: "nyali-coastal-double-room",
      url: roomImages.studio,
    },
    price: 6900,
    location: "Nyali",
    county: "Mombasa",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Air conditioning", "Pool", "Wi-Fi", "Breakfast"],
    pricing: {
      cleaningFee: 1000,
      serviceFeePercent: 9,
      minStay: 1,
      occupancyTarget: 78,
    },
  },
  {
    title: "Diani Beach Boutique Room",
    description:
      "A boutique room for coastal stays with a king bed, balcony, air conditioning, and quick access to Diani Beach Road.",
    image: {
      filename: "diani-beach-boutique-room",
      url: roomImages.executive,
    },
    price: 9200,
    location: "Diani",
    county: "Kwale",
    country: "Kenya",
    roomType: "Suite",
    maxGuests: 2,
    amenities: ["Air conditioning", "Balcony", "Pool", "Wi-Fi"],
    pricing: {
      cleaningFee: 1500,
      serviceFeePercent: 9,
      minStay: 2,
      occupancyTarget: 82,
    },
  },
  {
    title: "Kisumu Lake View Room",
    description:
      "A relaxed room near Lake Victoria with a queen bed, desk, lake-facing lounge access, and quick movement into Kisumu CBD.",
    image: {
      filename: "kisumu-lake-view-room",
      url: roomImages.modern,
    },
    price: 5400,
    location: "Milimani",
    county: "Kisumu",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Workspace", "Breakfast", "Lake access"],
    pricing: {
      cleaningFee: 800,
      serviceFeePercent: 7,
      minStay: 1,
      occupancyTarget: 70,
    },
  },
  {
    title: "Nakuru CBD Business Room",
    description:
      "A practical room for work trips with fast Wi-Fi, desk space, secure parking, and easy access to Nakuru town.",
    image: {
      filename: "nakuru-cbd-business-room",
      url: roomImages.studio,
    },
    price: 4800,
    location: "Nakuru CBD",
    county: "Nakuru",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Workspace", "Secure parking", "Breakfast"],
    pricing: {
      cleaningFee: 700,
      serviceFeePercent: 7,
      minStay: 1,
      occupancyTarget: 72,
    },
  },
  {
    title: "Naivasha Weekend Studio",
    description:
      "A warm studio for short breaks with a kitchenette, queen bed, balcony, and convenient access to Moi South Lake Road.",
    image: {
      filename: "naivasha-weekend-studio",
      url: roomImages.luxury,
    },
    price: 5800,
    location: "Naivasha",
    county: "Nakuru",
    country: "Kenya",
    roomType: "Studio",
    maxGuests: 2,
    amenities: ["Kitchenette", "Balcony", "Wi-Fi", "Secure parking"],
    pricing: {
      cleaningFee: 900,
      serviceFeePercent: 8,
      minStay: 1,
      occupancyTarget: 76,
    },
  },
  {
    title: "Eldoret Town Ensuite Room",
    description:
      "A clean ensuite room for athletes, students, and business visitors with a desk, hot shower, and secure parking.",
    image: {
      filename: "eldoret-town-ensuite-room",
      url: roomImages.executive,
    },
    price: 4200,
    location: "Eldoret Town",
    county: "Uasin Gishu",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Workspace", "Hot shower", "Secure parking"],
    pricing: {
      cleaningFee: 650,
      serviceFeePercent: 7,
      minStay: 1,
      occupancyTarget: 68,
    },
  },
  {
    title: "Nanyuki Mount Kenya Room",
    description:
      "A stylish room for Nanyuki escapes with warm bedding, Wi-Fi, breakfast service, and views toward Mount Kenya on clear days.",
    image: {
      filename: "nanyuki-mount-kenya-room",
      url: roomImages.modern,
    },
    price: 7200,
    location: "Nanyuki",
    county: "Laikipia",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Breakfast", "Fireplace", "Secure parking"],
    pricing: {
      cleaningFee: 1000,
      serviceFeePercent: 8,
      minStay: 1,
      occupancyTarget: 74,
    },
  },
  {
    title: "Lamu Old Town Heritage Room",
    description:
      "A heritage-inspired room in Lamu Old Town with carved wood details, ceiling fan, ensuite bathroom, and breakfast service.",
    image: {
      filename: "lamu-old-town-heritage-room",
      url: roomImages.studio,
    },
    price: 6800,
    location: "Lamu Old Town",
    county: "Lamu",
    country: "Kenya",
    roomType: "Guest suite",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Breakfast", "Ceiling fan", "Terrace"],
    pricing: {
      cleaningFee: 900,
      serviceFeePercent: 8,
      minStay: 2,
      occupancyTarget: 72,
    },
  },
  {
    title: "Kisii Town Deluxe Room",
    description:
      "A comfortable room close to Kisii town amenities with a queen bed, desk, hot shower, and secure parking.",
    image: {
      filename: "kisii-town-deluxe-room",
      url: roomImages.luxury,
    },
    price: 3900,
    location: "Kisii Town",
    county: "Kisii",
    country: "Kenya",
    roomType: "Private room",
    maxGuests: 2,
    amenities: ["Wi-Fi", "Workspace", "Hot shower", "Secure parking"],
    pricing: {
      cleaningFee: 600,
      serviceFeePercent: 7,
      minStay: 1,
      occupancyTarget: 68,
    },
  },
];

module.exports = { data: sampleListings };
