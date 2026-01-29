# Film Ribbon Portfolio

A high-performance 3D portfolio featuring an "Infinite Film Ribbon" - a twisted path through space showcasing video projects.

## Tech Stack

- **Next.js** 16.1.6 - App Router, SSR
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - 3D helpers and utilities
- **@react-three/postprocessing** - Post-processing effects
- **GSAP** - Smooth animations
- **Zustand** - State management
- **Tailwind CSS** - UI styling

## Getting Started

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to React Three Fiber's peer dependencies.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the 3D portfolio.

### Build for Production

```bash
npm run build
npm start
```

## Features

- ✨ **Twisted Figure-8 Ribbon Path** with procedural curve generation
- 🎥 **Three-State Video Cards** (idle/hover/active)
- 🎨 **Custom GLSL Shaders** (RGB split glitch, wave distortion, scanlines)
- 📹 **Camera Banking System** with tangent/normal/binormal rotation
- ⚡ **Post-Processing** (Bloom, Chromatic Aberration, Film Grain)
- 🎬 **YouTube Player Modal** for full video playback
- 🖱️ **Custom Cursor** with trailing effect
- ⭐ **5000 Stars** + **1000 Particles** for atmosphere
- 🎮 **Keyboard/Mouse Controls** (Scroll, Arrow keys, W/S)

## Deployment

### Netlify

The project includes `.npmrc` and `netlify.toml` configuration files for seamless Netlify deployment.

Just connect your GitHub repository to Netlify and it will automatically deploy!

### Vercel

```bash
vercel --prod
```

## Customization

### Update Video Content

Edit `src/store/usePortfolioStore.ts` to replace placeholder data:

```typescript
{
  id: "project1",
  youtubeId: "YOUR_YOUTUBE_ID",
  thumbnail: "https://img.youtube.com/vi/YOUR_YOUTUBE_ID/maxresdefault.jpg",
  title: "Your Project Title",
  description: "Your project description",
  credits: ["Director: Name", "Editor: Name"],
  position: 0.0
}
```

### Change Colors

Search for `#00ffff` (cyan) throughout the codebase and replace with your brand color.

### Adjust Curve Shape

Modify the control point calculations in `src/utils/ribbonCurve.ts`.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main homepage  
│   └── globals.css         # Tailwind imports
├── components/
│   ├── 3d/
│   │   ├── FilmRibbonScene.tsx   # Main 3D container
│   │   ├── VideoCard.tsx         # Card component
│   │   └── CameraRig.tsx         # Camera controller
│   └── ui/
│       ├── Navigation.tsx
│       ├── YouTubePlayer.tsx
│       └── CustomCursor.tsx
├── store/
│   └── usePortfolioStore.ts      # Zustand state
├── utils/
│   └── ribbonCurve.ts            # Curve mathematics
└── shaders/
    └── cardShaders.ts            # GLSL shaders
```

## License

MIT
