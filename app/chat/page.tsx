'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

// Question Options Component with Multiple Selection
function QuestionOptions({ 
  question, 
  onSelect, 
  isLoading 
}: { 
  question: { text: string; options: string[] }; 
  onSelect: (options: string[]) => void;
  isLoading: boolean;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleOptionClick = (option: string) => {
    const isOther = option.toLowerCase().includes('other');
    
    if (isOther) {
      setShowOtherInput(true);
      return;
    }

    // Toggle selection (allow multiple)
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(opt => opt !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSubmit = () => {
    const options = [...selectedOptions];
    if (otherInput.trim()) {
      options.push(otherInput.trim());
    }
    if (options.length > 0) {
      onSelect(options);
      setSelectedOptions([]);
      setOtherInput('');
      setShowOtherInput(false);
    }
  };

  // Don't render if no options
  if (!question.options || question.options.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {question.options.map((option, optIndex) => {
        const isOther = option.toLowerCase().includes('other');
        const isSelected = selectedOptions.includes(option);
        
        return (
          <div key={optIndex}>
            {isOther ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleOptionClick(option)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    showOtherInput 
                      ? 'bg-[#FF007F]/30 border-2 border-[#FF007F] text-white' 
                      : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                  }`}
                >
                  {option}
                </button>
                {showOtherInput && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={otherInput}
                      onChange={(e) => setOtherInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit();
                        }
                      }}
                      placeholder="Please specify..."
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF007F]"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleOptionClick(option)}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-[#FF007F] hover:bg-[#FF0088] text-white border-2 border-[#FF007F]'
                    : 'bg-[#FF007F]/20 hover:bg-[#FF007F]/30 border border-[#FF007F]/50 text-white'
                }`}
              >
                {isSelected && '✓ '}
                {option}
              </button>
            )}
          </div>
        );
      })}
      {(selectedOptions.length > 0 || otherInput.trim()) && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-[#FF007F] hover:bg-[#FF0088] text-white rounded-lg text-sm font-medium transition-colors"
        >
          Submit {selectedOptions.length > 0 && `(${selectedOptions.length} selected)`}
        </button>
      )}
    </div>
  );
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Clear localStorage on mount (migration to database)
  useEffect(() => {
    localStorage.removeItem('redspec_prds');
    localStorage.removeItem('redspec_shares');
  }, []);

  // Load saved PRDs from database
  useEffect(() => {
    const loadPRDs = async () => {
      try {
        const response = await fetch('/api/prds?limit=10');
        const data = await response.json();
        if (data.success) {
          setSavedPRDs(data.data.map((prd: any) => ({
            id: prd.id,
            title: prd.title,
            date: prd.created_at,
            content: prd.content,
            sections: prd.sections,
          })));
        }
      } catch (e) {
        console.error('Failed to load saved PRDs:', e);
      }
    };
    loadPRDs();
  }, []);

  // Load PRD from URL query param
  useEffect(() => {
    const prdId = searchParams.get('prd');
    if (prdId) {
      const loadPRD = async () => {
        try {
          const response = await fetch(`/api/prds/${prdId}`);
          const data = await response.json();
          if (data.success) {
            const prd = data.data;
            // Parse sections if they're stored as JSON string
            let sections = prd.sections;
            if (typeof sections === 'string') {
              try {
                sections = JSON.parse(sections);
              } catch (e) {
                console.error('Error parsing sections:', e);
                sections = {};
              }
            }
            
            if (sections && Object.keys(sections).length > 0) {
              setPrdSections(sections);
              const fullPRD = Object.values(sections).join('\n\n');
              setPrdContent(fullPRD);
            } else if (prd.content) {
              // If no sections but we have content, try to parse it
              setPrdContent(prd.content);
              // Try to extract title from content
              const titleMatch = prd.content.match(/^#\s*(.+)$/m);
              if (titleMatch) {
                setPrdSections({ title: titleMatch[1] });
              }
            }
            setCurrentPRDId(prd.id);
            
            // Load conversation history
            const convResponse = await fetch(`/api/conversations?prd_id=${prd.id}&limit=50`);
            const convData = await convResponse.json();
            if (convData.success && convData.data.length > 0) {
              const loadedMessages: Message[] = convData.data.map((msg: any) => {
                // Parse metadata if it's a string
                let metadata = msg.metadata;
                if (typeof metadata === 'string') {
                  try {
                    metadata = JSON.parse(metadata);
                  } catch (e) {
                    console.error('Error parsing message metadata:', e);
                    metadata = null;
                  }
                }
                
                const message: Message = {
                  role: msg.role as 'user' | 'assistant' | 'system',
                  content: msg.content,
                  timestamp: msg.timestamp,
                  question: metadata?.question,
                };
                
                // If no question in metadata but content has [QUESTION] tag, parse it
                if (!message.question && message.role === 'assistant' && message.content.includes('[QUESTION]')) {
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
                    } else if (questionText) {
                      message.question = {
                        text: questionText,
                        options: [],
                      };
                    }
                  }
                }
                
                return message;
              });
              setMessages(loadedMessages);
            }
          }
        } catch (e) {
          console.error('Error loading PRD:', e);
        }
      };
      loadPRD();
    }
  }, [searchParams]);

  // Track current PRD ID
  const [currentPRDId, setCurrentPRDId] = useState<string | null>(null);

  // Auto-save PRD when sections update (debounced)
  useEffect(() => {
    if (Object.keys(prdSections).length > 0 || prdContent.trim().length > 0) {
      const fullPRD = Object.keys(prdSections).length > 0 
        ? Object.values(prdSections).join('\n\n')
        : prdContent;
      
      if (fullPRD.trim()) {
        const timeoutId = setTimeout(async () => {
          const title = prdSections.title?.replace(/^#\s*/, '') || prdContent?.substring(0, 50) || 'Untitled PRD';
          
          try {
            if (currentPRDId) {
              // Update existing PRD
              await fetch(`/api/prds/${currentPRDId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title,
                  content: fullPRD,
                  sections: Object.keys(prdSections).length > 0 ? prdSections : null,
                }),
              });
            } else {
              // Create new PRD
              const response = await fetch('/api/prds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title,
                  content: fullPRD,
                  sections: Object.keys(prdSections).length > 0 ? prdSections : null,
                  template: prdTemplate,
                  status: 'draft',
                }),
              });
              const data = await response.json();
              if (data.success) {
                setCurrentPRDId(data.data.id);
                
                // Save all existing messages to database
                for (const msg of messages) {
                  if (msg.role !== 'system') {
                    try {
                      await fetch('/api/conversations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          prd_id: data.data.id,
                          role: msg.role,
                          content: msg.content,
                          metadata: msg.question ? { question: msg.question } : null,
                        }),
                      });
                    } catch (e) {
                      console.error('Error saving message:', e);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error auto-saving PRD:', e);
          }
        }, 2000); // Debounce: save 2 seconds after last change
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [prdSections, prdContent, currentPRDId, prdTemplate, messages]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    const userMessage: Message = {
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to database (will be saved when PRD is created if no PRD ID yet)
    // The full conversation (user + assistant) will be saved after assistant responds
    
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
          
          // Parse question format - SIMPLIFIED AND ROBUST
          const questionMatch = message.content.match(/\[QUESTION\]([\s\S]*?)\[\/QUESTION\]/);
          console.log('[QUESTION DETECTION] Message content:', message.content.substring(0, 200));
          console.log('[QUESTION DETECTION] Question match found:', !!questionMatch);
          if (questionMatch) {
            const questionContent = questionMatch[1];
            console.log('[QUESTION DETECTION] Question content:', questionContent.substring(0, 200));
            
            // First try to find [OPTIONS] tag
            const optionsMatch = questionContent.match(/\[OPTIONS\]([\s\S]*?)\[\/OPTIONS\]/);
            const questionText = questionContent.replace(/\[OPTIONS\][\s\S]*?\[\/OPTIONS\]/, '').trim();
            
            let options: string[] = [];
            
            if (optionsMatch && optionsMatch[1]) {
              // Parse options from [OPTIONS] tag
              options = optionsMatch[1]
                .split('\n')
                .map((opt: string) => {
                  // Remove bullet points, dashes, asterisks, numbers
                  return opt
                    .replace(/^[-*]\s*/, '')
                    .replace(/^\d+[\.\)]\s*/, '')
                    .replace(/^[•]\s*/, '')
                    .trim();
                })
                .filter((opt: string) => opt.length > 0);
            } else {
              // If no [OPTIONS] tag, extract from question content itself
              // Look for lines that look like options (bullet points, dashes, numbers)
              const lines = questionContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
              
              for (const line of lines) {
                // Skip if it's clearly part of the question text (too long or contains question marks)
                if (line.length > 150 || line.includes('?')) {
                  continue;
                }
                
                // Check for bullet points, dashes, asterisks
                const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
                if (bulletMatch) {
                  options.push(bulletMatch[1].trim());
                  continue;
                }
                
                // Check for numbered lists
                const numberMatch = line.match(/^\d+[\.\)]\s+(.+)$/);
                if (numberMatch) {
                  options.push(numberMatch[1].trim());
                  continue;
                }
              }
            }
            
            // Only create question if we have options OR question text
            if (options.length > 0 || questionText) {
              console.log('[QUESTION PARSING] Parsed question:', {
                text: questionText,
                optionsCount: options.length,
                options: options,
              });
              
              message.question = {
                text: questionText,
                options: options.length > 0 ? options : [],
              };
            }
          }
        }
        
        setMessages((prev) => [...prev, message]);
        
        // Save conversation to database
        // If PRD ID exists, save immediately. Otherwise, it will be saved when PRD is created
        const saveConversation = async (prdId: string) => {
          try {
            // Save user message
            await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prd_id: prdId,
                role: 'user',
                content: content,
                metadata: null,
              }),
            });
            
            // Save assistant message
            await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prd_id: prdId,
                role: 'assistant',
                content: message.content,
                metadata: message.question ? { question: message.question } : null,
              }),
            });
          } catch (e) {
            console.error('Error saving conversation:', e);
          }
        };
        
        if (currentPRDId) {
          await saveConversation(currentPRDId);
        } else {
          // If no PRD ID yet, wait a bit for auto-save to create PRD, then save
          setTimeout(async () => {
            if (currentPRDId) {
              await saveConversation(currentPRDId);
            } else {
              // If still no PRD ID after 3 seconds, try to get it from the latest PRD
              // This handles the case where PRD was just created
              const checkAndSave = async () => {
                const response = await fetch('/api/prds?limit=1');
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                  const latestPRD = data.data[0];
                  setCurrentPRDId(latestPRD.id);
                  await saveConversation(latestPRD.id);
                }
              };
              setTimeout(checkAndSave, 1000);
            }
          }, 3000);
        }
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
          <button
            onClick={() => router.push('/chat')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-zinc-800 text-white text-left"
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
            <span className="ml-auto text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{savedPRDs.length}</span>
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

        {/* Document History - Recent Chats */}
        <div className="mt-auto p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Recent Chats</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {savedPRDs.slice(0, 10).map((prd) => (
              <div
                key={prd.id}
                onClick={async () => {
                      try {
            const response = await fetch(`/api/prds/${prd.id}`);
            const data = await response.json();
            if (data.success) {
              const loadedPRD = data.data;
              // Parse sections if they're stored as JSON string
              let sections = loadedPRD.sections;
              if (typeof sections === 'string') {
                try {
                  sections = JSON.parse(sections);
                } catch (e) {
                  console.error('Error parsing sections:', e);
                  sections = {};
                }
              }
              
              if (sections && Object.keys(sections).length > 0) {
                setPrdSections(sections);
                const fullPRD = Object.values(sections).join('\n\n');
                setPrdContent(fullPRD);
              } else if (loadedPRD.content) {
                // If no sections but we have content, try to parse it
                setPrdContent(loadedPRD.content);
                // Try to extract title from content
                const titleMatch = loadedPRD.content.match(/^#\s*(.+)$/m);
                if (titleMatch) {
                  setPrdSections({ title: titleMatch[1] });
                }
              }
              setCurrentPRDId(loadedPRD.id);
                          
                          // Load conversation history
                          const convResponse = await fetch(`/api/conversations?prd_id=${loadedPRD.id}&limit=50`);
                          const convData = await convResponse.json();
                          if (convData.success && convData.data.length > 0) {
                            const loadedMessages: Message[] = convData.data.map((msg: any) => ({
                              role: msg.role as 'user' | 'assistant' | 'system',
                              content: msg.content,
                              timestamp: msg.timestamp,
                              question: msg.metadata?.question,
                            }));
                            setMessages(loadedMessages);
                          }
                        }
                      } catch (e) {
                        console.error('Error loading PRD:', e);
                      }
                }}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer truncate p-1 rounded hover:bg-zinc-800"
                title={prd.title}
              >
                {prd.title}
              </div>
            ))}
            {savedPRDs.length === 0 && (
              <div className="text-xs text-zinc-500">No recent chats</div>
            )}
          </div>
        </div>
      </div>

      {/* Left Panel - PRD Rough Area */}
      <div className="w-1/2 flex flex-col bg-[#1A1A1A] border-r border-zinc-800">
        {/* Header */}
        <div className="bg-[#1A1A1A] border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-white">PRD Rough Draft</h2>
              <p className="text-sm text-zinc-400">Work in progress</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  // Always try to save/publish, even if sections are empty
                  const title = prdSections.title?.replace(/^#\s*/, '') || prdContent?.substring(0, 50) || 'Untitled PRD';
                  const fullPRD = Object.keys(prdSections).length > 0 
                    ? Object.values(prdSections).join('\n\n')
                    : prdContent || '';
                  
                  try {
                    let prdId = currentPRDId;
                    
                    // If no PRD ID, create one
                    if (!prdId) {
                      const response = await fetch('/api/prds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title,
                          content: fullPRD,
                          sections: Object.keys(prdSections).length > 0 ? prdSections : null,
                          template: prdTemplate,
                          status: 'draft',
                        }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        prdId = data.data.id;
                        setCurrentPRDId(prdId);
                        
                        // Save all messages to database
                        for (const msg of messages) {
                          await fetch('/api/conversations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              prd_id: prdId,
                              role: msg.role,
                              content: msg.content,
                              metadata: msg.question ? { question: msg.question } : null,
                            }),
                          });
                        }
                      }
                    } else {
                      // Update existing PRD
                      await fetch(`/api/prds/${prdId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title,
                          content: fullPRD,
                          sections: Object.keys(prdSections).length > 0 ? prdSections : null,
                        }),
                      });
                    }
                    
                    if (prdId) {
                      router.push(`/prd/${prdId}`);
                    }
                  } catch (e) {
                    console.error('Error saving PRD:', e);
                    alert('Failed to save PRD. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-[#FF007F] hover:bg-[#FF0088] text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Publish</span>
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

        {/* PRD Rough Content */}
        <div
          ref={prdViewerRef}
          className="flex-1 overflow-y-auto bg-white"
        >
          {Object.keys(prdSections).length > 0 || prdContent.trim().length > 0 ? (
            <div className="max-w-4xl mx-auto py-4 px-6">
              <div className="bg-white">
                {/* Document Header - Compact for Rough Draft */}
                <div className="border-b border-gray-300 pb-3 mb-4">
                  {prdSections.title ? (
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {prdSections.title.replace(/^#\s*/, '')}
                      </ReactMarkdown>
                    </h1>
                  ) : prdContent ? (
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {(() => {
                        const titleMatch = prdContent.match(/^#\s*(.+)$/m);
                        return titleMatch ? titleMatch[1] : 'Untitled PRD';
                      })()}
                    </h1>
                  ) : null}
                  {prdSections.overview && (
                    <div className="prose prose-sm max-w-none text-gray-700 font-mono">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {prdSections.overview}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Main PRD Sections - Visual Cards for Better UX */}
                {Object.keys(prdSections).length > 0 ? (
                  <div className="space-y-4">
                  {Object.entries(prdSections)
                    .filter(([key]) => key !== 'title' && key !== 'overview')
                    .sort(([a], [b]) => {
                      const order = [
                        'objective',
                        'context',
                        'problem_statement',
                        'assumptions',
                        'scope',
                        'goals_success_metrics',
                        'user_stories_personas',
                        'functional_requirements',
                        'non_functional_requirements',
                        'technical_considerations',
                        'analytics_tracking',
                        'design_requirements',
                        'open_questions_risks',
                        'release_plan',
                        'dependencies_blockers',
                        'stakeholders_approvals',
                      ];
                      const indexA = order.indexOf(a);
                      const indexB = order.indexOf(b);
                      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                      if (indexA === -1) return 1;
                      if (indexB === -1) return -1;
                      return indexA - indexB;
                    })
                    .map(([sectionName, content]) => {
                      const sectionTitle = sectionName
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      // Get icon for section type
                      const getSectionIcon = (name: string) => {
                        if (name.includes('objective') || name.includes('goal')) return '🎯';
                        if (name.includes('problem') || name.includes('challenge')) return '⚠️';
                        if (name.includes('user') || name.includes('persona')) return '👤';
                        if (name.includes('requirement')) return '✅';
                        if (name.includes('technical')) return '⚙️';
                        if (name.includes('design')) return '🎨';
                        if (name.includes('risk') || name.includes('question')) return '❓';
                        if (name.includes('release') || name.includes('plan')) return '📅';
                        if (name.includes('dependency')) return '🔗';
                        return '📋';
                      };
                      
                      return (
                        <div
                          key={sectionName}
                          className="relative group bg-yellow-50/40 border-2 border-gray-300 border-dashed rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:border-[#FF007F]"
                          style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          }}
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="text-2xl flex-shrink-0">{getSectionIcon(sectionName)}</div>
                            <div className="flex-1">
                              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                <span className="w-1 h-5 bg-[#FF007F] rounded-full mr-2"></span>
                                {sectionTitle}
                              </h2>
                            </div>
                          </div>
                          <div className="pl-9">
                            {editingSection === sectionName ? (
                              <div
                                className="border-l-4 border-[#FF007F] pl-4 py-2 bg-yellow-50/30 rounded-r-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <textarea
                                  value={content}
                                  onChange={(e) => {
                                    setPrdSections((prev) => ({
                                      ...prev,
                                      [sectionName]: e.target.value,
                                    }));
                                  }}
                                  onBlur={() => {
                                    setEditingSection(null);
                                    const allSections = { ...prdSections };
                                    const fullPRD = Object.values(allSections).join('\n\n');
                                    setPrdContent(fullPRD);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setEditingSection(null);
                                    }
                                  }}
                                  className="w-full p-3 bg-transparent border-0 rounded text-sm min-h-[120px] focus:outline-none text-gray-900 font-mono leading-relaxed resize-none placeholder-gray-400"
                                  autoFocus
                                  placeholder="Click to start typing..."
                                  style={{ minHeight: '120px' }}
                                />
                              </div>
                            ) : (
                              <div
                                className="relative cursor-text hover:bg-yellow-50/20 rounded-lg p-3 -m-3 transition-colors group/content"
                                onClick={() => setEditingSection(sectionName)}
                              >
                                <div
                                  className="prose prose-sm max-w-none text-gray-700 font-mono
                                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-2 prose-headings:mb-1
                                    prose-h2:text-sm prose-h2:font-bold prose-h2:mt-2 prose-h2:mb-1 prose-h2:text-gray-900 prose-h2:uppercase prose-h2:tracking-wide
                                    prose-h3:text-xs prose-h3:font-semibold prose-h3:mt-1 prose-h3:mb-1 prose-h3:text-gray-800
                                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-2 prose-p:text-sm
                                    prose-ul:text-gray-700 prose-ul:my-1 prose-ul:pl-4 prose-ul:space-y-0.5 prose-ul:list-disc
                                    prose-ol:text-gray-700 prose-ol:my-1 prose-ol:pl-4 prose-ol:space-y-0.5
                                    prose-li:text-gray-700 prose-li:my-0.5 prose-li:leading-relaxed prose-li:text-sm
                                    prose-strong:text-gray-900 prose-strong:font-bold
                                    prose-code:text-xs prose-code:bg-gray-100 prose-code:text-[#FF007F] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:font-semibold
                                    prose-pre:bg-gray-100 prose-pre:border-2 prose-pre:border-dashed prose-pre:border-gray-300 prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-xs prose-pre:overflow-x-auto prose-pre:font-mono
                                    prose-blockquote:border-l-4 prose-blockquote:border-[#FF007F] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-2 prose-blockquote:bg-pink-50/50 prose-blockquote:py-2
                                    prose-table:border-collapse prose-table:w-full prose-table:my-2 prose-table:text-xs prose-table:font-mono
                                    prose-th:border-2 prose-th:border-gray-400 prose-th:bg-gray-100 prose-th:px-2 prose-th:py-1.5 prose-th:text-left prose-th:text-gray-900 prose-th:font-bold prose-th:uppercase prose-th:text-xs
                                    prose-td:border prose-td:border-gray-300 prose-td:px-2 prose-td:py-1.5 prose-td:text-gray-700
                                    prose-a:text-[#FF007F] prose-a:underline prose-a:font-semibold
                                    prose-hr:border-gray-400 prose-hr:border-dashed prose-hr:my-3"
                                >
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                  </ReactMarkdown>
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover/content:opacity-100 transition-opacity">
                                  <div className="bg-[#FF007F] text-white rounded px-2 py-0.5 text-xs font-medium shadow-sm">
                                    ✎ tap to edit
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })}
                  </div>
                ) : prdContent ? (
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="prose prose-sm max-w-none text-gray-700 font-mono">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {prdContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg text-gray-600">PRD Rough Draft</p>
                  <p className="text-sm text-gray-500">Start a conversation to build your PRD</p>
                  {prdContent && !prdSections.title && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
                      <p className="text-xs text-gray-500 mb-2">Raw content detected:</p>
                      <div className="prose prose-sm max-w-none text-gray-700 font-mono text-left">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {prdContent.substring(0, 500) + (prdContent.length > 500 ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Right Panel - Conversation */}
      <div className="w-1/2 flex flex-col bg-[#222222] border-l border-zinc-800">
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            // Remove PRD_SECTION and QUESTION tags from display, but keep other content
            let displayContent = message.content
              .replace(/\[PRD_SECTION:[\w]+\][\s\S]*?\[\/PRD_SECTION\]/g, '')
              .replace(/\[QUESTION\][\s\S]*?\[\/QUESTION\]/g, '')
              .trim();
            
            // If question was extracted, show it separately but keep any other content
            if (message.question && message.role === 'assistant') {
              // If displayContent is empty after removing tags, use question text
              // Otherwise, show both the content and question
              if (!displayContent || displayContent.length === 0) {
                displayContent = message.question.text;
              } else {
                // Show content + question text
                displayContent = displayContent + '\n\n' + message.question.text;
              }
            }
            
            // If still empty, show a fallback
            if (!displayContent || displayContent.length === 0) {
              displayContent = message.content || 'Message received';
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
                  {displayContent ? (
                    <div className="prose prose-sm max-w-none text-white
                      prose-p:text-white prose-p:leading-relaxed prose-p:mb-2
                      prose-strong:text-white prose-strong:font-semibold
                      prose-ul:text-white prose-ul:my-2 prose-ul:pl-4
                      prose-li:text-white prose-li:my-1
                      prose-code:text-white prose-code:bg-white/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-a:text-blue-300 prose-a:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">Message content</div>
                  )}
                  
                  {/* Interactive buttons for questions - Multiple selection support */}
                  {message.question && message.role === 'assistant' && message.question.options && message.question.options.length > 0 && (
                    <QuestionOptions
                      question={message.question}
                      onSelect={(selectedOptions) => {
                        if (selectedOptions.length > 0) {
                          sendMessage(selectedOptions.join(', '));
                        }
                      }}
                      isLoading={isLoading}
                    />
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
          <div>
            <input
              type="text"
              placeholder="GitHub Repository URL (optional)"
              value={githubRepo}
              onChange={(e) => {
                const value = e.target.value;
                // Validate GitHub URL format
                if (!value || value.trim() === '' || /^https?:\/\/(www\.)?(github\.com|github\.io)\/[\w\-\.]+\/[\w\-\.]+(\/)?$/.test(value.trim())) {
                  setGithubRepo(value);
                }
              }}
              className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF007F] text-sm text-white placeholder-zinc-500 ${
                githubRepo && !/^https?:\/\/(www\.)?(github\.com|github\.io)\/[\w\-\.]+\/[\w\-\.]+(\/)?$/.test(githubRepo.trim())
                  ? 'border-red-500'
                  : 'border-zinc-700'
              }`}
            />
            {githubRepo && !/^https?:\/\/(www\.)?(github\.com|github\.io)\/[\w\-\.]+\/[\w\-\.]+(\/)?$/.test(githubRepo.trim()) && (
              <p className="text-xs text-red-400 mt-1">Please enter a valid GitHub repository URL</p>
            )}
          </div>

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

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#1A1A1A] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#FF007F] border-t-transparent rounded-full"></div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}

