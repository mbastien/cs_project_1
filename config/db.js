var mongoose = require("mongoose");
module.exports = {
    connect : connect,
    disconnect : disconnect
};

function connect(cb){
    mongoose.connect("mongodb://localhost/my_world_test");
    mongoose.connection.once("open", function(){
        cb();
    });
}

function disconnect(cb){
    mongoose.disconnect(cb);
}