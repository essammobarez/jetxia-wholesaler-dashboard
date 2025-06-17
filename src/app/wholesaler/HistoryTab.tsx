"use client";
import { NextPage } from 'next';
import Head from 'next/head';
import { Search, UserPlus, List } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HistoryRow {
  User: string;
  LoginDate: string;
  Search: string;
  Hotel: string;
  HotelCode: string;
  Room: string[];
  BookingStages: string[];
  Destination?: string;
  CheckInDate?: string;
  CheckOutDate?: string;
  RoomsInfo?: string;
  Citizenship?: string;
}

const stageLabels = [
  { key: 'HS', label: 'HS' },
  { key: 'AV', label: 'AV' },
  { key: 'PB', label: 'PB' },
  { key: 'OK', label: 'OK' },
];

const StatusRing = ({ label, active }: { label: string; active: boolean }) => {
  const ringClass = active
    ? 'ring-green-500 text-green-600'
    : 'ring-red-400 text-red-500';
  return (
    <div
      className={`w-6 h-6 flex items-center justify-center rounded-full ring-2 ${ringClass} text-[10px] font-semibold`}
    >
      {label}
    </div>
  );
};

const StatsCard = ({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-700 shadow-sm dark:shadow-none rounded-lg p-5 flex flex-col">
    <div className="flex items-center">
      {icon && <div className="mr-2 text-indigo-500">{icon}</div>}
      <span className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300">{title}</span>
    </div>
    <span className="mt-1 text-xl font-medium text-gray-700 dark:text-gray-200">{value}</span>
  </div>
);

const HistoryPage: NextPage = () => {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [hoveredData, setHoveredData] = useState<HistoryRow | null>(null);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    // fetch history
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}HistoryPage/history-page`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data.history)) {
          setHistory(json.data.history);
        }
      })
      .catch(err => console.error('Failed to load history:', err));
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const totalRecords = history.length;
  const totalSearches = history.filter(h => h.Search && h.Search !== 'N/A').length;

  const handleMouseEnter = (e: React.MouseEvent, row: HistoryRow) => {
    const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const approxTooltipH = 200;
    const spaceBelow = window.innerHeight - cellRect.bottom;
    setPlacement(spaceBelow < approxTooltipH ? 'top' : 'bottom');
    setHoveredData(row);
  };

  return (
    <>
      <Head><title>History</title></Head>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <aside className=" bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700" />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header & Stats */}
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">History</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 w-full lg:w-auto">
                <StatsCard icon={<UserPlus className="h-5 w-5" />} title="Daily Records" value={`${totalRecords}`} />
                <StatsCard icon={<Search className="h-5 w-5" />} title="Valid Searches" value={`${totalSearches}`} />
                <div className="bg-white dark:bg-gray-700 shadow-sm dark:shadow-none rounded-lg p-5">
                  <div className="flex items-center">
                    <List className="h-5 w-5 mr-2 text-indigo-500" />
                    <span className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300">
                      Booking Stages
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    <strong>HS</strong> = Hotel Search, <strong>AV</strong> = Availability,{' '}
                    <strong>PB</strong> = Pre-booking, <strong>OK</strong> = Booked
                  </p>
                </div>
              </div>
            </header>

            {/* Toolbar */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button className="w-full sm:w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 shadow-sm hover:shadow-md">
                Filters
              </button>
              <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search history..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['User', 'Login Date', 'Search', 'Hotel', 'Room', 'Stage'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.User}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(row.LoginDate)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer relative"
                        onMouseEnter={e => handleMouseEnter(e, row)}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        {row.Search || 'N/A'}
                        {hoveredData === row && (
                          <div
                            className={
                              `absolute w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-gray-800 dark:text-gray-100 z-10 ` +
                              (placement === 'bottom'
                                ? 'top-full left-0 mt-1'
                                : 'bottom-full left-0 mb-1')
                            }
                          >
                            <h4 className="text-sm font-medium mb-2">Destination</h4>
                            <p className="font-semibold mb-3">{row.Destination || '-'}</p>
                            <div className="flex justify-between mb-3">
                              <div>
                                <h5 className="text-xs">Check in</h5>
                                <p className="font-semibold text-sm">{formatDate(row.CheckInDate)}</p>
                              </div>
                              <div>
                                <h5 className="text-xs">Check out</h5>
                                <p className="font-semibold text-sm">{formatDate(row.CheckOutDate)}</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <h5 className="text-xs">Room & guest</h5>
                              <div className="font-semibold text-sm">
                                {row.RoomsInfo?.split('|').map((r, i) => (
                                  <p key={i}>{r.trim()}</p>
                                )) || <p>-</p>}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs">Guest citizenship</h5>
                              <p className="font-semibold text-sm">{row.Citizenship || '-'}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.Hotel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.Room?.length ? row.Room.join(', ') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                        {stageLabels.map(({ key, label }) => (
                          <StatusRing
                            key={key}
                            label={label}
                            active={row.BookingStages.includes(key)}
                          />
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default HistoryPage;