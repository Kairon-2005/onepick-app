'use client';

import { useState } from 'react';
import { CANDIDATES } from '@/lib/config/candidates';
import CandidateCard from '@/components/CandidateCard';
import ChangeKeyModal from '@/components/ChangeKeyModal';
import Link from 'next/link';

export default function ChangePage() {
  const [orderId, setOrderId] = useState('');
  const [changeKey, setChangeKey] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newChangeKey, setNewChangeKey] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/one-pick/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId.trim().toUpperCase(),
          candidateId: selectedCandidate,
          changeKey: changeKey.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error.message || '修改失败');
        return;
      }

      setNewChangeKey(data.data.changeKey);
      setSuccess(true);
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setNewChangeKey(null);
    window.location.href = '/verify';
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
          <h2 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            修改投票
          </h2>
        </div>

        {!success ? (
          <>
            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 订单号 */}
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

              {/* 修改密钥 */}
              <div className="glass-card p-8 space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  修改密钥
                </label>
                <input
                  type="text"
                  value={changeKey}
                  onChange={(e) => setChangeKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                  style={{ fontFamily: 'monospace' }}
                />
                <p className="text-xs text-gray-500">
                  首次投票时获得的密钥
                </p>
              </div>

              {/* 候选人选择 */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider px-2">
                  选择新的 One-Pick
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
                disabled={!orderId || !changeKey || !selectedCandidate || loading}
                className="neon-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '修改中...' : '确认修改'}
              </button>
            </form>

            {/* 警告 */}
            <div className="glass-card p-8 mt-8 border-2 border-yellow-300" style={{
              background: 'linear-gradient(135deg, rgba(249, 229, 17, 0.1) 0%, rgba(255, 255, 249, 0.2) 100%)'
            }}>
              <p className="text-sm font-bold text-yellow-700 mb-2">
                ⚠️ 重要提示
              </p>
              <p className="text-xs text-gray-600">
                每季度只能修改一次。修改后将获得新的密钥，但本季度将无法再次修改。
              </p>
            </div>
          </>
        ) : (
          /* 成功提示 */
          <div className="glass-card p-16 text-center" style={{
            background: 'linear-gradient(135deg, rgba(111, 227, 178, 0.2) 0%, rgba(78, 232, 204, 0.2) 100%)',
            border: '2px solid rgba(111, 227, 178, 0.5)'
          }}>
            <div className="text-7xl mb-6">✓</div>
            <h3 className="text-3xl font-black mb-3" style={{
              background: 'linear-gradient(135deg, #6FE3B2 0%, #4CE8CC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              修改成功！
            </h3>
            <p className="text-gray-600 font-medium">
              你的投票已更新
            </p>
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

      {/* 新密钥展示弹窗 */}
      {newChangeKey && (
        <ChangeKeyModal
          changeKey={newChangeKey}
          onConfirm={handleModalConfirm}
        />
      )}
    </main>
  );
}
