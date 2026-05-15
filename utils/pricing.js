const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDateOnly = (value) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const pad = (value) => String(value).padStart(2, "0");

const dateKey = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const inRange = (date, start, end) => {
  if (!start || !end) {
    return false;
  }

  const startDate = toDateOnly(start);
  const endDate = toDateOnly(end);
  return date >= startDate && date <= endDate;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0;
};

const getSmartRate = (listing, date) => {
  const baseRate = Number(listing.price) || 0;
  const pricing = listing.pricing || {};
  let multiplier = 1;
  let label = "Base rate";

  if (pricing.smartPricingEnabled === false) {
    return {
      rate: baseRate,
      multiplier,
      label,
    };
  }

  if (inRange(date, pricing.offPeakStart, pricing.offPeakEnd)) {
    multiplier = Number(pricing.offPeakMultiplier) || 0.9;
    label = "Off-peak";
  }

  if (inRange(date, pricing.peakSeasonStart, pricing.peakSeasonEnd)) {
    const peakMultiplier = Number(pricing.peakSeasonMultiplier) || 1.25;
    if (peakMultiplier > multiplier) {
      multiplier = peakMultiplier;
      label = "Peak season";
    }
  }

  if (isWeekend(date)) {
    const weekendMultiplier = Number(pricing.weekendMultiplier) || 1.15;
    if (weekendMultiplier > multiplier) {
      multiplier = weekendMultiplier;
      label = "Weekend";
    }
  }

  for (const event of pricing.events || []) {
    if (inRange(date, event.startDate, event.endDate)) {
      const eventMultiplier = Number(event.multiplier) || 1.2;
      if (eventMultiplier > multiplier) {
        multiplier = eventMultiplier;
        label = event.name || "Major event";
      }
    }
  }

  return {
    rate: Math.round(baseRate * multiplier),
    multiplier,
    label,
  };
};

const calculateBookingPrice = (listing, checkIn, checkOut) => {
  const checkInDate = toDateOnly(checkIn);
  const checkOutDate = toDateOnly(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / MS_PER_DAY);
  const pricing = listing.pricing || {};
  const priceBreakdown = [];
  let staySubtotal = 0;

  for (let i = 0; i < nights; i += 1) {
    const nightDate = addDays(checkInDate, i);
    const rateInfo = getSmartRate(listing, nightDate);

    staySubtotal += rateInfo.rate;
    priceBreakdown.push({
      date: nightDate,
      dateKey: dateKey(nightDate),
      rate: rateInfo.rate,
      multiplier: rateInfo.multiplier,
      label: rateInfo.label,
    });
  }

  const cleaningFee = Number(pricing.cleaningFee) || 0;
  const serviceFeePercent = Number(pricing.serviceFeePercent) || 0;
  const serviceFee = Math.round((staySubtotal * serviceFeePercent) / 100);
  const totalPrice = staySubtotal + cleaningFee + serviceFee;

  return {
    nights,
    staySubtotal,
    cleaningFee,
    serviceFee,
    totalPrice,
    averageNightlyRate: nights > 0 ? Math.round(staySubtotal / nights) : 0,
    smartPricingApplied: Boolean(pricing.smartPricingEnabled),
    priceBreakdown,
  };
};

module.exports = {
  calculateBookingPrice,
};
