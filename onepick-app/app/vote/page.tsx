'use client';

import { useState } from 'react';
import { CANDIDATES } from '@/lib/config/candidates';
import CandidateCard from '@/components/CandidateCard';
import ChangeKeyModal from '@/components/ChangeKeyModal';
import Link from 'next/link';

export default function VotePage() {
  const [orderId, setOrderId] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [changeKey, setChangeKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/one-pick/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId.trim().toUpperCase(),
          candidateId: selectedCandidate,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error.message || '提交失败');
        return;
      }

      setChangeKey(data.data.changeKey);
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setChangeKey(null);
    setOrderId('');
    setSelectedCandidate(null);
  };

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
          <p className="text-gray-600 text-lg font-medium">
            2026 Q1 季度投票
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 订单号输入 */}
          <div className="glass-card p-8 space-y-3">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              订单号
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="TF260204114784891234"
              required
              maxLength={17}
            />
            <p className="text-xs text-gray-500">
              格式：TF + 15位数字
            </p>
          </div>

          {/* 候选人选择 */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider px-2">
              选择你的 One-Pick
            </label>
            <div className="space-y-3">
              {CANDIDATES.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedCandidate === candidate.id}
                  onSelect={() => setSelectedCandidate(candidate.id)}
                />
              ))}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="glass-card p-6 border-2 border-red-300" style={{
              background: 'linear-gradient(135deg, rgba(230, 0, 18, 0.1) 0%, rgba(255, 182, 217, 0.1) 100%)'
            }}>
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={!orderId || !selectedCandidate || loading}
            className="neon-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交投票'}
          </button>
        </form>

        {/* 说明 */}
        <div className="glass-card p-8 mt-8 space-y-4">
          <h3 className="text-lg font-black text-gray-700">
            投票规则
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>• 一个订单号只能投一票</li>
            <li>• 每季度可修改一次（需要密钥）</li>
            <li>• 投票后会获得修改密钥，请妥善保管</li>
          </ul>
        </div>

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

      {/* 密钥展示弹窗 */}
      {changeKey && (
        <ChangeKeyModal
          changeKey={changeKey}
          onConfirm={handleModalConfirm}
        />
      )}
    </main>
  );
}
