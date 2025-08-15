# Setting up Supabase

These instructions will guide you through setting up Supabase and obtaining the necessary credentials for your application.

## 1. Create a Supabase Account

- Go to the [Supabase website](https://supabase.com/) and sign up for a free account.

## 2. Create a New Project

- Once you're logged in, click the "New project" button.
- Choose a name for your project, select a region, and set a database password.
- Wait for Supabase to provision your project. This may take a few minutes.

## 3. Obtain Your Supabase URL and Anon Key

- Once your project is ready, go to the "Settings" tab in the left sidebar.
- Click on "API" under the "Settings" section.
- You will find your Supabase URL (VITE_SUPABASE_URL) and Anon Key (VITE_SUPABASE_ANON_KEY) on this page.

## 4. Set Environment Variables

- Create a `.env` file in the root of your project.
- Add the following lines to your `.env` file, replacing the placeholders with your actual Supabase URL and Anon Key:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Enable Authentication

- In the Supabase dashboard, go to the "Authentication" tab in the left sidebar.
- Enable the authentication providers you want to use (e.g., Email/Password, Google, GitHub).

## 6. Configure Database Tables

- Ensure that the necessary database tables are created and configured correctly. The project includes migrations in the `supabase/migrations` directory. You can run these migrations using the Supabase CLI or by manually executing the SQL scripts in the Supabase dashboard.

## 7. Restart Your Application

- After setting the environment variables and configuring the database, restart your application to ensure that the changes are applied.

Now your application should be able to connect to Supabase and use its services.