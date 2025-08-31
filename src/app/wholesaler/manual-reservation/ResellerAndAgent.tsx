import React from 'react';
import { FormInput, FormSection } from '../ManualReservationsTab';

// Define the props the component will accept
type ResellerAndAgentProps = {
  reseller: string;
  setReseller: (value: string) => void;
  supervisor: string;
  setSupervisor: (value: string) => void;
  agent: string;
  setAgent: (value: string) => void;
};

const ResellerAndAgent: React.FC<ResellerAndAgentProps> = ({
  reseller,
  setReseller,
  supervisor,
  setSupervisor,
  agent,
  setAgent,
}) => {
  return (
    <FormSection title="Reseller & Agent">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <FormInput
          label="Reseller"
          placeholder="Enter reseller name"
          value={reseller}
          onChange={e => setReseller(e.target.value)}
        />
        <FormInput
          label="Supervisor"
          placeholder="Enter supervisor name"
          value={supervisor}
          onChange={e => setSupervisor(e.target.value)}
        />
        <FormInput
          label="Agent"
          placeholder="Enter agent name"
          value={agent}
          onChange={e => setAgent(e.target.value)}
        />
      </div>
    </FormSection>
  );
};

export default ResellerAndAgent;