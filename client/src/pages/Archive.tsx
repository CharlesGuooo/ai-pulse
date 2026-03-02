/*
 * Design: Editorial Warmth - Archive Page
 * User's saved tweets and academic projects
 */
import { useState } from 'react';
import { useArchive } from '@/contexts/ArchiveContext';
import TweetCard from '@/components/TweetCard';
import AcademicCard from '@/components/AcademicCard';
import { cn } from '@/lib/utils';
import { Bookmark, MessageSquare, BookOpen, Trash2 } from 'lucide-react';

const EMPTY_STATE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393655905/WLAVeVPYGCycWsT7vD3Ng4/empty-state-W8vfGrE3AdYRABBHff7LVE.webp';

type Tab = 'tweets' | 'projects';

export default function Archive() {
  const { archive } = useArchive();
  const [activeTab, setActiveTab] = useState<Tab>('tweets');

  const hasTweets = archive.tweets.length > 0;
  const hasProjects = archive.projects.length > 0;
  const isEmpty = !hasTweets && !hasProjects;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-4 h-4 text-brand-orange" />
          <span className="text-xs font-medium text-brand-orange uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
            Archive
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          我的收藏
        </h1>
        <p className="text-sm text-muted-foreground">
          收藏的推文和学术项目会永久保存在这里，即使主页数据更新也不会丢失。
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20">
          <img
            src={EMPTY_STATE}
            alt="Empty archive"
            className="w-48 h-36 object-contain mb-6 opacity-60"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            收藏夹为空
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            在浏览推文或学术项目时，点击收藏按钮即可将内容保存到这里。
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-border/40">
            <button
              onClick={() => setActiveTab('tweets')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === 'tweets'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              推文 ({archive.tweets.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === 'projects'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="w-4 h-4" />
              学术项目 ({archive.projects.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'tweets' && (
            hasTweets ? (
              <div className="grid gap-4 md:grid-cols-2">
                {archive.tweets.map(tweet => (
                  <TweetCard
                    key={tweet.id}
                    tweet={tweet}
                    influencerName={tweet.influencer_name}
                    influencerHandle={tweet.influencer_handle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">还没有收藏任何推文</p>
              </div>
            )
          )}

          {activeTab === 'projects' && (
            hasProjects ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {archive.projects.map(project => (
                  <AcademicCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">还没有收藏任何学术项目</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
