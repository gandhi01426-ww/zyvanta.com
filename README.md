# Zyvanta Luxe Launch

Production Vite + React storefront with Supabase data services, Vercel serverless APIs, and server-verified Razorpay Payments.

## Environment

Copy `.env.example` and configure the same values in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `ADMIN_EMAILS`

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create an Auth user for admin access.
4. Add the admin email to `ADMIN_EMAILS` in Vercel.
5. Add/edit products, reviews, homepage sections, and policies from `/admin`.

## Razorpay Setup

1. Create Razorpay live API keys.
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Vercel.
3. Use `/checkout` to test Pay Now. Orders are saved only after server-side signature and amount verification.
4. Cash on Delivery orders are saved directly through the secure order API.

## Vercel Deployment

1. Import the project into Vercel.
2. Set the environment variables above.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy. `vercel.json` handles SPA routing and cache headers.

## Local Development

Install dependencies, then run:

```bash
npm run dev
```

For API parity with production, use Vercel dev:

```bash
vercel dev
```
