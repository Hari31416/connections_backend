# Connections Tracker - Backend API

A robust Node.js/Express REST API for managing professional and personal connections, companies, and employment positions. Features JWT authentication, MongoDB integration, and comprehensive logging.

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM (v8.15.0)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Cross-origin resource sharing enabled
- **Environment**: dotenv for configuration management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone and navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the backend root:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connections

   # JWT Secret (use a strong, random string in production)
   JWT_SECRET=your_super_secure_jwt_secret_key_here

   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL

- Development: `http://localhost:4000/api`
- Production: `https://your-backend-domain.com/api`

### Health Check

- **GET** `/health` - Check server status

### Authentication Endpoints

#### Check System Status

- **GET** `/api/users/exists`
- **Response**: `{ "hasUsers": boolean }`

#### Initialize First Admin User

- **POST** `/api/initialize`
- **Body**: `{ "email": "admin@example.com", "password": "password" }`
- **Note**: Only works when no users exist in the system

#### User Login

- **POST** `/api/login`
- **Body**: `{ "email": "user@example.com", "password": "password" }`
- **Response**: `{ "token": "jwt_token", "user": {...} }`

#### Register New User (Admin Only)

- **POST** `/api/register`
- **Headers**: `Authorization: Bearer <admin_jwt_token>`
- **Body**: `{ "email": "newuser@example.com", "password": "password" }`

### Connections Endpoints

#### Get All Connections

- **GET** `/api/connections`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Get Connection by ID

- **GET** `/api/connections/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Includes connection details and associated positions

#### Create New Connection

- **POST** `/api/connections`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedinUserId": "johndoe",
    "githubUserId": "johndoe",
    "notes": "Met at tech conference"
  }
  ```

#### Update Connection

- **PUT** `/api/connections/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: Same as create, with updated fields

#### Delete Connection

- **DELETE** `/api/connections/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Note**: Also deletes all associated positions

#### Get Connections by Company

- **GET** `/api/connections/bycompany/:companyId`
- **Headers**: `Authorization: Bearer <jwt_token>`

### Companies Endpoints

#### Get All Companies

- **GET** `/api/companies`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Get Company by ID

- **GET** `/api/companies/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Includes company details and associated positions

#### Create New Company

- **POST** `/api/companies`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**:
  ```json
  {
    "name": "Tech Corp Inc",
    "industry": "Technology",
    "website": "https://techcorp.com"
  }
  ```

#### Update Company

- **PUT** `/api/companies/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: Same as create, with updated fields

#### Delete Company

- **DELETE** `/api/companies/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Note**: Also deletes all associated positions

#### Get Companies by Connection

- **GET** `/api/companies/byconnection/:connectionId`
- **Headers**: `Authorization: Bearer <jwt_token>`

### Positions Endpoints

#### Get All Positions

- **GET** `/api/positions`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Get Position by ID

- **GET** `/api/positions/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Create New Position

- **POST** `/api/positions`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**:
  ```json
  {
    "connectionId": "connection_object_id",
    "companyId": "company_object_id",
    "title": "Software Engineer",
    "startDate": "2023-01-15",
    "endDate": "2024-01-15",
    "current": false,
    "notes": "Full-stack development role"
  }
  ```

#### Update Position

- **PUT** `/api/positions/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: Same as create, with updated fields

#### Delete Position

- **DELETE** `/api/positions/:id`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Get Positions by Connection

- **GET** `/api/positions/connection/:connectionId`
- **Headers**: `Authorization: Bearer <jwt_token>`

#### Get Positions by Company

- **GET** `/api/positions/company/:companyId`
- **Headers**: `Authorization: Bearer <jwt_token>`

## 🗄️ Database Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  password: String (required, hashed),
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Connection Model

```javascript
{
  _id: ObjectId,
  userId: String (required),
  name: String (required),
  email: String,
  phone: String,
  linkedinUserId: String,
  githubUserId: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Company Model

```javascript
{
  _id: ObjectId,
  userId: String (required),
  name: String (required),
  industry: String,
  website: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Position Model

```javascript
{
  _id: ObjectId,
  userId: String (required),
  connectionId: ObjectId (ref: 'Connection', required),
  companyId: ObjectId (ref: 'Company', required),
  title: String (required),
  startDate: Date,
  endDate: Date,
  current: Boolean (default: false),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **User Isolation**: All data is user-scoped via userId
- **Admin Controls**: User registration restricted to admin users
- **Request Logging**: Comprehensive logging with sensitive data protection
- **CORS Configuration**: Cross-origin request handling

## 📝 Scripts

```json
{
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## 🚀 Deployment

### Render Deployment (Recommended)

1. **Create Render Web Service**:

   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set environment to `Node`

2. **Environment Variables**:

   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_jwt_secret
   NODE_ENV=production
   PORT=4000
   ```

3. **MongoDB Atlas Setup**:
   - Create a MongoDB Atlas cluster
   - Add your Render service IP to IP whitelist (or use 0.0.0.0/0 for all IPs)
   - Create a database user with read/write permissions

### Alternative Deployment Options

- **Heroku**: Compatible with Heroku's Node.js buildpack
- **Railway**: Direct GitHub integration
- **Vercel**: Serverless functions (requires restructuring)
- **DigitalOcean App Platform**: Container-based deployment

## 🔧 Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and use in `src/index.js`
3. Follow existing authentication middleware pattern

### Database Migrations

- No formal migration system
- Use MongoDB Compass or Atlas UI for data management
- Consider implementing seeds for development data

### Logging

The application includes comprehensive request logging:

- All requests are logged with timestamp and IP
- Sensitive data (passwords, emails, etc.) is hidden in logs
- Error logging includes stack traces for debugging

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:

   - Verify MONGODB_URI in .env
   - Check Atlas IP whitelist
   - Ensure database user has correct permissions

2. **JWT Authentication Fails**:

   - Verify JWT_SECRET is set
   - Check token format in Authorization header
   - Ensure token hasn't expired

3. **CORS Issues**:

   - Configure CORS_ORIGIN for production
   - Verify frontend URL matches CORS settings

4. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:4000 | xargs kill -9`

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Harikesh Kushwaha**

---

For frontend documentation, see [Frontend README](https://github.com/Hari31416/connections_frontend/blob/main/README.md).
