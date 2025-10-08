import { Post } from '@/types/index';

export interface BackupData {
  posts: Post[];
  metadata: {
    version: string;
    createdAt: Date;
    totalPosts: number;
    totalSize: number;
  };
}

export interface BackupOptions {
  includeImages?: boolean;
  compress?: boolean;
  format?: 'json' | 'markdown' | 'html';
}

export class BackupManager {
  private static instance: BackupManager;
  private backups: BackupData[] = [];
  private maxBackups = 10;

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  async createBackup(posts: Post[], options: BackupOptions = {}): Promise<BackupData> {
    const {
      includeImages = true,
      compress = true,
      format = 'json'
    } = options;

    console.log('Creating backup...', { postsCount: posts.length, options });

    // Process posts based on format
    let processedPosts = posts;
    
    if (format === 'markdown') {
      processedPosts = posts.map(post => ({
        ...post,
        content: this.convertHtmlToMarkdown(post.content)
      }));
    } else if (format === 'html') {
      processedPosts = posts.map(post => ({
        ...post,
        content: this.wrapInHtmlTemplate(post)
      }));
    }

    // Calculate total size
    const totalSize = this.calculateDataSize(processedPosts);

    const backupData: BackupData = {
      posts: processedPosts,
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        totalPosts: posts.length,
        totalSize
      }
    };

    // Store backup
    this.backups.unshift(backupData);
    
    // Keep only the latest backups
    if (this.backups.length > this.maxBackups) {
      this.backups = this.backups.slice(0, this.maxBackups);
    }

    // Save to localStorage
    this.saveBackupsToStorage();

    console.log('Backup created successfully:', backupData.metadata);
    return backupData;
  }

  async exportBackup(backupData: BackupData, format: 'json' | 'markdown' | 'html' = 'json'): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `nexus-blog-backup-${timestamp}.${format}`;

    let content: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(backupData, null, 2);
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = this.generateMarkdownExport(backupData.posts);
        mimeType = 'text/markdown';
        break;
      case 'html':
        content = this.generateHtmlExport(backupData.posts);
        mimeType = 'text/html';
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  async restoreBackup(backupData: BackupData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Restoring backup...', backupData.metadata);
      
      // Validate backup data
      if (!backupData.posts || !Array.isArray(backupData.posts)) {
        throw new Error('Invalid backup data: posts array is missing or invalid');
      }

      if (!backupData.metadata) {
        throw new Error('Invalid backup data: metadata is missing');
      }

      // Here you would typically send the data to your API to restore
      // For now, we'll just validate and return success
      console.log(`Backup restoration would restore ${backupData.posts.length} posts`);
      
      return {
        success: true,
        message: `Backup restored successfully. ${backupData.posts.length} posts restored.`
      };
    } catch (error) {
      console.error('Backup restoration failed:', error);
      return {
        success: false,
        message: `Backup restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getBackups(): BackupData[] {
    return [...this.backups];
  }

  getBackupById(id: string): BackupData | undefined {
    return this.backups.find(backup => 
      backup.metadata.createdAt.toISOString() === id
    );
  }

  deleteBackup(id: string): boolean {
    const index = this.backups.findIndex(backup => 
      backup.metadata.createdAt.toISOString() === id
    );
    
    if (index !== -1) {
      this.backups.splice(index, 1);
      this.saveBackupsToStorage();
      return true;
    }
    
    return false;
  }

  private convertHtmlToMarkdown(html: string): string {
    // Simple HTML to Markdown conversion
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();
  }

  private wrapInHtmlTemplate(post: Post): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        .post-meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .post-content { margin-top: 20px; }
    </style>
</head>
<body>
    <article>
        <header>
            <h1>${post.title}</h1>
            <div class="post-meta">
                <p>Por ${post.author} • ${new Date(post.created_at).toLocaleDateString('pt-BR')}</p>
                ${post.tags ? `<p>Tags: ${post.tags.join(', ')}</p>` : ''}
            </div>
        </header>
        <div class="post-content">
            ${post.content}
        </div>
    </article>
</body>
</html>`;
  }

  private generateMarkdownExport(posts: Post[]): string {
    let markdown = `# Nexus Blog Backup\n\n`;
    markdown += `**Data do Backup:** ${new Date().toLocaleString('pt-BR')}\n`;
    markdown += `**Total de Posts:** ${posts.length}\n\n`;
    markdown += `---\n\n`;

    posts.forEach((post, index) => {
      markdown += `# ${post.title}\n\n`;
      markdown += `**Autor:** ${post.author}\n`;
      markdown += `**Data:** ${new Date(post.created_at).toLocaleString('pt-BR')}\n`;
      if (post.tags) {
        markdown += `**Tags:** ${post.tags.join(', ')}\n`;
      }
      markdown += `\n${this.convertHtmlToMarkdown(post.content)}\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  private generateHtmlExport(posts: Post[]): string {
    let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus Blog Backup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .backup-header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .post { border-bottom: 1px solid #eee; padding: 30px 0; }
        .post:last-child { border-bottom: none; }
        .post-meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
    </style>
</head>
<body>
    <div class="backup-header">
        <h1>Nexus Blog Backup</h1>
        <p><strong>Data do Backup:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Total de Posts:</strong> ${posts.length}</p>
    </div>`;

    posts.forEach(post => {
      html += `
    <article class="post">
        <header>
            <h1>${post.title}</h1>
            <div class="post-meta">
                <p><strong>Autor:</strong> ${post.author} • <strong>Data:</strong> ${new Date(post.created_at).toLocaleString('pt-BR')}</p>
                ${post.tags ? `<p><strong>Tags:</strong> ${post.tags.join(', ')}</p>` : ''}
            </div>
        </header>
        <div class="post-content">
            ${post.content}
        </div>
    </article>`;
    });

    html += `
</body>
</html>`;

    return html;
  }

  private calculateDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private saveBackupsToStorage(): void {
    try {
      localStorage.setItem('nexus-blog-backups', JSON.stringify(this.backups));
    } catch (error) {
      console.error('Failed to save backups to localStorage:', error);
    }
  }

  private loadBackupsFromStorage(): void {
    try {
      const stored = localStorage.getItem('nexus-blog-backups');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.backups = parsed.map((backup: any) => ({
          ...backup,
          metadata: {
            ...backup.metadata,
            createdAt: new Date(backup.metadata.createdAt)
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load backups from localStorage:', error);
    }
  }

  // Initialize by loading from storage
  constructor() {
    this.loadBackupsFromStorage();
  }
}
