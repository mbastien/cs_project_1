var mongoose = require("mongoose");
var PersonSchema = new mongoose.Schema({
    name:String,
    things : [{type: mongoose.Schema.ObjectId, ref: "Thing"}],
    numberOfThings : {type : Number, default : 0}
});
var ThingSchema = new mongoose.Schema({
    name:String,
    numberOwned : {type : Number, default : 0},
    numberInStock : Number
});

PersonSchema.statics.getOneByName = function(name, cb){
    this.findOne({name:name}).populate("things").exec(cb);
};

PersonSchema.statics.aquire = function(personId, thingId, cb){ // error here somewhere
    var qry = {_id:personId};
    var update = {$push: {things : thingId}, $inc: {numberOfThings : 1}};
    this.update(qry, update, function(err){
        var tqry = {_id : thingId};
        var tupdate = {$inc: {numberOwned : 1, numberInStock : -1}};
        Thing.update(tqry, tupdate, function(){
            cb();
        });
    });
};

ThingSchema.statics.getOneByName = function(name, cb){
    this.findOne({name:name}, cb);
};

PersonSchema.statics.getOneById = function(id, cb){
    this.findOne({_id:id}, cb);
};

ThingSchema.statics.getOneById = function(id, cb){
    this.findOne({_id:id}, cb);
};

PersonSchema.statics.getAll = function(cb){
    this.find({}).sort("name").exec(cb);
};

ThingSchema.statics.getAll = function(cb){
    this.find({}).sort("name").exec(cb);
};

var Person = mongoose.model("Person", PersonSchema);

var Thing = mongoose.model("Thing", ThingSchema);

function seed(cb){
    var people = [
        {name : "Moe"},
        {name : "Larry"},
        {name : "Curly"}
    ];
    var things = [
        {name : "Rock", numberInStock : 10},
        {name : "Paper", numberInStock : 10},
        {name : "Scissors", numberInStock : 10}
    ];
    Person.remove({}, function(){
        Person.create(people, function(err, moe, larry, curly){
            Thing.remove({}, function(){
                Thing.create(things, function(err, r, p, s){
                    cb(err, moe, larry, curly, r, p, s);
                });
            });
        });
    });
    
}

module.exports = {
    seed : seed,
    Person : Person, 
    Thing : Thing
}