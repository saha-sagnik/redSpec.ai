'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export default function Home() {
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
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prdViewerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          githubRepo: githubRepo || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
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
    <div className="flex h-screen bg-zinc-50">
      {/* Left Panel - Chat */}
      <div className="w-1/2 flex flex-col border-r border-zinc-200">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200 p-4">
          <h1 className="text-2xl font-bold text-zinc-900">redSpec.AI</h1>
          <p className="text-sm text-zinc-600">Product Specification Generator</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-zinc-100 text-zinc-800'
                    : 'bg-white border border-zinc-200 text-zinc-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-zinc-600">{currentPhase || 'Thinking...'}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-zinc-200 p-4 space-y-3">
          {/* GitHub Repo Input */}
          <input
            type="text"
            placeholder="GitHub Repository URL (optional)"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="flex-1 px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>

          {/* Generate PRD Button */}
          <button
            onClick={startPRDGeneration}
            disabled={isLoading || !input.trim()}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            🚀 Generate Complete PRD
          </button>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-600">
                <span>{currentPhase}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - PRD Viewer */}
      <div className="w-1/2 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-4 border-b border-zinc-700">
          <h2 className="text-xl font-bold">PRD Viewer</h2>
          <p className="text-sm text-zinc-400">Live document generation</p>
        </div>

        {/* PRD Content */}
        <div
          ref={prdViewerRef}
          className="flex-1 overflow-y-auto p-6 prose prose-zinc max-w-none"
        >
          {prdContent ? (
            <div className="whitespace-pre-wrap font-mono text-sm">
              {prdContent}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg">PRD will appear here</p>
                <p className="text-sm">Click "Generate Complete PRD" to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {prdContent && (
          <div className="border-t border-zinc-200 p-4 flex space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(prdContent)}
              className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors"
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
              className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors"
            >
              💾 Download
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors"
            >
              🖨️ Print
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
