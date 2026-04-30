import React from 'react';
import TemplateForm from '../../components/hr/TemplateForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateTemplate = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      // TODO: Replace with actual API call
      // await templateApi.createTemplate(data);
      toast.success('Template created successfully');
      navigate('/hr/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleCancel = () => {
    navigate('/hr/templates');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Template</h1>
          <p className="mt-1 text-sm text-gray-600">
            Design a custom onboarding template for your employees
          </p>
        </div>
      </div>

      <TemplateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateTemplate;