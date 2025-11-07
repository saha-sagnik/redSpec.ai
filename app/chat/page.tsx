'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  question?: {
    text: string;
    options: string[];
  };
}

interface PRDSection {
  name: string;
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Welcome to redSpec.AI! Tell me about your product idea and I\'ll help you create a comprehensive PRD.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prdContent, setPrdContent] = useState('');
  const [prdSections, setPrdSections] = useState<Record<string, string>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [prdTemplate, setPrdTemplate] = useState('standard');
  const [savedPRDs, setSavedPRDs] = useState<Array<{id: string, title: string, date: string, content: string}>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prdViewerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved PRDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('redspec_prds');
    if (saved) {
      try {
        setSavedPRDs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved PRDs:', e);
      }
    }
  }, []);

  // Track current PRD ID
  const [currentPRDId, setCurrentPRDId] = useState<string | null>(null);

  // Auto-save PRD when sections update (debounced)
  useEffect(() => {
    if (Object.keys(prdSections).length > 0) {
      const fullPRD = Object.values(prdSections).join('\n\n');
      if (fullPRD.trim()) {
        const timeoutId = setTimeout(() => {
          const title = prdSections.title?.replace(/^#\s*/, '') || 'Untitled PRD';
          const saved = localStorage.getItem('redspec_prds');
          const prds = saved ? JSON.parse(saved) : [];
          
          // Use existing ID or create new one
          const prdId = currentPRDId || `prd_${Date.now()}`;
          if (!currentPRDId) setCurrentPRDId(prdId);
          
          const prdData = {
            id: prdId,
            title: title.substring(0, 50),
            date: new Date().toISOString(),
            content: fullPRD,
            sections: prdSections
          };
          
          // Check if this PRD already exists (update instead of duplicate)
          const existingIndex = prds.findIndex((p: any) => p.id === prdId);
          
          if (existingIndex >= 0) {
            prds[existingIndex] = prdData;
          } else {
            prds.unshift(prdData);
            // Keep only last 10 PRDs
            if (prds.length > 10) prds.pop();
          }
          
          localStorage.setItem('redspec_prds', JSON.stringify(prds));
          setSavedPRDs(prds);
        }, 2000); // Debounce: save 2 seconds after last change
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [prdSections, currentPRDId]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    const userMessage: Message = {
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageContent) setInput('');
    setIsLoading(true);

    try {
      console.log('[FRONTEND] Sending message:', input);
      console.log('[FRONTEND] Conversation history:', messages.length, 'messages');
      
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          githubRepo: githubRepo || undefined,
        }),
      });

      console.log('[FRONTEND] Response status:', response.status);
      const data = await response.json();
      console.log('[FRONTEND] Response data:', data);

      if (data.success && data.message) {
        const message = data.message;
        
        // Parse PRD sections from the response
        if (message.content) {
          const sectionRegex = /\[PRD_SECTION:(\w+)\]([\s\S]*?)\[\/PRD_SECTION\]/g;
          let match;
          const newSections: Record<string, string> = {};
          
          while ((match = sectionRegex.exec(message.content)) !== null) {
            const sectionName = match[1];
            const sectionContent = match[2].trim();
            newSections[sectionName] = sectionContent;
          }
          
          if (Object.keys(newSections).length > 0) {
            setPrdSections((prev) => ({ ...prev, ...newSections }));
            // Update full PRD content
            const allSections = { ...prdSections, ...newSections };
            const fullPRD = Object.values(allSections).join('\n\n');
            setPrdContent(fullPRD);
          }
          
          // Parse question format
          const questionMatch = message.content.match(/\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/);
          if (questionMatch) {
            const questionContent = questionMatch[1];
            const optionsMatch = questionContent.match(/\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/);
            const questionText = questionContent.replace(/\[OPTIONS\][\s\S]*?\[\/OPTIONS\]/, '').trim();
            
            if (optionsMatch) {
              const options = optionsMatch[1]
                .split('\n')
                .map((opt: string) => opt.replace(/^[-*]\s*/, '').trim())
                .filter((opt: string) => opt.length > 0);
              
              message.question = {
                text: questionText,
                options: options,
              };
            }
          }
        }
        
        setMessages((prev) => [...prev, message]);
      } else {
        // Show error message from backend
        const errorMsg = data.error || 'Unknown error occurred';
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${errorMsg}${errorDetails}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('[FRONTEND] Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Network Error: ${error instanceof Error ? error.message : 'Failed to connect to server. Please check the console for details.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startPRDGeneration = async () => {
    if (!input.trim()) return;

    setPrdContent('');
    setProgress(0);
    setIsLoading(true);

    try {
      // Connect to streaming endpoint
      const params = new URLSearchParams({
        idea: input,
        ...(githubRepo && { repo: githubRepo }),
      });

      const eventSource = new EventSource(`/api/stream?${params}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'progress':
            setProgress(data.data.progress);
            setCurrentPhase(data.data.message);
            break;

          case 'prd_update':
            setPrdContent((prev) => prev + data.data.content);
            // Auto-scroll PRD viewer
            if (prdViewerRef.current) {
              prdViewerRef.current.scrollTop = prdViewerRef.current.scrollHeight;
            }
            break;

          case 'complete':
            setIsLoading(false);
            setCurrentPhase('Complete!');
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `✅ PRD generated successfully!\n\n📊 Total Story Points: ${data.data.totalStoryPoints}\n📈 Validation Score: ${data.data.validationScore}/100\n🎫 JIRA Epic: ${data.data.jiraEpicKey}`,
                timestamp: new Date().toISOString(),
              },
            ]);
            eventSource.close();
            break;

          case 'error':
            setIsLoading(false);
            setCurrentPhase('Error occurred');
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = () => {
        setIsLoading(false);
        setCurrentPhase('Connection error');
        eventSource.close();
      };
    } catch (error) {
      console.error('Error starting PRD generation:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#1A1A1A] border-r border-zinc-800 flex flex-col">
        {/* Back to Home */}
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

        {/* Start New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              setMessages([{
                role: 'system',
                content: 'Welcome to redSpec.AI! Tell me about your product idea and I\'ll help you create a comprehensive PRD.',
                timestamp: new Date().toISOString(),
              }]);
              setPrdContent('');
              setPrdSections({});
              setInput('');
            }}
            className="w-full bg-[#FF007F] hover:bg-[#FF0088] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-4 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-800 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">Chats</span>
            <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">1</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Documents</span>
            <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{savedPRDs.length}</span>
          </a>
        </div>

        {/* Document History */}
        <div className="mt-auto p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Recent</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {savedPRDs.slice(0, 5).map((prd) => (
              <div
                key={prd.id}
                onClick={() => {
                  try {
                    const saved = localStorage.getItem('redspec_prds');
                    if (saved) {
                      const prds = JSON.parse(saved);
                      const found = prds.find((p: any) => p.id === prd.id);
                      if (found && found.sections) {
                        setPrdSections(found.sections);
                        const fullPRD = Object.values(found.sections).join('\n\n');
                        setPrdContent(fullPRD);
                        setCurrentPRDId(prd.id);
                      }
                    }
                  } catch (e) {
                    console.error('Error loading PRD:', e);
                  }
                }}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer truncate p-1 rounded hover:bg-zinc-800"
              >
                {prd.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#222222]">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-white">redSpec.AI</h1>
              <p className="text-sm text-zinc-400">Product Specification Generator</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-white"
              >
                📚 History
              </button>
            </div>
          </div>
          
          {/* Template Selector */}
          <div className="flex items-center space-x-2 mt-2">
            <label className="text-xs text-zinc-400">Template:</label>
            <select
              value={prdTemplate}
              onChange={(e) => setPrdTemplate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-white"
            >
              <option value="standard">Standard PRD</option>
              <option value="mvp">MVP PRD</option>
              <option value="enhancement">Feature Enhancement</option>
              <option value="integration">Integration PRD</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            // Remove PRD_SECTION and QUESTION tags from display
            let displayContent = message.content
              .replace(/\[PRD_SECTION:[\w]+\][\s\S]*?\[\/PRD_SECTION\]/g, '')
              .replace(/\[QUESTION\][\s\S]*?\[\/QUESTION\]/g, '')
              .trim();
            
            // If question was extracted, show it separately
            if (message.question && message.role === 'assistant') {
              displayContent = message.question.text;
            }
            
            return (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-[#FF007F] text-white'
                      : message.role === 'system'
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-800 border border-zinc-700 text-white'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{displayContent}</div>
                  
                  {/* Interactive buttons for questions */}
                  {message.question && message.role === 'assistant' && (
                    <div className="mt-3 space-y-2">
                      {message.question.options.map((option, optIndex) => {
                        const isOther = option.toLowerCase().includes('other');
                        return (
                          <div key={optIndex}>
                            {isOther ? (
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    const otherInput = prompt('Please specify:');
                                    if (otherInput) {
                                      sendMessage(otherInput);
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors text-left text-white"
                                >
                                  {option}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => sendMessage(option)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-[#FF007F]/20 hover:bg-[#FF007F]/30 border border-[#FF007F]/50 rounded-lg text-sm font-medium transition-colors text-left text-white"
                              >
                                {option}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
                  <span className="text-sm text-zinc-400">{currentPhase || 'Thinking...'}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#1A1A1A] border-t border-zinc-800 p-4 space-y-3">
          {/* GitHub Repo Input */}
          <input
            type="text"
            placeholder="GitHub Repository URL (optional)"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-sm text-white placeholder-zinc-500"
          />

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Describe your product idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-white placeholder-zinc-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-[#FF007F] text-white rounded-lg hover:bg-[#FF0088] disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - PRD Viewer */}
      <div className="w-1/2 flex flex-col bg-[#1A1A1A] border-l border-zinc-800">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-4">
          <h2 className="text-xl font-bold text-white">PRD Viewer</h2>
          <p className="text-sm text-zinc-400">Live document generation</p>
        </div>

        {/* PRD Content */}
        <div
          ref={prdViewerRef}
          className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none"
        >
          {Object.keys(prdSections).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(prdSections).map(([sectionName, content]) => (
                <div key={sectionName} className="relative group">
                  {editingSection === sectionName ? (
                    <div className="space-y-2">
                      <textarea
                        value={content}
                        onChange={(e) => {
                          setPrdSections((prev) => ({
                            ...prev,
                            [sectionName]: e.target.value,
                          }));
                        }}
                        className="w-full p-3 bg-zinc-800 border border-[#FF007F] rounded-lg font-mono text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-white"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingSection(null);
                            const allSections = { ...prdSections };
                            const fullPRD = Object.values(allSections).join('\n\n');
                            setPrdContent(fullPRD);
                          }}
                          className="px-4 py-2 bg-[#FF007F] text-white rounded-lg hover:bg-[#FF0088] text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="whitespace-pre-wrap font-mono text-sm text-zinc-200">
                        {content}
                      </div>
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                        <button
                          onClick={async () => {
                            const improvement = prompt('What would you like to improve in this section?');
                            if (improvement) {
                              setIsLoading(true);
                              try {
                                const response = await fetch('/api/chat', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    message: `Improve this section: ${content}\n\nUser feedback: ${improvement}`,
                                    conversationHistory: messages,
                                  }),
                                });
                                const data = await response.json();
                                if (data.success && data.message) {
                                  const improvedContent = data.message.content;
                                  setPrdSections((prev) => ({
                                    ...prev,
                                    [sectionName]: improvedContent,
                                  }));
                                }
                              } catch (error) {
                                console.error('Improvement error:', error);
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="Improve this section"
                        >
                          ✨ Improve
                        </button>
                        <button
                          onClick={() => setEditingSection(sectionName)}
                          className="px-2 py-1 bg-[#FF007F] text-white text-xs rounded hover:bg-[#FF0088] transition-colors"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : prdContent ? (
            <div className="whitespace-pre-wrap font-mono text-sm text-zinc-200">
              {prdContent}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">PRD will appear here</p>
                <p className="text-sm">Start a conversation to build your PRD step-by-step</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {prdContent && (
          <div className="border-t border-zinc-800 p-4 space-y-2 bg-[#1A1A1A]">
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(prdContent)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors text-white"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([prdContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `prd-${Date.now()}.md`;
                  a.click();
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors text-white"
              >
                💾 Download
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors text-white"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

