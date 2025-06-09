import { useState } from 'react';
import { FaPen, FaTrash, FaPause, FaCheckCircle } from 'react-icons/fa';
import {
  Modal,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';

const ManageAgent = () => {
  const [agents, setAgents] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '987-654-3210', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', phone: '555-123-4567', status: 'Suspended' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', phone: '123-999-1111', status: 'Suspended' },
    { id: 5, name: 'David Clark', email: 'david.clark@example.com', phone: '555-888-7777', status: 'Active' },
    { id: 6, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', phone: '555-234-5678', status: 'Active' },
  { id: 7, name: 'James Harris', email: 'james.harris@example.com', phone: '555-345-6789', status: 'Active' },
  { id: 8, name: 'Olivia Lewis', email: 'olivia.lewis@example.com', phone: '555-456-7890', status: 'Active' },
  { id: 9, name: 'Ethan Walker', email: 'ethan.walker@example.com', phone: '555-567-8901', status: 'Suspended' },
  { id: 10, name: 'Sophia Martinez', email: 'sophia.martinez@example.com', phone: '555-678-9012', status: 'Active' },
  { id: 11, name: 'Liam Scott', email: 'liam.scott@example.com', phone: '555-789-0123', status: 'Active' },
  { id: 12, name: 'Mason Evans', email: 'mason.evans@example.com', phone: '555-890-1234', status: 'Active' },
  { id: 13, name: 'Isabella Taylor', email: 'isabella.taylor@example.com', phone: '555-901-2345', status: 'Suspended' },
  { id: 14, name: 'Noah Anderson', email: 'noah.anderson@example.com', phone: '555-012-3456', status: 'Active' },
  { id: 15, name: 'Ava Thomas', email: 'ava.thomas@example.com', phone: '555-123-4568', status: 'Active' },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const [updatedAgent, setUpdatedAgent] = useState({ name: '', email: '', phone: '', status: 'Active' });

  const handleOpenModal = (agent: any) => {
    setCurrentAgent(agent);
    setUpdatedAgent(agent);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    if (currentAgent) {
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent.id === currentAgent.id ? { ...agent, ...updatedAgent } : agent
        )
      );
    }
    setOpenModal(false);
  };

  const handleDeleteAgent = (id: number) => {
    setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== id));
  };

  const handleStatusToggle = (id: number) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === id ? { ...agent, status: agent.status === 'Active' ? 'Suspended' : 'Active' } : agent
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 -mt-20">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10 text-indigo-700">Manage Agents(Dummy data)</h2>

        {/* Table to display agents */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left" className="font-medium text-lg text-gray-800">Name</TableCell>
                <TableCell align="left" className="font-medium text-lg text-gray-800">Email</TableCell>
                <TableCell align="left" className="font-medium text-lg text-gray-800">Phone</TableCell>
                <TableCell align="left" className="font-medium text-lg text-gray-800">Status</TableCell>
                <TableCell align="center" className="font-medium text-lg text-gray-800">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-indigo-50 cursor-pointer transition-all">
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`py-1 px-3 rounded-full text-white ${agent.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {agent.status}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Agent" arrow>
                      <IconButton color="primary" onClick={() => handleOpenModal(agent)}>
                        <FaPen />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Agent" arrow>
                      <IconButton color="secondary" onClick={() => handleDeleteAgent(agent.id)}>
                        <FaTrash />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={agent.status === 'Active' ? 'Suspend Agent' : 'Activate Agent'} arrow>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agent.status === 'Active'}
                            onChange={() => handleStatusToggle(agent.id)}
                            color={agent.status === 'Active' ? 'success' : 'error'}
                            disabled={agent.status === 'Suspended'} // Disabled when status is Suspended
                          />
                        }
                        label=""
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-xl w-96">
            <h3 className="text-2xl font-semibold text-center mb-6 text-indigo-700">Edit Agent</h3>

            <TextField
              label="Name"
              name="name"
              value={updatedAgent.name}
              onChange={handleInputChange}
              fullWidth
              className="mb-4"
              variant="outlined"
              color="primary"
            />
            <TextField
              label="Email"
              name="email"
              value={updatedAgent.email}
              onChange={handleInputChange}
              fullWidth
              className="mb-4"
              variant="outlined"
              color="primary"
            />
            <TextField
              label="Phone"
              name="phone"
              value={updatedAgent.phone}
              onChange={handleInputChange}
              fullWidth
              className="mb-4"
              variant="outlined"
              color="primary"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={updatedAgent.status === 'Active'}
                  onChange={() => setUpdatedAgent((prev) => ({ ...prev, status: prev.status === 'Active' ? 'Suspended' : 'Active' }))}
                  name="status"
                  color="primary"
                />
              }
              label={updatedAgent.status === 'Active' ? 'Active' : 'Suspended'}
              className="mb-6"
            />

            <div className="flex justify-end space-x-4">
              <Button onClick={handleCloseModal} variant="outlined" color="primary" className="text-indigo-600">
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} variant="contained" color="primary">
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageAgent;
