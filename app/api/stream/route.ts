/**
 * Streaming API Route
 * Server-Sent Events (SSE) for real-time PRD generation updates
 */

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StreamMessage {
  type: 'progress' | 'prd_update' | 'complete' | 'error';
  data: any;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productIdea = searchParams.get('idea');
  const githubRepo = searchParams.get('repo');

  if (!productIdea) {
    return new Response('Missing product idea parameter', { status: 400 });
  }

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper function to send SSE message
      const sendMessage = (message: StreamMessage) => {
        const data = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // Simulate streaming workflow
        // TODO: Replace with actual Python orchestrator calls

        // Phase 1: Context Gathering
        sendMessage({
          type: 'progress',
          data: {
            phase: 'context_gathering',
            progress: 10,
            message: 'Loading company context and analyzing codebase...',
          },
          timestamp: new Date().toISOString(),
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Phase 2: PRD Generation Start
        sendMessage({
          type: 'progress',
          data: {
            phase: 'prd_generation',
            progress: 30,
            message: 'Generating Product Requirements Document...',
          },
          timestamp: new Date().toISOString(),
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Stream PRD sections
        const prdSections = [
          {
            section: 'Problem Statement',
            content: `# Problem Statement\n\nUsers currently lack...`,
          },
          {
            section: 'User Stories',
            content: `\n\n# User Stories\n\n- As a user, I want to...`,
          },
          {
            section: 'Requirements',
            content: `\n\n# Requirements\n\n## Functional\n- Feature 1\n- Feature 2`,
          },
        ];

        for (const section of prdSections) {
          sendMessage({
            type: 'prd_update',
            data: section,
            timestamp: new Date().toISOString(),
          });
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        // Phase 3: Technical Analysis
        sendMessage({
          type: 'progress',
          data: {
            phase: 'technical_analysis',
            progress: 60,
            message: 'Analyzing code impact and calculating story points...',
          },
          timestamp: new Date().toISOString(),
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Phase 4: Design & Analytics
        sendMessage({
          type: 'progress',
          data: {
            phase: 'design_tracking',
            progress: 80,
            message: 'Creating design specs and analytics plan...',
          },
          timestamp: new Date().toISOString(),
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Phase 5: Validation & JIRA
        sendMessage({
          type: 'progress',
          data: {
            phase: 'validation',
            progress: 95,
            message: 'Validating PRD and creating JIRA tickets...',
          },
          timestamp: new Date().toISOString(),
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Complete
        sendMessage({
          type: 'complete',
          data: {
            totalStoryPoints: 42,
            validationScore: 92,
            jiraEpicKey: 'PROD-123',
          },
          timestamp: new Date().toISOString(),
        });

        controller.close();
      } catch (error) {
        sendMessage({
          type: 'error',
          data: {
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          timestamp: new Date().toISOString(),
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
