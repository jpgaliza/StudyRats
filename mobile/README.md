# StudyRats Mobile App

A React Native mobile application for collaborative study tracking and gamification. StudyRats helps students stay motivated by competing with their study groups through check-ins and leaderboards.

## 🚀 Technologies & Libraries

### Core Technologies
- **React Native** - Cross-platform mobile development
- **Expo** (~54.0.33) - Development platform and tooling
- **Expo Router** (~6.0.23) - File-based routing for React Native
- **TypeScript** (~5.9.2) - Type-safe development

### UI & Styling
- **expo-linear-gradient** - Gradient backgrounds and buttons
- **@expo/vector-icons** - Ionicons icon library
- **React Native StyleSheet** - Native styling

### Navigation & State
- **@react-navigation/native** (~7.1.8) - Navigation infrastructure
- **@react-navigation/bottom-tabs** (~7.4.0) - Tab navigation
- **expo-router** - File-based routing system

### Animation & Interaction
- **react-native-reanimated** (~4.1.1) - Powerful animation library
- **react-native-gesture-handler** (~2.28.0) - Gesture handling
- **expo-haptics** (~15.0.8) - Haptic feedback

### Other Features
- **expo-image** (~3.0.11) - Optimized image component
- **expo-splash-screen** (~31.0.13) - Splash screen management
- **expo-status-bar** (~3.0.9) - Status bar control

## 📱 App Flow & Structure

### Authentication Flow
```
(auth)/
├── login.tsx        - Email/password login
└── register.tsx     - User registration
```

Users start at the login screen. After logging in (or registering), they're directed to the main app.

### Main App Flow
```
(tabs)/
├── index.tsx (Dashboard)  - Home screen with stats and activity feed
└── groups.tsx             - List of study groups, create/join groups

leaderboard/
└── [id].tsx              - Dynamic route for group leaderboards
```

#### 1. **Dashboard** (index.tsx)
- Welcome message with user's name
- Study check-in button (opens group selector → check-in modal)
- Quick stats (current streak, weekly check-ins)
- Preview of user's groups (top 3)
- Recent activity feed from all groups

#### 2. **Groups** (groups.tsx)
- List of all user's study groups
- Create new group button (opens modal)
- Join group via code button (opens modal)
- Each group card shows:
  - Group name and member count
  - Group code for invites
  - Top 3 leaderboard preview

#### 3. **Leaderboard** (leaderboard/[id].tsx)
- View specific group's leaderboard
- Check-in button for that group
- Full member ranking list
- Podium visualization for top 3
- Highlights current user's rank

### Shared Components
```
components/
└── CheckInModal.tsx  - Modal for submitting study check-ins
```

The CheckInModal allows users to:
- Enter subject/topic studied
- Upload a photo (mock)
- Add optional notes
- Shows success animation on submission

## 🏃 Running the App Locally

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app installed on your phone (iOS/Android)
- Or iOS Simulator / Android Emulator on your computer

### Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Or use specific platform commands:
   ```bash
   npm run android   # Run on Android
   npm run ios       # Run on iOS
   npm run web       # Run on web browser
   ```

4. **Open on your device:**
   - Scan the QR code with the Expo Go app (Android)
   - Scan with Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

### Development Commands

```bash
npm start          # Start Expo development server
npm run android    # Launch on Android emulator/device
npm run ios        # Launch on iOS simulator/device
npm run web        # Launch in web browser
npm run lint       # Run ESLint
```

## 🎨 Design System

### Colors
- **Primary**: `#0ea5e9` (Sky Blue) - Main brand color
- **Primary Dark**: `#0284c7` - For gradients and hover states
- **Background**: `#eff6ff` to `#f0f9ff` - Light gradient
- **Text**: `#111827` (Gray 900) - Primary text
- **Text Secondary**: `#6b7280` (Gray 500) - Secondary text
- **Borders**: `#e5e7eb` (Gray 200) - Default borders

### Key Features
- **Gradients**: Used for buttons and backgrounds
- **Rounded Corners**: 12-16px border radius for cards
- **Shadows**: Subtle elevation for depth
- **Haptic Feedback**: Tactile responses on interactions

## 📊 Data Structure

### Mock Data (data/mockData.ts)
- **currentUser**: Logged-in user information
- **studyGroups**: Array of study groups with members
- **recentActivity**: Recent check-ins from all groups
- **currentStreak**: Days of consecutive check-ins

### Key Interfaces
```typescript
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface StudyGroup {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  topMembers: GroupMember[];
  allMembers: GroupMember[];
}

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  subject: string;
  duration: string;
  timestamp: Date;
  note?: string;
}
```

## 🔄 Routing

The app uses **Expo Router** for file-based routing:

- `/(auth)/login` - Login screen
- `/(auth)/register` - Registration screen
- `/(tabs)/` - Dashboard (home)
- `/(tabs)/groups` - Study groups list
- `/leaderboard/[id]` - Dynamic leaderboard for specific group

## 🚧 Future Enhancements

- Backend API integration (currently using mock data)
- Real-time updates with WebSockets
- Push notifications for group activity
- Photo upload functionality
- User profile customization
- Group chat feature
- Weekly/monthly statistics
- Achievement badges
- Dark mode support

## 📝 Notes

- This app currently uses **mock data** - no backend integration yet
- Authentication is simulated (no real validation)
- Photo upload is UI-only (no actual upload)
- All check-ins show success but don't persist

## 🛠️ Troubleshooting

### Common Issues

**Issue: "expo-linear-gradient not found"**
```bash
npm install expo-linear-gradient
```

**Issue: Metro bundler cache issues**
```bash
npm start -- --clear
```

**Issue: iOS/Android build errors**
```bash
cd android && ./gradlew clean && cd ..  # Android
cd ios && pod install && cd ..          # iOS
```

---

Built with ❤️ for students who grind together.
