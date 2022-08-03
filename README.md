# NodeServer requirement

Problem:
    After the contagious pandemic is over, Panoramic Hotel is now accepting booking of its only
    presidential suite. You are going to design and develop a back-end service to provide the REST APIs to
    manage the booking of the presidential suite. Each booking allows up to 3 people for up to 3 days.

Solution: Provide REST APIs for
1. Booking the presidential suite. The user provides the following:
    • Email, first name and last name of the principal guest
    • Number of people, including the principal guest
    • Check-in and check-out dates
    Upon success, the system returns the following:
    • A unique reservation identifier
    • How to retrieve and cancel the reservation
2. Retrieving a reservation with its identifier
3. Cancelling a reservation with its identifie

## Usage

1. Post endpoint for booking, http://localhost:8088/add
    Payload example:
        {
            "email": "test@domain.com",
            "firstName": "First",
            "lastName": "Last",
            "number": 2,
            "start": "2022-08-10",
            "end": "2022-08-12"
        }
    Response example:
        {
            "status": "200",
            "message": "",
            "content":    {
                "id": "1_2022-08-10",
                "urls":       {
                    "get": "http://localhost:8088/get/1_2022-08-10",
                    "cancel": "http://localhost:8088/cancel/1_2022-08-10"
                }
            }
        }
    Error response example:
        {
            "status": "400",
            "message": "Invalid input: Missing fields: Last Name\r\nBooking people must between 1 to 3: 0\r\nBooking days must between 1 to 3: 0\r\n",
            "content": {}
        }    

2. Get endpoint for retrieving, http://localhost:8088/get/0_2022-08-11
    Response example:
        {
            "status": "200",
            "message": "",
            "content":    {
                "email": "test@domain.com",
                "firstName": "First",
                "lastName": "Last",
                "number": 1,
                "start": "2022-08-11",
                "end": "2022-08-12"
            }
        }
    Error response example:
        {
            "status": "400",
            "message": "Room ID not found: 0_2022-08-01",
            "content": {}
        }

3. Get endpoint for cancelling, http://localhost:8088/cancel/0_2022-08-06
    Response example:
        {
            "status": "200",
            "message": "",
            "content": {}
        }
    Error response example:
        {
            "status": "400",
            "message": "Room ID not found: 0_2022-08-01",
            "content": {}
        }

## Developing

1. This a NodeJs based REST service for room reservation
2. The storage is file based, loaded into memory and persistenced automatically, with small footprint
3. To startup the server, go to the directory /src, and run
    startup.bat
4. Initially, need to reset the rooms and capacity, in the db file, /src/assets/db/config.json, such as
    {
        "capacity": 10
    }

### Tests

1. Unit test cases
    - Test GET route, failed when database empty
        /get/0_2022-08-01
        /cancel/0_2022-08-01
    - Test normal Add, Get and Cancel route, Successfully
        /add, with normal payload
        /get/0_2022-08-01
        /cancel/0_2022-08-01
    - Test Add two bookings to the same room with different date, Successfully
    - Test Add two bookings to the different rooms with overlapped date, Successfully
    - Negative test Add, Failed with wrong input
        Empty payload
        More than 3 people
        Longer than 3 days
2. To run the unit, go to the project root directory, and run
    test.bat
