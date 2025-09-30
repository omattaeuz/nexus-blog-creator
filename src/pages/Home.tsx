import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, BookOpen, Users, Zap, Shield, Palette, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import TypewriterText from "@/components/TypewriterText";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Escreva sem complicação",
      description: "Uma plataforma simples e rápida para você colocar suas ideias no ar.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Compartilhe com o mundo",
      description: "Seja lido por pessoas que buscam conteúdo relevante e autêntico.",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Seu espaço, sua voz",
      description: "Personalize seu perfil, publique histórias e construa sua comunidade.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Interação em tempo real",
      description: "Comentários e engajamento instantâneos para você se conectar com leitores.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Acesso em qualquer lugar",
      description: "Blog responsivo que funciona no celular, tablet ou computador.",
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
              ✍️ Escreva, compartilhe, inspire
            </Badge>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                <TypewriterText 
                  text="Escreva, compartilhe, inspire."
                  speed={50}
                  delay={500}
                  loop={true}
                  pauseTime={1500}
                  showCursor={true}
                  cursorChar="|"
                />
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Transforme suas ideias em artigos que alcançam o mundo.
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
                  <span>Começar Agora</span>
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
                  <span>Explorar Blogs</span>
                </Link>
              </Button>
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
              Recursos Poderosos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para criar, gerenciar e compartilhar seu conteúdo de forma eficaz
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
                {isAuthenticated ? `Bem-vindo de volta, ${user?.email?.split('@')[0]}!` : '🌟 Dê vida às suas ideias'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {isAuthenticated 
                  ? 'Continue compartilhando suas histórias e ideias com o mundo.'
                  : 'Milhares de pessoas já estão publicando suas histórias, artigos e experiências. Agora é sua vez.'
                }
              </p>
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="text-lg px-8 py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/posts/new">
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Criar Novo Post
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-lg px-8 py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/posts">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Ver Posts
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="text-lg px-8 py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/register">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Crie seu Blog Gratuitamente
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-lg px-8 py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/login">
                      <LogIn className="h-5 w-5 mr-2" />
                      Entrar
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;