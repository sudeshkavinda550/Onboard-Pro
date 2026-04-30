import axiosInstance from './axios';

export const documentApi = {
  uploadDocument: (formData) => 
    axiosInstance.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getMyDocuments: () => axiosInstance.get('/documents/my-documents'),
  getDocumentById: (documentId) => axiosInstance.get(`/documents/${documentId}`),
  deleteDocument: (documentId) => axiosInstance.delete(`/documents/${documentId}`),
  downloadDocument: (documentId) => 
    axiosInstance.get(`/documents/${documentId}/download`, { responseType: 'blob' }),
  
  getAllDocuments: (params = {}) => axiosInstance.get('/hr/documents', { params }),
  approveDocument: (documentId) => 
    axiosInstance.put(`/hr/documents/${documentId}/approve`),
  rejectDocument: (documentId, reason) => 
    axiosInstance.put(`/hr/documents/${documentId}/reject`, { reason }),
  getPendingDocuments: () => axiosInstance.get('/hr/documents/pending'),
};