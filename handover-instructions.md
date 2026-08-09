# Instructions for Setting Up the DesignBHK Codebase

Here is the zip file containing the complete source code for the Web Dashboard and the Mobile App. Please follow these instructions to set everything up on your machine or deployment server.

## Part 1: Setting up the Web Dashboard (Production Build)

### 1. Install Dependencies
After extracting the zip file, open your terminal, navigate into the `designbhk-admin` folder, and install all required packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a new file in the root folder named `.env.local` and paste the following database and security credentials into it:
```env
DATABASE_URL="postgresql://neondb_owner:npg_FUWYEH4kdfL3@ep-blue-bread-at1czyea.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="designbhk-super-secret-jwt-key-2024-admin"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Database Client
Run this command to synchronize the Prisma client with the database schema:
```bash
npm run postinstall
```
*(Note: If you ever need to push new database changes in the future, you can run `npx prisma db push`)*

### 4. Build for Production
Compile the Next.js application into an optimized production build:
```bash
npm run build
```

### 5. Start the Production Server
Once the build is complete, start the live production server:
```bash
npm run start
```
*The Web Dashboard is now running locally at `http://localhost:3000` in production mode.*
*(Note: If you just want to run it in developer mode to make live code changes, you can use `npm run dev` instead of building).*

---

## Part 2: Building the Mobile App (For Android/Google Play)

The mobile app is located inside the `mobile-app` folder. It uses React Native (Expo) and dynamically loads the live website, meaning the app automatically updates whenever the website updates.

### 1. Install Mobile Dependencies
Open a new terminal, navigate into the `mobile-app` folder, and install the required packages:
```bash
cd mobile-app
npm install
```

### 2. Install Expo Build Tools
Install the Expo CLI globally on your computer so you can generate the Android file:
```bash
npm install -g eas-cli
```

### 3. Build the Android App Bundle
To generate the `.aab` file required by the Google Play Store, run:
```bash
eas build -p android
```
*(Note: This will ask you to log into an Expo account. You can create a free account at expo.dev. Once the build finishes on their cloud servers, it will give you a direct link to download the `.aab` file!)*
