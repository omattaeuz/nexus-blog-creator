import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, MessageCircle, Heart } from 'lucide-react';
import CountUp from '@/components/ui/count-up';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix: string;
  percentage: number;
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Posts Ativos', value: 0, icon: <TrendingUp className="h-4 w-4" />, color: 'text-blue-500', suffix: '', percentage: 4 },
    { label: 'Usuários Online', value: 0, icon: <Users className="h-4 w-4" />, color: 'text-green-500', suffix: '', percentage: 1 },
    { label: 'Visualizações Hoje', value: 0, icon: <Eye className="h-4 w-4" />, color: 'text-purple-500', suffix: 'K', percentage: 5 },
    { label: 'Comentários', value: 0, icon: <MessageCircle className="h-4 w-4" />, color: 'text-orange-500', suffix: '', percentage: 5 },
    { label: 'Curtidas', value: 0, icon: <Heart className="h-4 w-4" />, color: 'text-red-500', suffix: 'K', percentage: 3 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.value + Math.floor(Math.random() * 3)
        }))
      );
    }, 2000);

    setStats(prevStats => 
      prevStats.map((stat, index) => ({
        ...stat,
        value: [1247, 89, 45, 234, 12][index]
      }))
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 ${stat.color} mb-2`}>
              {stat.icon}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {stat.value.toLocaleString()}{stat.suffix}
              </p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +<CountUp from={0} to={stat.percentage} duration={1.5} className="inline" />%
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}