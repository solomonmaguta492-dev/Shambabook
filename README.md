# ShambaBook 🌱

ShambaBook is a responsive web app that helps small-scale Kenyan farmers keep digital records of their crops, expenses and harvests, see the profit from each crop, and plan their farm work with a 7-day weather forecast.

## Links

- **Live site:** https://shambabook.vercel.app
- **Figma wireframes:** https://www.figma.com/design/d7B7rgZw37eKr4JXMSwbbw
- **Project board:** PASTE_YOUR_PROJECT_BOARD_LINK_HERE

## The problem

Most small-scale farmers keep records in notebooks, or not at all. Notebooks get lost, and it's hard to work out whether a crop made money after paying for seed, fertiliser and labour. ShambaBook keeps these records safe in the cloud and does the maths for the farmer.

## Features

- **Authentication:** register, log in and log out with email and password, or sign in with Google
- **Protected routes:** farm pages are only available to logged-in users
- **Crops:** add, view, edit, filter and delete crops (name, variety, plot size, planting and harvest dates, status)
- **Expenses:** record seed, fertiliser, labour and other costs for each crop, with filters and totals
- **Harvests:** record quantity and price; income is calculated automatically
- **Profit:** each crop shows expenses, income and profit (green for profit, red for a loss)
- **Dashboard:** totals, net profit, most profitable crop, next harvest, today's weather and recent activity
- **Weather:** 7-day forecast and simple farming tips for the farmer's town
- **Profile:** update your name and set your farm location with a town search
- **User experience:** loading spinners, friendly error messages, empty states, toast notifications and form validation
- **Accessibility:** labelled inputs, keyboard-friendly modals, a skip link, visible focus styles and page titles
- **Responsive:** sidebar on desktop and bottom navigation on phones

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React (Vite), React Router |
| Styling | Tailwind CSS |
| State | Context API (AuthContext, FarmContext, ToastContext) and custom hooks |
| Authentication | Firebase Authentication (email/password and Google) |
| Database | Cloud Firestore (real-time updates) |
| External APIs | Open-Meteo Geocoding API and Forecast API |
| Testing | Vitest and React Testing Library |
| CI | GitHub Actions (lint, test with coverage, build) |
| Hosting | Vercel |
| Design and planning | Figma and GitHub Projects (Kanban) |

## Getting started

### Prerequisites
- Node.js 20 or newer
- A Firebase project with Authentication (Email/Password and Google) and Firestore enabled

### Installation

```bash
git clone https://github.com/solomonmaguta492-dev/Shambabook.git
cd Shambabook
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Firebase web app config:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` is listed in `.gitignore`, so secrets are never committed. On Vercel, the same variables are set under **Settings → Environment Variables**.

### Run the app

```bash
npm run dev
```

Then open http://localhost:5173

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm run lint` | Checks the code with ESLint |
| `npm test` | Runs the tests |
| `npm run coverage` | Runs the tests with a coverage report |

## Testing

Tests are written with Vitest and React Testing Library. Firebase and the weather API are mocked, so tests don't need the internet.

- **Coverage:** about 96% of lines and statements (requirement: 65%)
- CI fails if coverage drops below 65%

## Data model (Firestore)

Each farmer's data is stored under their own user ID:

```
users/{uid}                → profile (farm location)
users/{uid}/crops/{id}     → name, variety, plotSize, plantingDate, expectedHarvestDate, status
users/{uid}/expenses/{id}  → cropId, category, amount, date, note
users/{uid}/harvests/{id}  → cropId, quantity, unit, pricePerUnit, date
```

**Security rules** (`firestore.rules`) only allow a logged-in user to read and write their own documents.

## Project structure

```
src/
  components/   reusable UI (Button, Input, Modal, Spinner…) and feature components
  context/      AuthContext, FarmContext, ToastContext
  hooks/        useAuth, useFarm, useToast, useWeather, usePageTitle
  pages/        one file per page
  services/     Firebase, Firestore and weather API code
  utils/        validators, calculations, formatting, weather tips
  tests/        Vitest and React Testing Library tests
```

## Design

- **Wireframes:** designed in Figma before coding (mobile and desktop)
- **Colour scheme:** complementary colours. Green (`green-700`) for growth, income and main actions, and rose red (`rose-700`) for expenses, losses and delete actions, on neutral stone backgrounds.

## Development process

- Every feature was built on its own branch and merged through its own pull request
- Tasks were tracked on a GitHub Projects Kanban board (To Do, In Progress, In Review, Done)
- GitHub Actions checks lint, tests and build on every pull request
- Vercel deploys automatically when `main` changes

## Author

**Solomon Maguta**: [GitHub](https://github.com/solomonmaguta492-dev)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).