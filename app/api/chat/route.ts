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
  console.log('[CHAT API] POST request received');
  
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationHistory = [], githubRepo } = body;

    console.log('[CHAT API] Message:', message.substring(0, 100));
    console.log('[CHAT API] Conversation history length:', conversationHistory.length);
    console.log('[CHAT API] GitHub repo:', githubRepo || 'none');

    // Import the Python orchestrator dynamically via subprocess
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Build context for the conversational PRD agent
    const conversationContext = conversationHistory
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const fullPrompt = `${conversationContext}\n\nUSER: ${message}`;
    
    console.log('[CHAT API] Calling Python agent...');
    console.log('[CHAT API] Prompt length:', fullPrompt.length);

    // Get the project root directory
    const projectRoot = process.cwd();
    console.log('[CHAT API] Project root:', projectRoot);

    // First, find and check Python version
    return new Promise<NextResponse>((resolve) => {
      const { exec } = require('child_process');
      
      // Try to find Python 3.10+ (try python3.11, python3.10, then python3)
      const pythonCommands = ['python3.11', 'python3.10', 'python3'];
      let pythonCmd = 'python3';
      let pythonVersion = '';
      
      const tryNextPython = (index: number) => {
        if (index >= pythonCommands.length) {
          // All attempts failed
          resolve(
            NextResponse.json(
              {
                success: false,
                error: 'Python 3.10+ not found',
                details: 'Google ADK requires Python 3.10+. Please install:\n\nOn macOS:\n  brew install python@3.11\n\nOr run: ./setup_python.sh\n\nThen restart the dev server.',
              },
              { status: 500 }
            )
          );
          return;
        }
        
        const cmd = pythonCommands[index];
        console.log(`[CHAT API] Trying ${cmd}...`);
        
        exec(`${cmd} --version`, (error: Error | null, stdout: string, stderr: string) => {
          if (error) {
            console.log(`[CHAT API] ${cmd} not found, trying next...`);
            tryNextPython(index + 1);
            return;
          }

          const versionMatch = stdout.match(/Python (\d+)\.(\d+)/);
          if (!versionMatch) {
            console.log(`[CHAT API] Could not parse version from ${cmd}, trying next...`);
            tryNextPython(index + 1);
            return;
          }

          const major = parseInt(versionMatch[1]);
          const minor = parseInt(versionMatch[2]);
          console.log(`[CHAT API] ${cmd} version: ${major}.${minor}`);

          if (major < 3 || (major === 3 && minor < 10)) {
            console.log(`[CHAT API] ${cmd} version too old, trying next...`);
            tryNextPython(index + 1);
            return;
          }

          // Found a good Python version!
          pythonCmd = cmd;
          pythonVersion = `${major}.${minor}`;
          console.log(`[CHAT API] Using ${pythonCmd} (version ${pythonVersion})`);
          
          // Python version is OK, proceed with agent execution
          proceedWithAgent();
        });
      };
      
      const proceedWithAgent = () => {
        
        // Create a temporary Python script file
        const fs = require('fs');
        const os = require('os');
        const tempScriptPath = path.join(os.tmpdir(), `chat_agent_${Date.now()}.py`);
        
        const pythonScript = `
import asyncio
import json
import sys
import os

# Set Google API Key from environment BEFORE importing anything
google_api_key = os.environ.get('GOOGLE_API_KEY')
if not google_api_key:
    print(json.dumps({"output": "Error: GOOGLE_API_KEY not set", "success": False, "error": "GOOGLE_API_KEY environment variable is missing"}), file=sys.stdout)
    sys.exit(1)

# Set the API key in environment before importing Google libraries
os.environ['GOOGLE_API_KEY'] = google_api_key

# Add project root to path
project_root = "${projectRoot.replace(/\\/g, '/')}"
sys.path.insert(0, project_root)

try:
    # Import after setting environment - Google ADK reads GOOGLE_API_KEY from environment automatically
    # Make sure it's set before importing
    if not os.environ.get('GOOGLE_API_KEY'):
        raise ValueError("GOOGLE_API_KEY not found in environment")
    
    from agents.conversational_prd_agent import conversational_prd_agent
    from google.adk.runners import InMemoryRunner
    
    async def run():
        try:
            runner = InMemoryRunner(agent=conversational_prd_agent)
            prompt = ${JSON.stringify(fullPrompt)}
            
            # Redirect stdout to stderr for debug messages
            print("Starting agent run...", file=sys.stderr)
            print(f"Prompt length: {len(prompt)}", file=sys.stderr)
            
            events = await runner.run_debug(prompt)
            
            output = ""
            for event in events:
                # Send all non-JSON output to stderr
                if hasattr(event, 'content') and event.content:
                    if hasattr(event.content, 'parts'):
                        for part in event.content.parts:
                            if hasattr(part, 'text'):
                                # Send intermediate messages to stderr
                                if not event.is_final_response():
                                    print(part.text, file=sys.stderr)
                                else:
                                    output = part.text
            
            # Only output JSON to stdout
            result = {"output": output, "success": True}
            print(json.dumps(result), file=sys.stdout)
            sys.stdout.flush()
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            # Print full error to stderr for debugging
            print(f"Full error traceback:", file=sys.stderr)
            print(error_trace, file=sys.stderr)
            error_result = {"output": f"Error: {str(e)}", "success": False, "error": str(e), "traceback": error_trace}
            print(json.dumps(error_result), file=sys.stdout)
            sys.stdout.flush()
            sys.exit(1)
    
    asyncio.run(run())
except Exception as e:
    import traceback
    error_result = {"output": f"Import/Setup Error: {str(e)}", "success": False, "error": str(e), "traceback": traceback.format_exc()}
    print(json.dumps(error_result), file=sys.stdout)
    sys.stdout.flush()
    sys.exit(1)
        `;

        fs.writeFileSync(tempScriptPath, pythonScript);
        console.log('[CHAT API] Created temp script:', tempScriptPath);

        const pythonProcess = spawn(pythonCmd, [tempScriptPath], {
          cwd: projectRoot,
          env: { 
            ...process.env, 
            PYTHONPATH: projectRoot,
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
          },
        });

        let responseData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data: Buffer) => {
          const text = data.toString();
          console.log('[CHAT API] Python stdout:', text.substring(0, 200));
          responseData += text;
        });

        pythonProcess.stderr.on('data', (data: Buffer) => {
          const text = data.toString();
          console.log('[CHAT API] Python stderr:', text);
          errorData += text;
        });

        // Add timeout (120 seconds - Gemini can take time for complex responses)
        const timeout = setTimeout(() => {
          console.error('[CHAT API] Python process timeout');
          pythonProcess.kill();
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore cleanup errors
          }
          resolve(
            NextResponse.json(
              {
                success: false,
                error: 'Request timeout - agent took too long to respond',
                details: 'The agent process exceeded 120 seconds. This might be due to a complex query or API delays. Please try again with a simpler message.',
              },
              { status: 500 }
            )
          );
        }, 120000);

        pythonProcess.on('close', (code: number) => {
          clearTimeout(timeout);
          console.log('[CHAT API] Python process closed with code:', code);
          console.log('[CHAT API] Response data length:', responseData.length);
          console.log('[CHAT API] Error data length:', errorData.length);

          // Clean up temp file
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            console.warn('[CHAT API] Failed to delete temp file:', e);
          }

          if (code !== 0) {
            console.error('[CHAT API] Python process error. Code:', code);
            console.error('[CHAT API] Full error output:', errorData);
            console.error('[CHAT API] Response data:', responseData);
            
            // Check if it's a Python version error
            if (errorData.includes('Python 3.10') || errorData.includes('MCP requires')) {
              resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: 'Python version too old',
                    details: 'Google ADK requires Python 3.10+, but you have Python 3.9.6.\n\nTo fix:\n1. Install Python 3.10+: brew install python@3.11\n2. Or download from: https://www.python.org/downloads/\n3. Restart the dev server after installing',
                    code: code,
                  },
                  { status: 500 }
                )
              );
            } else {
              // Show full error details
              const fullErrorDetails = errorData || responseData || 'Python process exited with non-zero code';
              resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: 'Failed to process with conversational agent',
                    details: fullErrorDetails.length > 2000 ? fullErrorDetails.substring(0, 2000) + '...' : fullErrorDetails,
                    code: code,
                    rawError: errorData,
                    rawResponse: responseData,
                  },
                  { status: 500 }
                )
              );
            }
            return;
          }

        try {
          // Try to parse JSON from response
          // The response might have extra text, so try to extract JSON
          const trimmedResponse = responseData.trim();
          console.log('[CHAT API] Raw response length:', trimmedResponse.length);
          console.log('[CHAT API] First 500 chars:', trimmedResponse.substring(0, 500));
          
          // Try to find JSON object in the response
          let jsonStart = trimmedResponse.indexOf('{');
          let jsonEnd = trimmedResponse.lastIndexOf('}') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            // If no JSON found, check if there's partial output in stderr
            const partialOutput = errorData.includes('output') ? errorData : trimmedResponse;
            console.log('[CHAT API] No JSON found, using raw output');
            const response: ChatMessage = {
              role: 'assistant',
              content: partialOutput || 'I received your message but had trouble generating a response.',
              timestamp: new Date().toISOString(),
            };
            resolve(
              NextResponse.json({
                success: true,
                message: response,
                conversationId: Date.now().toString(),
              })
            );
            return;
          }
          
          const jsonString = trimmedResponse.substring(jsonStart, jsonEnd);
          console.log('[CHAT API] Extracted JSON:', jsonString.substring(0, 200));
          
          let result;
          try {
            result = JSON.parse(jsonString);
          } catch (parseErr) {
            // If JSON parsing fails, try to extract just the output field
            const outputMatch = trimmedResponse.match(/"output"\s*:\s*"([^"]*)"/);
            if (outputMatch) {
              result = { output: outputMatch[1], success: true };
            } else {
              // Use the raw response as output
              result = { output: trimmedResponse, success: true };
            }
          }
          
          console.log('[CHAT API] Parsed result, success:', result.success);
          
          const response: ChatMessage = {
            role: 'assistant',
            content: result.output || 'I received your message but had trouble generating a response.',
            timestamp: new Date().toISOString(),
          };

          console.log('[CHAT API] Sending success response');
          resolve(
            NextResponse.json({
              success: true,
              message: response,
              conversationId: Date.now().toString(),
            })
          );
        } catch (parseError) {
          console.error('[CHAT API] Failed to parse Python output');
          console.error('[CHAT API] Parse error:', parseError);
          console.error('[CHAT API] Raw response:', responseData);
          console.error('[CHAT API] Error data:', errorData);
          
          // Try to extract any error message from the response
          let errorMessage = 'Failed to parse agent response';
          if (responseData) {
            const errorMatch = responseData.match(/Error[^}]*/);
            if (errorMatch) {
              errorMessage = errorMatch[0];
            }
          }
          
          resolve(
            NextResponse.json(
              {
                success: false,
                error: errorMessage,
                details: `Response: ${responseData.substring(0, 500)}...\n\nError: ${errorData.substring(0, 500)}`,
              },
              { status: 500 }
            )
          );
        }
        });

        pythonProcess.on('error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[CHAT API] Python process spawn error:', error);
          try {
            fs.unlinkSync(tempScriptPath);
          } catch (e) {
            // Ignore
          }
          resolve(
            NextResponse.json(
              {
                success: false,
                error: 'Failed to spawn Python process',
                details: error.message,
              },
              { status: 500 }
            )
          );
        });
      };
      
      // Start trying Python versions
      tryNextPython(0);
    });
  } catch (error) {
    console.error('[CHAT API] Top-level error:', error);
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
