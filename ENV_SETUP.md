# Environment Variables Setup

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# Alternative: Use DATABASE_URL connection string
# DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Render Configuration (if deploying on Render)
RENDER_EXTERNAL_URL=
```

## Setup Instructions

1. Create `.env` file in the Backend directory
2. Copy the template above and replace placeholder values with your actual credentials
3. For Render deployment, set environment variables in Render dashboard instead of using `.env`

