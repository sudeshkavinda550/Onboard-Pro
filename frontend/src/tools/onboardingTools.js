import {
  agentGetAllEmployees,
  agentGetEmployeeById,
  agentGetEmployeesByStatus,
  agentGetEmployeeProgress,
  agentGetEmployeeTasks,
  agentGetDocuments,
  agentGetAnalyticsOverview,
  agentGetDepartmentStats,
  agentSendReminder,
} from '../api/agentApi';

// ── Tool Definitions (Groq / OpenAI function-calling format) ──────────────────
export const ONBOARDING_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_all_employees',
      description:
        'Get all employees with name, position, department, start date, and onboarding_status. Use when listing or searching all employees.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_employee_by_id',
      // FIXED: now accepts both UUID and EMP-format codes like EMP2602521
      description: 'Get full details of one employee. Accepts a UUID or EMP-format ID like EMP2602521.',
      parameters: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', description: 'UUID or EMP-format code e.g. EMP2602521' },
        },
        required: ['employee_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_employee_by_name',
      description: 'Search for employees by name (partial match). Returns their UUID and details.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Employee name to search for (can be partial)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_employee_progress',
      // FIXED: now accepts both UUID and EMP-format codes
      description: 'Get onboarding progress for a specific employee — total tasks, completed tasks, percent done, status. Accepts UUID or EMP-format ID.',
      parameters: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', description: 'UUID or EMP-format code e.g. EMP2602521' },
        },
        required: ['employee_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_employee_tasks',
      // FIXED: now accepts both UUID and EMP-format codes
      description:
        'Get the task list for one employee. Filter by status to find pending/overdue/completed tasks. Accepts UUID or EMP-format ID.',
      parameters: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', description: 'UUID or EMP-format code e.g. EMP2602521' },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'overdue'],
            description: 'Optional: filter by task status',
          },
        },
        required: ['employee_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_employees_by_status',
      description:
        "Get employees filtered by onboarding_status. Use 'overdue' or 'not_started' to find who needs attention.",
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['not_started', 'in_progress', 'completed', 'overdue'],
            description: 'The onboarding_status to filter by',
          },
        },
        required: ['status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_company_analytics',
      description:
        'Get company-wide onboarding stats: total employees, completed, in_progress, not_started, overdue, average progress %.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_department_analytics',
      description:
        'Get onboarding stats per department: headcount, average progress %, completion count.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_employee_documents',
      // FIXED: now accepts both UUID and EMP-format codes
      description:
        'Get documents uploaded by an employee. Filter by status to find pending/approved/rejected. Accepts UUID or EMP-format ID.',
      parameters: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', description: 'UUID or EMP-format code e.g. EMP2602521' },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            description: 'Optional: filter by document status',
          },
        },
        required: ['employee_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_reminder',
      // FIXED: enforces ONE call per employee with ALL tasks combined in one message
      description:
        'Send ONE reminder to an employee. You MUST call get_employee_tasks first and use the REAL task titles in the message. NEVER use placeholders like TASKS_FROM_GET_EMPLOYEE_TASKS. NEVER call this more than once per employee.',
      parameters: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', description: 'UUID or EMP-format code e.g. EMP2602521' },
          message: {
            type: 'string',
            description: 'Message with REAL task names only. Example: "Please complete: Sign NDA, Upload passport, Complete tax form". Never use placeholder text.',
          },
        },
        required: ['employee_id', 'message'],
      },
    },
  },
];

// Get API URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// ── EMPLOYEE CACHE: avoids re-fetching all employees on every resolveToUUID call ──
// Saves ~2000 tokens per multi-employee request (e.g. sending bulk reminders)
let _employeeCache     = null;
let _employeeCacheTime = 0;
const CACHE_TTL        = 30_000; // reuse for 30 seconds, then refresh

// ── DUPLICATE REMINDER GUARD: prevents sending 2+ reminders to same employee ──
const _remindersSent = new Set();

export function resetReminderGuard() {
  // Called at start of every new user message — clears both guard and cache
  _remindersSent.clear();
  _employeeCache     = null; // force fresh fetch on next request
  _employeeCacheTime = 0;
}

// ── KEY FIX: Resolves EMP-format IDs (e.g. EMP2602521) to real UUIDs ─────────
// Uses cache so multiple tools in one request share one fetch instead of many
async function resolveToUUID(idOrCode) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Already a valid UUID — no lookup needed
  if (uuidRegex.test(idOrCode)) return idOrCode;

  // Use cache if fresh — avoids redundant API calls within the same request
  if (!_employeeCache || Date.now() - _employeeCacheTime > CACHE_TTL) {
    const allRes       = await agentGetAllEmployees();
    _employeeCache     = allRes.data?.data || allRes.data;
    _employeeCacheTime = Date.now();
  }

  const match = _employeeCache?.find(
    e => e.employee_id?.toLowerCase() === idOrCode.toLowerCase()
  );

  if (!match) throw new Error(`No employee found with ID code "${idOrCode}". Try find_employee_by_name instead.`);

  return match.id; // return the real UUID
}

export async function executeTool(name, args) {
  try {
    // Check if user is authenticated first
    const token = localStorage.getItem('token');
    if (!token) {
      handleAuthError();
      throw new Error('Not authenticated');
    }

    if (name === 'get_all_employees') {
      const res       = await agentGetAllEmployees();
      const employees = res.data?.data || res.data;
      // Populate cache so resolveToUUID doesn't need a separate fetch
      _employeeCache     = employees;
      _employeeCacheTime = Date.now();
      if (!employees?.length) return 'No employees found.';
      // Include employee_id (EMP code) so the LLM can show it to HR users
      return employees
        .map(e =>
          `${e.name} | EMP: ${e.employee_id || 'N/A'} | ${e.position || 'N/A'} | ${e.department_name || 'N/A'} | ${e.onboarding_status}`
        )
        .join('\n');
    }

    if (name === 'find_employee_by_name') {
      // Use cache if available — avoids a second full fetch
      if (!_employeeCache || Date.now() - _employeeCacheTime > CACHE_TTL) {
        const res      = await agentGetAllEmployees();
        _employeeCache     = res.data?.data || res.data;
        _employeeCacheTime = Date.now();
      }
      const employees = _employeeCache;

      if (!employees?.length) return 'No employees found.';

      // Case-insensitive partial name search
      const searchName = args.name.toLowerCase();
      const matches = employees.filter(e =>
        e.name.toLowerCase().includes(searchName)
      );

      if (matches.length === 0) {
        return `No employees found with name containing "${args.name}".`;
      }

      if (matches.length === 1) {
        const e = matches[0];
        return `Found employee:\n• Name: ${e.name}\n• ID: ${e.id}\n• Position: ${e.position || 'N/A'}\n• Department: ${e.department_name || 'N/A'}`;
      }

      // Multiple matches
      return `Found ${matches.length} employees:\n` + matches
        .map(e => `• ${e.name} | ID: ${e.id} | ${e.position || 'N/A'} | ${e.department_name || 'N/A'}`)
        .join('\n') + '\n\nPlease specify which one by using their ID.';
    }

    if (name === 'get_employee_by_id') {
      // STEP 1: Resolve EMP code → UUID if needed
      const uuid = await resolveToUUID(args.employee_id);
      // STEP 2: Fetch employee with the real UUID
      const res = await agentGetEmployeeById(uuid);
      const e   = res.data?.data || res.data;
      return [
        `Name: ${e.name}`,
        `Email: ${e.email}`,
        `Employee ID: ${e.employee_id || 'N/A'}`,
        `Position: ${e.position || 'N/A'}`,
        `Department: ${e.department_name || 'N/A'}`,
        `Start Date: ${e.start_date?.slice(0, 10) || 'N/A'}`,
        `Onboarding Status: ${e.onboarding_status}`,
        `Phone: ${e.phone || 'Not provided'}`,
        `Manager: ${e.manager_name || 'Not assigned'}`,
        `UUID: ${e.id}`,
      ].join('\n');
    }

    if (name === 'get_employee_progress') {
      // STEP 1: Resolve EMP code → UUID if needed
      const uuid = await resolveToUUID(args.employee_id);
      // STEP 2: Fetch progress with real UUID
      const res = await agentGetEmployeeProgress(uuid);
      const p   = res.data?.data || res.data;
      return [
        `Employee: ${p.name}`,
        `Progress: ${p.percent}% complete`,
        `Tasks: ${p.completed_tasks} of ${p.total_tasks} done`,
        `Onboarding Status: ${p.onboarding_status}`,
      ].join('\n');
    }

    if (name === 'get_employee_tasks') {
      // STEP 1: Resolve EMP code → UUID if needed
      const uuid  = await resolveToUUID(args.employee_id);
      // STEP 2: Fetch tasks with real UUID
      const res   = await agentGetEmployeeTasks(uuid, args.status || null);
      const tasks = res.data?.data || res.data;
      if (!tasks?.length)
        return args.status
          ? `No ${args.status} tasks found for this employee.`
          : 'No tasks assigned to this employee.';
      return tasks
        .map(t =>
          `• [${t.task_type?.toUpperCase()}] ${t.title} — ${t.status}` +
          (t.due_date       ? ` | Due: ${t.due_date.slice(0, 10)}`       : '') +
          (t.completed_date ? ` | Done: ${t.completed_date.slice(0, 10)}` : '')
        )
        .join('\n');
    }

    if (name === 'get_employees_by_status') {
      const res       = await agentGetEmployeesByStatus(args.status);
      const employees = res.data?.data || res.data;
      if (!employees?.length) return `No employees with status "${args.status}".`;
      return (
        `${employees.length} employee(s) — status: ${args.status}\n` +
        employees
          .map(e => `• ${e.name} | ${e.position || 'N/A'} | ID: ${e.id} | Started: ${e.start_date?.slice(0, 10) || 'N/A'}`)
          .join('\n')
      );
    }

    if (name === 'get_company_analytics') {
      const res = await agentGetAnalyticsOverview();
      const s   = res.data?.data || res.data;
      return [
        `Total Employees:  ${s.total_employees}`,
        `Completed:        ${s.completed}`,
        `In Progress:      ${s.in_progress}`,
        `Not Started:      ${s.not_started}`,
        `Overdue:          ${s.overdue}`,
        `Avg Progress:     ${s.avg_progress_percent}%`,
      ].join('\n');
    }

    if (name === 'get_department_analytics') {
      const res   = await agentGetDepartmentStats();
      const depts = res.data?.data || res.data;
      if (!depts?.length) return 'No department data available.';
      return depts
        .map(d =>
          `• ${d.department_name}: ${d.headcount} employees | ${d.avg_progress}% avg | ${d.completed_count} fully onboarded`
        )
        .join('\n');
    }

    if (name === 'get_employee_documents') {
      // STEP 1: Resolve EMP code → UUID if needed
      const uuid = await resolveToUUID(args.employee_id);
      // STEP 2: Fetch documents with real UUID
      const res  = await agentGetDocuments(uuid, args.status || null);
      const docs = res.data?.data || res.data;
      if (!docs?.length) return 'No documents found for this employee.';
      return docs
        .map(d =>
          `• ${d.original_filename} | ${d.status} | Uploaded: ${d.uploaded_date?.slice(0, 10)}` +
          (d.rejection_reason ? ` | Rejection reason: ${d.rejection_reason}` : '')
        )
        .join('\n');
    }

    if (name === 'send_reminder') {
      // STEP 1: Resolve EMP code → UUID if needed
      const uuid = await resolveToUUID(args.employee_id);

      // STEP 2: DUPLICATE GUARD — block if already sent to this employee this request
      if (_remindersSent.has(uuid)) {
        return `Reminder already sent to this employee in this request. Skipping duplicate.`;
      }

      // STEP 3: SANITIZE — block placeholder text the LLM sometimes sends instead of real tasks
      const placeholderPatterns = [
        /TASKS_FROM_GET_EMPLOYEE_TASKS/i,
        /\[task[s]?\s*(list|names?)?\]/i,
        /\{task[s]?\}/i,
        /<task[s]?>/i,
        /pending task[s]?\s*:\s*$/i, // message ends with colon and no actual tasks
      ];
      const hasPlaceholder = placeholderPatterns.some(p => p.test(args.message));
      if (hasPlaceholder) {
        // Return an instruction so the LLM corrects itself
        return `ERROR: Message contains placeholder text instead of real task names. You must call get_employee_tasks first, read the actual task titles from the result, then call send_reminder again with the real task names in the message.`;
      }

      _remindersSent.add(uuid); // mark as sent

      // STEP 4: Send the reminder with real task names
      const res  = await agentSendReminder(uuid, args.message);
      const data = res.data?.data || res.data;
      return `✅ Reminder sent to ${data.sent_to_name} (${data.sent_to_email})\nMessage: "${args.message}"`;
    }

    return `Unknown tool: ${name}`;

  } catch (err) {
    // Check for authentication errors
    if (err.response?.status === 401 || err.message === 'Not authenticated') {
      handleAuthError();
      return `Authentication failed. Please log in again.`;
    }

    // Graceful error — AI reports it to HR instead of crashing
    const msg = err.response?.data?.message || err.message;
    return `Error from ${name}: ${msg}. Check that your backend is running at ${API_BASE_URL}.`;
  }
}

// Handle authentication errors
function handleAuthError() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// ── UI metadata ───────────────────────────────────────────────────────────────
export const TOOL_META = {
  get_all_employees:        { icon: '👥', label: 'Loading employees',       color: '#0891b2' },
  find_employee_by_name:    { icon: '🔍', label: 'Finding employee',        color: '#2563eb' },
  get_employee_by_id:       { icon: '👤', label: 'Getting employee details', color: '#2563eb' },
  get_employee_progress:    { icon: '📊', label: 'Checking progress',       color: '#2563eb' },
  get_employee_tasks:       { icon: '📋', label: 'Fetching tasks',          color: '#d97706' },
  get_employees_by_status:  { icon: '⚠️', label: 'Filtering by status',    color: '#dc2626' },
  get_company_analytics:    { icon: '📈', label: 'Computing stats',         color: '#7c3aed' },
  get_department_analytics: { icon: '🏢', label: 'Department breakdown',    color: '#7c3aed' },
  get_employee_documents:   { icon: '📂', label: 'Fetching documents',      color: '#0891b2' },
  send_reminder:            { icon: '📧', label: 'Sending reminder',        color: '#d97706' },
};