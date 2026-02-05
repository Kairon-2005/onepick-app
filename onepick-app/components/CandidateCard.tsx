'use client';

import { Candidate } from '@/lib/config/candidates';
import Image from 'next/image';

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
}

export default function CandidateCard({ 
  candidate, 
  selected, 
  onSelect 
}: CandidateCardProps) {
  // 将 hex 颜色转换为 rgba 以便添加透明度
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <button
      onClick={onSelect}
      className="w-full text-left transition-all duration-500 relative group"
      style={{
        background: selected 
          ? candidate.colors.gradient 
          : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `2px solid ${selected ? candidate.colors.primary : 'rgba(255, 255, 255, 0.8)'}`,
        borderRadius: '24px',
        padding: '20px',
        boxShadow: selected 
          ? `0 8px 32px ${hexToRgba(candidate.colors.primary, 0.3)}` 
          : '0 4px 20px rgba(162, 89, 255, 0.08)',
      }}
    >
      {/* 应援色光晕效果 */}
      {!selected && (
        <div 
          className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: candidate.colors.gradient,
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}

      <div className="flex items-center gap-4 relative z-10">
        {/* 头像 */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {candidate.avatar ? (
            <Image
              src={candidate.avatar}
              alt={candidate.name}
              fill
              className="rounded-2xl object-cover"
              style={{
                border: `2px solid ${selected ? 'white' : candidate.colors.primary}`
              }}
            />
          ) : (
            <div 
              className="w-full h-full rounded-2xl flex items-center justify-center"
              style={{
                background: candidate.colors.gradient,
                border: '2px solid white'
              }}
            >
              <span className="text-2xl font-black text-white">
                {candidate.name[0]}
              </span>
            </div>
          )}
        </div>

        {/* 姓名 */}
        <div className="flex-1">
          <h3 
            className="text-2xl font-bold transition-colors"
            style={{ 
              color: selected ? 'white' : '#1a1a2e',
              textShadow: selected ? `0 2px 8px ${hexToRgba(candidate.colors.primary, 0.5)}` : 'none'
            }}
          >
            {candidate.name}
          </h3>
        </div>

        {/* 选中指示器 */}
        <div className="flex-shrink-0">
          <div 
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
            style={{
              borderColor: selected ? 'white' : candidate.colors.primary,
              background: selected ? 'white' : 'transparent'
            }}
          >
            {selected && (
              <div 
                className="w-3 h-3 rounded-full"
                style={{ background: candidate.colors.primary }}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
