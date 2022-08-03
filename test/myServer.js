const server = require('../src/myServer');
const chai = require("chai");
const chaiHttp = require("chai-http");

//Assertion
chai.should();
chai.use(chaiHttp);

describe('Room booking APIs', () => {
  describe('Test GET route, failed when empty', () => {
    it("Should return error, when get nonexist id", () => {
      chai.request(server)
          .get('/get/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(400);
            response.body.should.have.property('message').contain('Room ID not found: ');
          });
    });

    it("Should return error, when cancel nonexist id", () => {
      chai.request(server)
          .get('/cancel/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(400);
            response.body.should.have.property('message').contain('Room ID not found: ');
          });
    })
  });

  describe('Test normal Add, Get and Cancel route, Successfully', () => {
    it("Should return success, when add normal", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 1,
              "start": "2022-08-01",
              "end": "2022-08-03"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when get respective id", () => {
      chai.request(server)
          .get('/get/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when cancel respective id", () => {
      chai.request(server)
          .get('/cancel/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    })
  })

  describe('Test Add two bookings to the same room with different date, Successfully', () => {
    it("Should return success, when add normal", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 1,
              "start": "2022-08-01",
              "end": "2022-08-03"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when add normal in another date", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 1,
              "start": "2022-08-05",
              "end": "2022-08-08"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when cancel respective id", () => {
      chai.request(server)
          .get('/cancel/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    })

    it("Should return success, when cancel respective id", () => {
      chai.request(server)
          .get('/cancel/0_2022-08-05')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    })
  })

  describe('Test Add two bookings to the different rooms with overlapped, Successfully', () => {
    it("Should return success, when add normal", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 1,
              "start": "2022-08-01",
              "end": "2022-08-03"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when add normal in overlapped date", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 1,
              "start": "2022-08-02",
              "end": "2022-08-04"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    });

    it("Should return success, when cancel respective id", () => {
      chai.request(server)
          .get('/cancel/0_2022-08-01')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    })

    it("Should return success, when cancel respective id", () => {
      chai.request(server)
          .get('/cancel/1_2022-08-02')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(200);
          });
    })
  })

  describe('Negative test Add, Failed with wrong input', () => {
    it("Should return failure, when add without any fields", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(400);
            response.body.should.have.property('message').contain('Invalid input: Missing fields: Email, First Name, Last Name, Number of People, Start Date, End Date');
          });
    });

    it("Should return failure, when add with more than 3 people", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 4,
              "start": "2022-08-02",
              "end": "2022-08-04"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(400);
            response.body.should.have.property('message').contain('Invalid input: Booking people must between 1 to 3:');
          });
    });

    it("Should return failure, when add with more than 3 days", () => {
      chai.request(server)
          .post('/add')
          .set('content-type', 'application/json')
          .send({
              "email": "test@domain.com",
              "firstName": "First",
              "lastName": "Last",
              "number": 3,
              "start": "2022-08-02",
              "end": "2022-08-06"
            })
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.have.status(400);
            response.body.should.have.property('message').contain('Invalid input: Booking days must between 1 to 3:');
          });
    })
  })
})