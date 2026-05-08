# 👗 Womanhood — Project Progress Tracker

> **Boutique Stitching Management System**
> Last updated: 01 Apr 2026

---

## 📋 Overall Status

| Component           | Status         | Tech Stack                                |
| ------------------- | -------------- | ----------------------------------------- |
| Backend API         | ✅ Complete    | Node.js, Express, MongoDB, Cloudinary     |
| Customer Website    | ✅ Complete    | React (Vite), React Router, Axios         |
| Owner App (Mobile)  | ✅ Complete    | React Native, Expo SDK 54, Expo Router    |

---

## 1. 🔧 Backend (Node.js + Express + MongoDB + Cloudinary)

### Files Created

| File                          | Purpose                                          | Status |
| ----------------------------- | ------------------------------------------------ | ------ |
| `backend/server.js`           | Express app entry, MongoDB connect, CORS, routes | ✅     |
| `backend/.env`                | Environment variables template                   | ✅     |
| `backend/models/Order.js`     | Mongoose Order schema with text search index     | ✅     |
| `backend/config/cloudinary.js`| Cloudinary SDK configuration                     | ✅     |
| `backend/middleware/auth.js`  | JWT verification middleware                      | ✅     |
| `backend/middleware/upload.js`| Multer memory storage (10MB limit, images only)  | ✅     |
| `backend/routes/auth.js`     | `POST /api/auth/login` — owner login, JWT issue  | ✅     |
| `backend/routes/orders.js`   | Full CRUD order routes (all protected)           | ✅     |
| `backend/routes/track.js`    | Public tracking routes for customers             | ✅     |
| `backend/cron/autoDelete.js` | Daily cron to delete collected orders > 2 days   | ✅     |

### Dependencies Installed

```
express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, multer, cloudinary, node-cron
```

### API Endpoints Implemented

| Method   | Endpoint                    | Auth     | Description                                  | Status |
| -------- | --------------------------- | -------- | -------------------------------------------- | ------ |
| `POST`   | `/api/auth/login`           | ❌ Public | Owner login with env credentials → JWT       | ✅     |
| `POST`   | `/api/orders`               | ✅ JWT   | Create order (multipart/form-data + image)   | ✅     |
| `GET`    | `/api/orders/search?q=`     | ✅ JWT   | Search by name, phone, serial (regex)        | ✅     |
| `GET`    | `/api/orders/:id`           | ✅ JWT   | Get single order by MongoDB ID               | ✅     |
| `PATCH`  | `/api/orders/:id`           | ✅ JWT   | Edit order fields (supports new image)       | ✅     |
| `PATCH`  | `/api/orders/:id/status`    | ✅ JWT   | Update status (sets `collectedAt` if needed) | ✅     |
| `DELETE` | `/api/orders/:id`           | ✅ JWT   | Delete order permanently                     | ✅     |
| `GET`    | `/api/track?q=`             | ❌ Public | Public search (limited fields returned)      | ✅     |
| `GET`    | `/api/track/:serialNumber`  | ❌ Public | Public single order view by serial number    | ✅     |
| `GET`    | `/api/health`               | ❌ Public | Health check endpoint                        | ✅     |

### Features Completed

- [x] Single owner authentication (credentials from `.env`)
- [x] JWT generation with 7-day expiry
- [x] JWT middleware for protected routes
- [x] Image upload via multer buffer → Cloudinary stream
- [x] Order schema with 5-status enum and `collectedAt` tracking
- [x] Text search index on name, phone, serial
- [x] Regex-based search across multiple fields
- [x] Auto-set `collectedAt` when status → `collected`, reset otherwise
- [x] Daily cron job (midnight) to auto-delete collected orders > 2 days
- [x] CORS configured for customer website origin
- [x] Global error handling middleware
- [x] Duplicate serial number validation on create

---

## 2. 🌐 Customer Tracking Website (Vite + React)

### Files Created

| File                                       | Purpose                                           | Status |
| ------------------------------------------ | ------------------------------------------------- | ------ |
| `customer-website/index.html`              | SEO-optimized HTML with meta tags                 | ✅     |
| `customer-website/src/App.jsx`             | Router setup: `/` and `/track/:serialNumber`      | ✅     |
| `customer-website/src/api.js`              | Axios client for public `/api/track` endpoints    | ✅     |
| `customer-website/src/index.css`           | Full design system CSS (560+ lines)               | ✅     |
| `customer-website/src/pages/SearchPage.jsx`| Search page with debounced input & result cards   | ✅     |
| `customer-website/src/pages/OrderDetailPage.jsx`| Order detail with status timeline            | ✅     |

### Dependencies Installed

```
axios, react-router-dom (+ Vite default deps: react, react-dom)
```

### Features Completed

- [x] Responsive design matching Figma color scheme (#FFF6EA, #CDA595, etc.)
- [x] Animated header with gradient and floating background effect
- [x] Search card with focus lift animation
- [x] 400ms debounced search as user types
- [x] Skeleton loading cards during API call
- [x] Order result cards with cloth photo, name, serial, phone, status badge
- [x] Click-to-navigate to individual order detail
- [x] Clear search button (✕)
- [x] Empty states: initial prompt, no results found, error state
- [x] Order detail page with back navigation
- [x] Full-width cloth photo with shadow
- [x] Customer info display (name, serial, phone)
- [x] Date given & delivery due date rows
- [x] Notes section (conditional)
- [x] 5-step visual status timeline with active/completed/pending states
- [x] "CURRENT" badge on active status step
- [x] Checkmark (✓) on completed steps
- [x] Footer with brand text
- [x] Custom scrollbar styled to brand
- [x] Mobile responsive breakpoints
- [x] SEO meta tags (title, description, theme-color)
- [x] Production build verified ✅

### Design System (CSS Custom Properties Applied)

- `--bg: #FFF6EA` — warm cream background
- `--primary: #CDA595` — dusty rose accents
- `--primary-dark: #8C7268` — active status
- `--shadow-card: 4px 4px 0px #CDA595` — card shadows
- `--shadow-btn: 4px 4px 0px #000000` — button/badge shadows
- Cards: `border-radius: 14px`, white background
- Inputs: `border-radius: 11px`, `#D9D9D9` background
- Status badges: `border-radius: 6px`, color-coded per status
- Font: Inter (400 Regular, 800 ExtraBold)

---

## 3. 📱 Owner App (React Native + Expo)

### Files Created

| File                              | Purpose                                              | Status |
| --------------------------------- | ---------------------------------------------------- | ------ |
| `owner-app/app.json`             | Expo config with camera, image picker plugins         | ✅     |
| `owner-app/eas.json`             | EAS build config (APK for preview, AAB for prod)      | ✅     |
| `owner-app/.env`                 | API_URL for Android emulator (`10.0.2.2`)             | ✅     |
| `owner-app/package.json`         | Updated with `expo-router/entry` as main              | ✅     |
| `owner-app/src/api.js`           | Axios with JWT interceptor from AsyncStorage          | ✅     |
| `owner-app/src/theme.js`         | COLORS, SHADOWS, commonStyles matching Figma          | ✅     |
| `owner-app/app/_layout.js`       | Root layout: Inter fonts, StatusBar, Stack navigator  | ✅     |
| `owner-app/app/index.js`         | **Screen 1: Login** — centered card, JWT storage      | ✅     |
| `owner-app/app/home.js`          | **Screen 2: Home** — gradient, search, cards, FAB     | ✅     |
| `owner-app/app/add-order.js`     | **Screen 3: Add Order** — camera/gallery, form, save  | ✅     |
| `owner-app/app/order/[id].js`    | **Screen 4: Order Detail** — edit, status, delete     | ✅     |

### Dependencies Installed

```
expo (~54.0.33), expo-router, expo-camera, expo-image-picker,
@react-native-async-storage/async-storage, axios, expo-constants,
expo-linking, expo-status-bar, expo-font, expo-linear-gradient,
react-native-safe-area-context, react-native-screens,
react-native-gesture-handler, @react-native-community/datetimepicker,
@expo-google-fonts/inter
```

### Screens Completed

#### Screen 1: Login (`app/index.js`)
- [x] Full screen `#FFF6EA` background
- [x] Centered white card with `border-radius: 14`, `shadow-card`
- [x] "Womanhood" title in Inter ExtraBold
- [x] "Owner Portal" subtitle
- [x] Username input field (styled: `#D9D9D9` bg, `11px` radius, `1px #9E9E9E` border)
- [x] Phone Number input field (same styling)
- [x] Login button: `#CDA595` bg, `shadow-btn`, white ExtraBold text
- [x] Animated fade-in on mount
- [x] Auto-check AsyncStorage for existing JWT → redirect to Home
- [x] Error handling with Alert dialogs
- [x] KeyboardAvoidingView for iOS/Android

#### Screen 2: Home (`app/home.js`)
- [x] `#FFF6EA` background
- [x] Dark gradient overlay at top (`rgba(0,0,0,0.35)` to transparent)
- [x] Search bar: white rounded card, `border-radius: 14`, `shadow-card`
- [x] Search icon + placeholder "Name, Serial no, Phone no." in `#9E9E9E`
- [x] 400ms debounced search on API
- [x] Clear search button
- [x] Scrollable FlatList of order cards
- [x] Each card: white, `border-radius: 14`, `shadow-card`
- [x] Card left: cloth photo `110×130px`, `border-radius: 16`
- [x] Card right: customer name `15px` black, serial `10px #464644`, phone `10px #464644`
- [x] Status badge pill: `#CDA595` bg, `border-radius: 6`, `shadow-btn`
- [x] Pull-to-refresh
- [x] Empty state illustrations (no orders / no results)
- [x] FAB "+" button: circular, `#CDA595`, fixed bottom-right, `shadow-btn`
- [x] Navigate to Add Order on FAB press
- [x] Navigate to Order Detail on card press
- [x] Auto-logout on 401 response

#### Screen 3: Add New Order (`app/add-order.js`)
- [x] `#FFF6EA` background
- [x] Back button: top-left, `58×58px`, `#CDA595`, `border-radius: 8`, white arrow
- [x] "New Order" header title
- [x] White card container, `border-radius: 14`
- [x] Photo area: `full-width×314px`, `#D9D9D9` bg, `border-radius: 16`
- [x] Camera icon + "Tap to add photo" when empty
- [x] Photo preview when selected
- [x] Tap opens Alert with Camera / Gallery / Cancel options
- [x] Expo Camera + Image Picker permissions handling
- [x] Name input field with label "Name:"
- [x] Serial No input field with label "Serial No:"
- [x] Phone No input field with label "Phone No:" (phone-pad keyboard)
- [x] Date Given: auto-filled, shown as read-only
- [x] Due Date: date picker (defaults to 7 days from today)
- [x] Notes: optional multiline input
- [x] SAVE button: `165×62px`, `#CDA595` bg, `border-radius: 9`, `shadow-btn`, "SAVE" 24px ExtraBold white
- [x] On save: FormData with image → POST `/api/orders` → navigate back
- [x] Loading state while saving
- [x] KeyboardAvoidingView

#### Screen 4: Order Detail (`app/order/[id].js`)
- [x] `#FFF6EA` background
- [x] Back button: same style as Add Order
- [x] Edit button (pencil ✏️ icon, top-right)
- [x] White card with `border-radius: 14`
- [x] Cloth photo: `full-width×312px`, `border-radius: 16`, `shadow-card`
- [x] Customer Name: `28px` Inter ExtraBold, black
- [x] Serial No: `18px`, `#464644`
- [x] Phone: `18px`, `#464644`
- [x] Date Given + Delivery Due Date in side-by-side layout
- [x] Notes section (conditional, warm background)
- [x] **Edit mode**: fields become editable inline
- [x] Cancel + Save Changes buttons in edit mode
- [x] **Status section** — 5 buttons stacked vertically:
  - [x] 🧵 Material Collected (default `#CDA595`)
  - [x] ✂️ Taken for Cutting
  - [x] 🪡 Stitching in Progress
  - [x] 👜 Ready to Collect
  - [x] ✅ Collected
- [x] Active status: darker `#8C7268` background + "CURRENT" badge
- [x] Tap → immediate PATCH `/api/orders/:id/status`
- [x] "Collected" tap → confirmation dialog: "Order auto-deletes in 2 days."
- [x] Loading indicator during status update
- [x] Delete button (only visible when status = `collected`)
- [x] Delete confirmation dialog before API call

### APK Export Configuration
- [x] `eas.json` configured with `preview` profile → `buildType: "apk"`
- [x] `app.json` has Android package, permissions, and plugin declarations
- [x] Build command: `npx eas build --platform android --profile preview`

---

## 🎨 Design System Consistency

All three apps share the same Figma-derived design tokens:

| Element            | Spec                               | Backend | Website | App |
| ------------------ | ---------------------------------- | ------- | ------- | --- |
| Background color   | `#FFF6EA`                          | —       | ✅      | ✅  |
| Primary accent     | `#CDA595`                          | —       | ✅      | ✅  |
| Active status      | `#8C7268`                          | —       | ✅      | ✅  |
| Card shadow        | `4px 4px 0 #CDA595`               | —       | ✅      | ✅  |
| Button shadow      | `4px 4px 0 #000`                   | —       | ✅      | ✅  |
| Card border-radius | `14px`                             | —       | ✅      | ✅  |
| Photo radius       | `16px`                             | —       | ✅      | ✅  |
| Input styling      | `11px radius, #D9D9D9 bg, 1px border` | —   | ✅      | ✅  |
| Font               | Inter Regular + ExtraBold          | —       | ✅      | ✅  |
| Status enum        | 5 states in Order schema           | ✅      | ✅      | ✅  |

---

## 🚀 What's Next (To Run the Project)

1. **Set up MongoDB** — local or Atlas, update `MONGODB_URI` in `backend/.env`
2. **Set up Cloudinary** — create account, update `CLOUDINARY_*` vars in `backend/.env`
3. **Set owner credentials** — update `OWNER_USERNAME` and `OWNER_PHONE` in `backend/.env`
4. **Start backend** — `cd backend && npm start`
5. **Start website** — `cd customer-website && npm run dev`
6. **Start owner app** — `cd owner-app && npx expo start`
7. **Build APK** — `cd owner-app && npx eas build --platform android --profile preview`

---

*Built with ❤️ for Womanhood Boutique*
