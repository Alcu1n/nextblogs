import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import dynamic from 'next/dynamic';
import { ScrollProvider } from '@/components/Providers/ScrollProvider';
import RecentPosts from '@/components/RecentPosts';
import SectionContainer from '@/components/SectionContainer';
import TopTracks from '@/components/Spotify/TopTracks';
import { allCoreContent, sortedBlogPost } from '@/lib/utils/contentlayer';
import { allBlogs } from 'contentlayer/generated';
import { Suspense } from 'react';

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false });

export default function Page() {
  const sortedPosts = sortedBlogPost(allBlogs);
  const posts = allCoreContent(sortedPosts);

  return (
    <ScrollProvider>
      <Hero />
      <Intro />
      <ThreeScene />
      <SectionContainer>
        <RecentPosts posts={posts} />
        <Suspense fallback="loading..">
          <TopTracks />
        </Suspense>
      </SectionContainer>
    </ScrollProvider>
  );
}
