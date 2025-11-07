/**
 * Chat API Route
 * Handles chat messages and initiates PRD generation workflow
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  githubRepo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [], githubRepo } = body;

    // Count messages to understand conversation stage
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const messageCount = userMessages.length;

    let responseContent = '';

    // First message - ask clarifying questions
    if (messageCount === 0 || messageCount === 1) {
      responseContent = `Great! I understand you want to work on: "${message}"\n\n${
        githubRepo ? `I'll analyze the codebase at: ${githubRepo}\n\n` : ''
      }To create a comprehensive PRD, could you tell me more about:\n\n1. **Target Users**: Who will use this feature? (e.g., frequent travelers, bus operators, admins)\n2. **Problem Statement**: What specific problem does this solve?\n3. **Success Metrics**: How will we measure if this is successful?`;
    }
    // Second message - acknowledge and ask about technical details
    else if (messageCount === 2) {
      responseContent = `Perfect! That helps a lot.\n\nYou mentioned: "${message}"\n\nA few technical questions:\n\n1. **Performance Requirements**: Any specific load time or response time targets?\n2. **Platform**: Is this for mobile app, web, or both?\n3. **Timeline**: When do you need this feature? (helps with scope)`;
    }
    // Third message - confirm and suggest PRD generation
    else if (messageCount === 3) {
      responseContent = `Excellent! I now have enough context:\n\n✅ Feature: ${userMessages[0]?.content || 'Feature'}\n✅ Users & Problem: ${userMessages[1]?.content.substring(0, 50)}...\n✅ Technical details: ${message.substring(0, 50)}...\n\n${
        githubRepo ? `✅ Codebase: ${githubRepo}\n\n` : ''
      }I'm ready to generate a comprehensive PRD with:\n- Problem Statement & Goals\n- User Stories & Acceptance Criteria\n- Technical Requirements\n- Story Point Estimates\n- Design Wireframes\n- Analytics Events\n- JIRA Tickets\n\n**Click "🚀 Generate Complete PRD" below to start!**`;
    }
    // Subsequent messages - be helpful
    else {
      responseContent = `I understand: "${message}"\n\nI have all the information I need. Click "🚀 Generate Complete PRD" button below to generate the complete specification with all 10 agents working together!\n\nOr feel free to ask me anything else about the feature.`;
    }

    const response: ChatMessage = {
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: response,
      conversationId: Date.now().toString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Chat API is running',
    version: '1.0.0',
    endpoints: {
      POST: '/api/chat - Send chat message',
      GET: '/api/stream - Stream PRD generation',
    },
  });
}
