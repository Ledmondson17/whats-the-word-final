const fetch = require('node-fetch');



function getVenues(lat,lng, pref, categories, callback){ // use pref to add venue category id's to url

    let prefOption = venueTypeToId(pref)
  const url = `https://api.foursquare.com/v2/venues/search?client_id=OLTUY3MB0W3OZ3ED3L52OQPO4R4KIZYL4UL5NQKX1WZRF3DR&client_secret=XB01K0FKGGHPCADJWTA1E45KW0MRVPWVSZAE1OQRAETWAMHJ&ll=${lat},${lng}&v=20181128&categoryId=${prefOption}&radius=500`
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

function venueTypeToId(venueType){
  if('hookah' === venueType){
    return '4bf58dd8d48988d119941735'
  }else if('nightclub' === venueType){
    return '4bf58dd8d48988d11f941735'
  }else if('lounge' === venueType){
    return '4bf58dd8d48988d121941735'
  }else if('bar' === venueType){
    return '4bf58dd8d48988d116941735'
  }else if('comedy club' === venueType){
    return '4bf58dd8d48988d18e941735'
  }else if('brewery' === venueType){
    return '50327c8591d4c4b30a586d5d'
  }else if('casino' === venueType){
    return '4bf58dd8d48988d17c941735'
  } else {
    console.log("warning: unknown venue type: ", venueType)
  }
}
module.exports = {getVenues: getVenues, venueTypeToId: venueTypeToId, getSpecificVenue: getSpecificVenue};
// getVenues(42.36,-71.0545, function(venues) {
//   console.log("the venues:", venues);
// });

console.log(module.exports.venueTypeToId('hookah'));
