# Car Parking API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust Car Parking Management System leveraging technologies such as Node.js, Express, PostgreSQL, Docker, Redis, and TypeScript. This system is meticulously designed to streamline parking zone administration, user management, parking history tracking, and incorporates Redis caching functionality for enhanced performance.

## 🚀 Features

### 🔐 User Authentication and Authorization

- User Registration, Login, Logout, Password Reset
- Implementation of PASETO and CSRF for secure and stateless user authentication
- Token refreshing and checksum
- Role-based access control for distinguishing between Admin and User roles
- If a user enters an incorrect password three consecutive times, the account will be temporarily locked as a security precaution. To unlock the account, the user will need to go through the password reset process. Please ensure you remember the secret answer you provided during account creation, as it will be required to successfully reset your password and regain access to your account.

### 👮‍♂️ Admin Management

- CRUD operations for parking zone management
- Granting admin privileges
- Deleting User
- Tracking parking history and viewing all reservations
- Fetching details of all or individual users

### 🚗 User Management

- CRUD operations for vehicle management
- Viewing owned vehicles
- Reserving parking zones
- Managing individual reservation
- Default balance setup with reservation decreasing balance functionality

### 🛡️ Security

- Implementation of CSRF Tokens
- Defense against Cross-Site Scripting
- Secure HTTP headers and rate limiting to prevent abuse
- Utilization of Helmet to secure Express apps by setting HTTP response headers
- Password hashing

## 💡 Getting Started

### DOCS

[https://app.swaggerhub.com/apis-docs/MAKHARADZEGIORGI00/cars-parking_api/1.0]

### Prerequisites

- Docker
  [https://docs.docker.com/engine/install/]

- run Docker

### Installation Steps

1. **Clone the Repository**

```sh
git clone https://github.com/GiorgiMakharadze/car-parking-API-nodejs-typescript.git
```

2. Create dotenv file

```bash
 PGUSER=root
 PGPASSWORD=secret
 PGUSERTEST=roottest
 PGPASSWORDTEST=secrettest
 MAX_LOGIN_ATTEMPTS=3
 PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdmsx8TI5W6U9/JUVpG9RGc/By6A2Cv2Ic5UeZSdv0ph9/
```

2. run `docker compose build`
3. run `docker compose up`
4. Go to project folder and run `make migrationup`
5. You can use API
6. The API is now ready for use! Remember, the API employs CSRF protection. First, make a GET request to /csrf-token, then include the received token in the headers of your API calls as x-csrf-token: value. This is crucial as, without the correct token, you are restricted to making only GET requests.
7. If you wan to shut down run `docker compose down`
8. If an issue arises and docker-compose build does not execute successfully, it is recommended to run npm install as an initial step before attempting to run docker-compose build again. This ensures that all the necessary Node.js dependencies are installed, potentially resolving any errors related to missing packages.

## Testing

1. run `docker compose up`
2. add this line in docker-compose

```bash
  depends_on:
     - test
```

3. run `docker compose run test` it will run test files that file name includes .test.ts
4. If you want do write test for that you got testing database included. Every test file name should include .test.ts
