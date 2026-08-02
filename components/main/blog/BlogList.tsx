import Image from "next/image";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blogs";

type BlogListProps = {
  posts: BlogPostMeta[];
};

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group overflow-hidden rounded-3xl border border-foreground/10 bg-card/80 transition hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_45px_rgba(15,10,5,0.12)]"
        >
          <div className="relative h-64 w-full overflow-hidden">
            {post.cover ? (
              <Image
                src={post.cover}
                alt={post.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              {post.category} · {post.readTime}
            </p>
            <h3 className="text-2xl font-semibold">{post.title}</h3>
            <p className="text-sm text-muted">{post.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
