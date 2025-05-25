# Connections Tracker Backend API

A Node.js/Express.js RESTful API for managing professional and personal connections, built with MongoDB and JWT authentication.

## 🚀 Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing support

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone the repository and navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend root directory:

   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   For production:

   ```bash
   npm start
   ```

5. **Health Check:**
   The server will be available at `http://localhost:4000`
   - Health endpoint: `http://localhost:4000/health`
   - API base URL: `http://localhost:4000/api`

## 🏗️ Database Models

### User Model

```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  isAdmin: Boolean (default: false)
}
```

### Connection Model

```javascript
{
  userId: String (required),
  name: String (required),
  email: String (optional),
  phone: String (optional),
  linkedinUserId: String (optional),
  githubUserId: String (optional),
  notes: String (optional)
}
```

### Company Model

```javascript
{
  userId: String (required),
  name: String (required),
  industry: String (optional),
  website: String (optional)
}
```

### Position Model

```javascript
{
  userId: String (required),
  connectionId: ObjectId (required, ref: Connection),
  companyId: ObjectId (required, ref: Company),
  title: String (required),
  startDate: Date (optional),
  endDate: Date (optional),
  current: Boolean (default: false),
  notes: String (optional)
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### First Time Setup

1. Check if users exist: `GET /api/users/exists`
2. Initialize first admin user: `POST /api/initialize`
3. Login to get JWT token: `POST /api/login`

## 📡 API Endpoints

### Authentication Routes (`/api`)

| Method | Endpoint        | Description                                        | Auth Required |
| ------ | --------------- | -------------------------------------------------- | ------------- |
| GET    | `/users/exists` | Check if any users exist in system                 | No            |
| POST   | `/initialize`   | Create first admin user (only when no users exist) | No            |
| POST   | `/register`     | Create new user (admin only)                       | Yes (Admin)   |
| POST   | `/login`        | User login                                         | No            |

### Connection Routes (`/api/connections`)

| Method | Endpoint                | Description                                 | Auth Required |
| ------ | ----------------------- | ------------------------------------------- | ------------- |
| GET    | `/`                     | Get all user's connections                  | Yes           |
| GET    | `/:id`                  | Get connection by ID with positions         | Yes           |
| POST   | `/`                     | Create new connection                       | Yes           |
| PUT    | `/:id`                  | Update connection                           | Yes           |
| DELETE | `/:id`                  | Delete connection and associated positions  | Yes           |
| GET    | `/bycompany/:companyId` | Get connections working at specific company | Yes           |

### Company Routes (`/api/companies`)

| Method | Endpoint                      | Description                               | Auth Required |
| ------ | ----------------------------- | ----------------------------------------- | ------------- |
| GET    | `/`                           | Get all user's companies                  | Yes           |
| GET    | `/:id`                        | Get company by ID with positions          | Yes           |
| POST   | `/`                           | Create new company                        | Yes           |
| PUT    | `/:id`                        | Update company                            | Yes           |
| DELETE | `/:id`                        | Delete company and associated positions   | Yes           |
| GET    | `/byconnection/:connectionId` | Get companies where connection has worked | Yes           |

### Position Routes (`/api/positions`)

| Method | Endpoint                    | Description                           | Auth Required |
| ------ | --------------------------- | ------------------------------------- | ------------- |
| GET    | `/`                         | Get all user's positions              | Yes           |
| GET    | `/:id`                      | Get position by ID                    | Yes           |
| POST   | `/`                         | Create new position                   | Yes           |
| PUT    | `/:id`                      | Update position                       | Yes           |
| DELETE | `/:id`                      | Delete position                       | Yes           |
| GET    | `/connection/:connectionId` | Get positions for specific connection | Yes           |
| GET    | `/company/:companyId`       | Get positions for specific company    | Yes           |

### Health Check

| Method | Endpoint  | Description          | Auth Required |
| ------ | --------- | -------------------- | ------------- |
| GET    | `/health` | Server health status | No            |

## 📝 API Request/Response Examples

### Create Connection

```bash
POST /api/connections
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "linkedinUserId": "johndoe",
  "githubUserId": "johndoe",
  "notes": "Met at tech conference"
}
```

### Create Company

```bash
POST /api/companies
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Tech Corp",
  "industry": "Technology",
  "website": "https://techcorp.com"
}
```

### Create Position

```bash
POST /api/positions
Content-Type: application/json
Authorization: Bearer <token>

{
  "connectionId": "507f1f77bcf86cd799439011",
  "companyId": "507f1f77bcf86cd799439012",
  "title": "Software Engineer",
  "startDate": "2023-01-15",
  "endDate": null,
  "current": true,
  "notes": "Full-stack development role"
}
```

## 🔒 Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **User Isolation**: All data is user-scoped via userId
- **Request Logging**: Comprehensive logging with sensitive data protection
- **Error Handling**: Secure error responses without data leakage

## 🚀 Deployment

### Environment Variables for Production

```env
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connections
JWT_SECRET=your_super_secure_jwt_secret
NODE_ENV=production
```

### Deployment Platforms

- **Recommended**: Render, Railway, or Heroku
- **Database**: MongoDB Atlas (free tier available)
- Ensure all environment variables are properly configured

## 🔧 Development Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run tests (placeholder)
```

## 📊 Logging

The API includes comprehensive logging:

- Request/response logging with timestamps
- Authentication events
- Database operations
- Error tracking
- Sensitive data is masked in logs

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Harikesh Kushwaha**

---

For frontend application, see the frontend README.md file.
