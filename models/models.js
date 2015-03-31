var mongoose = require("mongoose");

// Person Stuff
var PersonSchema = new mongoose.Schema({
  name: String,
  things: [{
    type: mongoose.Schema.ObjectId,
    ref: "Thing"
  }],
  numberOfThings: {
    type: Number,
    default: 0
  },
  favoritePlaces: [{
    type: mongoose.Schema.ObjectId,
    ref: "Place"
  }],
  numberOfFavoritePlaces: {
    type: Number,
    default: 0
  }
});

PersonSchema.statics.getOneByName = function(name, cb) {
  this.findOne({
    name: name
  }).populate("things").exec(cb);
};

PersonSchema.statics.getOneById = function(id, cb) {
  this.findOne({
    _id: id
  }, cb);
};

PersonSchema.statics.getAll = function(cb) {
  this.find({}).sort("name").exec(cb);
};

PersonSchema.statics.acquire = function(personId, thingId, cb) {
  Thing.findById(thingId, function(err, _thing) {
    if (_thing.numberInStock <= 0)
      return cb({
        message: "NONE_IN_STOCK"
      });
    var qry = {
      _id: personId
    };
    var update = {
      $push: {
        things: thingId
      },
      $inc: {
        numberOfThings: 1
      }
    };
    Person.update(qry, update, function(err) {
      var query = {
        _id: thingId
      };
      var update = {
        $inc: {
          numberOwned: 1,
          numberInStock: -1
        }
      }
      Thing.update(query, update, function() {
        cb();
      });
    });
  });
};

PersonSchema.statics.returnThing = function(personId, thingId, cb) {
  this.findById(personId, function(err, _person) {
    var index = _person.things.indexOf(thingId);
    if (index == -1)
      return cb({
        message: "USER_DOES_NOT_OWN"
      }, null);
    _person.things.splice(index, 1);
    _person.numberOwned = _person.numberOwned + 1;
    _person.save(function(err) {
      var query = {
        _id: thingId
      };
      var update = {
        $inc: {
          numberOwned: -1,
          numberInStock: 1
        }
      };
      Thing.update(query, update, function() {
        cb();
      });
    });
  });
};

PersonSchema.statics.findAllWhoFavoritedPlace = function(placeId, cb){
  this.find({favoritePlaces : placeId}).sort("name").exec(cb);
};

PersonSchema.statics.addPlace = function(personId, placeId, cb){
  // callback an error if person already has that place
  this.findAllWhoFavoritedPlace(placeId, function(err, _people){
    // this returns a list of person objects, must map it to a list of object ids
    var peopleIds = _people.map(function(person){return person._id.toString()});
    // console.log("peopleIds : [" + peopleIds + "]; personId : " + personId);
    var index = peopleIds.indexOf(personId.toString());
    // console.log("index : " + index);
    if (index > -1){
      return cb({
        message: "USER_ALREADY_HAS_PLACE_IN_FAVORITES_LIST"
      });//, null);
    };
    var query = { _id : personId };
    var update = { 
      $inc : {numberOfFavoritePlaces : 1}, 
      $push : {favoritePlaces : placeId} 
    };
    Person.update(query, update, function(err) {
      // increment numberOfTimesFavorited for the place
      var placeQuery = {
        _id: placeId
      };
      var placeUpdate = {
        $inc: {
          numberOfTimesFavorited: 1
        }
      }
      Place.update(placeQuery, placeUpdate, function() {
        cb();
      });
    });
  });
};

PersonSchema.statics.removePlace = function(personId, placeId, cb) {
  this.findById(personId, function(err, _person) {
    var index = _person.favoritePlaces.indexOf(placeId);
    //callback error if person does not have that place
    if (index == -1)
      return cb({
        message: "USER_DOES_NOT_HAVE_PLACE_IN_FAVORITES_LIST"
      }, null);
    // remove  entry to favoritePlaces for that person
    _person.favoritePlaces.splice(index, 1); // does this remove place from array?
    // decrement numberOfFavoritePlaces for that person
    _person.numberOfFavoritePlaces = _person.numberOfFavoritePlaces - 1;
    _person.save(function(err) {
      var placeQuery = {
        _id: placeId
      };
      var placeUpdate = {
        $inc: {
          numberOfTimesFavorited: -1
        }
      };
      // decrement  numberOfTimesFavorited for the place
      Place.update(placeQuery, placeUpdate, function() {
        cb();
      });
    });
  });
};

var Person = mongoose.model("Person", PersonSchema);
// End Person Stuff

// Thing Stuff
var ThingSchema = new mongoose.Schema({
  name: String,
  numberOwned: {
    type: Number,
    default: 0
  },
  numberInStock: Number
});

ThingSchema.statics.getOneByName = function(name, cb) {
  this.findOne({
    name: name
  }, cb);
};

ThingSchema.statics.getOneById = function(id, cb) {
  this.findById(id, cb);
};

ThingSchema.statics.getAll = function(cb) {
  this.find({}).sort("name").exec(cb);
};

var Thing = mongoose.model("Thing", ThingSchema);

// End Thing Stuff

// Place Stuff

var PlaceSchema = new mongoose.Schema({
  name: String,
  numberOfTimesFavorited: {
    type: Number,
    default: 0
  }
});

PlaceSchema.statics.getOneByName = function(name, cb) {
  this.findOne({
    name: name
  }, cb);
};

PlaceSchema.statics.getOneById = function(id, cb) {
  this.findById(id, cb);
};

PlaceSchema.statics.getAll = function(cb) {
  this.find({}).sort("name").exec(cb);
};

PlaceSchema.statics.getAllFavoritedPlaces = function(cb) {
  this.find({numberOfTimesFavorited : {$gt : 0}}).sort("name").exec(cb);
};

PlaceSchema.statics.getAllUnfavoritedPlaces = function(cb) {
  this.find({numberOfTimesFavorited : {$lte : 0}}).sort("name").exec(cb);
};

var Place = mongoose.model("Place", PlaceSchema);

// End Place Stuff


function seed(cb) {
  var people = [{
    name: "Moe"
  }, {
    name: "Larry"
  }, {
    name: "Curly"
  }];
  var things = [{
    name: "Rock",
    numberInStock: 10
  }, {
    name: "Paper",
    numberInStock: 10
  }, {
    name: "Scissors",
    numberInStock: 10
  }];
  // don't need to include numberOfTimesFavorited, b/c it is 0 by default
  var places = [{
    name: "New York"
  }, {
    name: "Paris"
  }, {
    name: "London"
  }];
  Person.remove({}, function() {
    Person.create(people, function(err, moe, larry, curly) {
      Thing.remove({}, function() {
        Thing.create(things, function(err, rock, paper, scissors) {
          Place.remove({}, function() {
            Place.create(places, function(err, newyork, paris, london){
              cb(err, moe, larry, curly, rock, paper, scissors, newyork, paris, london);
            });
          });
        });
      });
    });
  });
}

module.exports = {
  seed: seed,
  Person: Person,
  Thing: Thing,
  Place: Place
};