'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCandidateById } from '@/lib/config/candidates';

interface VoteData {
  orderId: string;
  season: string;
  vote: {
    candidateId: string;
    candidateName: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  hasChanged: boolean;
  canChange: boolean;
  changeHistory: Array<{
    from: string;
    to: string;
    changedAt: string;
  }>;
}

export default function VerifyPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voteData, setVoteData] = useState<VoteData | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setVoteData(null);

    try {
      const res = await fetch(
        `/api/one-pick/verify?orderId=${encodeURIComponent(orderId.trim().toUpperCase())}`
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error.message || '查询失败');
        return;
      }

      setVoteData(data.data);
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const candidate = voteData ? getCandidateById(voteData.vote.candidateId) : null;

  return (
    <main className="relative min-h-screen py-12 px-4 overflow-hidden">
      {/* Pearl Aurora Background */}
      <div className="cosmic-bg" />
      <div className="stars" />
      <div className="onepick-bg">ONE-PICK</div>

      {/* Ambient Orbs */}
      <div 
        className="ambient-orb w-[500px] h-[500px] top-1/4 left-1/4"
        style={{ background: 'radial-gradient(circle, rgba(255, 182, 217, 0.3) 0%, transparent 70%)' }}
      />
      <div 
        className="ambient-orb w-[600px] h-[600px] bottom-1/4 right-1/4"
        style={{ 
          background: 'radial-gradient(circle, rgba(162, 89, 255, 0.25) 0%, transparent 70%)',
          animationDelay: '5s'
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-5xl font-black glow-text hover:scale-105 transition-transform">
              ONE PICK
            </h1>
          </Link>
          <h2 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #A259FF 0%, #FF6B9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            查询投票
          </h2>
        </div>

        {/* 查询表单 */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="glass-card p-8 space-y-3">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              订单号
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="TF + 15位数字"
              required
              maxLength={17}
            />
          </div>

          <button
            type="submit"
            disabled={!orderId || loading}
            className="neon-button w-full disabled:opacity-50"
          >
            {loading ? '查询中...' : '查询投票'}
          </button>
        </form>

        {/* 错误提示 */}
        {error && (
          <div className="glass-card p-6 mt-6 border-2 border-red-300" style={{
            background: 'linear-gradient(135deg, rgba(230, 0, 18, 0.1) 0%, rgba(255, 182, 217, 0.1) 100%)'
          }}>
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* 投票结果 */}
        {voteData && candidate && (
          <div className="space-y-6 mt-8">
            {/* 当前投票卡片 */}
            <div 
              className="glass-card p-8 border-2"
              style={{
                background: candidate.colors.gradient,
                borderColor: candidate.colors.primary,
                boxShadow: `0 8px 32px ${candidate.colors.primary}40`
              }}
            >
              <div className="flex items-center gap-6 mb-6">
                {candidate.avatar && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={candidate.avatar}
                      alt={candidate.name}
                      fill
                      className="rounded-2xl object-cover border-2 border-white"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/80 mb-2">
                    你的 One-Pick
                  </p>
                  <h3 className="text-4xl font-black text-white mb-2">
                    {candidate.name}
                  </h3>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 space-y-2">
                <p className="text-sm text-white/90">
                  <span className="font-bold">季度：</span>{voteData.season}
                </p>
                <p className="text-sm text-white/90">
                  <span className="font-bold">投票时间：</span>
                  {new Date(voteData.vote.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {/* 状态信息 */}
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  是否已修改
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  voteData.hasChanged 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {voteData.hasChanged ? '已修改' : '未修改'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  是否可修改
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  voteData.canChange 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {voteData.canChange ? '可修改' : '不可修改'}
                </span>
              </div>
            </div>

            {/* 修改历史 */}
            {voteData.changeHistory.length > 0 && (
              <div className="glass-card p-8">
                <h3 className="text-lg font-black text-gray-700 mb-4">
                  修改历史
                </h3>
                <div className="space-y-3">
                  {voteData.changeHistory.map((log, index) => (
                    <div key={index} className="bg-white/50 rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-700">
                        {log.from} → {log.to}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.changedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 修改按钮 */}
            {voteData.canChange && (
              <Link
                href="/change"
                className="neon-button w-full block text-center"
              >
                修改投票
              </Link>
            )}
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors underline"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
