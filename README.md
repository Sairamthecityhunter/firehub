# EroStream - Adult Content Platform

A secure, scalable, and compliant adult video content platform built with React frontend and Django backend.

## Features

### Core Features
- User registration with ID verification
- Content upload and streaming
- Monetization (subscriptions, pay-per-view, tips)
- Advanced search and discovery
- Social engagement (likes, comments, follows)
- Comprehensive moderation tools
- Admin dashboard

### Technical Stack
- **Frontend**: React, Tailwind CSS, Plyr.js
- **Backend**: Django, Django REST Framework
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Video Processing**: FFmpeg
- **Authentication**: JWT, OAuth2
- **Payment**: Stripe integration

## Project Structure
```
erostream/
├── frontend/          # React application
├── backend/           # Django application
├── docs/             # Documentation
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL
- FFmpeg

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` files in both frontend and backend directories:

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/erostream
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
```

## Legal Compliance

This platform includes:
- 18 U.S.C. § 2257 compliance
- GDPR compliance
- COPPA compliance
- DMCA takedown support
- Age verification systems

## License

This project is for educational purposes. Ensure compliance with local laws and regulations. 