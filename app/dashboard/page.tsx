'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PRD {
  id: string;
  title: string;
  content: string;
  sections?: Record<string, string>;
  status: string;
  template: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [prds, setPrds] = useState<PRD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    in_review: 0,
    approved: 0,
  });

  useEffect(() => {
    loadPRDs();
  }, []);

  const loadPRDs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prds?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setPrds(data.data || []);
        
        // Calculate stats
        const stats = {
          total: data.data.length,
          draft: data.data.filter((p: PRD) => p.status === 'draft').length,
          in_review: data.data.filter((p: PRD) => p.status === 'in_review').length,
          approved: data.data.filter((p: PRD) => p.status === 'approved').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading PRDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recentPRDs = prds.slice(0, 5);

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => router.push('/chat')}
            className="w-full bg-[#FF007F] hover:bg-[#FF0088] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New PRD</span>
          </button>
        </div>

        <div className="px-4 space-y-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-800 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Dashboard</span>
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">Chats</span>
          </button>
          <button
            onClick={() => router.push('/documents')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Documents</span>
            <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{stats.total}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#222222] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-sm text-zinc-400">Overview of your PRDs and activity</p>
        </div>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">Total PRDs</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">Draft</div>
            <div className="text-3xl font-bold text-yellow-500">{stats.draft}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">In Review</div>
            <div className="text-3xl font-bold text-blue-500">{stats.in_review}</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="text-sm text-zinc-400 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
          </div>
        </div>

        {/* Recent PRDs */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent PRDs</h2>
            <button
              onClick={() => router.push('/documents')}
              className="text-sm text-[#FF007F] hover:text-[#FF0088] transition-colors"
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
            </div>
          ) : recentPRDs.length === 0 ? (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg text-zinc-400 mb-2">No PRDs yet</p>
              <p className="text-sm text-zinc-500 mb-4">Create your first PRD to get started</p>
              <button
                onClick={() => router.push('/chat')}
                className="px-6 py-2 bg-[#FF007F] hover:bg-[#FF0088] text-white rounded-lg transition-colors"
              >
                Create PRD
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPRDs.map((prd) => (
                <div
                  key={prd.id}
                  onClick={() => router.push(`/chat?prd=${prd.id}`)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#FF007F]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{prd.title}</h3>
                      <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                        {prd.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500">
                        <span>Updated {new Date(prd.updated_at).toLocaleDateString()}</span>
                        <span className="capitalize">{prd.template}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prd.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : prd.status === 'in_review'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {prd.status}
                      </span>
                      <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#FF007F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#FF007F]/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-[#FF007F]/20 rounded-lg flex items-center justify-center group-hover:bg-[#FF007F]/30 transition-colors">
                  <svg className="w-5 h-5 text-[#FF007F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Create New PRD</h3>
                  <p className="text-xs text-zinc-400">Start a new conversation</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/documents')}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#FF007F]/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">View Documents</h3>
                  <p className="text-xs text-zinc-400">Browse all PRDs</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/chat')}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#FF007F]/50 transition-all text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Continue Chat</h3>
                  <p className="text-xs text-zinc-400">Resume conversation</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

