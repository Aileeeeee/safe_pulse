import React from 'react';

// ── TYPES DEFINITIONS ────────────────────────────────────────────────────────
interface AreaData {
  rank: number;
  name: string;
  count: number;
}

interface AlertData {
  id: string;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  type: 'danger' | 'warning';
}

// ── WIDGET 1: TOP REPORTED AREAS ─────────────────────────────────────────────
export const TopReportedAreas: React.FC<{ data: AreaData[] }> = ({ data }) => {
  // Fallback to 1 to avoid Division by Zero errors
  const maxCount = data.length > 0 ? Math.max(...data.map((item) => item.count)) : 1;

  const getRankStyles = (rank: number) => {
    if (rank === 1) return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700' };
    if (rank === 2) return { bar: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700' };
    return { bar: 'bg-emerald-800', badge: 'bg-emerald-50 text-emerald-800' };
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full">
      <h3 className="text-base font-bold text-gray-900 mb-6">Top Reported Areas</h3>
      
      <div className="space-y-5">
        {data.map((item) => {
          const styles = getRankStyles(item.rank);
          return (
            <div key={item.rank} className="flex items-center justify-between">
              {/* Rank and Clean LGA Name */}
              <div className="flex items-center gap-3 w-1/3 min-w-[100px]">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${styles.badge}`}>
                  {item.rank}
                </span>
                <span className="text-sm font-bold text-gray-800 truncate">{item.name}</span>
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-gray-100 h-2 rounded-full mx-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>

              {/* Aggregated Total Reports Counter */}
              <span className="text-xs font-semibold text-gray-400 w-20 text-right whitespace-nowrap">
                {item.count} reports
              </span>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No territorial metrics logged yet.</p>
        )}
      </div>
    </div>
  );
};

// ── WIDGET 2: ACTIVE ALERTS FEED ─────────────────────────────────────────────
export const ActiveAlerts: React.FC<{ data: AlertData[] }> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-bold text-gray-900">Active Alerts</h3>
        <button className="text-xs font-bold text-emerald-700 hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {data.map((alert) => (
          <div 
            key={alert.id} 
            className="flex gap-4 p-4 rounded-2xl border border-gray-50 bg-white hover:bg-gray-50/50 transition-colors shadow-2xs"
          >
            {/* Status Alert Badge Icon */}
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-medium ${
              alert.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
            }`}>
              {alert.type === 'danger' ? '🚨' : '⚠️'}
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className={`text-sm font-bold truncate ${
                  alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {alert.title}
                </h4>
                <span className="text-[10px] text-gray-400 font-semibold ml-2 whitespace-nowrap">
                  {alert.timeAgo}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium line-clamp-2 mb-1">
                {alert.description}
              </p>
              <span className="text-[10px] text-gray-400 font-medium block">
                {alert.location}
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">All monitoring zones are currently steady.</p>
        )}
      </div>
    </div>
  );
};
