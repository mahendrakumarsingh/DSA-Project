# Indian Railways Booking System with DSA Features

## Description

A comprehensive MERN (MongoDB, Express.js, React, Node.js) stack application for Indian Railways ticket booking, incorporating Data Structures and Algorithms (DSA) implementations for efficient operations. The system provides a complete booking experience with advanced features like undo functionality, optimized sorting, priority-based waiting lists, and intelligent seat management.

## Tech Stack

- **Frontend**: React, Vite, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Additional**: CORS, dotenv for environment management

## Features

### Core Booking Features
- Train ticket booking and cancellation
- Real-time booking status tracking
- Confirmed and waiting list management
- Passenger information management

### DSA Implementations
- **Stack (LIFO)**: Undo last booking/cancellation action
- **Sorting Algorithms**: Selection, Merge, and Quick Sort for passenger lists (by age, name, time, PNR)
- **Priority Queue**: Senior citizen priority in waiting lists
- **Binary Search Tree**: Efficient seat allocation and management
- **Graph**: Train route optimization and connectivity
- **Binary Search**: Fast passenger lookup by PNR

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahendrakumarsingh/DSA-Project.git
   cd DSA-Project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   - Create a `.env` file in the `backend` directory
   - Add your MongoDB connection string and other environment variables

## How to Run

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `http://localhost:3000` (or your configured port)

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (Vite default)

3. **Access the Application**
   - Open your browser and navigate to the frontend URL
   - Use the navigation to book tickets, check status, and explore DSA features

## Folder Structure

```
Indian Railways/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── dsa/
│       ├── BinarySearchTree.js
│       ├── Graph.js
│       ├── PriorityQueue.js
│       ├── SeatTree.js
│       ├── Stack.js
│       └── TrainSystem.js
├── docs/
│   ├── ARCHITECTURE_DIAGRAM.txt
│   ├── DSA_FEATURES.md
│   ├── MERN_COMPLETE_SETUP.md
│   ├── MERN_SETUP_GUIDE.md
│   ├── PROJECT_UPGRADE_SUMMARY.md
│   └── README_QUICK_REFERENCE.txt
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       ├── components/
│       │   └── Navigation.jsx
│       └── pages/
│           ├── Booking.jsx
│           ├── Cancellation.jsx
│           ├── Confirmed.jsx
│           ├── DSADashboard.jsx
│           ├── DSADashboard.css
│           ├── Home.jsx
│           ├── Status.jsx
│           └── Waiting.jsx
└── README.md
```

## Author

**Mahendra Kumar Singh**

- GitHub: [mahendrakumarsingh](https://github.com/mahendrakumarsingh)
- Project Repository: [DSA-Project](https://github.com/mahendrakumarsingh/DSA-Project.git)

## License

This project is licensed under the ISC License.</content>
<parameter name="filePath">c:\Vs code\Indian Railways\README.md