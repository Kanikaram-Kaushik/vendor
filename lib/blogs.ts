export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  cover: string;
  publishedAt: string;
  tags: string[];
  content: string;
  contentHtml: string;
};

export type BlogPostMeta = Omit<BlogPost, "content" | "contentHtml">;

export async function getBlogPosts(): Promise<BlogPostMeta[]> {
  return [];
}

export async function getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
  return null;
}
