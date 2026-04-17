# Sanjeevani - Pages Navigation Guide

## 📋 Project Structure Overview

Your Sanjeevani project now includes dedicated pages for each major section with consistent Aurora design and styling.

### New Files Created

```
Sanjeevani/
├── home.html                 (Main landing page)
├── features.html             (Detailed features page)
├── about.html                (About company & mission)
├── contact.html              (Contact form & support)
├── home-script.js            (Home page interactions)
├── home-styles.css           (Main stylesheet)
├── pages-script.js           (Navigation for feature pages)
├── pages-styles.css          (Styles for feature pages)
├── start.html                (Hospital booking app)
└── app.js                    (Application logic)
```

## 🎯 Page Descriptions

### 1. **home.html** - Landing Page
- Hero section with animated background
- Quick overview of features
- About preview section
- Call-to-action buttons
- Links to detailed pages

### 2. **features.html** - Complete Features
Comprehensive breakdown including:
- 🌍 Global Connectivity
  - Global infrastructure
  - Real-time synchronization
  - Multi-hospital dashboard

- 🧠 AI-Powered Intelligence
  - Smart symptom analysis
  - Predictive matching
  - Automated recommendations

- 📍 Location & Navigation
  - Advanced GPS mapping
  - Ambulance dispatch
  - Geofencing alerts

- 📊 Analytics & Insights
  - Real-time analytics dashboard
  - Advanced reporting
  - Predictive analytics

- 🔒 Security & Compliance
  - HIPAA compliance
  - Data encryption
  - Security certifications

- ⚡ Performance & Speed
  - Ultra-fast API
  - Global CDN
  - Database optimization

- Feature comparison table

### 3. **about.html** - Company Info
- Mission & Vision statement
- Company values
- Problem statement (before Sanjeevani)
- Our solution approach
- Leadership team profiles
- Company milestones timeline
- Why choose Sanjeevani
- Customer testimonials

### 4. **contact.html** - Support & Engagement
- Contact information (phone, email, address, chat)
- Contact form with validation
- FAQ section with toggle answers
- Schedule demo form
- Live app experience button
- Support channels

## 🔗 Navigation Flow

```
home.html
├── Features (button) → features.html
├── About (button) → about.html
├── Contact (button) → contact.html
├── "Start Exploring" → start.html (Hospital Booking App)
├── "View Live Demo" → start.html (opens in new tab)
└── All CTAs → start.html

features.html
├── "Experience Sanjeevani" → start.html
├── "Get in Touch" → contact.html
└── "Home" → home.html

about.html
├── "Experience Sanjeevani" → start.html
├── "Schedule Demo" → contact.html (demo form)
└── "Home" → home.html

contact.html
├── "Schedule Demo" → Demo modal
├── "Experience Live App" → start.html
└── "Home" → home.html
```

## 🎨 Design & Styling

### Shared Styles
- `home-styles.css` - Main stylesheet used by all pages
  - Navigation styling
  - Button styles
  - Footer styling
  - Animations & keyframes
  - Responsive design

- `pages-styles.css` - Additional styles for feature pages
  - Page hero sections
  - Detailed feature cards
  - Timeline components
  - Team section styling
  - Contact form styling
  - FAQ section styling

### Color Scheme
```css
Primary: #0a9396 (Teal)
Secondary: #00d4d4 (Cyan)
Accent: #10a688 (Green)
Dark: #0a1628 (Navy Blue)
Light: #f8f9ff (Off-white)
```

## 🚀 Interactive Features

### 1. Navigation Bar
- **Desktop**: Full horizontal menu
- **Mobile**: Hamburger menu with toggle animation
- Active link highlighting
- Smooth page transitions

### 2. Modal Dialogs
- Redirect confirmation before navigating to app
- Demo scheduling form
- Smooth backdrop blur effect
- Click-outside to close

### 3. Buttons & CTAs
- Primary buttons (gradient background)
- Secondary buttons (transparent with border)
- Hover animations
- Arrow icons with smooth transitions

### 4. Animations
- Slide up entrance animations
- Pulse effects on badges
- Bounce scroll indicators
- Smooth transitions on hover
- Glow effects on active elements

## 📱 Responsive Design

All pages are fully responsive with breakpoints at:
- Desktop: 1200px (full layout)
- Tablet: 768px (adjusted grid)
- Mobile: 480px (single column)

## 🔧 How to Use

### 1. **Browse Features**
Navigate from Home → click "Features" link → View all features with detailed cards and comparison table

### 2. **Learn About Company**
Navigate from Home → click "About" link → Read mission, team info, and testimonials

### 3. **Get Support**
Navigate from Home → click "Contact" link → Fill contact form or view FAQ

### 4. **Access Hospital Booking App**
From any page:
- Click "Start Exploring" or "Experience Sanjeevani" button
- Confirm in modal dialog
- Redirected to `start.html` (hospital booking system)

### 5. **Mobile Navigation**
- Click hamburger menu icon
- Select desired page
- Menu closes automatically

## 📧 Contact Form Fields

The contact form includes:
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- Hospital/Organization (optional)
- Subject (required, dropdown)
- Message (required)
- Privacy policy checkbox

## ❓ FAQ Topics Covered

1. Setup time for Sanjeevani
2. HIPAA compliance confirmation
3. Pricing model information
4. EHR system integration
5. Support options available
6. Regional availability

## 🎓 JavaScript Functions

### Pages Script (pages-script.js)
- `updateActiveNavLink()` - Sets active nav indicator
- Modal open/close handlers
- Navigation menu toggle
- Redirect handlers

### Home Script (home-script.js)
- Canvas animation for globe
- Button click handlers
- Modal management
- Smooth scroll behavior
- Mobile menu controls

## 🚨 Important Notes

1. **start.html Integration**: All "Experience Sanjeevani" buttons redirect to `start.html` - ensure this file is properly configured for your hospital booking app

2. **Mobile Menu**: Navigation automatically closes when clicking a link - no sticky menu interference

3. **Active States**: Current page link is automatically highlighted in navigation

4. **Forms**: Contact form resets and shows success message for 5 seconds before allowing new submissions

5. **Modal Dialogs**: Can be closed by:
   - Clicking close (×) button
   - Clicking cancel button
   - Clicking outside the modal (backdrop)

## 🔄 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit prefixes)
- Mobile browsers: Optimized touch interactions

## 📊 Page Performance

- Fast loading with optimized CSS
- Minimal JavaScript for better performance
- Lazy loading ready for images
- Smooth animations with hardware acceleration

## 🎯 Next Steps

1. Test all navigation links
2. Verify start.html opens correctly for booking system
3. Test contact form submission
4. Check responsive design on mobile
5. Customize colors if needed in CSS variables
6. Add actual team photos to about page
7. Configure contact form backend
8. Set up email notifications for contact forms

---

**Version**: 1.0  
**Created**: April 2026  
**Last Updated**: April 2026
