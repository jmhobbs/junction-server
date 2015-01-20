"use strict";
/*jshint expr: true*/

var    should = require("should"),
 redis_client = require("fakeredis").createClient(),
         User = require("../lib/user.js");

/////////////////
// Setup

redis_client.set("user:index:email:john@example.com", 5);

redis_client.hmset("user:5", {
  id: 5,
  email: "john@example.com",
  password: "asdf",
  created: 1421549041,
  modified: 1421549047
});

/////////////////

describe("User", function(){

  describe("save", function () {
    it("should save the user to a redis hash", function (done) {
      var user = new User.user();
      user.id       = 1;
      user.email    = "derp@example.com";
      user.password = "derp";
      user.created  = 1;
      user.modified = 1;
      user.save(redis_client, function (error) {
        should(error).not.be.ok;
        redis_client.hgetall("user:" + user.id, function (error, hash) {
          hash.id.should.eql(user.id.toString());
          hash.email.should.eql(user.email.toString());
          hash.password.should.eql(user.password.toString());
          hash.created.should.eql(user.created.toString());
          hash.modified.should.eql(user.modified.toString());
          done();
        });
      });
    });

    it("should save the id to an email index", function (done) {
      var user = new User.user();
      user.id       = 2;
      user.email    = "herpderp@example.com";
      user.password = "derp";
      user.created  = 1;
      user.modified = 1;
      user.save(redis_client, function (error) {
        should(error).not.be.ok;
        redis_client.get("user:index:email:" + user.email, function (error, reply) {
          reply.should.eql(user.id);
          done();
        });
      });
    });
  }); // User.save

  describe("findByEmail", function() {
    it("should return null when the email is not in the index", function(done){
      User.findByEmail(redis_client, "nope@nope.org", function (error, user) {
        should(user).not.be.ok;
        done();
      });
    });

    it("should return a User when the email is in the index", function(done){
      User.findByEmail(redis_client, "john@example.com", function (error, user) {
        (user === null).should.be.false;
        user.should.have.property("id", 5);
        user.should.have.property("email", "john@example.com");
        user.should.have.property("password", "asdf");
        user.should.have.property("created", 1421549041);
        user.should.have.property("modified", 1421549047);
        done();
      });
    });
  }); // User.findByEmail
  
  describe("findByID", function() {
    it("should return null when the user does not exist", function(done){
      User.findByID(redis_client, 999, function (error, user) {
        should(user).not.be.ok;
        done();
      });
    });

    it("should return a User when the user exists", function(done){
      User.findByID(redis_client, 5, function (error, user) {
        should(error).not.be.ok;
        should(user).be.ok;
        user.should.have.property("id", 5);
        user.should.have.property("email", "john@example.com");
        user.should.have.property("password", "asdf");
        user.should.have.property("created", 1421549041);
        user.should.have.property("modified", 1421549047);
        done();
      });
    });
  });
});
