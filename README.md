# 🚗 Vehicle Pooling App
*A Collaborative Ride-Sharing Platform*

## 🌟 Project Overview

**Vehicle Pooling App** is a web application designed to make daily commute more sustainable and efficient through carpooling. Users can create, join, or manage ride offers, search for suitable rides, and connect with others to share resources and reduce their carbon footprint. The app supports secure, real-time communication and supports features for both drivers and passengers.

## 🛠️ Local Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher recommended)
- **MongoDB** (for local database setup)
- **MongoDB Atlas** (for cloud/cluster connectivity)

### 📁 Directory Structure

```
└── vehicle-pooling-app/
    ├── README.md
    ├── LICENSE
    ├── backend/
    │   ├── readme.md
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── .env.sample
    │   ├── .gitignore
    │   └── src/
    │       ├── index.js
    │       ├── controllers/
    │       │   ├── rideController.js
    │       │   ├── userController.js
    │       │   ├── bookingController.js
    │       ├── db/
    │       │   ├── Ride.js
    │       │   ├── User.js
    │       │   ├── Booking.js
    │       ├── middlewares/
    │       │   ├── auth.js
    │       │   ├── errorMiddleware.js
    │       ├── routes/
    │       │   ├── rideRoutes.js
    │       │   ├── userRoutes.js
    │       │   ├── bookingRoutes.js
    │       └── utils/
    │           ├── ApiError.js
    │           ├── ApiResponse.js
    │           ├── asyncHandler.js
    ├── client/
    │   ├── README.md
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── vite.config.js
    │   ├── .gitignore
    │   ├── public/
    │   └── src/
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       ├── assets/
    │       │   └── (images/logos/icons)
    │       ├── components/
    │       │   ├── RideForm.jsx
    │       │   ├── RideList.jsx
    │       │   ├── RideCard.jsx
    │       │   ├── UserProfile.jsx
    │       │   ├── BookingForm.jsx
    │       │   ├── MyRides.jsx
    │       │   └── Navbar.jsx
    │       └── pages/
    │           ├── Home.jsx
    │           ├── Dashboard.jsx
    │           └── RideDetails.jsx
    └── .github/
        └── workflows/
            └── ci.yml

```
---

### 🔹 Client Setup

1. **Navigate to the Client Directory**  
   ```bash
   cd vehicle-pooling-app/client
   ```

2. **Install Dependencies**  
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the Development Server**  
   ```bash
   npm run dev
   ```

### 🔹 Backend Setup

1. **Navigate to the Backend Directory**  
   ```bash
   cd vehicle-pooling-app/backend
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**  
   Create a `.env` file for sensitive data:
   ```bash
   touch .env
   ```
   Copy the contents of `.env.sample` and add your configuration:
   ```plaintext
   EMAIL_USER = your-app-email@example.com
   EMAIL_PASS = your-app-password-or-api-key
   MONGODB_URI = mongodb://127.0.0.1:27017/vehiclepool_db
   ```

4. **Start the Backend Server**  
   ```bash
   npm start
   ```

## 📁 Installation

### Clone the Repository

```bash
git clone https://github.com//vehicle-pooling-app.git
```

### Setting Up Client and Backend

**Client-Side Installation**
1. Navigate to `client`:
   ```bash
   cd client
   ```
2. Install and start:
   ```bash
   npm install && npm run dev
   ```

**Backend-Side Installation**
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies and start server:
   ```bash
   npm install && npm start
   ```

# Install Dependencies

## Client Side

1. cd vehicle-pooling-app
2. cd client
3. npm install
4. npm install --legacy-peer-deps
5. npm run dev

*Explanation of Flags*  
- `install`: Installs dependencies listed in your `package.json`  
- `--legacy-peer-deps`: Ignores peer dependency conflicts for older packages

## Backend Side

1. cd vehicle-pooling-app
2. cd backend
3. npm install
4. npm install nodemailer                        
5. npm start

# Create `.env` File

*Create and update your `.env` file with the following:*

```
EMAIL_USER=your-app-email@example.com
EMAIL_PASS=your-email-password-or-auth-key
MONGODB_URI=mongodb://127.0.0.1:27017/vehiclepool_db
```

# Create Database and Collections

*Create a MongoDB database and update the URI if needed in your `src/index.js`*

**Example:**
```js
mongodb://127.0.0.1:27017/vehiclepool_db
```

## 🗄️ Database Configuration

1. **Create a MongoDB Database**  
   Set up a MongoDB database (e.g., `vehiclepool_db`) and ensure it's running locally.
2. **Update Connection String**  
   Add your MongoDB connection URI in `src/index.js`:
   ```javascript
   mongodb://127.0.0.1:27017/vehiclepool_db
   ```

## 🎨 Key Features

- **Post & Join Rides**: Drivers can post available rides; users can search and join rides.
- **User Profiles**: Personalized dashboard for ride management and history.
- **Live Ride Search**: Search for rides based on location, date, and preferences.
- **Booking Requests**: Seamlessly send and manage ride requests.
- **Secure Messaging**: Communicate with fellow commuters securely.
- **Mobile Friendly UI**: Works smoothly on both desktop and mobile browsers.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Feel free to copy-paste** this to your `README.md` file and adjust any details unique to your Vehicle Pooling App!

If you provide your exact repository structure (or extra features), I can tailor this further.
