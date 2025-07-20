# LangSQL Client Libraries Documentation

## UI and Component Libraries

### 1. Tailwind CSS
- **Purpose**: Utility-first CSS framework for styling
- **Usage Locations**:
  - All component files under `src/components/`
  - Layout components (`src/components/layout/`)
  - Pages under `src/pages/`
- **Key Features Used**:
  - Dark mode utilities (`dark:` variants)
  - Flexbox and Grid utilities
  - Gradient backgrounds
  - Transitions and animations
  - Responsive design utilities

### 2. Framer Motion
- **Purpose**: Animation library for React
- **Usage Locations**:
  - Tutorial component (`src/components/onboarding/Tutorial.jsx`)
  - Modal animations
  - Page transitions
- **Key Features Used**:
  - `AnimatePresence` for exit animations
  - `motion` components for smooth transitions
  - Page transition effects
  - Modal animations

### 3. Lucide React
- **Purpose**: Modern icon library
- **Usage Locations**:
  - Navigation components
  - Buttons and interactive elements
  - Tutorial steps
  - Dashboard features
- **Common Icons Used**:
  - Database, Code2, MessageSquare (Feature icons)
  - Sun, Moon (Theme toggle)
  - ChevronRight, ChevronLeft (Navigation)
  - User, Settings (User interface)

## State Management

### 1. Redux Toolkit
- **Purpose**: State management solution
- **Location**: `src/redux/`
- **Key Features**:
  - Slices for different state domains:
    - `authSlice.js`: Authentication state
    - `onboardingSlice.js`: Tutorial progress
    - `themeSlice.js`: Theme preferences
    - `databaseSlice.js`: Database connections
  - Redux Persist integration for state persistence

### 2. Redux Persist
- **Purpose**: State persistence across page reloads
- **Location**: `src/redux/store.js`
- **Persisted States**:
  - Authentication
  - Theme preferences
  - Onboarding progress
  - Database connections

## Routing and Navigation

### React Router DOM
- **Purpose**: Client-side routing
- **Location**: `src/App.jsx`
- **Key Features Used**:
  - Protected routes
  - Route-based code splitting
  - Navigation guards
  - Location-based redirects

## Authentication

### Firebase Authentication
- **Purpose**: Social authentication provider
- **Location**: `src/Firebase/`
- **Features Used**:
  - Google authentication
  - GitHub authentication
  - JWT token management

## API Communication

### Axios
- **Purpose**: HTTP client for API requests
- **Location**: `src/services/axios.api.js`
- **Key Features**:
  - API interceptors
  - Request/response handling
  - Error handling
  - Authentication headers

## Development Tools

### Vite
- **Purpose**: Build tool and development server
- **Location**: Root configuration
- **Key Features**:
  - Fast refresh
  - Environment variables
  - Build optimization
  - Development server

## UI Components and Visualization

### Monaco Editor
- **Purpose**: Code editor for SQL queries
- **Location**: Query builder components
- **Features**:
  - Syntax highlighting
  - Code completion
  - Error highlighting

### Nivo/Recharts
- **Purpose**: Data visualization
- **Location**: Dashboard components
- **Chart Types**:
  - Bar charts
  - Line charts
  - Pie charts
  - Area charts

## Form Handling and Validation

### React Hook Form
- **Purpose**: Form management and validation
- **Location**: Authentication and database forms
- **Features**:
  - Form validation
  - Error handling
  - Form state management

## Notification System

### Toast Notifications
- **Purpose**: User feedback and notifications
- **Location**: `src/contexts/ToastContext.jsx`
- **Features**:
  - Success messages
  - Error notifications
  - Warning alerts
  - Info messages

## Email Integration

### EmailJS
- **Purpose**: Email services integration
- **Location**: `src/utils/emailjs.js`
- **Features**:
  - Welcome emails
  - Verification emails
  - Notification emails

## Best Practices and Conventions

### Code Organization
- Components follow atomic design principles
- Consistent file structure across the project
- Separation of concerns between UI and logic
- Reusable components and utilities

### Styling Conventions
- Consistent use of Tailwind utility classes
- Dark mode support across all components
- Responsive design patterns
- Accessible color schemes

### Performance Optimization
- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size
- Efficient state management

## Security Measures

### Authentication and Authorization
- Protected routes implementation
- JWT token management
- Secure cookie handling
- XSS prevention

### Environment Variables
- Secure configuration management
- API key protection
- Environment-specific settings 