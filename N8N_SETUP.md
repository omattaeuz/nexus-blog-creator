# N8n Workflow Setup Guide

This guide will help you set up the N8n workflow for the blog application.

## Prerequisites

1. An N8n instance (self-hosted or cloud)
2. A Supabase project
3. The provided N8n workflow JSON

## Step 1: Import the N8n Workflow

1. Open your N8n instance
2. Click on "Workflows" in the sidebar
3. Click "Import from file" or "Import from URL"
4. Copy and paste the provided workflow JSON
5. Save the workflow

## Step 2: Configure Supabase

The workflow is already configured to use the provided Supabase instance:
- **URL**: `https://yedzidjgfilitaqmjjpc.supabase.co`
- **Anon Key**: Already configured in the workflow

## Step 3: Get Your Webhook URL

1. In your N8n workflow, find the webhook nodes
2. Click on each webhook node to get its URL
3. The webhook URLs will look like: `https://your-n8n-instance.com/webhook/your-webhook-id`

## Step 4: Update Frontend Configuration

1. Open `src/config/n8n.ts`
2. Replace `https://your-n8n-instance.com/webhook` with your actual webhook URL
3. Save the file

## Step 5: Test the Integration

1. Start your frontend application: `npm run dev`
2. Register a new user
3. Create a blog post
4. Verify that the post appears in your Supabase database

## API Endpoints

The workflow provides the following endpoints:

### Authentication
- **POST** `/auth/v1/signup` - Register new user
- **POST** `/auth/v1/token` - Login user
- **GET** `/auth/v1/user` - Get current user

### Posts
- **POST** `/posts` - Create post (requires auth)
- **GET** `/posts` - List posts (with pagination and search)
- **GET** `/posts/:id` - Get single post
- **PATCH** `/posts/:id` - Update post (requires auth)
- **DELETE** `/posts/:id` - Delete post (requires auth)

### CORS
- **OPTIONS** `/posts` - CORS for posts endpoints
- **OPTIONS** `/posts/:id` - CORS for individual post endpoints

## Workflow Features

### Authentication Flow
1. User registers/logs in through Supabase Auth
2. Frontend sends requests with Bearer token
3. N8n validates token with Supabase
4. If valid, proceeds with database operations
5. If invalid, returns 401 Unauthorized

### Database Operations
- All database operations use Supabase service role key
- Posts are stored with user_id for ownership
- Pagination and search are supported
- CORS headers are properly configured

### Error Handling
- 401 for authentication errors
- 404 for not found
- Proper error messages in Portuguese
- CORS support for all endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the webhook URLs are correctly configured
2. **Authentication Errors**: Verify Supabase configuration
3. **Database Errors**: Check Supabase service role key
4. **Network Errors**: Verify N8n instance is accessible

### Debug Steps

1. Check N8n execution logs
2. Verify webhook URLs in browser network tab
3. Test endpoints with Postman or curl
4. Check Supabase logs for database errors

## Security Notes

- The Supabase service role key has full database access
- User authentication is handled by Supabase
- CORS is configured for the frontend domain
- All sensitive operations require authentication

## Support

If you encounter issues:
1. Check the N8n execution logs
2. Verify all configuration values
3. Test individual endpoints
4. Check browser console for errors
