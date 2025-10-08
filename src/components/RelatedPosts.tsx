import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { api, type Post } from '@/services/api';
import { formatDate, stripHtmlTags } from '@/lib/formatters';

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
        
        // Get all public posts using the public endpoint
        const response = await api.getPublicPosts(1, 50); // Get more posts to filter
        
        if (response && response.data) {
          const allPosts = response.data;
          
          // Filter out current post and find related posts
          const filteredPosts = allPosts
            .filter(post => 
              post.id !== currentPostId && 
              post.is_public && 
              !post.deleted_at
            )
            .map(post => {
              // Calculate similarity score based on tags
              let similarityScore = 0;
              if (currentPostTags.length > 0 && post.tags) {
                const commonTags = currentPostTags.filter(tag => 
                  post.tags?.includes(tag)
                );
                similarityScore = commonTags.length;
              }
              
              return { ...post, similarityScore };
            })
            .filter(post => post.similarityScore > 0) // Only posts with common tags
            .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity
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
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Posts Relacionados</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Posts Relacionados</h3>
        <div className="text-sm text-gray-600">
          <p>Nenhum post relacionado encontrado com as mesmas tags.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Posts Relacionados</h3>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id} 
            to={`/posts/${post.id}`}
            className="block group"
          >
            <Card className="p-4 hover:shadow-md transition-shadow border border-gray-200 group-hover:border-blue-300">
              <CardContent className="p-0">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h4>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {stripHtmlTags(post.content)}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
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
                        className="text-xs px-2 py-0.5"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
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