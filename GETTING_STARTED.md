# Welfare System - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables (already configured):
   - `.env` file contains `DATABASE_URL` for SQLite database

3. Generate Prisma Client:
   ```bash
   npm run db:push
   ```

## Starting the Application

### Development Mode

```bash
npm run dev
```

The application will be available at: `http://localhost:4028`

### Production Build

```bash
npm run build
npm start
```

## Admin User Setup

After starting the application, you can access the admin panel to manage users. The default admin user can be created via the API:

### Option 1: Use API to create admin

Run this command after the app is running:

```bash
curl -X POST http://localhost:4028/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "idNumber": "00000000",
    "dateOfBirth": "1990-01-01",
    "ministry": "Ministry of ICT & Digital Economy",
    "stateDepartment": "State Dept. of ICT",
    "payrollNumber": "ADMIN/001",
    "phoneNumber": "0700000000",
    "email": "admin@memberreg.com",
    "agreedToTerms": true
  }'
```

Then approve the member:

```bash
curl -X POST http://localhost:4028/api/members/{member-id}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "system",
    "role": "ADMIN"
  }'
```

### Option 2: Access via existing credentials

Use these credentials to log in:

```
Email: admin@memberreg.com
Password: Admin123!
```

⚠️ **Important:** Change the default password immediately after first login!

## Database Management

### Reset Database

```bash
npm run db:reset
```

This will:

- Delete all data
- Re-run migrations
- Create fresh database

### Open Prisma Studio

```bash
npm run db:studio
```

This opens a visual database editor at: `http://localhost:5555`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking
- `npm run db:push` - Push schema changes to database
- `npm run db:reset` - Reset database
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

The application provides comprehensive REST API endpoints for:

- **Authentication** - Login, password change
- **Members** - CRUD, bulk upload, approval
- **Contributions** - Track, verify, manage payments
- **Welfare Cases** - Create cases, committee decisions, disbursements
- **Financial** - Transactions, budgets, reports
- **Notifications** - Send alerts, announcements
- **Users** - Role-based access control
- **Reports** - Analytics, defaulters, trends

See `API_DOCUMENTATION.md` for complete API documentation.

## Key Features

✅ Complete member registration wizard (7 steps)
✅ Role-based access control (Admin, Treasurer, Secretary, Member)
✅ Welfare case management with approval workflow
✅ Contribution tracking with arrears/penalties
✅ Financial reporting and analytics
✅ Bulk member upload support
✅ M-Pesa payment integration
✅ Responsive admin panel
✅ Member portal for self-service

## Default User Roles

- **ADMIN** - Full system access, user management
- **TREASURER** - Financial management, disbursements
- **SECRETARY** - Records, communications, reports
- **MEMBER** - View own data, contributions, welfare cases

## Browser Support

Works on all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Port Already in Use

If port 4028 is already in use:

1. Kill the process using the port:

   ```bash
   lsof -ti:4028 | xargs kill -9
   ```

2. Or change the port in `package.json`:
   ```json
   "scripts": {
     "dev": "next dev -p 3000"
   }
   ```

### Database Connection Issues

If you encounter database errors:

1. Check `.env` file exists and has correct `DATABASE_URL`
2. Run `npm run db:push` to sync schema
3. Check `dev.db` file permissions in project root
4. Reset database: `npm run db:reset`

### Module Not Found Errors

If you see module import errors:

```bash
rm -rf node_modules
npm install
```

## Production Deployment

For production deployment, you'll need to:

1. Switch database from SQLite to MySQL/PostgreSQL
2. Update `.env` with production database URL
3. Set `NODE_ENV=production`
4. Build and deploy to your hosting platform

## Security Notes

⚠️ For Development:

- Using SQLite database (file-based)
- Default passwords provided for testing
- No authentication middleware on API routes

⚠️ For Production:

- MUST change all default passwords
- Implement JWT/session authentication
- Use secure database (MySQL/PostgreSQL)
- Enable HTTPS
- Set up proper environment variables
- Implement rate limiting
- Add CSRF protection
