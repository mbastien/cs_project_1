var mongoose = require("mongoose");
module.exports = {
    connect : connect,
    disconnect : disconnect
};

function connect(cb){
    var db = process.env.CONN || "mongodb://localhost/my_world_test";
    mongoose.connect(db);
    mongoose.connection.once("open", function(){
        cb();
    });
}

function disconnect(cb){
    mongoose.disconnect(cb);
}