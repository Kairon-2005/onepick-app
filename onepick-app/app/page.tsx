'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create soft stars
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
      for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${3 + Math.random() * 4}s`;
        starsContainer.appendChild(star);
      }
    }
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pearl Aurora Background */}
      <div className="cosmic-bg" />
      
      {/* Soft Stars */}
      <div className="stars" />
      
      {/* ONE-PICK Background Text */}
      <div className="onepick-bg">ONE-PICK</div>
      
      {/* Ambient Orbs */}
      <div 
        className="ambient-orb w-[500px] h-[500px] top-1/4 left-1/4"
        style={{ background: 'radial-gradient(circle, rgba(255, 182, 217, 0.4) 0%, transparent 70%)' }}
      />
      <div 
        className="ambient-orb w-[600px] h-[600px] bottom-1/4 right-1/4"
        style={{ 
          background: 'radial-gradient(circle, rgba(162, 89, 255, 0.3) 0%, transparent 70%)',
          animationDelay: '5s'
        }}
      />
      <div 
        className="ambient-orb w-[400px] h-[400px] top-1/2 right-1/3"
        style={{ 
          background: 'radial-gradient(circle, rgba(180, 210, 255, 0.35) 0%, transparent 70%)',
          animationDelay: '10s'
        }}
      />
      
      {/* Content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-1000 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Main Title */}
        <div className="mb-20 animate-float">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block glow-text mb-2">
              Every Star
            </span>
            <span className="block glow-text">
              Needs a Witness
            </span>
          </h1>
          
          <p className="text-3xl md:text-4xl font-light mb-4" style={{ 
            background: 'linear-gradient(135deg, #A259FF 0%, #FF6B9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            This is yours.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Vote Card */}
          <Link href="/vote">
            <div className="glass-card p-12 cursor-pointer group">
              <div className="text-6xl mb-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                ✨
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                开始投票
              </h3>
              <p className="text-gray-500 text-base font-medium">
                选择你的 One-Pick
              </p>
            </div>
          </Link>

          {/* Leaderboard Card */}
          <Link href="/leaderboard">
            <div className="glass-card p-12 cursor-pointer group">
              <div className="text-6xl mb-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                🏆
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{
                background: 'linear-gradient(135deg, #A259FF 0%, #4ECDC4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                查看榜单
              </h3>
              <p className="text-gray-500 text-base font-medium">
                实时排名
              </p>
            </div>
          </Link>
        </div>

        {/* Bottom Link */}
        <div className="mt-16">
          <Link 
            href="/verify"
            className="text-gray-400 hover:text-gray-600 text-base font-medium transition-colors underline decoration-1 underline-offset-4"
          >
            查询我的投票
          </Link>
        </div>
      </div>
    </main>
  );
}
