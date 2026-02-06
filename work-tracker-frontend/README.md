# Work Tracker - Standalone Frontend

A fully functional offline-first work time tracking application. No backend required!

## Features

✅ **Offline-First** - Works completely offline using localStorage
✅ **PWA Ready** - Installable as a standalone app
✅ **Live Timer** - Real-time session tracking
✅ **Statistics** - Daily totals, weekly goals, work streaks
✅ **Session History** - Track all your work sessions
✅ **Responsive Design** - Beautiful mobile-first UI

## Quick Start

1. Open `index.html` in your browser
2. Click "Punch In" to start tracking
3. Click "Punch Out" to end your session

That's it! All data is stored locally in your browser.

## Installation as PWA

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Click the install icon (⊕) in the address bar
3. Click "Install"

### Mobile (iOS Safari)
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Mobile (Android Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Install App" or "Add to Home Screen"

## How It Works

### Data Storage
All data is stored in your browser's localStorage:
- Work sessions
- Projects
- User preferences
- Weekly goals

### Offline Support
The service worker caches all resources, allowing the app to work completely offline.

### Statistics
- **Today's Total**: Sum of all sessions for current day
- **Weekly Progress**: Hours worked vs. weekly goal
- **Active Streak**: Consecutive days with work sessions

## File Structure

```
work-tracker-frontend/
├── index.html           # Main application file
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline caching
└── README.md           # This file
```

## Features in Detail

### Timer
- Live countdown/up display (HH:MM:SS)
- Persists across page reloads
- Automatic calculation of session duration

### Sessions
- Punch in/out functionality
- Project assignment
- Session history
- Duration tracking

### Projects
- Default "Brand Identity Design" project
- Customizable icons and colors
- Session categorization

### Statistics
- Real-time calculations
- Today's total work time
- Weekly goal tracking with progress bar
- Work streak calculation

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet

## Data Privacy

All data stays on your device. Nothing is sent to any server. Your data is:
- Stored locally in localStorage
- Never transmitted
- Completely private
- Under your control

## Customization

### Change Weekly Goal
Edit the `weeklyGoal` value in localStorage or modify the default in `index.html`.

### Add Projects
Projects can be added by modifying the `projects` array in the app initialization.

### Change User Name
Modify the `userName` value in localStorage.

## Backup & Export

To backup your data:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find localStorage
4. Copy the `workTrackerData` value
5. Save it to a file

To restore:
1. Open DevTools
2. Go to localStorage
3. Paste your saved data into `workTrackerData`
4. Refresh the page

## Troubleshooting

**Timer not updating?**
- Refresh the page
- Check if JavaScript is enabled

**Data lost?**
- Check if localStorage is enabled
- Ensure you didn't clear browser data
- Restore from backup if available

**App not installing?**
- Ensure HTTPS or localhost
- Check browser PWA support
- Try a different browser

## Future Enhancements

Potential features to add:
- Multiple projects with selection
- Session notes
- Export to CSV
- Charts and graphs
- Dark/light mode toggle
- Notifications
- Break reminders

## License

Free to use and modify.

## Support

This is a standalone app with no backend. All functionality is client-side.
