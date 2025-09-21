import React, { useEffect, useState, useRef } from 'react';
import { FiSend, FiUsers, FiClock, FiMoreVertical, FiEye, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// STYLES
// ============================================================================
const styles = `
  :root {
    --brand-color: #4f46e5;
    --brand-color-light: #e0e7ff;
    --brand-color-dark: #3730a3;
    --text-primary: #111827;
    --text-secondary: #4b5563;
    --text-light: #9ca3af;
    --surface-background: #f9fafb;
    --card-background: #ffffff;
    --border-color: #e5e7eb;
    --success-color: #22c55e; /* Added for send progress */
    --success-light: #dcfce7; /* Added for send progress */
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    50% { opacity: .5; }
  }

  .premium-list-wrapper {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--surface-background);
    padding: 32px;
  }

  .premium-list-header h1 {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 24px;
  }
  
  /* --- Main Card Layout --- */
  .campaign-card-premium {
    background-color: var(--card-background);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    display: grid;
    grid-template-areas:
      "header header chart"
      "lists lists chart"
      "send-visual send-visual send-visual" /* New grid area for the send visual */
      "progress progress progress"
      "footer footer footer";
    grid-template-columns: 1fr 1fr auto;
    gap: 16px 24px;
  }
  .campaign-card-premium:hover {
    border-color: var(--brand-color-light);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);
  }

  .card__header { grid-area: header; }
  .card__lists { grid-area: lists; }
  .card__chart { grid-area: chart; }
  .card__send-visual { grid-area: send-visual; } /* New grid area */
  .card__progress { grid-area: progress; }
  .card__footer { grid-area: footer; }

  .card__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .card__description {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* --- List Pills --- */
  .card__lists { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .list-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: #f3f4f6;
    color: var(--text-secondary);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  /* --- Donut Chart --- */
  .card__chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .donut-chart-text {
    position: absolute;
    font-size: 20px;
    font-weight: 700;
    color: var(--brand-color-dark);
  }
  .donut-chart-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
  
  /* --- Progress Bar --- */
  .progress-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }
  .progress-bar-bg {
    width: 100%;
    background-color: #f3f4f6;
    border-radius: 8px;
    height: 8px;
  }
  .progress-bar-fg {
    height: 100%;
    background-color: var(--brand-color);
    border-radius: 8px;
  }

  /* --- Send Visual --- */
  .card__send-visual {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    border-radius: 12px;
    background-color: var(--surface-background);
  }
  .send-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .send-metric-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .send-metric-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .circular-progress-container {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .circular-progress-text {
    position: absolute;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }

  /* --- Footer & Action Menu --- */
  .card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-light);
    font-size: 13px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
  .timestamp { display: flex; align-items: center; gap: 6px; }
  
  .action-menu-container { position: relative; }
  .action-menu-button {
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  .action-menu-button:hover { background-color: #f3f4f6; }

  .action-menu-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background-color: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
    width: 160px;
    z-index: 10;
    overflow: hidden;
    animation: fadeIn 0.15s ease-out;
  }
  .action-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--text-secondary);
  }
  .action-menu-item.delete { color: #be123c; }
  .action-menu-item:hover { background-color: #f9fafb; }
  
  /* Skeleton Loader */
  .skeleton-card {
    background-color: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .skeleton-line { height: 16px; background-color: #e5e7eb; border-radius: 4px; }
`;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface Campaign {
  _id: string;
  title: string;
  description: string;
  status: 'sent' | 'failed' | 'draft' | 'queued';
  createdAt: string;
  sentAt?: string;
  listIds: { _id: string; title: string; }[];
  stats: {
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
  };
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const DonutChart: React.FC<{ percentage: number; size?: number; strokewidth?: number; color?: string; bgColor?: string; textColor?: string; }> = 
  ({ percentage, size = 80, strokewidth = 10, color = 'var(--brand-color)', bgColor = 'var(--brand-color-light)', textColor = 'var(--brand-color-dark)' }) => {
  const radius = (size - strokewidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card__chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke={bgColor} strokeWidth={strokewidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={strokewidth} fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <span className="donut-chart-text" style={{ color: textColor }}>{Math.round(percentage)}%</span>
    </div>
  );
};

// New CircularProgress component for send visual
const CircularProgress: React.FC<{ percentage: number; size?: number; strokewidth?: number; color?: string; bgColor?: string; }> = 
  ({ percentage, size = 48, strokewidth = 5, color = 'var(--success-color)', bgColor = 'var(--success-light)' }) => {
  const radius = (size - strokewidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke={bgColor} strokeWidth={strokewidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={strokewidth} fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <span className="circular-progress-text">{Math.round(percentage)}%</span>
    </div>
  );
};

const ActionMenu: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="action-menu-container" ref={menuRef}>
            <div className="action-menu-button" onClick={() => setIsOpen(!isOpen)}><FiMoreVertical size={20} /></div>
            {isOpen && (
                <div className="action-menu-dropdown">
                    <div className="action-menu-item"><FiEye size={16} /> View Report</div>
                    <div className="action-menu-item delete"><FiTrash2 size={16} /> Delete</div>
                </div>
            )}
        </div>
    );
};

const CampaignSkeleton = () => (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ width: '60%', height: '24px', marginBottom: '16px' }}></div>
      <div className="skeleton-line" style={{ width: '90%', marginBottom: '24px' }}></div>
      <div className="skeleton-line" style={{ width: '100%', height: '8px', marginBottom: '24px' }}></div>
      <div className="skeleton-line" style={{ width: '40%' }}></div>
    </div>
);

// ============================================================================
// CAMPAIGN CARD COMPONENT
// ============================================================================
const CampaignCardPremium: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const { title, description, stats, listIds, sentAt, createdAt } = campaign;
  const sendProgress = stats.queued > 0 ? (stats.sent / stats.queued) * 100 : 0;
  const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
  const relativeDate = formatDistanceToNow(new Date(sentAt || createdAt), { addSuffix: true });

  return (
    <div className="campaign-card-premium">
      <div className="card__header"><h2 className="card__title">{title}</h2><p className="card__description">{description}</p></div>
      <div className="card__lists"><FiUsers size={14} color="var(--text-light)" />{listIds.map(list => (<span key={list._id} className="list-pill">{list.title}</span>))}</div>
      
      {/* Donut Chart for Open Rate */}
      <div className="card__chart">
          <DonutChart percentage={openRate} />
          <span className="donut-chart-label">Open Rate</span>
      </div>

      {/* New Send Visual Section */}
      <div className="card__send-visual">
        <div className="send-metric">
          <CircularProgress percentage={sendProgress} />
          <span className="send-metric-label">Sent</span>
        </div>
        <div className="send-metric">
          <FiSend size={24} color="var(--text-primary)" />
          <span className="send-metric-value">{stats.sent.toLocaleString()}</span>
          <span className="send-metric-label">Emails</span>
        </div>
        <div className="send-metric">
          <FiUsers size={24} color="var(--text-primary)" />
          <span className="send-metric-value">{stats.queued.toLocaleString()}</span>
          <span className="send-metric-label">Recipients</span>
        </div>
      </div>

      {/* Original Progress Bar (could be repurposed for delivery progress if needed, or removed) */}
      <div className="card__progress">
        <div className="progress-label"><span>Overall Campaign Progress</span><span>{Math.round(sendProgress)}% Complete</span></div>
        <div className="progress-bar-bg"><div className="progress-bar-fg" style={{ width: `${sendProgress}%` }}></div></div>
      </div>
      
      <div className="card__footer"><span className="timestamp"><FiClock size={14} />{sentAt ? 'Sent' : 'Created'} {relativeDate}</span><ActionMenu campaign={campaign} /></div>
    </div>
  );
};


// ============================================================================
// MAIN LIST COMPONENT
// ============================================================================
const CampaignListItem = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      
      const getAuthToken = (): string | null => localStorage.getItem('authToken');
      const token = getAuthToken();

      if (!token) {
        alert("Authorization failed. Please log in again.");
        setIsLoading(false);
        setError("Authentication token not found.");
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) {
          throw new Error("Backend URL (NEXT_PUBLIC_BACKEND_URL) is not configured.");
        }
        
        const response = await fetch(`${baseUrl}/campaign`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setCampaigns(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch campaigns due to invalid data format.");
        }
      } catch (err: any) {
        console.error("Error loading campaigns:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaigns();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => <CampaignSkeleton key={index} />);
    }

    if (error) {
      return <div className="error-message">❌ Error fetching campaigns: {error}</div>;
    }
    
    if (campaigns.length === 0) {
      return <div className="empty-state">🤷‍♀️ No campaigns found.</div>;
    }

    return campaigns.map(campaign => <CampaignCardPremium key={campaign._id} campaign={campaign} />);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="premium-list-wrapper">
        <div className="premium-list-header">
          <h1>Campaigns</h1>
        </div>
        {renderContent()}
      </div>
    </>
  );
};

export default CampaignListItem;