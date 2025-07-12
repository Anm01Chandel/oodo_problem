# Skill Swap Platform

This project is a full-stack MERN application that allows users to create profiles, list skills they can offer, and list skills they want to learn. Users can then browse other profiles and propose skill swaps.

## Features

### User Features
- **Authentication:** Secure user registration and login using JWT.
- **Profile Management:**
    - Update name, location, and availability.
    - Choose a predefined avatar.
    - List skills to offer and skills wanted.
    - Set profile to public or private.
- **User Discovery:** Browse and search for other users based on the skills they offer.
- **Swap System:**
    - Send swap requests with a custom message.
    - View incoming and outgoing swap requests.
    - Accept, reject, or cancel swap proposals.
    - Leave ratings and feedback on completed swaps.

### Admin Features
- **Admin Dashboard:** Central hub for administrative tasks.
- **User Management:** View all users, and ban/unban users who violate policies.
- **Swap Monitoring:** View a comprehensive list of all swaps on the platform.
- **Reporting:** Download CSV reports for user activity and swap statistics.

## Tech Stack

- **Frontend:** React, React Router, Axios, CSS Modules
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **File Handling:** Pre-set avatars, no user uploads required by final design.

## Project Structure

- **/client:** Contains the React frontend application.
- **/server:** Contains the Node.js/Express backend API.

## Setup & Installation

### Prerequisites
- Node.js (v14 or later)
- npm
- MongoDB (local instance or a cloud service like MongoDB Atlas)

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file by copying `.env.example`.
    ```bash
    cp .env.example .env
    ```
4.  Fill in the environment variables in `.env`:
    - `MONGO_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: A long, random string for signing tokens.
    - `PORT`: The port for the backend server (e.g., 5000).
5.  Start the server:
    ```bash
    npm start
    ```

### Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file for development.
    ```
    REACT_APP_API_URL=http://localhost:5000
    ```
    *(Replace 5000 with your backend port if different)*
4.  Start the client:
    ```bash
    npm start
    ```
The application should now be running on `http://localhost:3000`.