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

1. This a NodeJs base REST service for room reservation
2. The storage is file based, loaded into memory and persistenced automatically, with small footprint
3. To startup the server, go to the directory /src, and run
    startup.bat
4. Initially, need to reset the rooms and capacity, in the db file, /src/assets/db/config.json, as
    {
        "capacity": 10
    }

### Tools
