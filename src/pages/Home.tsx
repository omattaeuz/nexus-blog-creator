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
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              variant="secondary" 
              className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary-light text-primary border-primary/20"
            >
              🚀 Sua plataforma de blog profissional
            </Badge>

            <div className="h-[150px] md:h-[200px] flex items-center justify-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
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
            </div>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4">
              Transforme suas ideias em artigos que alcançam o mundo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-gradient-primary hover:bg-primary-hover shadow-glow text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300"
              >
                <Link to="/posts/new" className="flex items-center justify-center space-x-2">
                  <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Começar Agora</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Link to="/posts" className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Explorar Blogs</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-primary opacity-10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-surface/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Recursos Poderosos
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Tudo que você precisa para criar, gerenciar e compartilhar seu conteúdo de forma eficaz
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-glow transition-all duration-300 bg-gradient-surface border-border/50"
              >
                <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <Card className="bg-gradient-primary text-primary-foreground shadow-glow max-w-4xl mx-auto">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                {isAuthenticated ? `Bem-vindo de volta, ${user?.email?.split('@')[0]}!` : '🌟 Dê vida às suas ideias'}
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-4">
                {isAuthenticated 
                  ? 'Continue compartilhando suas histórias e ideias com o mundo.'
                  : 'Milhares de pessoas já estão publicando suas histórias, artigos e experiências. Agora é sua vez.'
                }
              </p>
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/posts/new" className="flex items-center justify-center">
                      <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Criar Novo Post
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/posts" className="flex items-center justify-center">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Ver Posts
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/register" className="flex items-center justify-center">
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Crie seu Blog Gratuitamente
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 transition-all duration-300 border-primary-foreground text-black hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link to="/login" className="flex items-center justify-center">
                      <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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