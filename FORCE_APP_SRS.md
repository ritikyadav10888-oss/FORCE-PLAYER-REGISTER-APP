# Software Requirements Specification (SRS) - Force App

## 1. Project Description
**Force** is a comprehensive sports tournament management application designed for both web and mobile platforms. It facilitates the interaction between sports enthusiasts (Players), event hosts (Organizers), and platform administrators (Owners). The app manages the entire lifecycle of a tournament, from registration and fee payment to live scoring and final payouts.

---

## 2. User Roles and Functional Requirements

### 2.1 Player Role
A user who participates in tournaments.
*   **Registration & Login**: Secure signup with personal details and Aadhar number for verification.
*   **Dashboard**: A personalized view showing recommended tournaments based on the player's favorite sports.
*   **Tournament Participation**: 
    *   Browse "All", "My Sport", and "Upcoming" tournaments.
    *   Join tournaments in Single, Double, or Team formats.
    *   Payment of entry fees using a digital wallet.
*   **Digital Wallet**: 
    *   View current balance and detailed transaction history.
    *   Securely top up wallet balance.
*   **Performance Tracking**: View global leaderboards and points based on match performance.
*   **Feedback System**: Rate and review organizers after tournament completion.

### 2.2 Organizer Role
A user who hosts and manages tournaments.
*   **Tournament Management**:
    *   Create tournaments with details: Name, Sport, Date, Time, Entry Fee, and Format.
    *   Manage tournament status: `PENDING` (Registration open), `ONGOING` (Matches started), `COMPLETED`.
    *   Generate match fixtures and update live scores.
*   **Player Verification**: Access to player lists and Aadhar verification details for participating athletes.
*   **Earnings & Financials**:
    *   Track total revenue generated.
    *   View platform fee deductions (5%).
    *   Track "Paid" vs "Pending" payouts from the platform owner.
*   **Profile**: Display average player ratings and professional credentials.

### 2.3 Owner (Administrator) Role
The platform administrator who oversees the ecosystem.
*   **Platform Overview**: High-level stats on total tournaments, active players, and registered organizers.
*   **User Moderation**: 
    *   Verify players based on uploaded documents.
    *   Block/Unblock users for policy violations.
*   **Organizer Administration**:
    *   Manually register and onboard new organizers.
    *   Manage organizer access expiry dates (subscription-based access).
*   **Financial Management**:
    *   Review total platform revenue and platform fees collected.
    *   Process net earnings payouts to organizers.
    *   Record payout transactions.

---

## 3. Product Features & Business Logic

### 3.1 Tournament Logic
*   **Formats**: 
    *   `SINGLE`: One-on-one matches.
    *   `DOUBLE`: Teams of two (requires partner name).
    *   `TEAM`: Teams of multiple players (requires team name and teammate list).
*   **Joining**: Players can only join if their wallet balance ≥ entry fee.

### 3.2 Payout System
*   **Revenue Generation**: 100% of entry fees collected.
*   **Platform Fee**: 5% of total revenue.
*   **Organizer Net**: 95% of total revenue.
*   **Pending Payout**: Net earnings minus any previously paid amounts.

---

## 4. Technical Architecture

### 4.1 Frontend Stack
*   **Framework**: React Native with Expo (Core).
*   **Navigation**: React Navigation (Native Stack).
*   **Icons**: Lucide-react-native.
*   **State**: React Context API (Auth, Tournaments).

### 4.2 Backend Stack
*   **Runtime**: Node.js.
*   **Framework**: Express.js.
*   **Database**: MongoDB (Atlas).
*   **ORM**: Mongoose.

### 4.3 Design System
*   **Theme**: Deep Navy (`#0A0E27`) and Surface Blue (`#1A1F3A`) aesthetics.
*   **Typography**: Bold headers with high-contrast text for visibility.
*   **Components**: Custom modern cards, buttons with haptic-simulated animations, and semantic badges.

---

## 5. Database Schema (Mongoose Models)

### 5.1 User Model
- `name`: String
- `email`: String (Unique, Lowercase)
- `password`: String (Hashed)
- `role`: Enum [PLAYER, ORGANIZER, OWNER]
- `walletBalance`: Number
- `points`: Number
- `isVerified`: Boolean
- `accessExpiryDate`: Date (Organizers)
- `totalPaidOut`: Number (Organizers)

### 5.2 Tournament Model
- `name`: String
- `gameType`: String
- `status`: Enum [PENDING, ONGOING, COMPLETED]
- `entryFee`: Number
- `type`: Enum [SINGLE, DOUBLE, TEAM]
- `players`: Array of user references + team data
- `matches`: Array of fixture/score data
