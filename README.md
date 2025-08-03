# Skill Swap Platform

##  Project Objective

In today’s digital age, learning is becoming more collaborative and community-driven. **Skill Swap Platform** is a mobile-first web application that connects individuals with complementary skills to engage in peer-to-peer learning. It allows users to swap their expertise, schedule live sessions, and share educational content in a social media–like environment. The platform fosters a supportive learning ecosystem, especially for students, freelancers, professionals, and hobbyists seeking growth through real-time collaboration.

---

##  Features

-  **Skill-Based Matchmaking**  
  Connect with users based on skills you offer and skills you want to learn.

-  **Skill Swapping Sessions**  
  Schedule collaborative learning tasks or one-on-one sessions.

-  **Content Sharing**  
  Post text, images, or videos like Instagram — visible to your connections only.

- **User Profiles**  
  Customize your profile, list your skills, interests, and availability.

-  **Messaging System**  
  Built-in chat to collaborate or schedule sessions.

-  **Notifications**  
  Get alerts for messages, posts, matches, or session requests.

-  **Feedback System**  
  Rate and review your partners after sessions to ensure quality.

-  **Admin Panel**  
  Manage users, moderate content, and track system analytics.

---

## Technologies Used

###  Frontend
- React Native (Expo)
- React Navigation
  
###  Backend
- Firebase Authentication
- Firebase Firestore (Real-time database)
- Firebase Storage
- Firebase Cloud Messaging (for notifications)

---

##  Functional Requirements (Summary)

- User authentication (email verification)
- Profile management
- Matchmaking algorithm (collaborative filtering)
- Skill swap session scheduling and history
- Direct messaging and attachments
- Social feed for media/text posts
- Rating and feedback system
- Search & filter by skills, ratings, and availability
- Admin moderation dashboard

---

## How to Run the Project

###  Prerequisites
- Node.js (v18+)
- Expo CLI:  
  Install using `npm install -g expo-cli`
- Firebase project set up with:
  - Authentication (Email/Password)
  - Firestore Database
  - Firebase Storage

---

###  Run the App

1. **Clone the Repository**

```bash
git clone https://github.com/FajarAsif842/SkillSwap.git
cd SkillSwap

**2. Install Dependencies**
   npm install
**3. Start the App**

      expo start
      Connect with Expo Go (on phone)

Scan the QR code to launch the app on your Android/iOS device.

** Firebase Setup**
Go to https://console.firebase.google.com

Create a new project called SkillSwap

Enable Authentication, Firestore, and Storage

Replace the Firebase config in /firebaseConfig.js with your project credentials

// firebaseConfig.js
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-id",
  appId: "your-app-id",
};


