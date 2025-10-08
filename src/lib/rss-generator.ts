import { Post } from '@/types/index';

export interface RSSFeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  lastBuildDate?: Date;
  ttl?: number;
}

export function generateRSSFeed(posts: Post[], options: RSSFeedOptions): string {
  const {
    title,
    description,
    siteUrl,
    feedUrl,
    language = 'pt-BR',
    copyright = `Copyright ${new Date().getFullYear()} ${title}`,
    managingEditor = 'admin@nexusblog.com',
    webMaster = 'admin@nexusblog.com',
    lastBuildDate = new Date(),
    ttl = 60
  } = options;

  const rssItems = posts.map(post => {
    const postUrl = `${siteUrl}/posts/${post.id}`;
    const pubDate = new Date(post.created_at).toUTCString();
    const lastBuildDateStr = lastBuildDate.toUTCString();
    
    // Clean HTML content for description
    const cleanContent = post.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .substring(0, 500) // Limit to 500 characters
      .trim();

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${cleanContent}...]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${managingEditor} (${post.author})</author>
      <category><![CDATA[${post.tags?.join(', ') || 'Blog'}]]></category>
      ${post.reading_time ? `<readingTime>${post.reading_time}</readingTime>` : ''}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>${language}</language>
    <copyright><![CDATA[${copyright}]]></copyright>
    <managingEditor>${managingEditor}</managingEditor>
    <webMaster>${webMaster}</webMaster>
    <lastBuildDate>${lastBuildDateStr}</lastBuildDate>
    <ttl>${ttl}</ttl>
    <generator>Nexus Blog RSS Generator</generator>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title><![CDATA[${title}]]></title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`;
}

export function generateSitemap(posts: Post[], options: { siteUrl: string }): string {
  const { siteUrl } = options;
  const lastmod = new Date().toISOString();

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/posts', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' }
  ];

  const postPages = posts.map(post => ({
    url: `/posts/${post.id}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: new Date(post.updated_at || post.created_at).toISOString()
  }));

  const allPages = [...staticPages, ...postPages];

  const urlEntries = allPages.map(page => `
    <url>
      <loc>${siteUrl}${page.url}</loc>
      <lastmod>${page.lastmod || lastmod}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
}

export function generateRobotsTxt(options: { siteUrl: string; allowCrawling?: boolean }): string {
  const { siteUrl, allowCrawling = true } = options;

  if (!allowCrawling) {
    return `User-agent: *
Disallow: /`;
  }

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# RSS Feed
Sitemap: ${siteUrl}/rss.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/`;
}
