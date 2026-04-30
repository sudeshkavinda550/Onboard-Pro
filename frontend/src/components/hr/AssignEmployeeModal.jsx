import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon, UserIcon } from '@heroicons/react/24/outline';

const AssignEmployeeModal = ({ template, employees, loading, onAssign, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      return;
    }

    setAssigning(true);
    try {
      // Assign to each selected employee
      for (const employeeId of selectedEmployees) {
        await onAssign(employeeId);
      }
      onClose();
    } catch (error) {
      console.error('Error assigning:', error);
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      not_started: { label: 'Not Started', class: 'bg-gray-100 text-gray-700' },
      in_progress: { label: 'In Progress', class: 'bg-amber-100 text-amber-700' },
      completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
    };
    const badge = badges[status] || badges.not_started;
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Assign Template</h2>
              <p className="text-sm text-white/80 mt-1">{template.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name, email, ID, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>{selectedEmployees.length} employee(s) selected</span>
              <span>{filteredEmployees.length} employee(s) available</span>
            </div>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.includes(employee.id);
                return (
                  <div
                    key={employee.id}
                    onClick={() => toggleEmployee(employee.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          isSelected ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-400'
                        }`}
                      >
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-500">
                          {employee.email} • ID: {employee.employee_id}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700">
                            {employee.position}
                          </span>
                          {employee.department_name && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700">
                              {employee.department_name}
                            </span>
                          )}
                          {getStatusBadge(employee.onboarding_status || 'not_started')}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckIcon className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {searchTerm ? 'No employees found matching your search' : 'No employees available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={assigning}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedEmployees.length === 0 || assigning}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? 'Assigning...' : `Assign to ${selectedEmployees.length} Employee(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;