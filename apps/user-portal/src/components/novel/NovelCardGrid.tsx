import type { NovelListItem } from '@asg/shared';
import NovelCard from './NovelCard';
import { BookOpen } from 'lucide-react';

interface NovelCardGridProps {
  novels: NovelListItem[];
  loading?: boolean;
  onEdit?: (novel: NovelListItem) => void;
  onDelete?: (id: number) => void;
  onArchive?: (id: number) => void;
}

export default function NovelCardGrid({ novels, loading, onEdit, onDelete, onArchive }: NovelCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-white/5 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-bg-tertiary" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-bg-tertiary rounded w-3/4" />
              <div className="h-4 bg-bg-tertiary rounded w-full" />
              <div className="h-4 bg-bg-tertiary rounded w-2/3" />
              <div className="flex gap-2">
                <div className="h-5 bg-bg-tertiary rounded-full w-16" />
                <div className="h-5 bg-bg-tertiary rounded-full w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <BookOpen className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">暂无小说</p>
        <p className="text-sm mt-1">去创建一本属于你的 AI 小说吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {novels.map((novel, index) => (
        <NovelCard 
          key={novel.id} 
          novel={novel} 
          index={index} 
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
