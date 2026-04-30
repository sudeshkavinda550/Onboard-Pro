import { useState, useCallback } from 'react';
import { taskApi } from '../api';
import { toast } from 'react-toastify';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksResponse, progressResponse] = await Promise.all([
        taskApi.getMyTasks(),
        taskApi.getTaskProgress()
      ]);
      setTasks(tasksResponse.data || []);
      setProgress(progressResponse.data || { completed: 0, total: 0, percentage: 0 });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      await taskApi.updateTaskStatus(taskId, { status });
      await fetchTasks();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  }, [fetchTasks]);

  const uploadTaskDocument = useCallback(async (taskId, formData) => {
    try {
      await taskApi.uploadTaskDocument(taskId, formData);
      await fetchTasks();
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  }, [fetchTasks]);

  const markTaskAsRead = useCallback(async (taskId) => {
    try {
      await taskApi.markTaskAsRead(taskId);
      await fetchTasks();
      toast.success('Task marked as read');
    } catch (error) {
      console.error('Error marking task as read:', error);
      toast.error('Failed to mark task as read');
    }
  }, [fetchTasks]);

  return {
    tasks,
    progress,
    loading,
    fetchTasks,
    updateTaskStatus,
    uploadTaskDocument,
    markTaskAsRead
  };
};

export default useTasks;