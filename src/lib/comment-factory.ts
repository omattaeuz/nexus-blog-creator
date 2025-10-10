import type { Comment } from '@/types/analytics';

export interface CreateCommentParams {
  postId: string;
  content: string;
  author: string;
  authorEmail: string;
  parentId?: string;
}

export class CommentFactory {
  static createComment(params: CreateCommentParams): Comment {
    const { postId, content, author, authorEmail, parentId } = params;
    
    return {
      id: this.generateId(),
      postId,
      author,
      authorEmail,
      content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      approved: true,
      likes: 0,
      isReply: !!parentId,
      parentId
    };
  }

  static createReply(params: CreateCommentParams & { parentCommentId: string }): Comment {
    return this.createComment({
      ...params,
      parentId: params.parentCommentId
    });
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}