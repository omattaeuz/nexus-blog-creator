import { Comment } from '@/types/analytics';
import { notificationService } from './notifications';
import { ERROR_MESSAGES } from '@/lib/constants';

export interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: string;
  author: string;
  authorEmail: string;
}

export interface CommentService {
  getComments(postId: string): Promise<Comment[]>;
  createComment(data: CreateCommentData): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  likeComment(id: string): Promise<Comment>;
  moderateComment(id: string, approved: boolean): Promise<Comment>;
}

class RealCommentService implements CommentService {
  private comments: Comment[] = [];

  constructor() {
    this.loadComments();
    this.generateSampleComments();
  }

  private loadComments() {
    const saved = localStorage.getItem('nexus-comments');
    if (saved) {
      try {
        this.comments = JSON.parse(saved).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }));
      } catch (error) {
        console.error('Error loading comments:', error);
        this.comments = [];
      }
    }
  }

  private saveComments() {
    localStorage.setItem('nexus-comments', JSON.stringify(this.comments));
  }

  private generateSampleComments() {
    if (this.comments.length === 0) {
      const sampleComments: Comment[] = [
        {
          id: 'comment-1',
          postId: 'post-1',
          author: 'João Silva',
          authorEmail: 'joao@example.com',
          content: 'Excelente tutorial! Muito bem explicado e fácil de seguir. Obrigado por compartilhar!',
          replies: [
            {
              id: 'comment-2',
              postId: 'post-1',
              author: 'Maria Santos',
              authorEmail: 'maria@example.com',
              content: 'Concordo totalmente! O passo a passo ficou muito claro.',
              replies: [],
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              approved: true,
              likes: 2,
              isReply: true,
              parentId: 'comment-1'
            }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          approved: true,
          likes: 5,
          isReply: false
        },
        {
          id: 'comment-3',
          postId: 'post-1',
          author: 'Pedro Costa',
          authorEmail: 'pedro@example.com',
          content: 'Tenho uma dúvida sobre o passo 3. Poderia explicar melhor como funciona a integração com o TypeScript?',
          replies: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          approved: true,
          likes: 1,
          isReply: false
        },
        {
          id: 'comment-4',
          postId: 'post-2',
          author: 'Ana Oliveira',
          authorEmail: 'ana@example.com',
          content: 'Muito útil este guia! Já implementei no meu projeto e funcionou perfeitamente.',
          replies: [],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          approved: true,
          likes: 3,
          isReply: false
        }
      ];

      this.comments = sampleComments;
      this.saveComments();
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    const postComments = this.comments.filter(comment => 
      comment.postId === postId && !comment.isReply
    );
    
    return postComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      postId: data.postId,
      author: data.author,
      authorEmail: data.authorEmail,
      content: data.content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      approved: true,
      likes: 0,
      isReply: !!data.parentId,
      parentId: data.parentId
    };

    if (data.parentId) {
      const parentIndex = this.comments.findIndex(c => c.id === data.parentId);
      if (parentIndex !== -1) {
        this.comments[parentIndex].replies.push(newComment);
      }
    } else {
      this.comments.push(newComment);
    }

    this.saveComments();

    notificationService.createNotification({
      type: 'comment',
      title: 'Novo comentário em seu post',
      message: `${data.author} comentou em seu post`,
      userId: 'user-1',
      postId: data.postId,
      commentId: newComment.id
    });

    return newComment;
  }

  async updateComment(id: string, content: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === id);
    if (commentIndex === -1) throw new Error(ERROR_MESSAGES.NOT_FOUND);

    this.comments[commentIndex].content = content;
    this.comments[commentIndex].updatedAt = new Date();
    this.saveComments();

    return this.comments[commentIndex];
  }

  async deleteComment(id: string): Promise<void> {
    this.comments = this.comments.filter(c => c.id !== id);
    
    this.comments.forEach(comment => { comment.replies = comment.replies.filter(reply => reply.id !== id); });
    this.saveComments();
  }

  async likeComment(id: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === id);
    if (commentIndex === -1) throw new Error(ERROR_MESSAGES.NOT_FOUND);

    this.comments[commentIndex].likes += 1;
    this.saveComments();

    return this.comments[commentIndex];
  }

  async moderateComment(id: string, approved: boolean): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === id);
    if (commentIndex === -1) throw new Error(ERROR_MESSAGES.NOT_FOUND);

    this.comments[commentIndex].approved = approved;
    this.saveComments();

    return this.comments[commentIndex];
  }

  getCommentById(id: string): Comment | null {
    for (const comment of this.comments) {
      if (comment.id === id) return comment;

      const reply = comment.replies.find(r => r.id === id);

      if (reply) return reply;
    }
    return null;
  }

  getAllCommentsForPost(postId: string): Comment[] {
    return this.comments.filter(comment => comment.postId === postId);
  }

  getCommentCountForPost(postId: string): number {
    return this.comments.filter(comment => comment.postId === postId).length;
  }
}

export const commentService = new RealCommentService();

export type { CommentService as CommentServiceType, Comment };