module.exports = function(app, passport, db) { // routes.js is just one big function
let foursquare =  require('./foursquare.js') // allows foursquare.js to pass its information through here
  // normal routes =============================================================

  // show the home page (will also have our login links)
  app.get('/index', function(req, res) {
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
    db.collection('users').save({venue: req.body.venue, favoriteMusic: req.body.favoriteMusic, favSong: req.body.favSong, favVenue: req.body.favVenue, thumbDown: 0, thumbDown:0}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/messages', (req, res) => {
    db.collection('users')
    .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, { //updating the "name" & "msg" fields with "req.body.___" in the document inside the collection
      $set: {
        thumbUp:req.body.thumbUp + 1
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })

  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
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

  // process the signup form
  //   app.post('/signup',function(req, res){ //posting and saving these 4 properties to each document saved in db
  //     db.collection('users').save({ //posting and saving these 4 properties to each document saved in db
  //     name: req.body.name, //posting and saving these 4 properties to each document saved in db
  //     email: req.body.email, //posting and saving these 4 properties to each document saved in db
  //     pass: req.body.pass, //posting and saving these 4 properties to each document saved in db
  //     username: req.body.username //posting and saving these 4 properties to each document saved in db
  //   }, (err,result) => {
  //     if (err) return console.log(err)
  //     console.log('saved to database')
  //     res.redirect('/')
  //   })
  // })
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
  app.get('/', function(req, res) {
    if (req.query.lat && req.query.lon) {
      console.log("query string: ",  req.query);
      // Access the session as req.session
      // put the lat and lon from the query string into the session
      req.session.location = {lat: req.query.lat, lon: req.query.lon};
    }else{
      console.log("no location");
    }
    // if we have location in the session, render the showlocation.ejs page to sho
    // the location in the browser
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
      let specificVenues
      foursquare.getVenues(req.session.location.lat,req.session.location.lon, function(allVenues) { // this function is going into foursquare.js and grabbing the "getVenues" function that is finding all the venues nearby
        //console.log("data:", data);
        for (let i = 0; i < allVenues.venues.length; i++) {
          if (!allVenues.venues[i].location.address) {
            allVenues.venues.splice(i,1)
          }
        }
        console.log(allVenues.venues);
        specificVenues = Object.values(allVenues.venues)
        req.session.venues = specificVenues // req makes it so that this data can be pulled form any page
        // foursquare.getSpecificVenue(allVenues.venues[0].id, function(specificVenue) { // this function grabs a specific venue using the data pulled from getvenues()
        //   console.log("venue:", specificVenue.venue.name)
        //   res.render('homepage.ejs', {specificVenue: specificVenue.venue}) // here we can do anything we want with that specific venue so we are rndering it to our screen
        // });
        res.render('homepage.ejs', {specificVenues: specificVenues, lat: req.session.location.lat, lon: req.session.location.lon}) // here we can do anything we want with that specific venue so we are rndering it to our screen
      });
      // res.render('homepage.ejs', {message: req.flash('signupMessage'),location: req.session.location});
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
  app.get('/venue', function(req, res) {
    const id = req.url.split("=") // making a variable that is spliutting a url by removing "=" which then turns url into an array with the id as the second elemnt
    console.log(id);
    foursquare.getSpecificVenue(id[1], function(specificVenue){
      console.log('*********** specificVenue below ************')
      console.log(specificVenue)
      res.render('venue.ejs', { specificVenue: specificVenue, message: req.flash('signupMessage') });
    }) // calling function from foursquare.js and we are passing in the variable and grabbingthe id by its indicie
  });
  // ===========================================================================
  // MAP PAGE ================================================================
  // ===========================================================================
  app.get('/map', function(req, res) {
    res.render('map.ejs', { venues: req.session.venues, lat: req.session.location.lat, lon: req.session.location.lon, message: req.flash('signupMessage') }); //setting these variableS inside this page holding these things
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();

  res.redirect('/');
}
