import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, BookOpen, Users, Zap, Shield, Palette } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Rich Content Creation",
      description: "Create beautiful blog posts with a modern, intuitive interface",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "User Authentication",
      description: "Secure login system with user profiles and permissions",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Updates",
      description: "Instant updates and seamless user experience",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Data Security",
      description: "Built with Supabase for enterprise-grade security",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Modern Design",
      description: "Beautiful, responsive design that works on all devices",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge 
              variant="secondary" 
              className="mb-6 px-4 py-2 text-sm font-medium bg-primary-light text-primary border-primary/20"
            >
              🚀 Modern Blog Platform
            </Badge>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Onboarding Blog
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              A complete CRUD blog platform with modern design, user authentication, 
              and powerful content management features. Built with React, TypeScript, and Supabase.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow text-lg px-8 py-6 transition-all duration-300"
              >
                <Link to="/posts/new" className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Your First Post</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-lg px-8 py-6 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Link to="/posts" className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Explore Posts</span>
                </Link>
              </Button>
            </div>

            {/* Status Message */}
            <div className="bg-accent-light border border-accent/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-accent-foreground">
                <strong>Connect Supabase</strong> to enable user authentication, 
                persistent data storage, and advanced features!
              </p>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and share your content effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-glow transition-all duration-300 bg-gradient-surface border-border/50"
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary text-primary-foreground shadow-glow max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Start Blogging?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of writers sharing their stories and ideas with the world.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg px-8 py-6 transition-all duration-300"
              >
                <Link to="/posts/new">
                  Get Started Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;