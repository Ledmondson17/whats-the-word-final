const fetch = require('node-fetch');



function getVenues(lat,lng, callback){
  const url = `https://api.foursquare.com/v2/venues/search?client_id=OLTUY3MB0W3OZ3ED3L52OQPO4R4KIZYL4UL5NQKX1WZRF3DR&client_secret=XB01K0FKGGHPCADJWTA1E45KW0MRVPWVSZAE1OQRAETWAMHJ&ll=${lat},${lng}&v=20181128&categoryId=4d4b7105d754a06376d81259,4bf58dd8d48988d11f941735&radius=200`
  //console.log(url);
  fetch(url).then(function(response) {
    return response.json();
  }).then(function(myJson) {
    callback(myJson.response);
  });
}

function getSpecificVenue(venId, callback){
  fetch(`https://api.foursquare.com/v2/venues/${venId}?client_id=OLTUY3MB0W3OZ3ED3L52OQPO4R4KIZYL4UL5NQKX1WZRF3DR&client_secret=XB01K0FKGGHPCADJWTA1E45KW0MRVPWVSZAE1OQRAETWAMHJ&v=20181128`)
.then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    //console.log("getSpecificVenue: ", myJson.response);
    callback(myJson.response);
  });
}
function getSpecificVenueHours(venId, callback){
  fetch(`https://api.foursquare.com/v2/venues/${venId}/hours?client_id=OLTUY3MB0W3OZ3ED3L52OQPO4R4KIZYL4UL5NQKX1WZRF3DR&client_secret=XB01K0FKGGHPCADJWTA1E45KW0MRVPWVSZAE1OQRAETWAMHJ&v=20181128`)
.then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    //console.log("getSpecificVenueHours: ", myJson.response)
    callback(myJson.response);
  });
}
function getSpecificVenueCategories(venId, callback){
  fetch(`https://api.foursquare.com/v2/venues/categories?client_id=OLTUY3MB0W3OZ3ED3L52OQPO4R4KIZYL4UL5NQKX1WZRF3DR&client_secret=XB01K0FKGGHPCADJWTA1E45KW0MRVPWVSZAE1OQRAETWAMHJ&v=20181128`)
.then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    // console.log("getSpecificVenueCategories: ", myJson.response)
    //console.log(myJson);
    callback(myJson);
  });
}
module.exports = {getVenues: getVenues, getSpecificVenue, getSpecificVenueHours, getSpecificVenueCategories};
// getVenues(42.36,-71.0545, function(venues) {
//   console.log("the venues:", venues);
// });
