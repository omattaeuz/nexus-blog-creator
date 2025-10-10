export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateData {
  name: string;
  content: string;
  category: string;
}

export interface UpdateTemplateData {
  name?: string;
  content?: string;
  category?: string;
}

export class TemplateService {
  static async create(templateData: CreateTemplateData): Promise<Template> {
    try {
      console.log('Creating template:', templateData);
      // TODO: Implement actual API call
      const newTemplate: Template = {
        id: Date.now().toString(),
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }
  }

  static async update(id: string, templateData: UpdateTemplateData): Promise<Template> {
    try {
      console.log('Updating template:', id, templateData);
      // TODO: Implement actual API call
      const updatedTemplate: Template = {
        id,
        name: templateData.name || '',
        content: templateData.content || '',
        category: templateData.category || '',
        updatedAt: new Date().toISOString(),
      };
      
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  static async delete(_id: string): Promise<void> {
    try {
      console.log('Deleting template:', _id);
      // TODO: Implement actual API call
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  static async getAll(): Promise<Template[]> {
    try {
      // TODO: Implement actual API call
      return [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  static async getById(_id: string): Promise<Template | null> {
    try {
      // TODO: Implement actual API call
      return null;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to fetch template');
    }
  }

  static navigateToCreatePost(template: Template): void {
    const templateData = encodeURIComponent(JSON.stringify({
      title: template.name,
      content: template.content,
      category: template.category
    }));
    
    window.location.href = `/posts/new?template=${templateData}`;
  }
}