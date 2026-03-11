# Firehub Local Development Guide

## Overview

Your Firehub application now works completely offline using localStorage for authentication and data storage. No backend server is required!

## How to Run

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and go to `http://localhost:3000`

## Features That Work Locally

### ✅ Authentication
- **Sign Up**: Create new accounts (stored in localStorage)
- **Login**: Sign in with created accounts
- **User Types**: Both Viewer and Creator accounts supported
- **Session Management**: Login state persists across browser sessions

### ✅ Content Management
- **Video Upload**: Upload videos (simulated with local file references)
- **Video Viewing**: Watch sample videos and uploaded content
- **Comments**: Add and view comments on videos
- **Likes/Dislikes**: Interactive voting system

### ✅ Sample Data
- Pre-loaded with 2 sample videos
- Sample categories and tags
- Placeholder thumbnails and content

## How to Use

### 1. Create Your First Account
- Go to `/register`
- Fill out the form with your details
- Choose "Creator" if you want to upload videos
- Your account will be saved to localStorage

### 2. Test Login
- Go to `/login` 
- Use the email and password you just created
- You'll be redirected to the dashboard

### 3. Upload Videos (Creator Only)
- Register/login as a Creator
- Navigate to Upload Video (if the route exists)
- Upload a video file - it will be processed locally

### 4. View Content
- Browse the sample videos
- Watch videos using the built-in player
- Like, comment, and interact with content

## Data Storage

All data is stored in your browser's localStorage:

- `firehub_users` - User accounts
- `firehub_videos` - Video content
- `firehub_comments_[videoId]` - Comments for specific videos
- `current_user` - Current logged-in user
- `token` - Authentication token

## Development Notes

### Resetting Data
To reset all data, open browser dev tools and run:
```javascript
localStorage.clear()
```

### Sample Credentials
The system starts fresh, so you'll need to create your own accounts.

### Video Processing
When you upload a video:
1. Status shows as "processing"
2. After 3 seconds, it becomes "published"
3. A toast notification confirms completion

### Limitations
- No real video processing/transcoding
- File uploads create blob URLs (temporary)
- No real payment processing
- No email notifications

## Tech Stack
- React 18
- React Router for navigation
- React Hook Form for forms
- Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

## Troubleshooting

### "Not authenticated" errors
- Make sure you're logged in
- Check that localStorage contains `current_user` and `token`

### Videos not playing
- Uploaded videos use blob URLs which may expire
- Sample videos use external URLs that require internet

### Form validation errors
- Check that all required fields are filled
- Password must be at least 8 characters with uppercase, lowercase, and number

## Customization

You can easily modify the sample data in `frontend/src/services/api.js` in the `initializeDefaultData` function to add your own sample content.

## Production Considerations

This localStorage setup is for development only. For production, you'll need:
- Real backend API
- Proper authentication server
- Video processing pipeline
- Database storage
- File upload handling
- Payment processing 