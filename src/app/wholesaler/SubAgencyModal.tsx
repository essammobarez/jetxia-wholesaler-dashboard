'use client';
import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { X, ShieldCheck, KeyRound, FilePenLine, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { PermissionModal } from './subAgentModal/PermissionModal';
import { EditAgentModal } from './subAgentModal/EditAgentModal';
import { DeleteConfirmationModal } from './subAgentModal/DeleteConfirmationModal';
import { ResetPasswordModal } from './subAgentModal/ResetPasswordModal';

export type SubAgency = {
  _id: string;
  firstName: string;
  lastName:string;
  email: string;
  permissions: string[];
  status: string;
  createdAt: string;
};

export const SubAgencyModal = ({
  isOpen,
  onClose,
  agencyId,
  agencyName,
}: {
  isOpen: boolean;
  onClose: () => void;
  agencyId?: string;
  agencyName?: string;
}) => {
  const [subAgencies, setSubAgencies] = useState<SubAgency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPermissionsFor, setEditingPermissionsFor] = useState<SubAgency | null>(null);
  const [editingAgentDetailsFor, setEditingAgentDetailsFor] = useState<SubAgency | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<SubAgency | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [agentForPasswordReset, setAgentForPasswordReset] = useState<SubAgency | null>(null);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [updatingStatusForId, setUpdatingStatusForId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  
  const getAuthToken = () => {
    return document.cookie
           .split('; ')
           .find(r => r.startsWith('authToken='))
           ?.split('=')[1] || localStorage.getItem('authToken');
  };

  useEffect(() => {
    if (isOpen && agencyId) {
      const fetchSubAgencies = async () => {
        setIsLoading(true);
        setSubAgencies([]);

        const token = getAuthToken();
        if (!token) {
          toast.error('Authorization failed. Please log in again.');
          setIsLoading(false);
          onClose();
          return;
        }

        try {
          const response = await fetch(
            `${API_URL}/sub-agency/list?agencyId=${agencyId}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            }
          );

          const result = await response.json();
          if (response.ok && result.success) {
            setSubAgencies(result.data);
          } else {
            throw new Error(result.message || 'Failed to fetch sub-agencies.');
          }
        } catch (error: any) {
          console.error('API call failed:', error);
          toast.error(error.message || 'An error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubAgencies();
    }
  }, [isOpen, agencyId, onClose, API_URL]);

  const handleEditAgent = (agent: SubAgency) => setEditingAgentDetailsFor(agent);
  
  const handleAgentUpdate = (updatedAgent: SubAgency) => {
    setSubAgencies(prev =>
      prev.map(agent => (agent._id === updatedAgent._id ? updatedAgent : agent))
    );
  };

  const handlePermissions = (subAgent: SubAgency) => setEditingPermissionsFor(subAgent);

  const handleConfirmDelete = async () => {
    if (!agentToDelete || !agencyId) {
      toast.error("Cannot perform deletion: Missing agent or agency ID.");
      return;
    }
    setIsProcessingDelete(true);
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      setIsProcessingDelete(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/sub-agency/delete/${agentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ agencyId: agencyId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete agent.');
      }
      setSubAgencies(prev => prev.filter(agent => agent._id !== agentToDelete._id));
      toast.success('Agent deleted successfully.');
      setAgentToDelete(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handleResetPassword = (agent: SubAgency) => {
    setAgentForPasswordReset(agent);
  };

  const handleConfirmResetPassword = async () => {
    if (!agentForPasswordReset) return;
    setIsSendingLink(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Password reset link sent to ${agentForPasswordReset.email}`);
      setAgentForPasswordReset(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link.');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleToggleStatus = async (subAgentId: string, currentStatus: string) => {
    if (updatingStatusForId) return; 
    if (!agencyId) {
        toast.error("Agency ID is missing. Cannot update status.");
        return;
    }

    const token = getAuthToken();
    if (!token) {
        toast.error("Authentication token not found.");
        return;
    }

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingStatusForId(subAgentId);

    setSubAgencies(prevAgencies =>
      prevAgencies.map(agent =>
        agent._id === subAgentId ? { ...agent, status: newStatus } : agent
      )
    );

    try {
        const response = await fetch(`${API_URL}/sub-agency/status/${subAgentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                agencyId: agencyId,
                status: newStatus,
            }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update status.');
        }

        toast.success(`Agent status updated to ${newStatus}.`);
    } catch (error: any) {
        toast.error(error.message);
        setSubAgencies(prevAgencies =>
            prevAgencies.map(agent =>
                agent._id === subAgentId ? { ...agent, status: currentStatus } : agent
            )
        );
    } finally {
        setUpdatingStatusForId(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          <header className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Sub-Agents for <span className="text-blue-600">{agencyName}</span>
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </header>
          <main className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <p className="text-lg text-gray-500">Loading Sub-Agents...</p>
              </div>
            ) : subAgencies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subAgencies.map(agent => (
                      <tr key={agent._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.firstName} {agent.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{agent.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusClass(agent.status)}`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(agent.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleEditAgent(agent)} title="Edit Agent Details" className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                              <FilePenLine className="w-5 h-5" />
                            </button>
                            <button onClick={() => handlePermissions(agent)} title="Edit Permissions" className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                              <ShieldCheck className="w-5 h-5" />
                            </button>
                            <div title={agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'}>
                              <Switch
                                checked={agent.status === 'active'}
                                onChange={() => handleToggleStatus(agent._id, agent.status)}
                                disabled={updatingStatusForId === agent._id}
                                className={`${
                                  agent.status === 'active' ? 'bg-green-600' : 'bg-gray-200'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                <span
                                  className={`${
                                    agent.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                              </Switch>
                            </div>
                            <button onClick={() => handleResetPassword(agent)} title="Reset Password" className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition">
                              <KeyRound className="w-5 h-5" />
                            </button>
                            <button onClick={() => setAgentToDelete(agent)} title="Delete Agent" className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No sub-agents found for this agency.</p>
            )}
          </main>
          <footer className="p-4 bg-gray-50 border-t text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isLoading}
            >
              Close
            </button>
          </footer>
        </div>
      </div>

      <PermissionModal
        isOpen={!!editingPermissionsFor}
        onClose={() => setEditingPermissionsFor(null)}
        subAgent={editingPermissionsFor}
      />
      <EditAgentModal
        isOpen={!!editingAgentDetailsFor}
        onClose={() => setEditingAgentDetailsFor(null)}
        agent={editingAgentDetailsFor}
        onUpdate={handleAgentUpdate}
        agencyId={agencyId}
      />
      <DeleteConfirmationModal
        isOpen={!!agentToDelete}
        onClose={() => setAgentToDelete(null)}
        onConfirm={handleConfirmDelete}
        agentName={agentToDelete ? `${agentToDelete.firstName} ${agentToDelete.lastName}` : ''}
        isProcessing={isProcessingDelete}
      />
      <ResetPasswordModal
        isOpen={!!agentForPasswordReset}
        onClose={() => setAgentForPasswordReset(null)}
        onConfirm={handleConfirmResetPassword}
        agentEmail={agentForPasswordReset?.email || ''}
        isProcessing={isSendingLink}
      />
    </>
  );
};