'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface PRD {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const router = useRouter();
  const [recentPRDs, setRecentPRDs] = useState<PRD[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear localStorage on mount (migration to database)
  useEffect(() => {
    localStorage.removeItem('redspec_prds');
    localStorage.removeItem('redspec_shares');
  }, []);

  // Load recent PRDs from database
  useEffect(() => {
    const loadRecentPRDs = async () => {
      try {
        const response = await fetch('/api/prds?limit=5');
        const data = await response.json();
        if (data.success) {
          setRecentPRDs(data.data || []);
        }
      } catch (error) {
        console.error('Error loading recent PRDs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecentPRDs();
  }, []);

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#1A1A1A] border-r border-zinc-800 flex flex-col">
        {/* User Account */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FF007F] rounded-full flex items-center justify-center">
              <span className="text-white font-bold">RS</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">redSpec.AI</div>
              <div className="text-xs text-zinc-400">Internal Tool</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => router.push('/chat')}
            className="w-full px-4 py-2 bg-[#FF007F] hover:bg-[#FF0088] text-white rounded-lg font-medium transition-colors"
          >
            Start New Chat
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/documents')}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          >
            Documents
          </button>
        </div>

        {/* Recent PRDs */}
        {recentPRDs.length > 0 && (
          <div className="p-4 border-t border-zinc-800">
            <div className="text-xs font-medium text-zinc-400 mb-2">Recent PRDs</div>
            <div className="space-y-1">
              {recentPRDs.map((prd) => (
                <div
                  key={prd.id}
                  onClick={() => router.push(`/prd/${prd.id}`)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer truncate p-1 rounded hover:bg-zinc-800"
                  title={prd.title}
                >
                  {prd.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">redSpec.AI</h1>
            <p className="text-xl text-zinc-400 mb-8">Product Specification Generator</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Action Cards */}
            <div
              onClick={() => router.push('/chat')}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 cursor-pointer transition-colors border border-zinc-700"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-white mb-2">Help me write a document</h3>
              <p className="text-sm text-zinc-400">Create a new PRD from scratch</p>
            </div>

            <div
              onClick={() => router.push('/documents')}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 cursor-pointer transition-colors border border-zinc-700"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-white mb-2">Help me improve an existing document</h3>
              <p className="text-sm text-zinc-400">Edit and enhance your PRDs</p>
            </div>

            <div
              onClick={() => router.push('/chat')}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 cursor-pointer transition-colors border border-zinc-700"
            >
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Brainstorm new features</h3>
              <p className="text-sm text-zinc-400">Explore product ideas</p>
            </div>

            <div
              onClick={() => router.push('/chat')}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 cursor-pointer transition-colors border border-zinc-700"
            >
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get feedback on my ideas</h3>
              <p className="text-sm text-zinc-400">Validate your concepts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
