'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCandidateById } from '@/lib/config/candidates';

interface LeaderboardItem {
  rank: number;
  candidateId: string;
  candidateName: string;
  avatar?: string;
  voteCount: number;
}

interface LeaderboardData {
  season: string;
  seasonStatus: string;
  totalVotes: number;
  leaderboard: LeaderboardItem[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    // Create more stars for honor hall effect
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
      // Clear existing stars
      starsContainer.innerHTML = '';
      
      // Create 150 stars (more than landing page)
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        
        // Some stars are golden
        if (Math.random() > 0.7) {
          star.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, transparent 70%)';
        }
        
        starsContainer.appendChild(star);
      }
    }
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/one-pick/leaderboard');
      const result = await res.json();

      if (!result.success) {
        setError(result.error.message || '加载失败');
        return;
      }

      setData(result.data);
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 50%, #2a1a4e 100%)'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{
            borderColor: 'rgba(255, 215, 0, 0.3)',
            borderTopColor: 'transparent'
          }}></div>
          <p className="text-white/60 font-bold">Loading Hall of Fame...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="relative min-h-screen py-12 px-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 50%, #2a1a4e 100%)'
      }}>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center border-2 border-red-500/30">
            <p className="text-lg font-bold text-red-400">{error || '加载失败'}</p>
          </div>
        </div>
      </main>
    );
  }

  // Get top 3
  const topThree = data.leaderboard.slice(0, 3);
  const others = data.leaderboard.slice(3);

  return (
    <main className="relative min-h-screen py-12 px-4 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 50%, #2a1a4e 100%)'
    }}>
      {/* Enhanced Stars */}
      <div className="stars" />
      
      {/* Golden Glow Orbs */}
      <div 
        className="ambient-orb w-[600px] h-[600px] top-1/4 left-1/4"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
          animation: 'float-orb 25s ease-in-out infinite'
        }}
      />
      <div 
        className="ambient-orb w-[700px] h-[700px] bottom-1/4 right-1/4"
        style={{ 
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.12) 0%, transparent 70%)',
          animationDelay: '8s',
          animation: 'float-orb 30s ease-in-out infinite'
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-6xl font-black hover:scale-105 transition-transform" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF69B4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
            }}>
              Hall of Fame
            </h1>
          </Link>
          <div>
            <p className="text-white/80 font-medium text-lg mb-2">
              {data.season}
            </p>
            <p className="text-white/50 text-sm">
              总票数 {data.totalVotes}
            </p>
          </div>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            {/* 2nd Place */}
            {topThree[1] && (() => {
              const candidate = getCandidateById(topThree[1].candidateId);
              return candidate && (
                <div className="flex flex-col items-center pt-12">
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredRank(2)}
                    onMouseLeave={() => setHoveredRank(null)}
                  >
                    {/* Avatar */}
                    <div className="relative w-32 h-32 mx-auto mb-4 transition-transform duration-500 group-hover:scale-110">
                      {candidate.avatar ? (
                        <Image
                          src={candidate.avatar}
                          alt={candidate.name}
                          fill
                          className="rounded-full object-cover"
                          style={{
                            border: '4px solid #C0C0C0',
                            boxShadow: hoveredRank === 2 
                              ? `0 0 40px ${candidate.colors.primary}80` 
                              : '0 10px 30px rgba(192, 192, 192, 0.3)'
                          }}
                        />
                      ) : null}
                      {/* Rank Badge */}
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{
                        background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
                        boxShadow: '0 4px 12px rgba(192, 192, 192, 0.4)'
                      }}>
                        2
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{candidate.name}</h3>
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{topThree[1].voteCount}</div>
                      <div className="text-xs text-white/50">票</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 1st Place - Tallest */}
            {topThree[0] && (() => {
              const candidate = getCandidateById(topThree[0].candidateId);
              return candidate && (
                <div className="flex flex-col items-center">
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredRank(1)}
                    onMouseLeave={() => setHoveredRank(null)}
                  >
                    {/* Crown */}
                    <div className="text-5xl text-center mb-2 animate-float">👑</div>
                    
                    {/* Avatar */}
                    <div className="relative w-40 h-40 mx-auto mb-4 transition-transform duration-500 group-hover:scale-110">
                      {candidate.avatar ? (
                        <Image
                          src={candidate.avatar}
                          alt={candidate.name}
                          fill
                          className="rounded-full object-cover"
                          style={{
                            border: '5px solid #FFD700',
                            boxShadow: hoveredRank === 1 
                              ? `0 0 50px ${candidate.colors.primary}` 
                              : '0 15px 40px rgba(255, 215, 0, 0.5)'
                          }}
                        />
                      ) : null}
                      {/* Rank Badge */}
                      <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center font-black text-white" style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)'
                      }}>
                        1
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-center mb-2" style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {candidate.name}
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-black text-white">{topThree[0].voteCount}</div>
                      <div className="text-xs text-white/50">票</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3rd Place */}
            {topThree[2] && (() => {
              const candidate = getCandidateById(topThree[2].candidateId);
              return candidate && (
                <div className="flex flex-col items-center pt-20">
                  <div 
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredRank(3)}
                    onMouseLeave={() => setHoveredRank(null)}
                  >
                    {/* Avatar */}
                    <div className="relative w-28 h-28 mx-auto mb-4 transition-transform duration-500 group-hover:scale-110">
                      {candidate.avatar ? (
                        <Image
                          src={candidate.avatar}
                          alt={candidate.name}
                          fill
                          className="rounded-full object-cover"
                          style={{
                            border: '4px solid #CD7F32',
                            boxShadow: hoveredRank === 3 
                              ? `0 0 40px ${candidate.colors.primary}80` 
                              : '0 10px 30px rgba(205, 127, 50, 0.3)'
                          }}
                        />
                      ) : null}
                      {/* Rank Badge */}
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{
                        background: 'linear-gradient(135deg, #CD7F32 0%, #D4A574 100%)',
                        boxShadow: '0 4px 12px rgba(205, 127, 50, 0.4)'
                      }}>
                        3
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{candidate.name}</h3>
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{topThree[2].voteCount}</div>
                      <div className="text-xs text-white/50">票</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Others - Compact List */}
        {others.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-3">
            {others.map((item) => {
              const candidate = getCandidateById(item.candidateId);
              if (!candidate) return null;

              return (
                <div
                  key={item.candidateId}
                  className="group cursor-pointer transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '16px 24px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${candidate.colors.gradient}15`;
                    e.currentTarget.style.borderColor = `${candidate.colors.primary}40`;
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${candidate.colors.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white/60 font-bold text-lg" style={{
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      {item.rank}
                    </div>

                    {/* Avatar */}
                    {item.avatar && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.candidateName}
                          fill
                          className="rounded-full object-cover"
                          style={{ border: `2px solid ${candidate.colors.primary}40` }}
                        />
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                        {item.candidateName}
                      </h3>
                    </div>

                    {/* Votes */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black text-white">
                        {item.voteCount}
                      </div>
                      <div className="text-xs text-white/40">票</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State - Simplified */}
        {data.totalVotes === 0 && (
          <div className="text-center py-20">
            <Link href="/vote" className="neon-button inline-block">
              立即投票
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors underline decoration-1 underline-offset-4"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
