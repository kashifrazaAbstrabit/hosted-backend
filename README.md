1. Clone the Backend Repository

In a separate directory, run the following command to clone the backend repository:

git clone https://github.com/abstrabit-tech/intellidev-backend

2. Navigate to the Backend Directory

After cloning the backend repository, navigate into the backend folder:

cd intellidev-backend

3. Install Dependencies

Run the following command to install all the necessary dependencies for the backend:

npm install

4. Set Up Environment Variables

In the root of the backend directory, create a .env file and configure it with the necessary environment variables like JWT_SECRET, DB_URI, etc. Here’s an example of how the .env file should look:

# Backend Environment Configuration

PORT=8000

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=intellidev
DB_PASSWORD=postgres
DB_PORT=5432

# SMTP Configuration
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your-email-id@gmail.com
SMTP_PASSWORD=your-app-password  # Use an App Password, not your Gmail password.

# JWT Authentication Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Node Environment
NODE_ENV=development

Make sure to replace the placeholders (e.g., your-email-id, your-app-password, your-secret-key) with actual values.

5. Run the Backend Application

After setting up the environment variables, run the backend server:

npm run dev

The backend should now be running on a local server (usually http://localhost:8000).



