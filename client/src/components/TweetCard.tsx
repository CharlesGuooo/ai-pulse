/*
 * Design: Editorial Warmth
 * TweetCard: Article-style card with orange accent line, AI analysis as main content
 */
import { ExternalLink, Bookmark, BookmarkCheck, Clock, TrendingUp } from 'lucide-react';
import { cn, formatDate, getEngagementColor } from '@/lib/utils';
import type { TweetData } from '@/hooks/useData';
import { useArchive } from '@/contexts/ArchiveContext';

interface TweetCardProps {
  tweet: TweetData;
  influencerName: string;
  influencerHandle: string;
  showInfluencer?: boolean;
  compact?: boolean;
}

export default function TweetCard({ tweet, influencerName, influencerHandle, showInfluencer = true, compact = false }: TweetCardProps) {
  const { saveTweet, removeTweet, isTweetSaved } = useArchive();
  const saved = isTweetSaved(tweet.id);

  const handleToggleSave = () => {
    if (saved) {
      removeTweet(tweet.id);
    } else {
      saveTweet(tweet, influencerName, influencerHandle);
    }
  };

  return (
    <article className={cn(
      'group bg-card rounded-lg border border-border/50 card-hover overflow-hidden',
      compact ? 'p-4' : 'p-5'
    )}>
      {/* Header: Author + Meta */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {showInfluencer && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {influencerName.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{influencerName}</span>
                <span className="text-xs text-muted-foreground ml-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                  @{influencerHandle}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-xs flex items-center gap-1', getEngagementColor(tweet.engagement))}>
            <TrendingUp className="w-3 h-3" />
            {tweet.engagement}
          </span>
          <button
            onClick={handleToggleSave}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              saved ? 'text-brand-orange bg-brand-orange/10' : 'text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/5'
            )}
            title={saved ? '取消收藏' : '收藏'}
          >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Summary */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {tweet.content_summary}
      </p>

      {/* AI Analysis - Main content with accent line */}
      <div className="accent-line mb-4">
        <p className="text-sm text-foreground leading-relaxed">
          {tweet.ai_analysis}
        </p>
      </div>

      {/* Tags + Footer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tweet.topics.map(topic => (
            <span key={topic} className="tag-pill">{topic}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {tweet.posted_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(tweet.posted_at)}
            </span>
          )}
          {tweet.tweet_url && (
            <a
              href={tweet.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-brand-orange transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              原推文
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
