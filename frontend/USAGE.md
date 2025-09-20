# PPL Coach - Usage Guide

## Fixed Issues ✅

### Norwegian 4x4 Confusion Fixed
- **Before**: "Norwegian 4x4" was incorrectly used for weight training
- **After**: Properly separated into two distinct features:
  - **PPL (Push/Pull/Legs)**: Weight training progression
  - **Norwegian 4x4**: Interval timer for cardio (4 rounds × 4 minutes work, 3 minutes rest)

### User-Friendly Workout Selection
- **Smart Detection**: App automatically knows if your next workout should be Push, Pull, or Legs
- **One-Click Start**: Dashboard and Plan Workout page show recommended next workout
- **Progress Tracking**: Shows your last workout and streak

## How to Use the App

### 🏠 Dashboard
- **Quick Start**: See your recommended next workout and start with one click
- **Progress Overview**: View your workout streak, this week's sessions, and total sessions
- **New User Guide**: First-time users see an explanation of the PPL system

### 🏋️ Start Workout (Plan Page)
- **Recommended Workout**: Top card shows your next workout (Push/Pull/Legs) based on your history
- **One-Click Start**: Click "Start [Day] Workout" to begin immediately
- **Manual Selection**: Choose any day type if you want to override the recommendation
- **Exercise Generation**: Use "Shuffle Exercises" to get a custom workout plan

### ⏱️ Interval Timer
- **Norwegian 4x4**: Proper cardio interval protocol (4×4min work, 3min rest)
- **HIIT Presets**: Tabata, EMOM, Circuit Training, and more
- **Custom Timer**: Build your own interval workout

### 📊 Progress
- **Strength Tracking**: Monitor your estimated 1RM progression
- **Volume Analysis**: See weekly volume by muscle group
- **RPE Trends**: Track your Rate of Perceived Exertion over time

### 🎯 Exercises
- Browse available movements and equipment requirements

## Quick Start Guide

1. **First Visit**: Dashboard shows welcome guide explaining PPL system
2. **Start Your First Workout**: Click the prominent "Start Push Workout" button
3. **Track Your Sets**: Log weights, reps, and RPE in the workout session
4. **Continue the Cycle**: App automatically suggests Pull day next, then Legs, then back to Push

## App URLs

- **Frontend**: http://localhost:5174/
- **Backend API**: http://localhost:5179/
- **API Documentation**: http://localhost:5179/swagger

## Technical Improvements

- ✅ Fixed user profile creation to prevent database foreign key errors
- ✅ Added automatic user creation with proper error handling
- ✅ Implemented smart workout day detection based on history
- ✅ Added one-click workout start from multiple locations
- ✅ Separated Norwegian 4x4 into proper interval timer feature
- ✅ Improved navigation with clearer labels
- ✅ Added contextual help for new users
- ✅ Real API integration (no more placeholder data)

The app now properly distinguishes between strength training (PPL) and cardio (Norwegian 4x4) while providing an intuitive, user-friendly experience!