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

export default function DocumentsPage() {
  const router = useRouter();
  const [prds, setPrds] = useState<PRD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'in_review' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPRDs();
  }, [filter]);

  const loadPRDs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await fetch(`/api/prds?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPrds(data.data || []);
      }
    } catch (error) {
      console.error('Error loading PRDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePRD = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PRD?')) return;
    
    try {
      const response = await fetch(`/api/prds/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        loadPRDs();
      } else {
        alert('Failed to delete PRD: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting PRD:', error);
      alert('Failed to delete PRD');
    }
  };

  const filteredPRDs = prds.filter((prd) => {
    if (searchQuery) {
      return (
        prd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prd.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={() => router.push('/dashboard')}
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
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Dashboard</span>
          </button>
          <button
            onClick={() => router.push('/documents')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-800 text-white text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Documents</span>
            <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{prds.length}</span>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#222222]">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-sm text-zinc-400">Manage and view all your PRDs</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {(['all', 'draft', 'in_review', 'approved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#FF007F] text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Search PRDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-white placeholder-zinc-500"
          />
        </div>

        {/* PRD List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredPRDs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">No PRDs found</p>
                <p className="text-sm">Create your first PRD to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPRDs.map((prd) => (
                <div
                  key={prd.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#FF007F]/50 transition-all cursor-pointer group"
                  onClick={() => router.push(`/chat?prd=${prd.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white truncate flex-1">{prd.title}</h3>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        prd.status === 'approved'
                          ? 'bg-green-600 text-white'
                          : prd.status === 'in_review'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {prd.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {prd.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{new Date(prd.updated_at).toLocaleDateString()}</span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/chat?prd=${prd.id}`);
                        }}
                        className="text-[#FF007F] hover:text-[#FF0088]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePRD(prd.id);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

