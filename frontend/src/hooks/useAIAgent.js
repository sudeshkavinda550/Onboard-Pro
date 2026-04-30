import { useState } from 'react';
import { ONBOARDING_TOOLS, executeTool, resetReminderGuard } from '../tools/onboardingTools';

// ── GLOBAL RESPONSE SANITIZER ─────────────────────────────────────────────────
// Strips ALL unwanted patterns from every AI response before showing to the user.
// Handles: placeholders, raw UUIDs, internal tool names, debug text, markdown artifacts
function sanitizeResponse(text) {
  if (!text) return text;

  let clean = text;

  // 1. Remove placeholder tokens the LLM sometimes forgets to replace
  clean = clean.replace(/TASKS_FROM_GET_EMPLOYEE_TASKS/gi, '');
  clean = clean.replace(/TASK_LIST_FROM_TOOL/gi, '');
  clean = clean.replace(/\[task[s]?\s*(list|names?|here)?\]/gi, '');
  clean = clean.replace(/\{task[s]?\}/gi, '');
  clean = clean.replace(/<task[s]?>/gi, '');
  clean = clean.replace(/\[PENDING_TASKS\]/gi, '');
  clean = clean.replace(/\[INSERT[^\]]*\]/gi, '');

  // 2. Remove raw UUIDs leaked into user-facing text
  // ONLY strip bare UUIDs — keep anything after "EMP:", "ID:", "UUID:" labels
  clean = clean.replace(/(?<!(EMP|ID|UUID)[:\s]{1,3})[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[ID]');

  // 3. Remove internal tool/function names that leaked into response
  clean = clean.replace(/\bget_employee_tasks\b/g, 'task lookup');
  clean = clean.replace(/\bget_employee_by_id\b/g, 'employee lookup');
  clean = clean.replace(/\bget_all_employees\b/g, 'employee list');
  clean = clean.replace(/\bget_employee_progress\b/g, 'progress check');
  clean = clean.replace(/\bget_employees_by_status\b/g, 'status filter');
  clean = clean.replace(/\bget_company_analytics\b/g, 'company analytics');
  clean = clean.replace(/\bget_department_analytics\b/g, 'department analytics');
  clean = clean.replace(/\bget_employee_documents\b/g, 'document lookup');
  clean = clean.replace(/\bfind_employee_by_name\b/g, 'employee search');
  clean = clean.replace(/\bsend_reminder\b/g, 'reminder');

  // 4. Remove raw JSON blobs that leaked into response
  clean = clean.replace(/```json[\s\S]*?```/gi, '');
  clean = clean.replace(/\{"employee_id":[^}]+\}/g, '');

  // 5. Remove "function call" / "tool call" debug language
  clean = clean.replace(/I(?:'ll| will) (?:now )?call(?: the)? \w+ (?:function|tool)[^\n]*/gi, '');
  clean = clean.replace(/Calling(?: the)? \w+ (?:function|tool)[^\n]*/gi, '');
  clean = clean.replace(/Using(?: the)? \w+ (?:function|tool)[^\n]*/gi, '');
  clean = clean.replace(/\bfunction call\b/gi, '');
  clean = clean.replace(/\btool call\b/gi, '');
  clean = clean.replace(/\[tool_call\]/gi, '');

  // 6. Remove repeated colons / broken sentence fragments left by placeholder removal
  clean = clean.replace(/:\s*,/g, ':');          // "tasks: , Task2" → "tasks: Task2"
  clean = clean.replace(/:\s*\./g, '.');          // "tasks:." → "."
  clean = clean.replace(/,\s*,/g, ',');           // double commas
  clean = clean.replace(/\n{3,}/g, '\n\n');       // more than 2 blank lines → 2
  clean = clean.replace(/[ \t]{2,}/g, ' ');       // multiple spaces → one

  // 7. Clean up lines that are now empty after stripping
  clean = clean
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return clean.trim();
}

// ── FRIENDLY ERROR MESSAGES ───────────────────────────────────────────────────
// Converts raw API/technical errors into clean user-facing messages
function sanitizeError(text) {
  if (!text) return text;

  // Groq rate limit
  if (text.includes('Rate limit reached') || text.includes('rate_limit_exceeded')) {
    const waitMatch = text.match(/try again in (\d+m[\d.]+s)/i);
    const wait = waitMatch ? ` Please wait ${waitMatch[1]} and try again.` : ' Please wait a few minutes and try again.';
    return `⚠️ AI usage limit reached for today.${wait}`;
  }

  // Auth errors
  if (text.includes('401') || text.includes('Unauthorized') || text.includes('Authentication failed')) {
    return '🔒 Session expired. Please log in again.';
  }

  // Backend down
  if (text.includes('ECONNREFUSED') || text.includes('localhost:5000') || text.includes('Network Error')) {
    return '🔌 Cannot reach the backend server. Make sure it is running on port 5000.';
  }

  // Generic Groq API error — strip the org ID and technical details
  if (text.includes('Groq API error')) {
    return '⚠️ AI service error. Please try again in a moment.';
  }

  return text;
}

const SYSTEM_PROMPT = `You are an intelligent HR Onboarding Assistant connected to a live PostgreSQL employee database via a secure REST API.

You have tools to query real employee data. ALWAYS use tools — never guess or invent data.

RESPONSE RULES — follow strictly:
- Respond in plain, friendly English only — no technical terms, no function names, no raw JSON
- Never mention tool names like get_employee_tasks, send_reminder, get_all_employees in your response
- When showing employee IDs, always show the EMP code (e.g. EMP2602521) — never show raw UUIDs
- Never use placeholder text — always wait for tool results and use the real data

EMPLOYEE ID HANDLING:
- Tools accept either a UUID or an EMP-format code like EMP2602521 — pass as-is
- If you only have a name, use find_employee_by_name first

SENDING REMINDERS — follow these steps exactly:
1. Call get_employee_tasks to get the employee's real pending task list
2. Read the actual task titles from the result
3. Write the message using ONLY those real task titles — example: "Please complete: Sign NDA, Upload ID, Complete tax form"
4. Call send_reminder ONCE with that message — never use placeholders

RULES:
- Minimize tool calls — only call what is needed
- NEVER call send_reminder more than once per employee per request
- When asked who is overdue, call get_employees_by_status ONCE
- When asked for company overview, call get_company_analytics ONCE
- Format lists with bullet points
- If something fails, explain it simply without technical details
`;

export function useAIAgent() {

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hi! I'm your **Onboarding AI Assistant** 👋

I'm connected to your PostgreSQL database.

Ask me things like:
• Who is overdue on onboarding?
• Show company-wide progress stats
• What tasks are pending for John?
• Send reminder to employees
• Department analytics`,
      steps: []
    }
  ]);

  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState([]);

  async function sendMessage(userText) {

    if (!userText.trim() || thinking) return;

    const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

    if (!API_KEY) {
      alert("Groq API key missing. Check your .env file.");
      return;
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', text: userText }
    ]);

    setThinking(true);

    // RESET GUARD: clear reminder tracking and employee cache for this new request
    resetReminderGuard();

    const updatedHistory = [...history, { role: 'user', content: userText }];
    let workHistory = [...updatedHistory];
    const steps = [];
    let finalText = '';

    const MAX_LOOPS = 4; // prevents runaway tool chains

    try {

      for (let loop = 0; loop < MAX_LOOPS; loop++) {

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 512,
            tools: ONBOARDING_TOOLS,
            tool_choice: "auto",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...workHistory
            ]
          })
        });

        const data = await res.json();

        // Handle API-level errors with friendly messages
        if (!res.ok) {
          finalText = sanitizeError(`Groq API error: ${data.error?.message || res.status}`);
          break;
        }

        const aiMsg = data?.choices?.[0]?.message;

        if (!aiMsg) {
          finalText = "No response generated. Please try again.";
          break;
        }

        // No tool calls → final answer — sanitize before storing
        if (!aiMsg.tool_calls?.length) {
          // SANITIZE: clean the final response before showing to user
          finalText = sanitizeResponse(aiMsg.content || "No response generated.");

          workHistory.push({
            role: "assistant",
            content: finalText
          });

          break;
        }

        // Tool calls exist
        workHistory.push({
          role: "assistant",
          content: aiMsg.content || "",
          tool_calls: aiMsg.tool_calls
        });

        for (const call of aiMsg.tool_calls) {

          const toolName = call.function.name;

          let toolArgs = {};

          try {
            toolArgs = JSON.parse(call.function.arguments || "{}");
          } catch {
            toolArgs = {};
          }

          const result = await executeTool(toolName, toolArgs);

          steps.push({
            tool: toolName,
            input: toolArgs,
            result
          });

          workHistory.push({
            role: "tool",
            tool_call_id: call.id,
            name: toolName,
            content: result
          });

        }

      }

    } catch (err) {
      // Friendly network error
      finalText = sanitizeError(err.message) || '⚠️ Something went wrong. Please check your connection and try again.';
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "ai",
        // Final sanitize pass — catches anything that slipped through
        text: sanitizeResponse(sanitizeError(finalText)),
        steps
      }
    ]);

    setHistory(workHistory);
    setThinking(false);
  }

  function clearChat() {

    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        text: 'Chat cleared. How can I help with onboarding?',
        steps: []
      }
    ]);

    setHistory([]);
  }

  return {
    messages,
    thinking,
    sendMessage,
    clearChat
  };
}