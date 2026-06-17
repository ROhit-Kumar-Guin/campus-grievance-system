# CampusGrieve — Campus Grievance & Resource Sharing System

A modern web-based platform for students of Vinoba Bhave University to submit and track grievances, access study resources, and stay connected with campus events.

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.io
- **File Storage:** Cloudinary
- **Auth:** JWT with bcryptjs

## Features

- 🔐 Role-based authentication (Student / Admin)
- 📋 Grievance submission and real-time tracking
- 📊 Analytics dashboard with charts
- 📚 Study resources upload and download
- 📰 Stories and events feed
- 🔔 Real-time notifications via Socket.io
- 🌙 Dark mode support

## Project Structure

## Google Authentication Setup

1. Add a Google OAuth Client ID in the Google Cloud Console.
2. In the server `.env`, add:
   - `GOOGLE_CLIENT_ID=<your-google-client-id>`
   - `MONGO_URI=<your-mongo-connection-string>`
   - `JWT_SECRET=<your-jwt-secret>`
   - `JWT_EXPIRE=30d`
   - `ADMIN_SECRET_KEY=<your-admin-secret-key>`
   - `CLIENT_URL=http://localhost:5173`
3. In the client `.env`, add:
   - `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>`
   - `VITE_API_URL=http://localhost:5000/api`
4. Install new dependencies:
   - `cd server && npm install`
   - `cd client && npm install`
