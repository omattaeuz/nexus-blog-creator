import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PlusCircle, 
  BookOpen, 
  Users, 
  Zap, 
  Shield, 
  LogIn, 
  UserPlus,
  ArrowRight,
  Star,
  TrendingUp,
  Globe,
  Code,
  Sparkles,
  Rocket,
  Heart,
  MessageCircle,
  Eye,
  Play,
  Pause,
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import AnimatedBackground from "@/components/AnimatedBackground";
import LiveStats from "@/components/LiveStats";
import GlobeDemo from "@/components/globe-demo";
import RotatingText from "@/components/ui/rotating-text";
import { useState, useEffect, useRef } from "react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Posts Publicados", value: 2.4, suffix: "K", icon: <BookOpen className="h-4 w-4" />, color: "text-blue-500" },
    { label: "Leitores Ativos", value: 15.2, suffix: "K", icon: <Users className="h-4 w-4" />, color: "text-green-500" },
    { label: "Comentários", value: 8.7, suffix: "K", icon: <MessageCircle className="h-4 w-4" />, color: "text-purple-500" },
    { label: "Visualizações", value: 156, suffix: "K", icon: <Eye className="h-4 w-4" />, color: "text-orange-500" },
  ];

  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Editor Inteligente",
      description: "Escreva com IA, formatação automática e sugestões em tempo real.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "95% mais rápido"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Performance Extrema",
      description: "Carregamento instantâneo com cache Redis e otimizações avançadas.",
      gradient: "from-purple-500 to-pink-500",
      stats: "3x mais rápido"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Design Moderno",
      description: "Interface elegante e responsiva que se adapta a qualquer dispositivo.",
      gradient: "from-green-500 to-emerald-500",
      stats: "100% responsivo"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Alcance Global",
      description: "Seu conteúdo disponível mundialmente com CDN e otimizações SEO.",
      gradient: "from-orange-500 to-red-500",
      stats: "99.9% uptime"
    },
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Tech Writer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      content: "A melhor plataforma para blog tech que já usei. Performance incrível!",
      rating: 5
    },
    {
      name: "Carlos Santos",
      role: "Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      content: "Interface moderna e recursos avançados. Recomendo para qualquer desenvolvedor.",
      rating: 5
    },
    {
      name: "Maria Costa",
      role: "Content Creator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      content: "Ferramentas de analytics e SEO que realmente fazem a diferença.",
      rating: 5
    }
  ];



  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(progressInterval);
  }, [isPlaying]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elements = document.querySelectorAll('.gradual-blur');
      
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        const isInView = rect.top < windowHeight && rect.bottom > 0;
        
        if (isInView) {
          const centerY = windowHeight / 2;
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - centerY);
          const maxDistance = windowHeight / 2;
          const blurAmount = Math.min(distance / maxDistance, 1);
          
          (element as HTMLElement).style.filter = `blur(${blurAmount * 3}px)`;
          (element as HTMLElement).style.opacity = `${1 - blurAmount * 0.3}`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScrollTop = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScrollTop);
    return () => window.removeEventListener('scroll', handleScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.02}px, ${(mousePosition.y - window.innerHeight / 2) * 0.02}px)`
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000 transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${(mousePosition.x - window.innerWidth / 2) * -0.02}px, ${(mousePosition.y - window.innerHeight / 2) * -0.02}px)`
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500 transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(calc(-50% + ${(mousePosition.x - window.innerWidth / 2) * 0.01}px), calc(-50% + ${(mousePosition.y - window.innerHeight / 2) * 0.01}px))`
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Plataforma de Blog do Futuro
                </Badge>
                
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="flex bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                  Escreva
                    <RotatingText
                      texts={["Futuro", "Mundo", "Ideias", "Conteúdo", "História"]}
                      mainClassName="ml-4 w-full max-w-[500px] px-2 sm:px-2 md:px-3 bg-white/10 backdrop-blur-sm overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg border border-white/20"
                      elementLevelClassName="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent"
                      staggerFrom="last"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.025}
                      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                      rotationInterval={2000}
                    />
                </span>
              </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  A plataforma mais avançada para criadores de conteúdo tech. 
                  Performance extrema, design moderno e ferramentas de IA integradas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card 
                    key={index} 
                    className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl group cursor-pointer"
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      transform: hoveredCard === index ? 'scale(1.05) rotateY(5deg)' : 'scale(1)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`p-2 rounded-lg bg-white/10 ${stat.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-200 group-hover:text-blue-400 transition-colors duration-300">
                            {stat.value}{stat.suffix}
                          </p>
                          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 border border-blue-500/50 hover:border-blue-400/70 px-8 py-6 text-lg font-semibold group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm click-spark"
                >
                  <Link to="/posts/new" className="flex items-center space-x-2 relative z-10">
                    <Rocket className="h-5 w-5 group-hover:animate-bounce text-white" />
                    <span className="shiny-text-gradient font-bold">Começar Agora</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/70 px-8 py-6 text-lg group transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm bg-purple-900/20 click-spark"
                >
                  <Link to="/posts" className="flex items-center space-x-2">
                    <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 text-purple-400" />
                    <span className="shiny-text font-medium">Ver Demo</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative group">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-8 hover:bg-slate-700/50 hover:border-slate-600/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-all duration-300">
                      Recursos em Destaque
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-all duration-300 hover:scale-110"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Progress value={progress} className="w-20 h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div 
                        className={`p-3 rounded-xl bg-gradient-to-r ${features[currentFeature].gradient} transition-all duration-500 hover:scale-110 hover:rotate-12`}
                      >
                        {features[currentFeature].icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300">
                          {features[currentFeature].title}
                        </h4>
                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                          {features[currentFeature].description}
                        </p>
                      </div>
                    </div>
                    
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                      <TrendingUp className="h-3 w-3 mr-1 group-hover:animate-pulse" />
                      {features[currentFeature].stats}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                          index === currentFeature 
                            ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mb-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Estatísticas em Tempo Real
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Nossa Comunidade <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Cresce</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Acompanhe o crescimento da nossa plataforma em tempo real
            </p>
          </div>
          
          <LiveStats />
        </div>
      </section>

      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 mb-4">
              <Code className="h-4 w-4 mr-2" />
              Tecnologia Avançada
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Recursos que Fazem a 
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Diferença</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ferramentas profissionais para criadores de conteúdo que buscam excelência e performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div 
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
                  >
                    {feature.icon}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 group-hover:bg-green-500/30 transition-all duration-300">
                    <TrendingUp className="h-3 w-3 mr-1 group-hover:animate-pulse" />
                    {feature.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 mb-4">
              <Heart className="h-4 w-4 mr-2" />
              Depoimentos
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              O que Nossos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Usuários</span> Dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-purple-400 transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:animate-pulse transition-all duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>

                  <p className="text-slate-300 leading-relaxed italic group-hover:text-slate-100 transition-colors duration-300">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <GlobeDemo />

      <section className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl max-w-5xl mx-auto overflow-hidden">
            <CardContent className="p-12 lg:p-16 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div 
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                ></div>
              </div>

              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                    <Rocket className="h-4 w-4 mr-2" />
                    {isAuthenticated ? 'Continue sua jornada' : 'Junte-se à revolução'}
                  </Badge>
                  
                  <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                    {isAuthenticated 
                      ? `Bem-vindo de volta, ${user?.email?.split('@')[0]}!`
                      : 'Pronto para Transformar suas Ideias?'
                    }
                  </h2>
                  
                  <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                    {isAuthenticated 
                      ? 'Continue compartilhando suas histórias e inspirando o mundo com seu conhecimento.'
                      : 'Milhares de criadores já estão usando nossa plataforma para alcançar audiências globais. Sua vez chegou.'
                    }
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {isAuthenticated ? (
                    <>
                      <Button
                        size="lg"
                        asChild
                        className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-100 border border-slate-500/50 hover:border-slate-400/70 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm"
                      >
                        <Link to="/posts/new" className="flex items-center space-x-2">
                          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300 text-cyan-400" />
                          <span className="shiny-text font-bold">Criar Novo Post</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 text-cyan-400" />
                        </Link>
                      </Button>
                      
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-slate-400/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-300/70 px-8 py-6 text-lg font-semibold group hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                      >
                        <Link to="/posts" className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 text-emerald-400" />
                          <span className="shiny-text font-medium">Ver Meus Posts</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        asChild
                        className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-100 border border-slate-500/50 hover:border-slate-400/70 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm"
                      >
                        <Link to="/register" className="flex items-center space-x-2">
                          <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 text-purple-400" />
                          <span className="shiny-text font-bold">Criar Conta Gratuita</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 text-purple-400" />
                        </Link>
                      </Button>
                      
                      <Button
                        size="lg"
                        asChild
                        className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-100 border border-slate-500/50 hover:border-slate-400/70 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 backdrop-blur-sm"
                      >
                        <Link to="/login" className="flex items-center space-x-2">
                          <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 text-purple-400" />
                          <span className="shiny-text font-bold">Fazer Login</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-white/20">
                  <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 group cursor-pointer">
                    <Shield className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">100% Seguro</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 group cursor-pointer">
                    <Zap className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">Setup em 2 minutos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 group cursor-pointer">
                    <Globe className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">Disponível globalmente</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Scroll Float Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          size="icon"
        >
          <ArrowRight className="h-6 w-6 text-white group-hover:animate-bounce rotate-[-90deg]" />
          <span className="sr-only">Voltar ao topo</span>
        </Button>
      )}
    </div>
  );
};

export default Home;