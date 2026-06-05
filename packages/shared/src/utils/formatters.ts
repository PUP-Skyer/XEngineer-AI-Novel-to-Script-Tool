export const formatWordCount = (count: number): string => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

export const formatDuration = (minutes: number): string => {
  if (minutes >= 60) return `${Math.floor(minutes / 60)}小时${minutes % 60}分钟`;
  return `${minutes}分钟`;
};

export const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('zh-CN');
export const formatDateTime = (dateStr: string): string => new Date(dateStr).toLocaleString('zh-CN');

export const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
