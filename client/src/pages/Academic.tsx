/*
 * Design: Editorial Warmth - Academic Page
 * Grid of academic project cards with category filtering
 */
import { useState, useMemo } from 'react';
import { useAcademic } from '@/hooks/useData';
import AcademicCard from '@/components/AcademicCard';
import { cn, getCategoryIcon } from '@/lib/utils';
import { BookOpen, Search, Filter } from 'lucide-react';

const ACADEMIC_HERO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393655905/WLAVeVPYGCycWsT7vD3Ng4/academic-hero-mibwbAmywAmrd9g7s6jwdt.webp';

const ALL_CATEGORIES = [
  'LLM与NLP', '计算机视觉', '图像生成', '视频生成', '音频与语音',
  '3D视觉', '多模态学习', 'AI Agent', '具身智能', 'AI基础设施', 'AI for Science', '其他'
];

export default function Academic() {
  const { data, loading } = useAcademic();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter(proj => {
      const matchCategory = selectedCategory === 'all' || proj.category === selectedCategory;
      const matchSearch = !searchQuery ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchImpact = impactFilter === 'all' || proj.impact_level === impactFilter;
      return matchCategory && matchSearch && matchImpact;
    });
  }, [data, selectedCategory, searchQuery, impactFilter]);

  // Get unique categories from data
  const availableCategories = useMemo(() => {
    if (!data) return [];
    const cats = new Set(data.projects.map(p => p.category));
    return ALL_CATEGORIES.filter(c => cats.has(c));
  }, [data]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-lg border border-border/50 p-5">
                <div className="h-5 bg-secondary rounded-full w-20 mb-3" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary rounded w-full mb-4" />
                <div className="h-16 bg-secondary/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/30">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${ACADEMIC_HERO})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />

        <div className="container relative py-10 md:py-14">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-medium text-brand-orange uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
              Academic Frontier
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            学术前沿
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            发现最新的AI论文、开源项目和技术突破。由顶尖学术博主筛选推荐，Grok AI深度解读。
          </p>
          {data?.meta && (
            <p className="text-xs text-muted-foreground mt-3" style={{ fontFamily: 'var(--font-mono)' }}>
              共 {data.meta.total_projects} 个项目
            </p>
          )}
        </div>
      </section>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索论文或项目..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-colors"
              />
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">影响力:</span>
              {['all', '高', '中', '低'].map(level => (
                <button
                  key={level}
                  onClick={() => setImpactFilter(level)}
                  className={cn(
                    'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                    impactFilter === level
                      ? 'bg-brand-orange text-white'
                      : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {level === 'all' ? '全部' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                selectedCategory === 'all'
                  ? 'bg-brand-orange text-white'
                  : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
              )}
            >
              全部分类
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  selectedCategory === cat
                    ? 'bg-brand-orange text-white'
                    : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <AcademicCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">没有找到匹配的项目</p>
          </div>
        )}
      </div>
    </div>
  );
}
