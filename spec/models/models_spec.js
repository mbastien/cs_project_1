// can use --captureExceptions
var models = require("../../models/models");
var Person = models.Person;
var Thing = models.Thing;
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
        scissors) {
        ids.moeId = moe._id;
        ids.larryId = larry._id;
        ids.curlyId = curly._id;
        ids.rockId = rock._id;
        ids.paperId = paper._id;
        ids.scissorsId = scissors._id;
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

});