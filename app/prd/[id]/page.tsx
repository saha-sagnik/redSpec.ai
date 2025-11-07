'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function PRDViewContent() {
  const router = useRouter();
  const params = useParams();
  const prdId = params.id as string;

  const [prd, setPrd] = useState<PRD | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requirements');

  // Utility function to clean and format content
  const formatContent = (content: string): string => {
    if (!content) return '';

    // Remove all markdown formatting, emojis, and special characters
    let formatted = content
      .replace(/^#{1,6}\s*/gm, '') // Remove markdown headers
      .replace(/[🎯📊🎨⚙️📈👥💡🔧📝✅❌⚠️🚀🔍📌💻🌟⭐️🎉]/g, '') // Remove emojis
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/```[^\n]*\n?/g, '') // Remove code fence markers
      .replace(/^[└─├│►▶•]\s*/gm, '') // Remove tree connectors and arrows
      .replace(/^>\s*/gm, '') // Remove blockquote markers
      .replace(/^\[\s*\]\s*/gm, '☐ ') // Convert checkbox to symbol
      .replace(/^[•\-\*]\s*/gm, '• ') // Normalize bullets
      .replace(/\n\n+/g, '\n\n') // Normalize spacing
      .trim();

    return formatted;
  };

  // Extract clean bullet points without excessive formatting
  const extractCleanList = (content: string): string[] => {
    if (!content) return [];

    const lines = content.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[•\-\*]\s*/, '') // Remove bullet markers
        .replace(/^[└─├│]\s*/, '') // Remove tree connectors
        .replace(/[🎯📊🎨⚙️📈👥💡🔧📝✅❌⚠️🚀🔍📌💻🌟⭐️🎉]/g, '') // Remove emojis
        .replace(/\*\*/g, '') // Remove bold markdown
        .trim();

      if (cleaned && !cleaned.startsWith('#')) {
        items.push(cleaned);
      }
    }

    return items;
  };

  useEffect(() => {
    const loadPRD = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/prds/${prdId}`);
        const data = await response.json();
        if (data.success) {
          const loadedPRD = data.data;
          // Ensure sections are parsed if they're stored as JSON string
          if (loadedPRD.sections && typeof loadedPRD.sections === 'string') {
            try {
              loadedPRD.sections = JSON.parse(loadedPRD.sections);
            } catch (e) {
              console.error('Error parsing sections:', e);
            }
          }
          console.log('[PRD VIEW] Loaded PRD:', {
            id: loadedPRD.id,
            title: loadedPRD.title,
            hasSections: !!loadedPRD.sections,
            sectionsCount: loadedPRD.sections ? Object.keys(loadedPRD.sections).length : 0,
            sections: loadedPRD.sections,
            hasContent: !!loadedPRD.content,
            contentLength: loadedPRD.content?.length || 0,
          });
          setPrd(loadedPRD);
        }
      } catch (error) {
        console.error('Error loading PRD:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (prdId) {
      loadPRD();
    }
  }, [prdId]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">PRD not found</p>
          <button
            onClick={() => router.push('/chat')}
            className="mt-4 px-4 py-2 bg-[#FF007F] text-white rounded-lg"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  // Parse sections - handle both object and string formats
  let sections: Record<string, string> = {};
  if (prd.sections) {
    if (typeof prd.sections === 'string') {
      try {
        sections = JSON.parse(prd.sections);
      } catch (e) {
        console.error('Error parsing sections string:', e);
        sections = {};
      }
    } else if (typeof prd.sections === 'object') {
      sections = prd.sections;
    }
  }
  
  // If no sections but we have content, try to parse it
  const hasSections = Object.keys(sections).length > 0;
  const hasContent = prd.content && prd.content.trim().length > 0;
  
  console.log('[PRD VIEW] Rendering with:', {
    hasSections,
    sectionsCount: Object.keys(sections).length,
    sectionKeys: Object.keys(sections),
    hasContent,
    contentLength: prd.content?.length || 0,
  });
  
  const sectionTitle = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => router.push('/')}
              className="text-lg font-semibold text-gray-900 hover:text-[#FF007F] transition-colors"
            >
              redSpec.AI
            </button>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button onClick={() => router.push('/')} className="hover:text-gray-900">Home</button>
              <button onClick={() => router.push('/dashboard')} className="hover:text-gray-900">Dashboard</button>
              <button onClick={() => router.push('/documents')} className="hover:text-gray-900">Documents</button>
              <button onClick={() => router.push('/chat')} className="hover:text-gray-900">Chat</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Feature Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {sections.overview && 'Belongs to epic'} • Feature {prdId.substring(0, 8).toUpperCase()} • Created on {new Date(prd.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {sections.title ? (
                  String(sections.title).replace(/^#\s*/, '')
                ) : (
                  prd.title
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-6">
          {/* Left Column - PRD Content */}
          <div className="flex-1">
            {/* Key Capability Bar */}
            {(sections.objective || (hasContent && !hasSections)) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                <div className="text-sm font-semibold text-blue-900 mb-1">Key Capability</div>
                <div className="text-sm text-blue-800">
                  {sections.objective ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {String(sections.objective).substring(0, 200) + (String(sections.objective).length > 200 ? '...' : '')}
                    </ReactMarkdown>
                  ) : (
                    <div>{prd.content.substring(0, 200)}...</div>
                  )}
                </div>
              </div>
            )}

            {/* Display all PRD sections in TABLE FORMAT */}
            {hasSections && Object.keys(sections).length > 1 ? (
              <>
                {/* Main Feature Description Box */}
                {sections.objective && (
                  <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg overflow-hidden">
                    <div className="bg-blue-500 px-4 py-2">
                      <h2 className="text-sm font-semibold text-white">{sections.title ? sections.title.replace(/^#\s*/, '') : prd.title}</h2>
                    </div>
                    <div className="px-4 py-3">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {sections.objective}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* TABLE FORMAT - Structured Rows */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {/* Overview Row */}
                      {sections.overview && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Overview</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.overview}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Challenge Row */}
                      {sections.problem_statement && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Challenge</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm text-gray-700 space-y-3">
                              {(() => {
                                const cleaned = formatContent(sections.problem_statement);
                                const blocks = cleaned.split('\n\n');

                                return blocks.map((block, idx) => {
                                  // Check if it's a list section
                                  if (block.includes('\n• ')) {
                                    const lines = block.split('\n');
                                    const header = lines[0]?.trim();
                                    const items = lines.slice(1).filter(line => line.trim().startsWith('• '));

                                    return (
                                      <div key={idx}>
                                        {header && !header.startsWith('• ') && (
                                          <p className="font-semibold text-gray-900 mb-2">{header}</p>
                                        )}
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          {items.map((item, i) => (
                                            <li key={i} className="text-gray-700">
                                              {item.replace(/^•\s*/, '').trim()}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return <p key={idx} className="text-gray-700 leading-relaxed">{block.trim()}</p>;
                                });
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Who it benefits Row */}
                      {sections.user_stories_personas && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Who it benefits</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm text-gray-700 space-y-3">
                              {(() => {
                                const cleaned = formatContent(sections.user_stories_personas);
                                const blocks = cleaned.split('\n\n');

                                return blocks.map((block, idx) => {
                                  // Skip redundant headers like "Users & Stories"
                                  if (block.trim() === 'Users & Stories' || block.trim() === 'Users and Stories') {
                                    return null;
                                  }

                                  // Check for checkboxes
                                  if (block.includes('☐ ')) {
                                    const lines = block.split('\n');
                                    const header = lines.find(l => !l.trim().startsWith('☐'))?.trim();
                                    const checkboxItems = lines.filter(line => line.trim().startsWith('☐'));

                                    return (
                                      <div key={idx}>
                                        {header && (
                                          <p className="font-semibold text-gray-900 mb-2">{header}</p>
                                        )}
                                        <div className="space-y-1.5">
                                          {checkboxItems.map((item, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                              <input
                                                type="checkbox"
                                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                                                disabled
                                              />
                                              <span className="text-gray-700 text-sm">
                                                {item.replace(/^☐\s*/, '').trim()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Check if it's a list section
                                  if (block.includes('\n• ')) {
                                    const lines = block.split('\n');
                                    const header = lines[0]?.trim();
                                    const items = lines.slice(1).filter(line => line.trim().startsWith('• '));

                                    return (
                                      <div key={idx}>
                                        {header && !header.startsWith('• ') && (
                                          <p className="font-semibold text-gray-900 mb-2">{header}</p>
                                        )}
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          {items.map((item, i) => (
                                            <li key={i} className="text-gray-700">
                                              {item.replace(/^•\s*/, '').trim()}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return <p key={idx} className="text-gray-700 leading-relaxed">{block.trim()}</p>;
                                });
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Open questions Row */}
                      {sections.open_questions_risks && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Open questions</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.open_questions_risks}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Go-to-market team Row */}
                      {sections.stakeholders_approvals && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Go-to-market team</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.stakeholders_approvals}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Context Row */}
                      {sections.context && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Context</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.context}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Assumptions Row */}
                      {sections.assumptions && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Assumptions</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.assumptions}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Scope Row */}
                      {sections.scope && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Scope</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.scope}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Goals & Success Metrics Row */}
                      {sections.goals_success_metrics && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Goals & Success</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm text-gray-700 space-y-3">
                              {(() => {
                                const cleaned = formatContent(sections.goals_success_metrics);
                                const blocks = cleaned.split('\n\n');

                                return blocks.map((block, idx) => {
                                  // Skip redundant headers
                                  if (block.trim() === 'Goals & Success Metrics' || block.trim() === 'Goals and Success Metrics') {
                                    return null;
                                  }

                                  // Check if it's a list section
                                  if (block.includes('\n• ')) {
                                    const lines = block.split('\n');
                                    const header = lines[0]?.trim();
                                    const items = lines.slice(1).filter(line => line.trim().startsWith('• '));

                                    return (
                                      <div key={idx}>
                                        {header && !header.startsWith('• ') && (
                                          <p className="font-medium text-gray-800 mb-1">{header}</p>
                                        )}
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          {items.map((item, i) => (
                                            <li key={i} className="text-gray-700">
                                              {item.replace(/^•\s*/, '').trim()}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return <p key={idx} className="text-gray-700 leading-relaxed">{block.trim()}</p>;
                                });
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Functional Requirements Row */}
                      {sections.functional_requirements && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Functional Requirements</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.functional_requirements}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Non-Functional Requirements Row */}
                      {sections.non_functional_requirements && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Non-Functional Requirements</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.non_functional_requirements}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Technical Considerations Row */}
                      {sections.technical_considerations && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Technical Considerations</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.technical_considerations}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Analytics & Tracking Row */}
                      {sections.analytics_tracking && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Analytics & Tracking</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.analytics_tracking}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Design Requirements Row */}
                      {sections.design_requirements && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Design Requirements</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.design_requirements}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Release Plan Row */}
                      {sections.release_plan && (
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Release Plan</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.release_plan}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Dependencies & Blockers Row */}
                      {sections.dependencies_blockers && (
                        <tr>
                          <td className="bg-gray-50 px-4 py-3 w-48 align-top">
                            <h3 className="text-sm font-semibold text-gray-900">Dependencies & Blockers</h3>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.dependencies_blockers}
                              </ReactMarkdown>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* If no sections or only title, show full content */
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">PRD Content</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prd.content || 'No content available. Please go back to chat and continue building the PRD.'}
                  </ReactMarkdown>
                </div>
                {hasSections && Object.keys(sections).length === 1 && sections.title && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This PRD only has a title. Go back to <button onClick={() => router.push(`/chat?prd=${prd.id}`)} className="text-blue-600 underline">chat</button> to continue building the PRD sections.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                Create mockup
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                Attach files
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                Show less
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'requirements'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  REQUIREMENTS {(() => {
                    const reqContent = sections.functional_requirements || (hasContent && !hasSections ? prd.content : '');
                    if (!reqContent) return '0';
                    const count = reqContent.split(/\n(?=\d+\.|\*|\-|•)/).filter(r => r.trim().length > 0).length;
                    return count > 0 ? count : (reqContent.trim().length > 0 ? '1' : '0');
                  })()}
                </button>
                <button
                  onClick={() => setActiveTab('research')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'research'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  RESEARCH {(() => {
                    let count = 0;
                    if (sections.problem_statement) count++;
                    if (sections.context) count++;
                    if (sections.assumptions) count++;
                    return count;
                  })()}
                </button>
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'todos'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  TO-DOS
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'comments'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  COMMENTS
                </button>
                <button
                  onClick={() => setActiveTab('related')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'related'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  RELATED 0
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'history'
                      ? 'border-[#FF007F] text-[#FF007F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  HISTORY
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'requirements' && (
              <div>
                <button className="mb-4 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">
                  + Add
                </button>
                {sections.functional_requirements || sections.user_stories_personas || (hasContent && !hasSections) ? (
                  <div className="space-y-3">
                    {/* Parse and display functional requirements */}
                    {(() => {
                      const reqContent = sections.functional_requirements || (hasContent && !hasSections ? prd.content : '');
                      if (!reqContent) return null;
                      
                      // Split by common patterns (numbered lists, bullets, etc.)
                      const requirements = reqContent
                        .split(/\n(?=\d+\.|\*|\-|•)/)
                        .filter(req => req.trim().length > 0)
                        .map(req => req.trim())
                        .slice(0, 20); // Limit to 20 requirements
                      
                      // If no list items found, treat entire content as one requirement
                      if (requirements.length === 0) {
                        return (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-gray-600">1</span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 mb-2">
                                    {prdId.substring(0, 8).toUpperCase()}-1
                                  </div>
                                  <div className="prose prose-sm max-w-none text-gray-700">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {reqContent}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">In design</span>
                                <button className="text-xs text-blue-600 hover:text-blue-800">View in report</button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return requirements.map((req, idx) => {
                        // Clean up the requirement text
                        const cleanReq = req.replace(/^[\d\*\-•\.\s]+/, '').trim();
                        if (!cleanReq) return null;
                        
                        return (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-gray-600">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    {prdId.substring(0, 8).toUpperCase()}-{idx + 1} {cleanReq.substring(0, 100)}
                                    {cleanReq.length > 100 && '...'}
                                  </div>
                                  {cleanReq.length > 100 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {cleanReq}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">In design</span>
                                <button className="text-xs text-blue-600 hover:text-blue-800">View in report</button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-8 text-center">
                    No requirements added yet. Click "+ Add" to add a requirement.
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'research' && (
              <div>
                {sections.context || sections.problem_statement || sections.assumptions ? (
                  <div className="space-y-4">
                    {/* Problem Statement as Research */}
                    {sections.problem_statement && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-700">R</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Problem Statement Research</h3>
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.problem_statement}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Context as Research */}
                    {sections.context && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-700">R</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Context & Background</h3>
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.context}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assumptions as Research */}
                    {sections.assumptions && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-700">R</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Assumptions & Validation</h3>
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {sections.assumptions}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-8 text-center">
                    No research items yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'todos' && (
              <div>
                {sections.release_plan || sections.dependencies_blockers || sections.open_questions_risks ? (
                  <div className="space-y-2">
                    {/* Open Questions as TODOs */}
                    {sections.open_questions_risks && (() => {
                      const todos = sections.open_questions_risks
                        .split('\n')
                        .filter(line => line.match(/^[-*•]\s+/) || line.match(/^\d+[\.\)]\s+/) || line.includes('[ ]'))
                        .map(line => line.replace(/^[-*•\d\.\)\s]+/, '').replace(/\[\s*\]/, '').trim())
                        .filter(line => line.length > 0);

                      return todos.map((todo, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-[#FF007F] rounded" />
                            <span className="text-sm text-gray-900">{todo}</span>
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Dependencies as TODOs */}
                    {sections.dependencies_blockers && (() => {
                      const dependencies = sections.dependencies_blockers
                        .split('\n')
                        .filter(line => line.match(/^[-*•]\s+/) || line.match(/^\d+[\.\)]\s+/))
                        .map(line => line.replace(/^[-*•\d\.\)\s]+/, '').trim())
                        .filter(line => line.length > 0);

                      return dependencies.map((dep, idx) => (
                        <div key={`dep-${idx}`} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-[#FF007F] rounded" />
                            <span className="text-sm text-gray-900">{dep}</span>
                            <span className="ml-auto px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Blocked</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-8 text-center">
                    No to-dos yet.
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'comments' && (
              <div className="text-sm text-gray-500 py-8 text-center">
                No comments yet.
              </div>
            )}
            
            {activeTab === 'related' && (
              <div className="text-sm text-gray-500 py-8 text-center">
                No related items yet.
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="text-sm text-gray-500 py-8 text-center">
                No history yet.
              </div>
            )}
          </div>

          {/* Right Column - Feature Properties */}
          <div className="w-80 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Assigned to</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-900">Unassigned</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1">
                    <select className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                      <option>{prd.status || 'Draft'}</option>
                      <option>In design</option>
                      <option>In review</option>
                      <option>Approved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Product value</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                  <div className="mt-1 text-sm text-gray-900 capitalize">{prd.template || 'Standard'}</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Initiative</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date range</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(prd.created_at).toLocaleDateString()} – {new Date(prd.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Team</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Initial estimate</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Detailed estimate</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Release</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Watchers</label>
                  <div className="mt-1">
                    <button className="text-sm text-blue-600 hover:text-blue-800">Notify watchers</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Goals</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Epic</label>
                  <div className="mt-1 text-sm text-gray-900">-</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-gray-600 hover:text-gray-900">Show more</button>
                <button className="text-sm text-gray-600 hover:text-gray-900 ml-4">Add custom field</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PRDViewPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
      </div>
    }>
      <PRDViewContent />
    </Suspense>
  );
}

