# Software Gaze Portal - Modern Office Management System

A comprehensive, modern office portal built with React, featuring dynamic UI, role-based access control, and real-time data management.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Secure JWT-based authentication**
- **Role-based access control** (Admin/User)
- **Protected routes** with automatic redirects
- **Token expiration handling**
- **Modern login/signup forms** with validation

### 👨‍💼 Admin Dashboard
- **Employee Management**: View, search, and delete employees
- **Expense Management**: Add, view, and track office expenses
- **Analytics Dashboard**: Visual insights into spending patterns
- **Real-time notifications** for all actions
- **Responsive design** for all devices

### 👤 User Dashboard
- **Team Contacts**: Browse and search team members
- **Profile Management**: Update personal information
- **Activity Tracking**: View recent actions
- **Modern UI** with intuitive navigation

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Mobile-first approach** with collapsible navigation
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Modern component architecture**
- **Tailwind CSS** for styling

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS 4.0
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Authentication**: JWT with jwt-decode
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: Custom notification system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SoftwareGaze-Portal-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Backend API
The application is configured to connect to a backend API running on `http://localhost:8080`. Make sure your backend server is running before starting the frontend.

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📱 Responsive Design

The application is fully responsive and includes:
- **Desktop**: Full sidebar navigation with comprehensive dashboards
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Hamburger menu with slide-out navigation

## 🎯 Key Components

### Authentication System
- `AuthContext`: Global authentication state management
- `ProtectedRoute`: Route protection based on user roles
- `LoginPage` & `SignupPage`: Modern authentication forms

### Admin Features
- `EmployeeManagement`: Complete employee CRUD operations
- `ExpenseManagement`: Expense tracking with analytics
- `Analytics`: Data visualization and insights

### User Features
- `Contacts`: Team member directory with search
- `Profile`: Personal information management

### UI Components
- `Button`: Customizable button component with loading states
- `Input`: Form input with validation and error handling
- `Card`: Flexible card component for content organization
- `Modal`: Reusable modal for forms and confirmations
- `LoadingSpinner`: Loading indicators
- `Notification`: Toast notification system

## 🔒 Security Features

- **JWT Token Management**: Automatic token validation and refresh
- **Route Protection**: Role-based access to different sections
- **Input Validation**: Client-side form validation
- **Error Handling**: Comprehensive error handling and user feedback

## 📊 API Integration

The application integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Admin Endpoints
- `GET /api/admin/employees` - Get all employees
- `DELETE /api/admin/user/{id}` - Delete user
- `GET /api/admin/expenses` - Get all expenses
- `POST /api/admin/expenses` - Add new expense
- `GET /api/admin/expenses/monthly` - Get monthly totals
- `GET /api/admin/expenses/yearly` - Get yearly totals

### User Endpoints
- `GET /api/users` - Get all users (for contacts)

## 🎨 Design System

The application follows modern design principles:
- **Consistent color palette** with semantic colors
- **Typography hierarchy** for better readability
- **Spacing system** using Tailwind's spacing scale
- **Component-based architecture** for reusability
- **Accessibility considerations** with proper ARIA labels

## 🚀 Performance Optimizations

- **Code splitting** with React.lazy (ready for implementation)
- **Optimized bundle size** with Vite
- **Efficient re-renders** with proper state management
- **Lazy loading** for better initial load times

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/        # Layout components
│   ├── admin/        # Admin-specific components
│   └── user/         # User-specific components
├── contexts/          # React contexts
├── services/         # API services
├── pages/            # Page components
└── App.jsx           # Main app component
```

### Code Quality
- **ESLint** for code linting
- **Consistent naming conventions**
- **Component documentation**
- **Error boundary implementation** (ready for addition)

## 📱 Mobile Experience

The application provides an excellent mobile experience with:
- **Touch-friendly interface**
- **Optimized navigation**
- **Responsive tables** with horizontal scrolling
- **Mobile-specific layouts**

## 🎯 Future Enhancements

- **Real-time chat functionality**
- **File upload capabilities**
- **Advanced analytics with charts**
- **Email notifications**
- **Dark mode support**
- **PWA capabilities**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using React and modern web technologies**
