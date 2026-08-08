# HireHub – Recruitment & Campus Placement Platform

HireHub is a web-based recruitment and campus placement management platform designed to connect students, recruiters, and placement coordinators in a centralized system.

The platform streamlines the recruitment workflow by allowing students to create profiles and apply for placement drives, recruiters to manage recruitment drives and candidates, and coordinators/verifiers to monitor and manage the placement process.

## Features

### Student Module

* Student registration and login
* Email OTP verification
* Student profile management
* Profile photo upload
* View available recruitment drives
* Check eligibility criteria
* Apply for placement drives
* Track applied jobs
* Submit consent information
* View recruitment updates and results
* Password reset functionality

### Recruiter Module

* Recruiter/company registration
* Recruiter login
* Email OTP verification
* Create and manage recruitment drives
* Define eligibility criteria
* Specify required academic programs
* Specify CGPA and backlog requirements
* Add job designations and descriptions
* Manage candidates
* Conduct multiple recruitment rounds
* Select candidates for subsequent rounds
* Declare round-wise results
* Declare final recruitment results
* Send candidate selection emails

### Coordinator / Verifier Module

* Coordinator authentication
* View recruitment drives
* Monitor student participation
* Manage recruitment rounds
* Track selected candidates
* Verify recruitment information
* Monitor placement results

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive web interfaces

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB
* MongoDB Atlas
* Mongoose

### Authentication & Security

* Express Sessions
* bcrypt / bcryptjs password hashing
* OTP-based email verification
* MongoDB session storage

### Other Technologies

* Nodemailer – email notifications and OTPs
* Multer – file uploads
* Node Cron – scheduled tasks
* CORS – cross-origin requests
* dotenv – environment configuration

## Project Structure

```text
hirehub-recruitment-platform/
│
├── api/
│   └── drives.js
│
├── config/
│   └── db.js
│
├── models/
│   ├── Drive.js
│   └── user.js
│
├── public/
│   ├── HTML pages
│   ├── CSS stylesheets
│   ├── JavaScript files
│   └── images/
│
├── uploads/
│   └── profile photos
│
├── server.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

## Prerequisites

Before running the project, install:

* Node.js 18+
* npm
* MongoDB Atlas account or local MongoDB
* Gmail account or another SMTP-compatible email service

Check your Node.js installation:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/hirehub-recruitment-platform.git
```

Move into the project directory:

```bash
cd hirehub-recruitment-platform
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_EMAIL=your_email@gmail.com
AUTH_PASS=your_email_app_password

SESSION_SECRET=your_secure_session_secret
```

### Important

Never commit your `.env` file to GitHub.

Add this to `.gitignore`:

```gitignore
.env
node_modules/
uploads/*
```

The original project contains database and email credentials directly inside the source code. **Before publishing this project publicly, replace/rotate those credentials and move all secrets into environment variables.**

## MongoDB Setup

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Add your IP address to the Network Access list.
5. Copy the MongoDB connection string.
6. Add it to your `.env` file.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/UserDB
```

The application uses MongoDB collections for information such as:

* Students
* Recruiters
* Recruitment drives
* OTPs
* Rounds
* Consents
* Applications
* Sessions

## Running Locally

Start the server:

```bash
node server.js
```

The application runs on:

```text
http://localhost:5500
```

Open the application in your browser:

```text
http://localhost:5500
```

For development, you can use Nodemon:

```bash
npx nodemon server.js
```

## Deployment / Hosting

The application can be hosted using services such as Render, Railway, or another Node.js-compatible hosting provider.

### Option 1 – Deploy the Backend on Render

1. Push the project to GitHub.
2. Create an account on Render.
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. Select the repository.
6. Configure the service.

Recommended settings:

```text
Environment: Node
Build Command: npm install
Start Command: node server.js
```

Add the following environment variables in the hosting provider:

```text
MONGODB_URI
AUTH_EMAIL
AUTH_PASS
SESSION_SECRET
```

Render will automatically provide the `PORT` environment variable.

The application already contains:

```javascript
const PORT = process.env.PORT || 5500;
```

so it can use the hosting provider's assigned port.

### Option 2 – Deploy on Railway

1. Push the project to GitHub.
2. Create a new Railway project.
3. Deploy from your GitHub repository.
4. Add the required environment variables.
5. Railway will install the dependencies and start the Node.js application.

Use:

```bash
npm install
```

as the build/install command and:

```bash
node server.js
```

as the start command if Railway asks for them.

## Email Configuration

The application uses Nodemailer for:

* OTP verification
* Password recovery
* Recruitment notifications
* Candidate selection emails

For Gmail, use an **App Password** instead of your normal Gmail password.

Example:

```env
AUTH_EMAIL=your_email@gmail.com
AUTH_PASS=your_16_character_app_password
```

Do not store email credentials directly inside JavaScript files.

## Application Workflow

```text
Student
   │
   ├── Register
   │      └── OTP Verification
   │
   ├── Login
   │
   ├── Create Profile
   │
   ├── View Recruitment Drives
   │
   ├── Check Eligibility
   │
   └── Apply
           │
           ▼
       Recruiter
           │
           ├── Create Drive
           ├── View Candidates
           ├── Conduct Rounds
           ├── Select Candidates
           └── Declare Results
                    │
                    ▼
                 Student
                    │
                    └── View Recruitment Status
```

## API

The backend provides REST endpoints for authentication, recruitment drives, students, recruiters, rounds, applications, consent management, and recruitment results.

Examples:

```text
POST /signup
POST /login1
POST /rsignup
POST /rlogin
GET  /logout
GET  /check-session

POST /send-otp

GET  /recruiter/:recId
GET  /consents/:studentId
GET  /get-consent/:studentId

POST /declareResults
GET  /isResultsDeclared/:driveId

POST /declareRoundResults
GET  /isRoundResultsDeclared/:driveId/:roundId
```
