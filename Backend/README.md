# Google Drive Clone - Backend API

Flask RESTful API handling authentication, directory navigation, database records, and file uploads.

## Setup Instructions

**Create and Activate Virtual Environment:**
   ```bash
   cd Backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
```bash
cp .env.example .env
```

**Run development server:**
```bash
flask run #Test endpoint: http://127.0.0.1:5000/health
```

**Deactivate environment and return to root:**
```bash
deactivate
cd ..
```
[Database design](https://dbdiagram.io/d/MoringaBox-Database-Design-6a84dcb9fd15a881e5aec2ca)

## Database setup and migrations

**PostgreSQL Database Initialization:**
```bash
sudo service postgresql start
sudo -u postgres psql -c "CREATE DATABASE drive_clone;"
```

**Apply pending migrations:**
```bash
flask db upgrade
```

**Autogenerate a new migration script:**
```bash
flask db migrate -m "Describe database schema changes"
```

**Roll back the previous migration:**
```bash
flask db downgrade
```

## Running tests
```bash
python -m pytest
```


  


