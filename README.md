<h1> 📌 Overview </h1>

• CityPulse is a smart municipal issue tracking platform designed to improve communication between citizens and local city engineering departments.
The platform enables citizens to report infrastructure problems such as potholes, broken streetlights, water leaks, and public hazards directly through an interactive map-based interface.

Using crowdsourced reporting, geolocation, and community upvoting, CityPulse helps municipalities prioritize urgent issues and manage maintenance workflows efficiently.
<hr>

<h2> 🚀 Tech Stack </h2>

• Frontend </br>
• React.js </br>
• React-Leaflet </br> 
• Context API / Redux </br>
• Axios </br> 
• Backend </br>
• Node.js </br>
• Express.js </br>
• MongoDB + Mongoose </br>
• JWT Authentication </br> 
• Multer </br> 
• Cloudinary </br>
<hr>

<h2> ✨ Core Features </h2>

<h3> 🔐 Authentication System: </h3>
• Secure user registration & login </br>
• JWT-based authentication </br>
• Role-based authorization </br>
• Separate access for: </br>
 - Citizens </br>
 - City Engineers (Admins) </br>
<hr>

<h3> 📝 Issue Reporting </h3>

Citizens can: </br>
• Create infrastructure reports </br>
• Upload issue images </br>
• Select district/sector </br> 
• Add detailed descriptions </br> 
• Pin exact locations on an interactive map </br>
<hr>

<h3> 🗺️ Interactive Map System </h3>

Powered by React-Leaflet: </br>
• Real-time issue visualization </br>
• Latitude & longitude tracking </br> 
• Public city feed with active reports </br>
<hr>

<h3> 👍 Community Upvoting </h3>

Users can upvote nearby issues to: </br>
• Increase issue priority </br>
• Help municipalities identify urgent problems </br>

MongoDB logic prevents duplicate voting from the same user. </br>
<hr>

<h3> 🛠️ Engineer Control Panel </h3>

City engineers can: </br>
• View district-specific reports </br>
• Sort reports by urgency </br>
• Assign maintenance crews </br>
• Update issue statuses </br>
• Remove spam or duplicate reports </br>
<hr>

<h3> ✅ Resolution Workflow </h3>

Lifecycle states: </br>

<pre> Pending → Assigned → Resolved </pre> </br>

Engineers upload a resolution image as proof before closing a report. </br>
<hr>

<h3> ☁️ Cloud Image Storage </h3>
• Multer handles uploads </br>
• Cloudinary stores and serves images securely </br>
<hr>

<h3> 👥 User Lifecycle </h3>
 1. Citizen Workflow </br>
 2. Access public city map </br>
 3. Create account </br> 
 4. Submit issue report </br>
 5. Upload image </br> 
 6. Drop map pin </br> 
 7. Track report status </br> 
 8. Upvote local issues </br>
<hr>

<h3> 🛠️ Engineer Workflow </h3> 
1. Login to admin dashboard </br>
2. Review sector reports </br> 
3. Assign maintenance teams </br> 
4. Update issue progress </br> 
5. Resolve & archive completed reports </br>
<hr>

<h3> 📂 Project Structure </h3>
<pre>
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
</pre>
<hr>

📄 License
<pre> This project is developed for educational and graduation project purposes. </pre>
<hr>

<h3> ⚙️ Installation </h3>
<h4> 1️⃣ Clone Repository </h4>

<pre> git clone https://github.com/MKFaroouq/citypulse.git </pre>
<pre> cd citypulse </pre>

<h4> 2️⃣ Install Dependencies </h4>
<h3> Frontend </h3>
<pre> cd client
npm install </pre>

<h3> Backend </h3>
<pre> cd server
npm install </pre>

<h4> 3️⃣ Run Application </h4>
<h3> Backend </h3>
<pre> npm run server </pre>

<h3> Frontend </h3>
<pre> npm start </pre>
<hr>

<h3> 🌍 Future Scope </h3>
📍 Automated Geospatial Sectoring
• MongoDB GeoJSON
• Turf.js integration
• Automatic sector allocation
<hr>

<h3> ⚡ Real-Time Updates </h3>
• Socket.io integration </br>
• Live notifications </br>
• Real-time upvote syncing </br>
<hr>

<h3> 🎯 Project Goals </h3>
• Improve citizen-government communication </br>
• Speed up infrastructure maintenance </br>
• Increase transparency </br>
• Prioritize urgent public issues efficiently </br>
<hr>

👨‍💻 Contributors </br>
<h3> Mohammed Faroouq (Bazooka) </h3>
<h3> Project 3.0 </h3>
