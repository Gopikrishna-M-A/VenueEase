const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const saltRounds = 10;

const app = express()




  //.env variables
  const PORT = process.env.PORT;
  const Pass_Key = process.env.PASS_KEY;
  const user_id = process.env.USER_ID;
  
  console.log(Pass_Key);
  console.log(user_id);
  
  const uri = `mongodb+srv://gopikrishna6003:${encodeURIComponent(Pass_Key)}@survey.0ijfdji.mongodb.net/venueEase`

  
  console.log(uri);
  mongoose.set("strictQuery", false);
  mongoose.connect(uri, { useNewUrlParser: true,useUnifiedTopology: true, }).then(() => {
    console.log('Connected to MongoDB successfully!');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true
  }));



// user Collection

const userSchema = mongoose.Schema(
    {
    colId:String,
    name:String,
    email:String,
    password:String,
    role:String,
    phone:Number,
    permissions:[String]
    }
)
userSchema.set('timestamps', true);

const User = new mongoose.model('User',userSchema)





// venue collection

const venueSchema = new mongoose.Schema({
    name:String,
    location:String, 
    venueAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    desc:String,
    capacity:Number,
    day:String,
    timing:String,
    amenities:[String],
    rules:[{
        ruleName:String,
        ruleDesc:String
    }]
})
venueSchema.set('timestamps', true);

const Venue = new mongoose.model('Venue',venueSchema)

 


//reservation collection 

const reservationSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    },
    eventName:String,
    eventDesc:String,
    eventType:String,
    dateTime:[
        {
            startDate:Date,
            endDate:Date
        }
        ],
    status:String,
    admin:mongoose.ObjectId,
    approvedAt:Date,
    rejectedAt:Date,
    rejectedreason:String
})
reservationSchema.set('timestamps', true);
const Reservation = new mongoose.model("Reservation",reservationSchema)

    
const ExpiredReservation = new mongoose.model("ExpiredReservation",reservationSchema)



const isLoggedIn = (req, res, next) => {
    if (req.cookies.loggedIn === 'true') {
      next();
    } else {
      res.redirect("/login")
    }
}


// **************************************************************** routes ***************************************************************

// / route

app.get("/",(req,res)=>{
    res.render("landing")
})


//logout route

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err)
        console.log(err)
      else {
        res.clearCookie('loggedIn');
        res.redirect('/login');
      }
    });
  });


//login route

app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",(req,res)=>{
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email }).then((user) => {
    if (!user) {
      console.log('User not found')
    } else {
        const hash = user.password
        bcrypt.compare(password, hash, function(err,result) {
            if(result){
                req.session.user = user;
                // console.log(user.name);
                res.cookie('loggedIn', 'true');
                res.redirect("/home")
            }
            else    
                res.send("password does not match")    
        })
    }
  })
  .catch((err) => {
    console.log(err);
  });
})




//signup route

app.get("/signup",(req,res)=>{
    res.render("signup")
})
app.post("/signup",(req,res)=>{
    const fname =req.body.fname
    const lname =req.body.lname
    const cid =req.body.cid
    const email =req.body.email
    const password =req.body.password
    const role =req.body.role
    const phone =req.body.phone

    bcrypt.hash(password, saltRounds, function(err, result) {
        if(!err){
            const user = new User({
                colId:cid,
                name:fname+" "+lname,
                email:email,
                password:result,
                role:role,
                phone:phone,
                permissions:[]
            })
            user.save().then(()=>{
              console.log('User saved successfully:', savedUser);
            }).catch((error) => {
              console.error('Error while saving user:', error);
              
            });
            console.log("encrypting sucessfull ....");
        }
        else
            console.log("err in encrypting password ....");
       
    
    });

   
    res.redirect("/login")
})





//home route

app.get("/home",isLoggedIn,(req,res)=>{

  Reservation.aggregate([
    {
      $group: {
        _id: "$venueId",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: 1 }
    },
    {
      $limit: 3
    }
  ])
    .then(leastReservationResults => {
      const leastReservationVenueIds = leastReservationResults.map(result => result._id);
  
      Reservation.aggregate([
        {
          $group: {
            _id: "$venueId",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 2
        }
      ])
        .then(highestReservationResults => {
          const highestReservationVenueIds = highestReservationResults.map(result => result._id);
  
          Venue.find({ _id: { $in: leastReservationVenueIds } })
            .then(availableVenues => {
              Venue.find({ _id: { $in: highestReservationVenueIds } })
                .then(popularVenues => {
                    // console.log("popular",popularVenues);
                    // console.log("available",availableVenues);
                  res.render("home",{available: availableVenues, popular: popularVenues, username: req.session.user.name })
                })
                .catch(error => {
                  console.log(error);
                  res.render("error");
                });
            })
            .catch(error => {
              console.log(error);
              res.render("error");
            });
        })
        .catch(error => {
          console.log(error);
          res.render("error");
        });
    })
    .catch(error => {
      console.log(error);
      res.render("error");
    });
  
  

  // res.render("home",{ username: req.session.user.name })
})





//reservation route

app.get("/reservation",isLoggedIn,async(req,res)=>{
    // console.log(req.session.user);

    if(req.session.user.role == "student")
        res.redirect("/reservation/student")
    if(req.session.user.role == "faculty")    
        res.redirect("/reservation/faculty")
    

})



//reservation faculty route
app.get("/reservation/faculty",isLoggedIn,async(req,res)=>{


    // find the venue ids for the  specific user id
    // find all the reservations with the venue ids 

    const venueAdminId = mongoose.Types.ObjectId.createFromHexString(req.session.user._id);

    // First, find all the venue IDs for this venueAdmin
    Venue.find({ venueAdmin: venueAdminId })
      .then((venues) => {
        const venueIds = venues.map((venue) => venue._id);
    
        // Then, find all reservations that have any of those venue IDs and group them by status
        Promise.all([
          Reservation.find({ venueId: { $in: venueIds }, status: 'pending' }).lean(),
          Reservation.find({ venueId: { $in: venueIds }, status: 'accepted' }).lean(),
          Reservation.find({ venueId: { $in: venueIds }, status: 'rejected' }).lean()
        ]).then(([pendingReservations, acceptedReservations, rejectedReservations]) => {
        
          // Retrieve the venue name for each reservation
          const getVenueName = (reservation) => {
            return Venue.findById(reservation.venueId)
              .then((venue) => {
                reservation.venueName = venue.name;
                return reservation;
              });
          };
    
          // Wait for all the nested queries to finish
          const promises = [];
          for (let i = 0; i < pendingReservations.length; i++) {
            promises.push(getVenueName(pendingReservations[i]));
          }
          for (let i = 0; i < acceptedReservations.length; i++) {
            promises.push(getVenueName(acceptedReservations[i]));
          }
          for (let i = 0; i < rejectedReservations.length; i++) {
            promises.push(getVenueName(rejectedReservations[i]));
          }
    
          Promise.all(promises)
            .then((reservations) => {
              // Group the reservations by status
              const pendingReservations = reservations.filter((reservation) => reservation.status === 'pending');
              const acceptedReservations = reservations.filter((reservation) => reservation.status === 'accepted');
              const rejectedReservations = reservations.filter((reservation) => reservation.status === 'rejected');
    
              res.render('faculty', {username: req.session.user.name,pendingReservations,acceptedReservations,rejectedReservations
              });




            })
            .catch((err) => {
              console.error(err);
            });
    
        }).catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    
      
  

})


// request/accept

app.get("/request/accept/:id",(req,res)=>{

  const query = { _id: req.params.id };
  const update = {
    admin:new mongoose.Types.ObjectId(req.session.user._id),
    approvedAt: new Date(),
    status: 'accepted' 
  };
  const options = { new: true }; 
  
  Reservation.updateOne(query, update, options)
    .then((updatedReservation) => {
      // console.log(updatedReservation);
      res.redirect("/reservation")
    })
    .catch((err) => {
      console.error(err);
    });

})



// request/reject

app.get("/request/reject/:id",(req,res)=>{

  const query = { _id: req.params.id };
  const update = {
    admin:new mongoose.Types.ObjectId(req.session.user._id),
    rejectedAt: new Date(),
    rejectedreason:"NIL",
    status: 'rejected' 
  };
  const options = { new: true }; 
  
  Reservation.updateOne(query, update, options)
    .then((updatedReservation) => {
      // console.log(updatedReservation);
      res.redirect("/reservation")
    })
    .catch((err) => {
      console.error(err);
    });

})


//reservation student route 
app.get("/reservation/student",isLoggedIn,(req,res)=>{
    Reservation.find({ userId: req.session.user._id })
    .then(async (reservations) => {
        const pendingReservations = [];
        const acceptedReservations = [];
        const rejectedReservations = [];
    
        await Promise.all(reservations.map(async (reservation) => {
            if (reservation.status === 'pending') {
                pendingReservations.push(reservation);
            } else if (reservation.status === 'accepted') {
                acceptedReservations.push(reservation);
            } else if (reservation.status === 'rejected') {
                rejectedReservations.push(reservation);
            }
    
            try {
                const venue = await Venue.findById(reservation.venueId);
                reservation.venueName = venue.name;
            } catch (err) {
                console.error(err);
            }
        }));

        // pendingReservations.forEach((reservation) => {
        //     console.log(reservation.venueName);
        // });
        res.render('student',{username: req.session.user.name, pendingReservations,acceptedReservations,rejectedReservations});
       
    

    })
    .catch((err) => {
        console.error(err);
    });
})


//cancel reservation student

app.post('/cancelReservation', (req, res) => {
  const reservationId = req.body.reservationId;
  console.log(reservationId);

  Reservation.findByIdAndDelete(reservationId)
  .then(deletedReservation => {
    if (deletedReservation) {
      console.log('Reservation deleted successfully:', deletedReservation);
      res.redirect("/reservation/student")
      // Handle the deletion success scenario
    } else {
      console.log('Reservation not found');
      // Handle the scenario when reservation with the given ID is not found
    }
  })
  .catch(err => {
    console.log('Error deleting reservation:', err);
    // Handle the error appropriately
  });
});




//booking route

app.get("/booking/:id", isLoggedIn, (req, res) => {
  const venueId = req.params.id; // Replace with the specific venue ID you want to query
  console.log("---------------");
  console.log(venueId)
  // Find reservations for the given venueId
  Reservation.find({ venueId })
    .populate({
      path: 'userId',
      // select: 'name email', // Select the fields you want to retrieve for the user
    })
    .populate({
      path: 'venueId',
      populate: {
        path: 'venueAdmin',
        model: 'User',
        // select: 'name email', // Select the fields you want to retrieve for the venue admin
      },
    })
    .exec()
    .then((reservations) => {
      if (reservations.length === 0) {
        // If no reservations are found for the venueId, retrieve the venue details separately
        return Venue.findById(venueId).populate('venueAdmin').exec()
          .then((venue) => {
            // Construct the response with all values as null except for the venue details
            const nullReservations = {
              _id: null,
              userId: null,
              venueId: venue || null,
              eventName: null,
              eventDesc: null,
              eventType: null,
              dateTime: null,
              status: null,
              admin: null,
              approvedAt: null,
              rejectedAt: null,
              rejectedreason: null,
              createdAt: null,
              updatedAt: null,
            };
            // Send the response to the view
            console.log("1.",nullReservations);
            res.render("booking", { reservations: [nullReservations], username: req.session.user.name });
          });
      } else {
        // If reservations are found, send the populated reservations to the view
        console.log("2.",reservations);
        console.log("---------------");
        res.render("booking", { reservations, username: req.session.user.name });
      }
    })
    .catch((err) => {
      console.error('Failed to retrieve reservations:', err);
      // Handle the error and respond accordingly
      res.status(500).send("Failed to retrieve reservations.");
    });
});


  
  



    // const id = req.params.id
    // Venue.findById(id).then(venue => {
    //     if (!venue) 
    //         console.log('venue not found')
    //     res.render("booking",{venue, username: req.session.user.name })    
    //   }).catch(err => {
    //     console.error(err)
    //   })



app.post("/booking",async (req,res)=>{



    const dates = [];
    const name = req.body.eventName;
    const type = req.body.type;
    const desc = req.body.desc;
    const Vid = req.body.venueId;
    const Uid = req.session.user._id;
    console.log(Vid);
    const startTimeList = req.body.stime;
    const endTimeList = req.body.etime;
    const yearList = req.body.year;
    const monthList = req.body.month;
    const dayList = req.body.day;
    
    const length = dayList.length;
    
    if (Array.isArray(dayList)) {
      for (let i = 0; i < length; i++) {
        const year = yearList[i];
        const month = monthList[i];
        const day = dayList[i];
        const start = startTimeList[i];
        const end = endTimeList[i];
    
        const [Shours, Sminutes] = start.split(":");
        const [Ehours, Eminutes] = end.split(":");
    
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZone: "Asia/Kolkata",
        };
    
        const Sdate = new Date(year, month, day, Shours, Sminutes).toLocaleString("en-IN", options);
        const Edate = new Date(year, month, day, Ehours, Eminutes).toLocaleString("en-IN", options);
    
        const dateObj = {
          startDate: Sdate,
          endDate: Edate,
        };
        dates.push(dateObj);
      }
    } else {
      const year = yearList;
      const month = monthList;
      const day = dayList;
      const start = startTimeList;
      const end = endTimeList;
    
      const [Shours, Sminutes] = start.split(":");
      const [Ehours, Eminutes] = end.split(":");
    
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "Asia/Kolkata",
      };
    
      const Sdate = new Date(year, month, day, Shours, Sminutes).toLocaleString("en-IN", options);
      const Edate = new Date(year, month, day, Ehours, Eminutes).toLocaleString("en-IN", options);
    
      const dateObj = {
        startDate: Sdate,
        endDate: Edate,
      };
      dates.push(dateObj);
    }
    
    // Check for conflicting bookings
    const conflictingBookings = await Reservation.find({
      venueId: Vid,
      dateTime: {
        $elemMatch: {
          $or: [
            { startDate: { $in: dates.map((d) => d.startDate) } },
            { endDate: { $in: dates.map((d) => d.endDate) } },
            {
              $and: [
                { startDate: { $lte: dates[0].startDate } },
                { endDate: { $gte: dates[0].endDate } },
              ],
            },
          ],
        },
      },
    });
    
    if (conflictingBookings.length > 0) {
      const alertMessage = "Booking conflicts with existing reservations";
      return res.send(
        `<script>alert('${alertMessage}'); window.location.href = '/venues';</script>`
      );

    }
    
    const reservation = new Reservation({
      userId: Uid,
      venueId: Vid,
      eventName: name,
      eventDesc: desc,
      eventType: type,
      dateTime: dates,
      status: "pending",
    });
    
    reservation.save();
    console.log(dates);
    res.redirect("/home");
    
    

})





//venues route

app.get("/venues",isLoggedIn,(req,res)=>{

    Venue.find({}).then((result)=>{
        if (!result) 
            res.send("no venues found!!!")       
        res.render("venues",{venues:result, username: req.session.user.name })
        // console.log(result);
    })
})



//messages route
app.get("/message",(req,res)=>{
  res.render("message",{username:req.session.user.name})
})



//update route

app.get("/update",isLoggedIn,(req,res)=>{

    Venue.find({}).then((venues)=>{
        if (!venues) 
            res.send("no venues found !!!!!")  
        User.find({role:'faculty'}).then((result)=>{
            if (!result) 
                res.send("no user found with role faculty !!!!!")    
            res.render("update",{faculty:result,venues:venues,username: req.session.user.name })
        })      
    })
})



//update/add route

app.post("/update/add",(req,res)=>{
    const name = req.body.name
    const location = req.body.location
    const venueAdmin = req.body.admin
    const desc = req.body.para
    const capacity = req.body.capacity
    const sdate = req.body.sdate
    const edate = req.body.edate
    const day = sdate + " - " + edate
    const stime = req.body.stime
    const etime = req.body.etime
    const amenities = req.body.amenity
    const timing = stime + " AM - " + etime +" PM"

    const venue = new Venue({
        name,
        location,
        venueAdmin,
        desc,
        capacity,
        day,
        timing,
        amenities
    })

    venue.save()

    res.redirect("/venues")

})




//update/edit route

app.post("/update/edit",(req,res)=>{
    const vid = req.body.venue
    const name = req.body.name
    const location = req.body.location
    const admin = req.body.admin
    const desc = req.body.para
    const capacity = req.body.capacity
    const sdate = req.body.sdate
    const edate = req.body.edate
    const date = sdate + " - " + edate
    const stime = req.body.stime
    const etime = req.body.etime
    const amenity = req.body.amenity
    const time = stime + " AM - " + etime +" PM"

    const update = {
        name:name,
        location:location,
        venueAdmin:admin,
        desc:desc,
        capacity:capacity,
        day:date,
        timing:time,
        amenities:amenity
      };
      
      Venue.findByIdAndUpdate(vid, update, { new: true })
        .then((updatedVenue) => {
          console.log('Updated venue:', updatedVenue);
        })
        .catch((err) => {
          console.log('Error updating venue:', err);
        });

        res.redirect("/venues")
})



//update/delete route

app.post("/update/delete",(req,res)=>{

    const vid = req.body.venue
    // console.log(vid);

    Venue.findByIdAndRemove(vid)
    .then((removedVenue) => {
      console.log('Removed venue:', removedVenue);
    })
    .catch((err) => {
      console.log('Error removing venue:', err);
    });
    res.redirect("/venues")
})





// data route

app.get('/data', (req, res) => {
    const id = req.query.id;
    Venue.findById(id)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Error fetching data from database');
      });
  });




app.listen(PORT||4000,(err)=>{
    if(err)
        console.log("err");
    else
        console.log("server started at port 4000");    
})



// app.get("/faculty",isLoggedIn,(req,res)=>



// // Function to remove expired reservations
// async function removeExpiredReservations() {
//   try {
//     const currentTime = new Date();

//     // Find reservations with end date less than current time
//     const expiredReservations = await Reservation.find({
//       "dateTime.endDate": { $lt: currentTime },
//     });

//     // Move expired reservations to the "ExpiredReservation" collection
//     for (const reservation of expiredReservations) {
//       const expiredReservation = new ExpiredReservation(reservation.toObject());
//       await expiredReservation.save();
//       await Reservation.deleteOne({ _id: reservation._id });
//     }

//     console.log(`${expiredReservations.length} expired reservations removed and saved in "ExpiredReservation" collection`);
//   } catch (error) {
//     console.error("Error removing expired reservations:", error);
//   }
// }

// // Schedule the function to run periodically
// setInterval(removeExpiredReservations, 60000); // Run every 1 minute (adjust the interval as needed)
