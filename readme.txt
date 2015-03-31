Marc Bastien

CE-9068 Project 1

Start Mongo : $ mongod --nojournal
Run like : $ jasmine-node spec/ 
The test will default to the DB 'my_world_test'.  Can pass in an optional DB like:
$ CONN=mongodb://localhost/my_world_test2 jasmine-node spec/ 

As per the assignment, this is derived from https://github.com/ericpkatz/ce-9053-6

