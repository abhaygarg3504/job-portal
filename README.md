# Job Portal Application

A comprehensive full-stack job portal platform built with modern web technologies, featuring real-time messaging, analytics, blog system, and seamless user experiences for both job seekers and recruiters.

## 🚀 Features

### For Job Seekers
- **Advanced Job Search**: Filter jobs by title, location, and category
- **Application Management**: Track and manage job applications
- **Job Recommendations**: Personalized job suggestions based on profile
- **Saved Jobs**: Bookmark favorite job listings
- **User Analytics**: Track application statistics and insights
- **Blog System**: Read industry insights and company blogs
- **Profile Management**: Comprehensive user profiles with resume upload
- **Subscription Management**: Handle premium features

### For Recruiters
- **Company Dashboard**: Manage jobs, applications, and analytics
- **Job Posting**: Create and manage job listings with detailed requirements
- **Application Review**: View and manage job applications
- **Analytics Dashboard**: Track hiring metrics and performance
- **Blog Management**: Publish company blogs and updates
- **Interview Scheduling**: Calendar integration for interviews

### Core Features
- **Authentication**: Secure login/signup with Clerk authentication
- **Real-time Messaging**: Socket.io powered chat system
- **File Upload**: Cloudinary integration for resumes and images
- **Payment Integration**: Razorpay for subscription payments
- **Email Notifications**: SendGrid for automated emails
- **Resume Parsing**: Automated resume analysis and parsing
- **Heatmaps**: Activity tracking with calendar heatmaps

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI (MUI)** - Component library for consistent UI
- **Framer Motion** - Animation library for smooth transitions
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **React Quill** - Rich text editor for blogs
- **React Calendar** - Date picker and calendar components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Primary database for user and job data
- **PostgreSQL** - Secondary database for blogs and analytics
- **Prisma** - ORM for PostgreSQL
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### DevOps & Tools
- **Clerk** - Authentication and user management
- **Cloudinary** - Media storage and optimization
- **SendGrid** - Email service
- **Razorpay** - Payment gateway
- **ESLint** - Code linting
- **Nodemon** - Development auto-restart

## 🏗️ Architecture

### Database Schema
- **MongoDB Collections**:
  - Users: Job seekers profiles and data
  - Companies: Recruiter and company information
  - Jobs: Job listings and requirements
  - JobApplications: Application tracking
  - Messages: Chat messages
  - Contacts: Chat contacts and online status
  - Transactions: Payment records

- **PostgreSQL Tables** (via Prisma):
  - Blogs: Company and user blog posts
  - Comments: Blog comments and ratings
  - Activities: User activity tracking

### API Structure
- **RESTful APIs** for CRUD operations
- **WebSocket** connections for real-time features
- **Webhook** integration for Clerk authentication
- **Rate limiting** on sensitive endpoints
- **File upload** handling with Multer

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- PostgreSQL (local or cloud)
- Clerk account for authentication
- Cloudinary account for media storage
- SendGrid account for emails
- Razorpay account for payments

### Backend Setup
```bash
cd server
npm install
cp .env.example .env  # Configure environment variables
npm run build
npm start
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
DATABASE_URL=postgresql://user:password@localhost:5432/jobportal
DIRECT_URL=postgresql://user:password@localhost:5432/jobportal
CLERK_SECRET_KEY=your_clerk_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your_jwt_secret
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🚀 Usage

### Development
```bash
# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev
```

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

## 📡 API Endpoints

### Authentication
- `POST /webhooks` - Clerk webhook handler

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `POST /api/jobs` - Create new job (recruiter)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/apply/:jobId` - Apply for job

### Companies
- `POST /api/company/register` - Register company
- `GET /api/company/profile` - Get company profile
- `PUT /api/company/profile` - Update company profile

### Messages
- `GET /api/messages/:contactId` - Get chat messages
- `POST /api/messages` - Send message

### Analytics
- `GET /api/users/analytics` - User analytics
- `GET /api/company/analytics` - Company analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Test API endpoints thoroughly
- Maintain code documentation
- Use proper error handling

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk** for seamless authentication
- **Socket.io** for real-time communication
- **Prisma** for database management
- **Material-UI** for UI components
- **Chart.js** for data visualization

## 📞 Support

For support, email abhaygarg5684@gmail.com.

---

**Made with ❤️ by Abhay Garg**

*Showcase your full-stack development skills with this comprehensive job portal platform featuring modern technologies and best practices.*
