📌 Overview

CityPulse is a smart municipal issue tracking platform designed to improve communication between citizens and local city engineering departments.
The platform enables citizens to report infrastructure problems such as potholes, broken streetlights, water leaks, and public hazards directly through an interactive map-based interface.

Using crowdsourced reporting, geolocation, and community upvoting, CityPulse helps municipalities prioritize urgent issues and manage maintenance workflows efficiently.
<hr>

🚀 Tech Stack
Frontend
React.js
React-Leaflet
Context API / Redux
Axios
Backend
Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
Multer
Cloudinary
<hr>

✨ Core Features
🔐 Authentication System
Secure user registration & login
JWT-based authentication
Role-based authorization
Separate access for:
 - Citizens
 - City Engineers (Admins)
<hr>

📝 Issue Reporting

Citizens can:

Create infrastructure reports
Upload issue images
Select district/sector
Add detailed descriptions
Pin exact locations on an interactive map
<hr>

🗺️ Interactive Map System

Powered by React-Leaflet:

Real-time issue visualization
Latitude & longitude tracking
Public city feed with active reports
<hr>

👍 Community Upvoting

Users can upvote nearby issues to:

Increase issue priority
Help municipalities identify urgent problems

MongoDB logic prevents duplicate voting from the same user.
<hr>

🛠️ Engineer Control Panel

City engineers can:

View district-specific reports
Sort reports by urgency
Assign maintenance crews
Update issue statuses
Remove spam or duplicate reports

✅ Resolution Workflow

Lifecycle states:

Pending → Assigned → Resolved

Engineers upload a resolution image as proof before closing a report.

☁️ Cloud Image Storage
Multer handles uploads
Cloudinary stores and serves images securely

👥 User Lifecycle
Citizen Workflow
Access public city map
Create account
Submit issue report
Upload image
Drop map pin
Track report status
Upvote local issues

Engineer Workflow
Login to admin dashboard
Review sector reports
Assign maintenance teams
Update issue progress
Resolve & archive completed reports

📂 Project Structure
CityPulse/
│
├── client/                 # React Frontend
├── server/                 # Express Backend
│
├── models/                 # Mongoose Schemas
├── routes/                 # API Routes
├── controllers/            # Business Logic
├── middleware/             # Auth & Validation
├── uploads/                # Temporary File Storage
│
├── public/
├── utils/
└── README.md

