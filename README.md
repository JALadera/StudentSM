# Student Management System (SMS)

A comprehensive Student Management System built with Django REST Framework and Vue.js.

## Features

- **Student Management**: Add, view, update, and delete student records
- **Subject Management**: Manage subjects, prerequisites, and enrollments
- **Grade Tracking**: Record and track student grades
- **User Authentication**: JWT-based authentication system
- **RESTful API**: Clean and well-documented API endpoints
- **Responsive Frontend**: Modern Vue.js frontend with Vite

## Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL (for production) / SQLite (for development)
- pip (Python package manager)
- npm or yarn

## Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/JALadera/StudentSM.git
   cd StudentSM/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and update the values:
   ```bash
   cp .env.example .env
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file based on `.env.example` and update the values:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Running Tests

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
# or
yarn test
```

## Environment Variables

### Backend (`.env`)
```
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000/api
```

## Deployment

### Backend (Render/Heroku)
1. Set up a PostgreSQL database
2. Configure environment variables
3. Set up a production WSGI server (Gunicorn/Uvicorn)
4. Configure static files with WhiteNoise

### Frontend (Vercel/Netlify)
1. Set environment variables
2. Configure build command: `npm run build`
3. Set output directory: `dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
