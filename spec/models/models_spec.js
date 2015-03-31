// can use --captureExceptions for debugging
var models = require("../../models/models");
var Person = models.Person;
var Thing = models.Thing;
var Place = models.Place;

var db = require("../../config/db");
describe("models", function() {
  var ids = {};
  beforeEach(function(done) {
    db.connect(function() {
      models.seed(function(
        err,
        moe,
        larry,
        curly,
        rock,
        paper,
        scissors,
        newyork,
        paris,
        london) {
        ids.moeId = moe._id;
        ids.larryId = larry._id;
        ids.curlyId = curly._id;
        ids.rockId = rock._id;
        ids.paperId = paper._id;
        ids.scissorsId = scissors._id;
        ids.newyorkId = newyork._id;
        ids.parisId = paris._id;
        ids.londonId = london._id;
        done();
      });
    });
  });
  afterEach(function(done) {
    db.disconnect(function() {
      done();
    });
  });

  describe("Person", function() {
    // place tests
    // step 1 : Moe Favorites New York and Paris and Larry Favorites New York
    describe("Moe Favorites New York and Paris and Larry Favorites New York", function(cb){
      var favoritePlaces;
      var unFavoritePlaces;
      var peopleWhoLikeNY;
      var peopleWhoLikeLondon;
      var moe;
      
      var addFavoritePlaces = function(cb){
        Person.addPlace(ids.moeId, ids.newyorkId, function(){
          Person.addPlace(ids.moeId, ids.parisId, function(){
            Person.addPlace(ids.larryId, ids.newyorkId, function(){
              cb();
            });
          });
        });
      };
      beforeEach(function(done){
        addFavoritePlaces(function(){
          Place.getAllFavoritedPlaces(function(err, _favoritePlaces){
            favoritePlaces = _favoritePlaces;
            Place.getAllUnfavoritedPlaces(function(err, _unFavoritePlaces){
              unFavoritePlaces = _unFavoritePlaces;
              Person.findAllWhoFavoritedPlace(ids.newyorkId, function(err, _peopleWhoLikeNY){
                peopleWhoLikeNY = _peopleWhoLikeNY;
                Person.findAllWhoFavoritedPlace(ids.londonId, function(err, _peopleWhoLikeLondon){
                  peopleWhoLikeLondon = _peopleWhoLikeLondon;
                  Person.getOneByName("Moe", function(err, _moe){
                    moe = _moe;
                    done();
                  });
                });
              });
            });
          });
        });
      });// end of beforeEach
      it("Favorite Places Should Have two items", function(){
        expect(favoritePlaces.length).toEqual(2);
      });
      it("Favorite Places Should equal [New York, Paris]", function(){
        var myFavs = favoritePlaces.map(function(place){return place.name});
        expect(myFavs).toEqual(["New York", "Paris"]);
      });
      it("UnFavorite Places Should equal [London]", function(){
        var myUnFavs = unFavoritePlaces.map(function(place){return place.name});
        expect(myUnFavs).toEqual(["London"]);
      });
      it("People Who Like NY Should equal [Larry, Moe]", function(){
        var iLoveNy = peopleWhoLikeNY.map(function(person){return person.name});
        expect(iLoveNy).toEqual(["Larry", "Moe"]);
      });
      it("People Who Like London Should be empty", function(){
        expect(peopleWhoLikeLondon).toEqual([]);
      });
      it("Moe has 2 favorite places", function(){
        expect(moe.numberOfFavoritePlaces).toEqual(2);
      });
      it("Moes favorite places has the ids for New York and Paris", function(){
        // console.log(moe.favoritePlaces); // for debugging
        // Must do string comparason; cannot compare ObjectID objects
        var moesPlaces = moe.favoritePlaces.map(function(place){return place.toString()});
        expect(moesPlaces).toEqual([ids.newyorkId.toString(), ids.parisId.toString()]);
      });
      
      // step 2 : Moe and Larry unfavorite New York
      describe("Moe and Larry Unfavorite New York", function(cb){
        var unfavoriteNewYork = function(cb){
          Person.removePlace(ids.moeId, ids.newyorkId, function(){
            Person.removePlace(ids.larryId, ids.newyorkId, function(){
              cb();
            });
          })
        };
        beforeEach(function(done){
          unfavoriteNewYork(function(){
              Place.getAllFavoritedPlaces(function(err, _favoritePlaces){
              favoritePlaces = _favoritePlaces;
              Place.getAllUnfavoritedPlaces(function(err, _unFavoritePlaces){
                unFavoritePlaces = _unFavoritePlaces;
                Person.findAllWhoFavoritedPlace(ids.newyorkId, function(err, _peopleWhoLikeNY){
                  peopleWhoLikeNY = _peopleWhoLikeNY;
                  Person.findAllWhoFavoritedPlace(ids.londonId, function(err, _peopleWhoLikeLondon){
                    peopleWhoLikeLondon = _peopleWhoLikeLondon;
                    Person.getOneByName("Moe", function(err, _moe){
                      moe = _moe;
                      done();
                    });
                  });
                });
              });
            });
          })
        })// end of beforeEach
        it("Favorite Places Should equal [Paris]", function(){
        var myFavs = favoritePlaces.map(function(place){return place.name});
        expect(myFavs).toEqual(["Paris"]);
        });
        it("UnFavorite Places Should equal [London New York]", function(){
          var myUnFavs = unFavoritePlaces.map(function(place){return place.name});
          expect(myUnFavs).toEqual(["London", "New York"]);
        });
        it("People Who Like NY Should equal []", function(){
          // var iLoveNy = peopleWhoLikeNY.map(function(person){return person.name});
          expect(peopleWhoLikeNY).toEqual([]);
        });
        it("Moes favorite places has the id for Paris", function(){
        var moesPlaces = moe.favoritePlaces.map(function(place){return place.toString()});
        expect(moesPlaces).toEqual([ids.parisId.toString()]);
        });
        //Step 3-a : Moe tries to Favorite Paris again
        describe("Moe tries to re-favorite Paris", function() {
          var message;
          beforeEach(function(done) {
            Person.addPlace(ids.moeId, ids.parisId, function(err) {
              message = err.message;
              done();
            });
          });
          it("error is thrown", function() {
            expect(message).toEqual("USER_ALREADY_HAS_PLACE_IN_FAVORITES_LIST");
          });
        });// end of Step 3-a
        //Step 3-b : Moe tries to unfavorite New York Again
        describe("Moe tries to re-UnFavorite New York", function() {
          var message;
          beforeEach(function(done) {
            Person.removePlace(ids.moeId, ids.newyorkId, function(err) {
              message = err.message;
              done();
            });
          });
          it("error is thrown", function() {
            expect(message).toEqual("USER_DOES_NOT_HAVE_PLACE_IN_FAVORITES_LIST");
          });
        });// end of Step 3-b
      }); // end of Step 2
    });  //end of Step 1 (add favorites tests)
    // end of Place tests
    
    describe("acquire", function() {
      describe("Moe gets two rocks and piece of paper", function() {
        var things;
        var rockThing;
        var paperThing;
        var person;
        var giveMoeTwoRocksAndAPairOfScissors = function(cb) {
          Person.acquire(ids.moeId, ids.rockId, function() {
            Person.acquire(ids.moeId, ids.rockId, function() {
              Person.acquire(ids.moeId, ids.paperId, function() {
                cb();
              });
            });
          });
        };
        var getThingsFromMoe = function(moe) {
          return moe.things.map(
            function(thing) {
              return thing.name;
            }
          );
        };
        beforeEach(function(done) {
          giveMoeTwoRocksAndAPairOfScissors(function() {
            Thing.getOneByName("Rock", function(err, _thing) {
              rockThing = _thing;
              Thing.getOneByName("Paper", function(err, _thing) {
                paperThing = _thing
                Person.getOneByName("Moe", function(err, _person) {
                  things = getThingsFromMoe(_person);
                  person = _person;
                  done();
                });
              });
            });
          });
        });
        it("Moe has three things", function() {
          expect(person.things.length).toEqual(3)
        });
        it("Moe's numberOfthings is 3", function() {
          expect(person.numberOfThings).toEqual(3);
        });
        it("Moe has a two rocks and paper", function() {
          expect(things).toEqual(["Rock", "Rock", "Paper"]);
        });
        it("Rock is owned twice", function() {
          expect(rockThing.numberOwned).toEqual(2);
        });
        it("There are 8 rocks left", function() {
          expect(rockThing.numberInStock).toEqual(8);
        });
        it("There are 9 pieces of paper  left", function() {
          expect(paperThing.numberInStock).toEqual(9);
        });
        describe("moe gives back a rock", function() {
          beforeEach(function(done) {
            Person.returnThing(ids.moeId, ids.rockId, function() {
              Person.getOneByName("Moe", function(err, _person) {
                things = getThingsFromMoe(_person);
                Thing.getOneByName("Rock", function(err, _thing) {
                  rockThing = _thing;
                  done();
                });
              });
            });
          });
          it("moe has a rock and a piece of paper", function() {
            expect(things).toEqual(["Rock", "Paper"]);
          });
          it("There are now 9 rocks in stock", function() {
            expect(rockThing.numberInStock).toEqual(9);
          });
          it("One Rock is owned", function() {
            expect(rockThing.numberOwned).toEqual(1);
          });
        });
        describe("moe gives back paper", function() {
          var message;
          beforeEach(function(done) {
            Person.returnThing(ids.moeId, ids.scissorsId, function(err) {
              message = err.message;
              done();
            });
          });
          it("error is thrown", function() {
            expect(message).toEqual("USER_DOES_NOT_OWN");
          });
        });
        describe("There is no paper", function() {
          beforeEach(function(done) {
            Thing.update({
              _id: ids.paperId
            }, {
              $set: {
                numberInStock: 0
              }
            }, done)
          });
          describe("Moe attempts to get paper", function() {
            var message;
            beforeEach(function(done) {
              Person.acquire(ids.moeId, ids.paperId, function(err) {
                message = err.message;
                done();
              });
            });
            it("moe doesn't get to own paper", function() {
              expect(message).toEqual("NONE_IN_STOCK");
            });
          });
        });
      });
    });
    describe("getPersonByName", function() {
      var person;
      beforeEach(function(done) {
        Person.getOneByName("Moe", function(err, _person) {
          person = _person;
          done();
        });
      });
      it("person is moe", function() {
        expect(person.name).toEqual("Moe");
      });
    });
    describe("getPersonById", function() {
      var person;
      beforeEach(function(done) {
        Person.getOneById(ids.moeId, function(err, _person) {
          person = _person;
          done();
        });
      });
      it("returns moe", function() {
        expect(person.name).toEqual("Moe");
      });
    }); //end getPersonById

    describe("getAll", function() {
      var people;
      beforeEach(function(done) {
        Person.getAll(function(err, _people) {
          people = _people.map(function(person) {
            return person.name;
          });
          done();
        });
      });
      it("return [curly, larry, moe]", function() {
        expect(people).toEqual(["Curly", "Larry", "Moe"]);
      });
    });
  }); //end of person tests
  
  // Thing Tests
  describe("Thing", function() {
    describe("getOneByName", function() {
      var thing;
      beforeEach(function(done) {
        Thing.getOneByName("Rock", function(err, _thing) {
          thing = _thing;
          done();
        });
      });

      it("is a rock", function() {
        expect(thing.name).toEqual("Rock");
      });
    }); //end of getOneByName
    describe("getOneById", function() {
      var thing;
      beforeEach(function(done) {
        Thing.getOneById(ids.rockId, function(err, _thing) {
          thing = _thing;
          done();
        });
      });
      it("is a rock", function() {
        expect(thing.name).toEqual("Rock");
      });
    });
    describe("getAll", function() {
      var things;
      beforeEach(function(done) {
        Thing.getAll(function(err, _things) {
          things = _things.map(function(thing) {
            return thing.name;
          });
          done();
        });
      });
      it("return [Paper, Rock, Scissors]", function() {
        expect(things).toEqual(["Paper", "Rock", "Scissors"]);
      });
    });
  }); //end of Thing
  
  // Place Tests
  describe("Place", function() {
    describe("getOneByName", function() {
      var place;
      beforeEach(function(done) {
        Place.getOneByName("New York", function(err, _place) {
          place = _place;
          done();
        });
      });

      it("is New York", function() {
        expect(place.name).toEqual("New York");
      });
    }); //end of getOneByName
    describe("getOneById", function() {
      var place;
      beforeEach(function(done) {
        Place.getOneById(ids.londonId, function(err, _place) {
          place = _place;
          done();
        });
      });
      it("is London", function() {
        expect(place.name).toEqual("London");
      });
    });
    describe("getAll", function() {
      var places;
      beforeEach(function(done) {
        Place.getAll(function(err, _places) {
          places = _places.map(function(place) {
            return place.name;
          });
          done();
        });
      });
      it("return [London, New York, Paris]", function() {
        expect(places).toEqual(["London", "New York", "Paris"]);
      });
    });
  }); //end of Place Tests
});