import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Posts from "@/pages/Posts";
import CreatePost from "@/pages/CreatePost";
import EditPost from "@/pages/EditPost";
import PostDetail from "@/pages/PostDetail";
import PublicPostDetail from "@/pages/PublicPostDetail";
import PublicPosts from "@/pages/PublicPosts";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EmailConfirmation from "@/pages/EmailConfirmation";
import TestAuth from "@/pages/TestAuth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/test-auth" element={<TestAuth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Public post views - accessible without login */}
              <Route path="/posts/public" element={<PublicPosts />} />
              <Route path="/posts/:id" element={<PublicPostDetail />} />
              
              {/* Protected routes */}
              <Route path="/posts" element={
                <ProtectedRoute>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/posts/new" element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              } />
              <Route path="/posts/:id/edit" element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
