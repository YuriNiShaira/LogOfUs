# LogOfUs

LogOfUs is a full-stack diary and memory preservation platform that allows users to document life moments, manage yearly journals, create bucket lists, explore memory timelines, save playlists, write love letters, and relive experiences through an interactive digital scrapbook experience.

## Live Demo
🌐 [https://www.logofus.dev/](https://www.logofus.dev/)

---

## About The Project
LogOfUs was built as a personal storytelling and memory management platform. Unlike traditional diary apps that only store text entries, LogOfUs focuses on creating a rich emotional and interactive experience through timelines, playlists, bucket lists, and themed memory features.

This project was made for my girlfriend, Shaira Danica, as a way to preserve our memories and meaningful moments in a more interactive and lasting way.

---

## Tech Stack

### Backend

- Django
- Django REST Framework
- JWT Authentication
- CORS
- Supabase PostgreSQL
- Supabase Storage

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Axios

---

## Key Features

### Authentication

- User registration and login
- JWT-based secure authentication
- Protected routes and API endpoints

### Diary System

- Create and manage yearly journals
- Add, edit, and delete memories
- Memory categorization and organization

### Memory Experience

- Memory timeline view
- Calendar-based memory browsing
- Mood-based song recommendations
- Themed diary backgrounds and animations

### Extras

- Bucket list creation and filtering
- Playlist section for memories
- Love letter feature
- Interactive mini-games
- Fun facts and themed UI elements

---

## Backend Features

- RESTful API architecture
- JWT authentication system
- CRUD operations for all core modules
- File upload handling
- Supabase storage integration
- Custom permissions and access control

---

## Frontend Features

- Responsive UI design
- Component-based architecture
- State management using React Query
- Smooth animations and transitions
- Modular and reusable components

---

## Project Structure

### Backend

- `manage.py` – Django entry point
- `backend/` – Project configuration
- `accounts/` – Authentication system
- `diary_project/` – Core diary logic (models, views, serializers)

### Frontend

- `src/components/` – Reusable UI components
- `src/pages/` – Page views
- `src/services/api.ts` – API client setup

---

## Local Setup

### Backend Setup

```
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## Future Improvements

- AI-powered memory summaries and insights
- Memory sharing between users
- Mobile application (React Native)
- Real-time collaborative journals
- Advanced search and tagging system
- Social features for shared memories

---

## Notes

- Ensure backend server is running before starting the frontend.
- API configuration is located in `frontend/src/services/api.ts`.
- Media uploads are handled via Supabase Storage.


---

## Author
Built by Yuri Mauricio
