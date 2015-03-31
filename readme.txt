Marc Bastien

CE-9068 Project 1

Start Mongo : $ mongod --nojournal
Run like : $ jasmine-node spec/ 
The test will default to the DB 'my_world_test'.  Can pass in an optional DB like:
$ CONN=mongodb://localhost/my_world_test2 jasmine-node spec/ 

As per the assignment, this is derived from https://github.com/ericpkatz/ce-9053-6

The node_modules directly is intentionally omitted from the .gitignore file.  (That is, the NPM modules are tracked by Git.)

I started with a fresh project and a fresh install of jasmine-node and mongoose.  
The tests would not run.  The solution was copying the contents of the node_modules 
directory from our in-class exercise from class 6 (3/11/15).  