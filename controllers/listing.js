const Listing=require("../models/listing");
const ExpressError=require("../utils/ExpressError");

const getImageData=(file)=>{
  return {
    url:file.secure_url || file.url || file.path,
    filename:file.public_id || file.filename,
  };
};

const normalizeListing=(listing)=>{
  if(!listing){
    return listing;
  }

  if(!listing.amenities){
    listing.amenities=[];
  }else if(!Array.isArray(listing.amenities)){
    listing.amenities=[listing.amenities];
  }

  listing.country=listing.country || "Kenya";
  listing.pricing=normalizePricing(listing.pricing);
  return listing;
};

const normalizeNumber=(value, fallback)=>{
  if(value === "" || value === null || typeof value === "undefined"){
    return fallback;
  }

  const numberValue=Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeDate=(value)=>{
  return value ? value : undefined;
};

const normalizePricing=(pricing={})=>{
  const normalizedPricing={...pricing};
  const eventInputs=Array.isArray(pricing.events)
    ? pricing.events
    : Object.values(pricing.events || {});

  normalizedPricing.smartPricingEnabled=
    pricing.smartPricingEnabled === true ||
    pricing.smartPricingEnabled === "true" ||
    pricing.smartPricingEnabled === "on";

  normalizedPricing.cleaningFee=normalizeNumber(pricing.cleaningFee,0);
  normalizedPricing.serviceFeePercent=normalizeNumber(pricing.serviceFeePercent,8);
  normalizedPricing.minStay=normalizeNumber(pricing.minStay,1);
  normalizedPricing.occupancyTarget=normalizeNumber(pricing.occupancyTarget,70);
  normalizedPricing.weekendMultiplier=normalizeNumber(pricing.weekendMultiplier,1.15);
  normalizedPricing.peakSeasonMultiplier=normalizeNumber(pricing.peakSeasonMultiplier,1.25);
  normalizedPricing.offPeakMultiplier=normalizeNumber(pricing.offPeakMultiplier,0.9);
  normalizedPricing.peakSeasonStart=normalizeDate(pricing.peakSeasonStart);
  normalizedPricing.peakSeasonEnd=normalizeDate(pricing.peakSeasonEnd);
  normalizedPricing.offPeakStart=normalizeDate(pricing.offPeakStart);
  normalizedPricing.offPeakEnd=normalizeDate(pricing.offPeakEnd);
  normalizedPricing.events=eventInputs
    .filter((event)=>event && event.name && event.startDate && event.endDate)
    .map((event)=>({
      name:event.name,
      startDate:event.startDate,
      endDate:event.endDate,
      multiplier:normalizeNumber(event.multiplier,1.2),
    }));

  return normalizedPricing;
};


module.exports.index=async (req,res)=>{
  const allListings= await Listing.find({}) ;
  res.render("./listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate({path:"reviews",populate:{
      path:"author",
    },
  })
    .populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing})
};

module.exports.createListing=async(req,res)=>{
    if(!req.file){
      throw new ExpressError(400,"Listing image is required");
    }
    let {url,filename}=getImageData(req.file);
    const newListing=new Listing(normalizeListing(req.body.listing));
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    
};

module.exports.renderEditForm=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
    if(!listing){
       req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
    
    res.render("listings/edit.ejs",{listing});
  };
 

module.exports.updateListing=async (req, res) => {
  let { id } = req.params;
 const listingData=normalizeListing(req.body.listing);
 let listing= await Listing.findByIdAndUpdate(id, { ...listingData }, {new:true, runValidators:true});
 if(!listing){
  throw new ExpressError(404,"Listing not found");
 }
 if(typeof req.file!=="undefined"){
  let {url,filename}=getImageData(req.file);
  listing.image={url,filename};
  await listing.save();
 }
  req.flash("success","Listing Updated!"); 
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
   let deletedListing=await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
    req.flash("success","Listing Deleted!");
   res.redirect("/listings");
};
