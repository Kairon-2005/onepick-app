'use client';

import { useState } from 'react';

interface ChangeKeyModalProps {
  changeKey: string;
  onConfirm: () => void;
}

export default function ChangeKeyModal({ changeKey, onConfirm }: ChangeKeyModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(changeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'rgba(26, 26, 46, 0.7)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="glass-card max-w-md w-full p-8 border-2" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(255, 182, 217, 0.5)',
        boxShadow: '0 20px 60px rgba(255, 107, 157, 0.3)'
      }}>
        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-3xl font-black mb-2" style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            保存你的密钥
          </h2>
          <p className="text-gray-600 text-sm">
            这是你本季度 one-pick 的修改密钥
          </p>
        </div>

        {/* 密钥显示 */}
        <div className="bg-white border-2 rounded-2xl p-6 mb-6" style={{
          borderColor: 'rgba(162, 89, 255, 0.3)',
          boxShadow: 'inset 0 2px 10px rgba(162, 89, 255, 0.05)'
        }}>
          <div className="flex items-center justify-between gap-4">
            <code className="text-2xl font-bold tracking-wider" style={{
              color: '#A259FF',
              fontFamily: 'monospace'
            }}>
              {changeKey}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all border-2"
              style={{
                background: copied 
                  ? 'linear-gradient(135deg, #6FE3B2 0%, #4CE8CC 100%)' 
                  : 'linear-gradient(135deg, #FFB6D9 0%, #D8B4FE 100%)',
                color: 'white',
                borderColor: 'white',
                boxShadow: copied 
                  ? '0 4px 12px rgba(111, 227, 178, 0.4)' 
                  : '0 4px 12px rgba(255, 182, 217, 0.4)'
              }}
            >
              {copied ? '已复制！' : '复制'}
            </button>
          </div>
        </div>

        {/* 警告提示 */}
        <div className="rounded-2xl p-4 mb-6 border-2" style={{
          background: 'linear-gradient(135deg, rgba(249, 229, 17, 0.1) 0%, rgba(255, 255, 249, 0.2) 100%)',
          borderColor: 'rgba(249, 229, 17, 0.3)'
        }}>
          <p className="text-sm font-bold text-yellow-700 mb-2">
            ⚠️ 重要提示
          </p>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• 密钥仅展示一次，丢失将无法修改</li>
            <li>• 本季度最多修改 1 次</li>
            <li>• 请妥善保管密钥</li>
          </ul>
        </div>

        {/* 确认按钮 */}
        <button
          onClick={onConfirm}
          className="neon-button w-full text-lg"
        >
          我已保存密钥
        </button>
      </div>
    </div>
  );
}
