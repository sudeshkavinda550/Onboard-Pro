import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const TASK_THEMES = [
  { bar: '#3b82f6', badge: { background: '#dbeafe', color: '#1d4ed8' }, border: '#bfdbfe' },
  { bar: '#22c55e', badge: { background: '#dcfce7', color: '#15803d' }, border: '#bbf7d0' },
  { bar: '#a855f7', badge: { background: '#f3e8ff', color: '#7e22ce' }, border: '#e9d5ff' },
  { bar: '#f97316', badge: { background: '#ffedd5', color: '#c2410c' }, border: '#fed7aa' },
];

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  background: '#fff',
  fontSize: 13.5,
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const TemplateForm = ({ template, onSubmit, onCancel }) => {
  const [tasks, setTasks] = useState(template?.tasks || []);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await api.get('/departments');
      setDepartments(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: template?.name || '',
      description: template?.description || '',
      department_id: template?.department_id || '',
      estimated_completion_days: template?.estimated_completion_days || 7,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'At least 2 characters').max(200, 'Max 200 characters').required('Template name is required'),
      description: Yup.string().max(1000, 'Max 1000 characters'),
      department_id: Yup.string().test('is-uuid-or-empty', 'Invalid department', (value) => {
        if (!value) return true;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      }),
      estimated_completion_days: Yup.number().min(1).max(365).integer('Must be a whole number'),
    }),
    onSubmit: (values) => {
      onSubmit(cleanFormData(values, tasks));
    },
  });

  const cleanFormData = (values, tasksList) => {
    const cleaned = {
      name: values.name?.trim(),
      description: values.description?.trim() || '',
      estimated_completion_days: values.estimated_completion_days,
    };
    if (values.department_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(values.department_id)) cleaned.department_id = values.department_id;
    }
    if (tasksList && tasksList.length > 0) {
      cleaned.tasks = tasksList.map((task, index) => {
        const cleanedTask = {
          title: task.title?.trim(),
          task_type: task.type || task.task_type || 'read',
          order_index: index + 1,
          is_required: task.isRequired !== undefined ? task.isRequired : task.is_required !== undefined ? task.is_required : true,
        };
        if (task.description?.trim()) cleanedTask.description = task.description.trim();
        const estimatedTime = task.estimatedTime || task.estimated_time;
        if (estimatedTime) cleanedTask.estimated_time = estimatedTime;
        if (task.resource_url?.trim()) cleanedTask.resource_url = task.resource_url.trim();
        return cleanedTask;
      });
    }
    return cleaned;
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), title: '', description: '', type: 'read', isRequired: true, estimatedTime: 30, order: tasks.length + 1, resource_url: null }]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  const moveTask = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const updated = [...tasks];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      setTasks(updated);
    } else if (direction === 'down' && index < tasks.length - 1) {
      const updated = [...tasks];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      setTasks(updated);
    }
  };

  const focusStyle = (e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; };
  const blurStyle = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ height: 5, background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' }} />

      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #eef2ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>
        <button
          onClick={onCancel}
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <XMarkIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'slideUp 0.4s ease-out 60ms both' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
              TEMPLATE NAME <span style={{ color: '#6366f1' }}>*</span>
            </label>
            <input
              type="text" id="name" name="name"
              style={{ ...INPUT_STYLE, borderColor: formik.touched.name && formik.errors.name ? '#ef4444' : '#e2e8f0' }}
              placeholder="e.g. Software Engineer Onboarding"
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              value={formik.values.name}
              onFocus={focusStyle}
            />
            {formik.touched.name && formik.errors.name && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, margin: '4px 0 0' }}>⚠ {formik.errors.name}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
              DEPARTMENT <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Optional</span>
            </label>
            {loadingDepartments ? (
              <div style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                Loading...
              </div>
            ) : (
              <select
                id="department_id" name="department_id"
                style={{ ...INPUT_STYLE }}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                value={formik.values.department_id}
                onFocus={focusStyle}
              >
                <option value="">No Department</option>
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                {departments.length === 0 && <option disabled>── Departments unavailable ──</option>}
              </select>
            )}
            <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>Department selection is optional</p>
          </div>
        </div>

        <div style={{ animation: 'slideUp 0.4s ease-out 120ms both' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
            DESCRIPTION <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Optional</span>
          </label>
          <textarea
            id="description" name="description" rows={3}
            style={{ ...INPUT_STYLE, resize: 'vertical' }}
            placeholder="Describe the purpose and scope of this template..."
            onChange={formik.handleChange}
            value={formik.values.description}
            onFocus={focusStyle}
            onBlur={e => { blurStyle(e); formik.handleBlur(e); }}
          />
          {formik.touched.description && formik.errors.description && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>⚠ {formik.errors.description}</p>
          )}
        </div>

        <div style={{ animation: 'slideUp 0.4s ease-out 180ms both' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
            ESTIMATED COMPLETION <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Optional</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number" id="estimated_completion_days" name="estimated_completion_days"
              min="1" max="365"
              style={{ ...INPUT_STYLE, width: 110 }}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              value={formik.values.estimated_completion_days}
              onFocus={focusStyle}
            />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>days to complete</span>
          </div>
          {formik.touched.estimated_completion_days && formik.errors.estimated_completion_days && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>⚠ {formik.errors.estimated_completion_days}</p>
          )}
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20, animation: 'slideUp 0.4s ease-out 240ms both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>Tasks</h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} added</p>
            </div>
            <button
              type="button" onClick={addTask}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              <PlusIcon style={{ width: 15, height: 15 }} />
              Add Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: '40px 24px', textAlign: 'center', background: '#fafafa' }}>
              <PlusIcon style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#94a3b8', margin: '0 0 2px' }}>No tasks added yet</p>
              <p style={{ fontSize: 12.5, color: '#cbd5e1', margin: 0 }}>Click "Add Task" above to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tasks.map((task, index) => {
                const theme = TASK_THEMES[index % TASK_THEMES.length];
                const taskType = task.type || task.task_type || 'read';
                return (
                  <div key={task.id} style={{ borderRadius: 16, border: `1.5px solid ${theme.border}`, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ height: 4, background: theme.bar }} />

                    <div style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: theme.badge.background, color: theme.badge.color }}>
                            Task {index + 1}
                          </span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[
                              { dir: 'up', disabled: index === 0, icon: <ChevronUpIcon style={{ width: 14, height: 14 }} /> },
                              { dir: 'down', disabled: index === tasks.length - 1, icon: <ChevronDownIcon style={{ width: 14, height: 14 }} /> },
                            ].map(btn => (
                              <button
                                key={btn.dir} type="button"
                                onClick={() => moveTask(index, btn.dir)}
                                disabled={btn.disabled}
                                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 6, color: btn.disabled ? '#e2e8f0' : '#94a3b8', cursor: btn.disabled ? 'not-allowed' : 'pointer' }}
                              >
                                {btn.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button" onClick={() => removeTask(index)}
                          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <TrashIcon style={{ width: 14, height: 14 }} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: '0.05em' }}>TITLE *</label>
                          <input type="text" value={task.title} onChange={e => updateTask(index, 'title', e.target.value)} style={{ ...INPUT_STYLE }} placeholder="Enter task title" onFocus={focusStyle} onBlur={blurStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: '0.05em' }}>TYPE *</label>
                          <select value={taskType} onChange={e => updateTask(index, 'type', e.target.value)} style={{ ...INPUT_STYLE }} onFocus={focusStyle} onBlur={blurStyle}>
                            <option value="read">Read Document</option>
                            <option value="upload">Upload File</option>
                            <option value="watch">Watch Video</option>
                            <option value="meeting">Schedule Meeting</option>
                            <option value="form">Complete Form</option>
                            <option value="training">Training</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: '0.05em' }}>DESCRIPTION</label>
                        <textarea value={task.description} onChange={e => updateTask(index, 'description', e.target.value)} rows={2} style={{ ...INPUT_STYLE, resize: 'vertical' }} placeholder="Describe what needs to be done" onFocus={focusStyle} onBlur={blurStyle} />
                      </div>

                      {(taskType === 'read' || taskType === 'watch') && (
                        <div style={{ marginTop: 12 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: '0.05em' }}>RESOURCE URL</label>
                          <input type="url" value={task.resource_url || ''} onChange={e => updateTask(index, 'resource_url', e.target.value)} style={{ ...INPUT_STYLE }} placeholder="https://example.com/document.pdf" onFocus={focusStyle} onBlur={blurStyle} />
                        </div>
                      )}

                      {taskType === 'upload' && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <DocumentArrowUpIcon style={{ width: 18, height: 18, color: '#3b82f6', flexShrink: 0, marginTop: 1 }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', margin: '0 0 2px' }}>File Upload Task</p>
                            <p style={{ fontSize: 12, color: '#3b82f6', margin: 0 }}>Employees will upload documents. Specify required files in the description.</p>
                          </div>
                        </div>
                      )}

                      {taskType === 'form' && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <DocumentArrowUpIcon style={{ width: 18, height: 18, color: '#a855f7', flexShrink: 0, marginTop: 1 }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#6b21a8', margin: '0 0 2px' }}>Form Completion Task</p>
                            <p style={{ fontSize: 12, color: '#a855f7', margin: 0 }}>Employees will complete a form. Data will be saved to their profile.</p>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 14 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={task.isRequired !== undefined ? task.isRequired : task.is_required !== undefined ? task.is_required : true}
                            onChange={e => updateTask(index, 'isRequired', e.target.checked)}
                            style={{ width: 15, height: 15, accentColor: '#6366f1', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Required</span>
                        </label>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: '0.05em' }}>EST. TIME (MIN)</label>
                          <input
                            type="number"
                            value={task.estimatedTime || task.estimated_time || 30}
                            onChange={e => updateTask(index, 'estimatedTime', parseInt(e.target.value) || 0)}
                            min="1"
                            style={{ ...INPUT_STYLE, width: 100 }}
                            onFocus={focusStyle} onBlur={blurStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid #f1f5f9', animation: 'slideUp 0.4s ease-out 300ms both' }}>
          <button
            type="button" onClick={onCancel}
            style={{ padding: '10px 22px', fontSize: 13.5, fontWeight: 700, color: '#475569', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button
            type="submit" disabled={formik.isSubmitting}
            style={{ padding: '10px 22px', fontSize: 13.5, fontWeight: 700, color: '#fff', background: '#6366f1', border: 'none', borderRadius: 10, cursor: formik.isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: formik.isSubmitting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'background 0.15s' }}
            onMouseEnter={e => { if (!formik.isSubmitting) e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
          >
            {formik.isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;