/*
 * Design: Editorial Warmth - Voices Page
 * Magazine-style layout: Left main content (wide), right sidebar (narrow)
 * Category filtering, influencer list with tweet cards
 */
import { useState, useMemo } from 'react';
import { useTweets } from '@/hooks/useData';
import TweetCard from '@/components/TweetCard';
import { cn } from '@/lib/utils';
import { Search, Users, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function Voices() {
  const { data, loading } = useTweets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInfluencer, setExpandedInfluencer] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.categories).map(([key, cat]) => ({
      key,
      ...cat,
    }));
  }, [data]);

  const filteredInfluencers = useMemo(() => {
    if (!data) return [];
    return Object.values(data.influencers).filter(inf => {
      const matchCategory = selectedCategory === 'all' || inf.category === selectedCategory;
      const matchSearch = !searchQuery ||
        inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof filteredInfluencers> = {};
    filteredInfluencers.forEach(inf => {
      const cat = inf.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(inf);
    });
    return groups;
  }, [filteredInfluencers]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-lg border border-border/50 p-5">
                <div className="h-4 bg-secondary rounded w-1/3 mb-3" />
                <div className="h-3 bg-secondary rounded w-full mb-2" />
                <div className="h-16 bg-secondary/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-brand-orange" />
          <span className="text-xs font-medium text-brand-orange uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
            Top Voices
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          AI大V动态
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          追踪AI领域最具影响力的声音，从四大实验室到独立研究者，每一条动态都经过Grok AI深度解读。
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索人物..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              selectedCategory === 'all'
                ? 'bg-brand-orange text-white'
                : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-brand-orange/40'
            )}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                selectedCategory === cat.key
                  ? 'bg-brand-orange text-white'
                  : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-brand-orange/40'
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {Object.entries(groupedByCategory).map(([catKey, influencers]) => {
        const category = data?.categories[catKey];
        return (
          <section key={catKey} className="mb-10">
            <div className="flex items-center gap-2 mb-5 pb-2 border-b border-border/40">
              <span className="text-lg">{category?.icon}</span>
              <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                {category?.name}
              </h2>
              <span className="text-xs text-muted-foreground ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
                {category?.group}
              </span>
            </div>

            <div className="space-y-4">
              {influencers.map(inf => {
                const isExpanded = expandedInfluencer === inf.handle;
                const displayTweets = isExpanded ? inf.tweets : inf.tweets.slice(0, 1);

                return (
                  <div key={inf.handle} className="bg-card/50 rounded-xl border border-border/30 overflow-hidden">
                    {/* Influencer Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: category?.color || '#E8734A', fontFamily: 'var(--font-display)' }}
                        >
                          {inf.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{inf.name}</span>
                            {inf.highlight && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                                HIGHLIGHT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://x.com/${inf.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              @{inf.handle}
                            </a>
                            <span className="text-xs text-muted-foreground">{inf.role}</span>
                          </div>
                        </div>
                      </div>

                      {inf.tweets.length > 1 && (
                        <button
                          onClick={() => setExpandedInfluencer(isExpanded ? null : inf.handle)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                        >
                          {isExpanded ? '收起' : `展开 ${inf.tweets.length} 条`}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Person Summary */}
                    {inf.person_summary && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-muted-foreground italic leading-relaxed pl-4 border-l-2 border-brand-orange/30">
                          {inf.person_summary}
                        </p>
                      </div>
                    )}

                    {/* Tweets */}
                    {displayTweets.length > 0 && (
                      <div className="px-4 pb-4 space-y-3">
                        {displayTweets.map(tweet => (
                          <TweetCard
                            key={tweet.id}
                            tweet={tweet}
                            influencerName={inf.name}
                            influencerHandle={inf.handle}
                            showInfluencer={false}
                            compact
                          />
                        ))}
                      </div>
                    )}

                    {inf.tweets.length === 0 && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-muted-foreground italic">暂无最新推文数据</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">没有找到匹配的结果</p>
        </div>
      )}
    </div>
  );
}
