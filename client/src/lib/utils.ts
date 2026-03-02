import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Handle Chinese date formats like "2026年3月1日" or mixed formats
  const chineseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (chineseMatch) {
    const [, y, m, d] = chineseMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return `${m}月${d}日`;
  }
  // Handle "今天" or strings containing today
  if (dateStr.includes('今天') || dateStr.includes('刚刚')) return '今天';
  if (dateStr.includes('昨天')) return '昨天';
  // Try standard date parsing
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getEngagementColor(level: string): string {
  switch (level) {
    case '高': return 'text-brand-orange';
    case '中': return 'text-yellow-600';
    case '低': return 'text-muted-foreground';
    default: return 'text-muted-foreground';
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'LLM与NLP': '💬',
    '计算机视觉': '👁️',
    '图像生成': '🎨',
    '视频生成': '🎬',
    '音频与语音': '🎵',
    '3D视觉': '🧊',
    '多模态学习': '🔗',
    'AI Agent': '🤖',
    '具身智能': '🦾',
    'AI基础设施': '⚙️',
    'AI for Science': '🔬',
    '其他': '📌',
  };
  return icons[category] || '📌';
}
