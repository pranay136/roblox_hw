# Homework Star Tracker 📚⭐

A fun, interactive homework tracking app built with React that rewards you with stars and avatar unlocks as you complete homework!

**Live Demo:** https://pranay136.github.io/roblox_hw/

## Features

✨ **Track Homework** - Log your homework with subject, date, and details
⭐ **Earn Stars** - Get 2 stars for each homework entry
🎨 **Unlock Avatars** - Unlock unique avatars as you reach star milestones
📊 **Progress Charts** - Visualize your homework completion over time
💾 **Local Storage** - Your data is saved locally in your browser
🎞️ **Smooth Animations** - Beautiful animations powered by Framer Motion

## Avatar Unlock Milestones

- 🟦 **Starter Buddy** (Base) - Start with this
- 🟥 **Rocket Champ** - Unlock at 250 stars
- 🟢 **Jungle Ninja** - Unlock at 500 stars
- 🟪 **Galaxy Hero** - Unlock at 750 stars

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Scripts** - Build tools

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranay136/roblox_hw.git
   cd roblox_hw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Deployment

### Automatic Deployment (GitHub Actions)

The app automatically deploys to GitHub Pages when you push to the `main` branch. The workflow is configured in `.github/workflows/deploy.yml`.

**Steps:**
1. Make changes and commit
2. Push to main branch
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. GitHub Actions automatically builds and deploys

### Manual Deployment

If you need to deploy manually:

```bash
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch, which deploys to your GitHub Pages site.

## GitHub Pages Configuration

The app is configured to deploy to `https://pranay136.github.io/roblox_hw/` as specified in `package.json`:

```json
"homepage": "https://pranay136.github.io/roblox_hw/"
```

If you fork this repo or change ownership, update the homepage URL accordingly.

## Project Structure

```
roblox_hw/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── App.js              # Main React component
│   ├── index.js            # React entry point
│   └── index.css           # Tailwind styles
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions workflow
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## Data Storage

Your homework data is stored in browser's localStorage under the key `homework-star-tracker-v2`. To clear data:

1. Open DevTools (F12)
2. Go to Application → LocalStorage
3. Find the entry with your app's domain
4. Delete the key `homework-star-tracker-v2`

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### App not loading?
- Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
- Check browser console for errors (F12)

### Data not persisting?
- Check if localStorage is enabled in your browser
- Try using incognito/private mode to test

### Deployment issues?
- Check GitHub Actions workflow status in your repo
- Ensure `main` branch is the default branch
- Verify `homepage` URL in package.json

## License

MIT

## Author

Created for tracking homework progress! 📚
