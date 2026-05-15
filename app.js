require("dotenv").config({ quiet: true });
  
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
 
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const bookingRouter=require("./routes/booking.js");
const adminRouter=require("./routes/admin.js");

const PORT=process.env.PORT || 8080;
const MONGO_URL=process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";
const SESSION_SECRET=process.env.SECRET || process.env.SESSION_SECRET || "wanderlust-dev-secret";
const MONGO_TIMEOUT=Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;
const MONGO_DB_NAME=process.env.MONGO_DB_NAME || (hasDatabaseName(MONGO_URL) ? undefined : "wanderlust");

if(process.env.NODE_ENV==="production" && !process.env.MONGODB_URI){
    throw new Error("MONGODB_URI must be set in production");
}

if(process.env.NODE_ENV==="production" && SESSION_SECRET==="wanderlust-dev-secret"){
    throw new Error("SECRET must be set in production");
}

async function main() {
    await mongoose.connect(MONGO_URL,{
        serverSelectionTimeoutMS:MONGO_TIMEOUT,
        ...(MONGO_DB_NAME ? {dbName:MONGO_DB_NAME} : {}),
    });
};

function hasDatabaseName(uri){
    try{
        const parsedUri=new URL(uri);
        return Boolean(parsedUri.pathname && parsedUri.pathname !== "/");
    }catch(err){
        return false;
    }
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/Public")));

const store=MongoStore.create({
    clientPromise:mongoose.connection.asPromise().then((connection)=>connection.getClient()),
    ...(MONGO_DB_NAME ? {dbName:MONGO_DB_NAME} : {}),
    touchAfter:24*3600,
});

store.on("error",(err)=>{
    console.log("Error in mongo session store",err);
});
 
const sessionOptions={
    store,
    secret:SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,

    },
};

 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.currentPath=req.path;
   next();
});

 
app.get("/",(req,res)=>{
    res.redirect("/listings");
});

app.use("/listings/:id/bookings",bookingRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/admin",adminRouter);
app.use("/",userRouter);

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
});

main().then(()=>{
    console.log("connected to DB");
    app.listen(PORT,()=>{
        console.log(`server is listening on port ${PORT}`);
    });
}).catch((err)=>{
    console.error("Database connection error:",err);
    process.exit(1);
});
