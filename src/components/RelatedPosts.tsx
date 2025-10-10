import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { api } from '@/services/api';
import { type Post } from '@/types';
import { formatDate, stripHtmlTags } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants';

interface RelatedPostsProps {
  currentPostId: string;
  currentPostTags?: string[];
  maxPosts?: number;
}

export default function RelatedPosts({ 
  currentPostId, 
  currentPostTags = [], 
  maxPosts = 3 
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        
        const response = await api.getPublicPosts(1, 50);
        
        if (response && response.data) {
          const allPosts = response.data;
          
          const filteredPosts = allPosts
            .filter(post => 
              post.id !== currentPostId && 
              post.is_public
            )
            .map(post => {
              let similarityScore = 0;
              if (currentPostTags.length > 0 && post.tags) {
                const commonTags = currentPostTags.filter(tag => 
                  post.tags?.includes(tag)
                );
                similarityScore = commonTags.length;
              }
              
              return { ...post, similarityScore };
            })
            .filter(post => post.similarityScore > 0)
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, maxPosts);
          
          setRelatedPosts(filteredPosts);
        }
      } catch (error) {
        console.error('Error fetching related posts:', error);
        setRelatedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentPostTags.length > 0) fetchRelatedPosts();
    else setLoading(false);
  }, [currentPostId, currentPostTags, maxPosts]);

  if (loading) {
    return (
      <Card className="p-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <h3 className="font-semibold text-white mb-4">Posts Relacionados</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <h3 className="font-semibold text-white mb-4">Posts Relacionados</h3>
        <div className="text-sm text-gray-300">
          <p>Nenhum post relacionado encontrado com as mesmas tags.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
      <h3 className="font-semibold text-white mb-4">Posts Relacionados</h3>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id} 
            to={ROUTES.POST_DETAIL(post.id)}
            className="block group"
          >
            <Card className="p-4 hover:shadow-xl transition-all duration-300 border border-slate-600/50 group-hover:border-cyan-400/50 bg-slate-700/30 group-hover:bg-slate-700/50">
              <CardContent className="p-0">
                <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h4>
                
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {stripHtmlTags(post.content)}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  
                  {post.author && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author.email}</span>
                    </div>
                  )}
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-slate-600/50 text-gray-300 border-slate-500/50"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-600/50 text-gray-300 border-slate-500/50">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Card>
  );
}