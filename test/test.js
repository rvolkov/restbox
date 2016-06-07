var assert = require('assert'); // built-in node lib
var hippie = require('hippie'); // lib to test API

//describe("My Mocha Smoke test", function() {
//  it("should add 2 numbers", function() {
//    assert.equal(2 + 2, 4, "2 + 2 = 4, dang it!");
//  });
//});

var request = require('supertest')
, app = require(__dirname + '/../app_node/app');


// test 1.1
// first of all let check that server is working
describe('GET /', function () {
  it('should contain text "restBox"', function (done) {
    request(app)
    .get('/')
    .expect(/restBox/, done);
  });
});
