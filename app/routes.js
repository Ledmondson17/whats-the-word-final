module.exports = function(app, passport, db) { // routes.js is just one big function
  let foursquare =  require('./foursquare.js') // allows foursquare.js to pass its information through here
  var ObjectId = require('mongodb').ObjectID // allows you to grab user id in each of mongo db docs
  // normal routes =============================================================

  // show the home page (will also have our login links)
  app.get('/calendar', function(req, res) {
    res.render('index.ejs')});
    // });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      db.collection('messages').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('profile.ejs', {
          user : req.user,
          messages: result
        })
      })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // ===========================================================================
    // PROFILE PREFERENCE PAGE ===================================================
    // ===========================================================================
    app.post('/preferences', (req, res) => {

      let venueTypes = []; // this if statement is checking to see if profile preferences have more than 1 option. if so it is array, if not we make it an array of 1 item
      if (req.body.venue.constructor === Array){
        venueTypes = req.body.venue;
      }else{
        venueTypes.push(req.body.venue)
      }
      console.log(req.user,req.user._id);
      db.collection('users')
      .findOneAndUpdate({"_id": ObjectId(req.user._id)},{local: req.user.local, venue: venueTypes, favoriteMusic: req.body.favoriteMusic, favSong: req.body.favSong, favVenue: req.body.favVenue}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

  // ===========================================================================
  // AUTHENTICATE (FIRST LOGIN) ================================================
  // ===========================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/preferences', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // ===========================================================================
  // UNLINK ACCOUNTS ===========================================================
  // ===========================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user            = req.user;
    user.local.email    = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });
  // ===========================================================================
  // HOMEPAGE ==================================================================
  // ===========================================================================
  app.get('/', isLoggedIn,function(req, res) {

    // Access the session as req.session
    // put the lat and lon from the query string into the session
    if (req.query.lat && req.query.lon) { // if lat & lon are in url query then pass them into session location
      req.session.location = {lat: req.query.lat, lon: req.query.lon};
    }else{
      console.log("no location");
    }
    // if we have location in the session, render the homepage.ejs to show the location in the browser
    if (req.session.location) {
      console.log("show location: ",  req.session.location);
    } else {
      console.log("first pass");
      // otherwise, if we don't have the location in the session, send a special
      // html file which does this:
      // 1. get the location using the browser's navigator.geolocation.getCurrentPosition
      // 2. redirect the browser back to / but with the query string ?lat=XX&lon=XX
      // res.sendFile(__dirname + '/public/getlocation.html');
    }
    if(req.session.location){
      let categories =[] // get categories from user. user venue array in preferences
      let specificVenues
      var pref = req.user.toObject().venue[0]
      foursquare.getVenues(req.session.location.lat, req.session.location.lon, pref, categories,function(allVenues){ // this function is going into foursquare.js and grabbing the "getVenues" function that is finding all the venues nearby
      for (let i = 0; i < allVenues.venues.length; i++) {
        if (!allVenues.venues[i].location.address){ // shuffling through all venues to get their address
          allVenues.venues.splice(i,1)
        }
      }
      specificVenues = Object.values(allVenues.venues) // needed object.values to turn venues into actual object so we could take properties off of it
      req.session.venues = specificVenues // req makes it so that this data can be pulled form any page
      res.render('homepage.ejs', {specificVenues: specificVenues, lat: req.session.location.lat, lon: req.session.location.lon}) // here we can do anything we want with that specific venue so we are rndering it to our screen
    });
    // hi
}else{
  res.render('geolocation.ejs')
}
});
// ===========================================================================
// PROFILE PREFERENCE PAGE ===================================================
// ===========================================================================
app.get('/preferences', function(req, res) {
  res.render('pro-pref.ejs', { message: req.flash('signupMessage') });
});
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/preferences', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));
app.get("/apitest",function(req, res){
  console.log(req.session.location);
  res.send("hello");

});
// ===========================================================================
// VENUE PAGE ================================================================
// ===========================================================================
app.get('/venue', isLoggedIn,function(req, res) {
  const id = req.url.split("=") // making a variable that is spliutting a url by removing "=" which then turns url into an array with the id as the second elemnt
  console.log(id);
  foursquare.getSpecificVenue(id[1], function(specificVenue){
    res.render('venue.ejs', { specificVenue: specificVenue, message: req.flash('signupMessage') });
  })
   // calling function from foursquare.js and we are passing in the variable and grabbing the id by its indicie
});
// ===========================================================================
// MAP PAGE ================================================================
// ===========================================================================
app.get('/map', function(req, res) {
  res.render('map.ejs', { venues: req.session.venues, lat: req.session.location.lat, lon: req.session.location.lon, message: req.flash('signupMessage') }); //setting these variableS inside this page holding these things
});
// ===========================================================================
// WORD OF THE DAY PAGE ======================================================
// ===========================================================================
app.get('/wordoftheday', function(req, res) {
  res.render('word-of-the-day.ejs', { message: req.flash('signupMessage') });
});


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();

  res.redirect('/login');
}
