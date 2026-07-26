# BiblioDrop Backend

This is the backend API for BiblioDrop, built with Node.js, Express, and MongoDB.

## Features
- **Role-based Access Control**: Supports `user`, `librarian`, and `admin` roles.
- **JWT Authentication**: Uses secure `httpOnly` cookies for managing sessions.
- **Strict Server-Side Validation**: Enforces business logic (e.g., reviews only on delivered books, librarians cannot self-publish pending books).
- **Stripe Integration**: Secure payment intents fetched directly from authoritative database values.
- **Mongoose Data Models**: `User`, `Book`, `Delivery`, `Review`, `Transaction`.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root of the `backend` directory based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_ORIGIN=http://localhost:3000
   ```

3. **Start the Server**:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Routes Summary

### Auth
- `POST /api/jwt` - Issue JWT and set as httpOnly cookie.
- `POST /api/logout` - Clear cookie.

### Users
- `POST /api/users` - Create user (upsert-safe).
- `GET /api/users` - Admin only, list users with search/pagination.
- `PATCH /api/users/role/:id` - Admin only, change role.
- `DELETE /api/users/:id` - Admin only, delete user.

### Books
- `POST /api/books` - Librarian only, create book (defaults to `pending_approval`).
- `GET /api/books` - Public, list published books (filterable, searchable, paginated).
- `GET /api/books/:id` - Public, get book details.
- `PATCH /api/books/:id` - Librarian (own) or Admin, update book.
- `PATCH /api/books/:id/publish` - Librarian (own), publish approved/unpublished book.
- `PATCH /api/books/:id/approve` - Admin only, approve pending book.
- `DELETE /api/books/:id` - Librarian (own) or Admin, delete book.
- `GET /api/books/librarian/:email` - Librarian, get own inventory.

### Deliveries
- `POST /api/deliveries` - User, create delivery (requires successful Stripe payment).
- `GET /api/deliveries/user/:email` - User, get own history.
- `GET /api/deliveries/librarian/:email` - Librarian, get incoming requests.
- `PATCH /api/deliveries/:id/status` - Librarian/Admin, advance status (`pending` -> `dispatched` -> `delivered`).

### Reviews
- `POST /api/reviews` - User, create review (requires `delivered` delivery record).
- `GET /api/reviews/book/:bookId` - Public, get reviews for a book.
- `GET /api/reviews/user/:email` - User, get own reviews.
- `PATCH /api/reviews/:id` - Owner/Admin, update review.
- `DELETE /api/reviews/:id` - Owner/Admin, delete review.

### Payments
- `POST /api/payments/create-payment-intent` - User, create Stripe payment intent.

### Stats
- `GET /api/stats/admin-stats` - Admin, get global stats.
- `GET /api/stats/librarian-stats/:email` - Librarian, get librarian stats.
- `GET /api/stats/user-stats/:email` - User, get user stats.
