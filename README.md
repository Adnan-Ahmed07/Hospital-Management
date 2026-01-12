# AD Hospital Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for hospital management.

## Prerequisites

1.  **Node.js** (v18 or higher)
2.  **MongoDB** (Ensure it is installed and running locally on port 27017)

## Quick Start

1.  **Install Dependencies**
    Run this in the root directory to install dependencies for both server and client:

    ```bash
    npm install
    npm run install-all
    ```

2.  **Environment Setup**

    - The server defaults to `mongodb://127.0.0.1:27017/ad_hospital`.
    - No `.env` file is strictly required for local dev, but you can create `server/.env` to override settings:
      ```env
      MONGO_URL=mongodb://127.0.0.1:27017/ad_hospital
      PORT=5001
      # Optional: Cloudinary for image uploads
      CLOUDINARY_CLOUD_NAME=your_name
      CLOUDINARY_API_KEY=your_key
      CLOUDINARY_API_SECRET=your_secret
      ```

3.  **Run the Application**
    From the root directory:
    ```bash
    npm start
    ```
    - **Server:** http://localhost:5001
    - **Client:** http://localhost:5173

- **Media Uploads:** When Cloudinary is configured (see `.env`), images and videos uploaded via the Admin UI are stored in the Cloudinary folder `ad_hospital`.

## Features

- **Public:** Home page, Doctor Search, Appointment Booking, News.
- **Admin:** Dashboard to manage Doctors, Appointments, and News.
- **Auth:** Login/Register (JWT based).
  - _Demo Admin:_ `admin@medicare.com` / `admin123`
  - _Demo Patient:_ `patient@test.com` / `patient123`

## Database

The application strictly uses MongoDB. When the server starts, it will attempt to connect. If the database is empty, it will automatically seed it with initial doctors, news, and users.
