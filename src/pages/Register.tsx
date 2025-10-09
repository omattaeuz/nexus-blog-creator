import RegisterForm from "@/components/RegisterForm";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, MessageCircle, Eye, TrendingUp, Heart } from "lucide-react";

const Register = () => {
  const stats = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      value: "2.4K",
      label: "Posts Publicados"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      value: "8.7K",
      label: "Comentários"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      value: "156K",
      label: "Visualizações"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: "+25%",
      label: "Crescimento Mensal"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <section className="p-8 w-full max-w-7xl bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex min-h-[600px]">
            {/* Left Column - Branding & Stats */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
              <div className="max-w-lg">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 mb-6 w-fit">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Junte-se à Comunidade
                </Badge>
                
                <h1 className="text-4xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                  Comece sua Jornada no{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Nexta
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Crie, compartilhe e conecte-se com uma comunidade global de criadores. 
                  Suas histórias merecem ser contadas e ouvidas em todo o mundo.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Feito com amor</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <span>2024 Nexta</span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-slate-400/80 to-transparent"></div>

            {/* Right Column - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
              <div className="w-full max-w-md">
                <RegisterForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
