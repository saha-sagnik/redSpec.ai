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

export default function LandingPage() {
  const router = useRouter();
  const [recentPRDs, setRecentPRDs] = useState<PRD[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear localStorage on mount (migration to database)
  useEffect(() => {
    // Clear old localStorage data
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
       

        {/* Start New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => router.push('/chat')}
            className="w-full bg-[#FF007F] hover:bg-[#FF0088] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Start New Chat</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-4 space-y-1">
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
            {recentPRDs.length > 0 && (
              <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{recentPRDs.length}</span>
            )}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Dashboard</span>
          </button>
        </div>


        {/* Recent Activity */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Recent PRDs</span>
            {recentPRDs.length > 0 && (
              <button
                onClick={() => router.push('/documents')}
                className="text-xs text-zinc-500 hover:text-white"
              >
                View all
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="text-xs text-zinc-500">Loading...</div>
          ) : recentPRDs.length === 0 ? (
            <div className="text-xs text-zinc-500">No recent PRDs</div>
          ) : (
            <div className="space-y-2">
              {recentPRDs.map((prd) => (
                <div
                  key={prd.id}
                  onClick={() => router.push(`/chat?prd=${prd.id}`)}
                  className="text-sm text-zinc-300 hover:text-white cursor-pointer truncate p-2 rounded hover:bg-zinc-800 transition-colors"
                  title={prd.title}
                >
                  {prd.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-800 flex items-center space-x-2">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">S</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Sagnik</div>
            <div className="text-xs text-zinc-400">redSpec.AI</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#222222] flex flex-col items-center justify-center p-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#FF007F] to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold">S</span>
          </div>
        </div>

        {/* Header Text */}
        <h1 className="text-4xl font-bold mb-12 text-center">
          How can I <span className="text-[#FF007F]">help</span> you today?
        </h1>

        {/* Action Cards */}
        <div className="w-full max-w-2xl space-y-4 mb-8">
          <div
            onClick={() => router.push('/chat')}
            className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-6 cursor-pointer transition-all hover:border-[#FF007F]/50 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-[#FF007F]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Help me write a document</h3>
                  <p className="text-sm text-zinc-400">Create a new PRD or other document</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#FF007F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-6 cursor-pointer transition-all hover:border-[#FF007F]/50 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-[#FF007F]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Help me improve an existing document</h3>
                  <p className="text-sm text-zinc-400">Get expert feedback on your writing</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#FF007F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-6 cursor-pointer transition-all hover:border-[#FF007F]/50 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-[#FF007F]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Brainstorm new features</h3>
                  <p className="text-sm text-zinc-400">Generate ideas for your product roadmap</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#FF007F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-6 cursor-pointer transition-all hover:border-[#FF007F]/50 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-[#FF007F]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Get feedback on my ideas</h3>
                  <p className="text-sm text-zinc-400">Receive insights on your product concepts</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-[#FF007F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

