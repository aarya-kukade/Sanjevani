# Sanjeevani - React Globe Integration Guide

## Project Structure Overview

Your Sanjeevani project now has two parts:

1. **Frontend Home Page** (Vanilla HTML/CSS/JS)
   - `home.html` - Beautiful landing page
   - `home-styles.css` - Styling with animations
   - `home-script.js` - Interactivity and canvas globe

2. **React App** (To be set up) - For the interactive globe component
   - React with TypeScript
   - Tailwind CSS
   - Three.js + Framer Motion
   - shadcn project structure

---

## Step 1: Setup React App with Vite or Next.js

### Option A: Using Vite + React (Recommended for this project)

```bash
# Create new React + TypeScript project
npm create vite@latest sanjeevani-globe -- --template react-ts

cd sanjeevani-globe

# Install dependencies
npm install
```

### Option B: Using Create React App

```bash
npx create-react-app sanjeevani-globe --template typescript
cd sanjeevani-globe
```

### Option C: Using Next.js (Best for full-stack)

```bash
npx create-next-app@latest sanjeevani-globe --typescript --tailwind
cd sanjeevani-globe
```

---

## Step 2: Install Required Dependencies

```bash
npm install three @react-three/fiber @react-three/drei framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Configure Tailwind CSS (if using Vite/CRA):

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## Step 3: Setup Component Folders

Create the required folder structure:

```
src/
├── components/
│   └── ui/
│       └── globe-hero.tsx
├── lib/
│   └── utils.ts
└── App.tsx
```

### Create `src/lib/utils.ts`:

```typescript
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
```

---

## Step 4: Add the Globe Component

### Copy to `src/components/ui/globe-hero.tsx`:

```typescript
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import React, { useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

const Globe: React.FC<{
  rotationSpeed: number;
  radius: number;
}> = ({ rotationSpeed, radius }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
      groupRef.current.rotation.z += rotationSpeed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color="hsl(var(--foreground))"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
};

const DotGlobeHero = React.forwardRef<
  HTMLDivElement,
  DotGlobeHeroProps
>(({
  rotationSpeed = 0.005,
  globeRadius = 1,
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full h-screen bg-background overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {children}
      </div>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Globe
            rotationSpeed={rotationSpeed}
            radius={globeRadius}
          />
        </Canvas>
      </div>
    </div>
  );
});

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
```

---

## Step 5: Create Demo Component

### Create `src/pages/globe-demo.tsx` (or `src/components/globe-demo.tsx`):

```typescript
"use client";

import React from "react";
import { motion } from "framer-motion";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { ArrowRight, Zap } from "lucide-react";

export default function DotGlobeHeroDemo() {
  return (
    <DotGlobeHero
      rotationSpeed={0.004}
      className="bg-gradient-to-br from-background via-background/95 to-muted/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 text-center space-y-12 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="relative z-10 text-sm font-bold text-primary tracking-wider uppercase">GLOBAL NETWORK</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-ping animation-delay-500" />
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] select-none"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <span className="block font-light text-foreground/70 mb-3 text-4xl md:text-6xl lg:text-7xl">
                Connect
              </span>
              <span className="block relative">
                <span className="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent font-black relative z-10">
                  the World
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent font-black blur-2xl opacity-50 scale-105" 
                     style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  the World
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                  className="absolute -bottom-6 left-0 h-3 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full shadow-lg shadow-primary/50"
                />
              </span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium" 
               style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Experience real-time global connectivity with our{" "}
              <span className="text-foreground font-semibold bg-gradient-to-r from-primary/20 to-primary/10 px-2 py-1 rounded-md">
                distributed network infrastructure
              </span>
            </p>
            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              Monitor bed availability, track performance, and scale across continents with unprecedented reliability.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.2), 0 0 25px hsl(var(--primary) / 0.3)",
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground rounded-xl font-semibold text-lg shadow-xl hover:shadow-primary/30 transition-all duration-500 overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
            <span className="relative z-10 tracking-wide">Start Exploring</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "hsl(var(--accent))",
              borderColor: "hsl(var(--primary))",
              boxShadow: "0 15px 30px rgba(0,0,0,0.1), 0 0 15px hsl(var(--primary) / 0.1)",
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-border/40 rounded-xl font-semibold text-lg hover:border-primary/40 transition-all duration-500 backdrop-blur-xl bg-background/60 hover:bg-background/90 shadow-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="relative z-10 w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            <span className="relative z-10 tracking-wide">View Live Demo</span>
          </motion.button>
        </motion.div>
      </div>
    </DotGlobeHero>
  );
}
```

---

## Step 6: Update Main App File

### For Vite/CRA - Update `src/App.tsx`:

```typescript
import GlobeDemoPage from './pages/globe-demo'
import './App.css'

function App() {
  return <GlobeDemoPage />
}

export default App
```

### For Next.js - Create `app/page.tsx`:

```typescript
import GlobeDemoPage from '@/components/globe-demo'

export default function Home() {
  return <GlobeDemoPage />
}
```

---

## Step 7: Run the Projects

### Terminal 1 - React App (Port 3000):
```bash
cd sanjeevani-globe
npm run dev
# or for Next.js:
npm run dev
```

### Terminal 2 - Vanilla Home Page (Port 5000):
```bash
cd ../Sanjeevani
# Using Python:
python -m http.server 5000

# Or using Node.js:
npx http-server -p 5000
```

---

## Accessing the Application

- **Home Page**: `http://localhost:5000/home.html`
- **Globe Demo**: `http://localhost:3000`

The home page has buttons that redirect to the React app (configured for `http://localhost:3000`)

---

## Project Files Summary

### Vanilla Home Page (Sanjeevani folder):
- ✅ `home.html` - Main home page
- ✅ `home-styles.css` - Styling with aurora theme
- ✅ `home-script.js` - Interactivity and canvas globe
- ✅ `index.html` - Original hospital search page (unchanged)

### React App (sanjeevani-globe folder):
- ✅ `src/components/ui/globe-hero.tsx` - Globe component
- ✅ `src/pages/globe-demo.tsx` - Demo page
- ✅ `src/lib/utils.ts` - Utility functions
- ✅ `tailwind.config.js` - Tailwind configuration

---

## Important Notes

1. **Update Redirect URL**: In `home-script.js`, update the redirect URL:
   ```javascript
   window.location.href = 'http://localhost:3000/';
   // Change to your production URL when deploying
   ```

2. **CORS Issues**: If you get CORS errors, you might need to proxy requests or run both apps on the same port using a reverse proxy.

3. **Production Deployment**: 
   - Deploy React app to Vercel, Netlify, or similar
   - Deploy home page to your hosting
   - Update redirect URLs accordingly

4. **API Integration**: The hospital search page (`index.html`) remains vanilla and functional. Integrate with your backend as needed.

---

## File Structure Reference

```
Your Projects/
├── Sanjeevani/                    (Vanilla HTML/CSS/JS)
│   ├── home.html                  ← NEW: Beautiful home page
│   ├── home-styles.css            ← NEW: Home page styles
│   ├── home-script.js             ← NEW: Home page logic
│   ├── index.html                 (Original - unchanged)
│   ├── styles.css
│   ├── app.js
│   ├── data.js
│   └── .git/
│
└── sanjeevani-globe/              (React app - to be created)
    ├── src/
    │   ├── components/ui/
    │   │   └── globe-hero.tsx      ← React Globe Component
    │   ├── pages/
    │   │   └── globe-demo.tsx      ← Demo page
    │   ├── lib/
    │   │   └── utils.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── vite.config.ts (or next.config.js)
```

---

## Troubleshooting

### Three.js errors?
```bash
npm install three @types/three --save
```

### Framer Motion not working?
```bash
npm install framer-motion
```

### Tailwind CSS not applying?
- Check `content` paths in `tailwind.config.js`
- Rebuild CSS: `npm run build` or restart dev server

### Canvas globe not showing?
- Check browser console for errors
- Ensure canvas element has proper dimensions
- Try resizing window

---

## Next Steps

1. ✅ Create React project
2. ✅ Install dependencies
3. ✅ Add components
4. ✅ Run both servers
5. 🔄 Test redirects
6. 🔄 Integrate with backend API
7. 🔄 Deploy to production

Happy coding! 🚀
