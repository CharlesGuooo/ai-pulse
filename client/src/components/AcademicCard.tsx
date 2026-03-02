/*
 * Design: Editorial Warmth
 * AcademicCard: Research paper/project card with category tag, links, and AI analysis
 */
import { ExternalLink, Github, FileText, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn, getCategoryIcon, formatDate } from '@/lib/utils';
import type { AcademicProject } from '@/hooks/useData';
import { useArchive } from '@/contexts/ArchiveContext';

interface AcademicCardProps {
  project: AcademicProject;
}

export default function AcademicCard({ project }: AcademicCardProps) {
  const { saveProject, removeProject, isProjectSaved } = useArchive();
  const saved = isProjectSaved(project.id);

  const handleToggleSave = () => {
    if (saved) {
      removeProject(project.id);
    } else {
      saveProject(project);
    }
  };

  const impactColors: Record<string, string> = {
    '高': 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    '中': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    '低': 'bg-secondary text-muted-foreground border-border',
  };

  return (
    <article className="group bg-card rounded-lg border border-border/50 card-hover overflow-hidden">
      {/* Category bar */}
      <div className="px-5 pt-4 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{getCategoryIcon(project.category)}</span>
          <span className="tag-pill">{project.category}</span>
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full border font-medium',
            impactColors[project.impact_level] || impactColors['低']
          )} style={{ fontFamily: 'var(--font-mono)' }}>
            {project.impact_level}影响力
          </span>
        </div>
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

      {/* Title */}
      <div className="px-5 pt-3 pb-2">
        <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-brand-orange transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {project.summary}
        </p>
      </div>

      {/* AI Analysis */}
      <div className="px-5 py-3">
        <div className="accent-line">
          <p className="text-sm text-foreground leading-relaxed">
            {project.ai_analysis}
          </p>
        </div>
      </div>

      {/* Footer: Links + Meta */}
      <div className="px-5 pb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {project.arxiv_url && (
            <a
              href={project.arxiv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              arXiv
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Code
            </a>
          )}
          {project.source_url && (
            <a
              href={project.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              来源
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          <span>via @{project.shared_by}</span>
          <span>{formatDate(project.published_at)}</span>
        </div>
      </div>
    </article>
  );
}
