const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js"); 
const Listing=require("../models/listing.js");
const {isLoggedIn,isAdmin,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});


// using mvc= model view controller

router
.route("/")
.get(wrapAsync (listingController.index))
.post(
    isLoggedIn,
    isAdmin,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync (listingController.createListing)
);



//New Route
 router.get("/new",isLoggedIn,isAdmin,listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync (listingController.showListing))
.put(
     isLoggedIn,
     isOwner,
     upload.single("listing[image]"),
     validateListing,
    wrapAsync (listingController.updateListing)
)
.delete(isLoggedIn,isOwner,wrapAsync (listingController.destroyListing));

//Edit Route
 router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync (listingController.renderEditForm));

 

module.exports=router;
