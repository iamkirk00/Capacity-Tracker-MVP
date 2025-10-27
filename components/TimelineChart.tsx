import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckIn, LogType } from '../types';

interface TimelineChartProps {
  data: CheckIn[];
}

const LOG_TYPE_COLORS: Record<LogType, string> = {
  [LogType.Initial]: '#9ca3af',
  [LogType.Normal]: '#9ca3af',
  [LogType.SuddenDrop]: '#60a5fa',
  [LogType.Increase]: '#34d399',
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: CheckIn = payload[0].payload;
    return (
      <div className="p-3 bg-brand-primary bg-opacity-90 border border-brand-surface rounded-lg shadow-lg text-sm">
        <p className="font-bold text-brand-text mb-1">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.stroke }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
        {data.journal && <p className="mt-2 text-brand-subtle italic">"{data.journal}"</p>}
      </div>
    );
  }
  return null;
};

const CustomizedDot: React.FC<any> = (props) => {
    const { cx, cy, payload } = props;
    const color = LOG_TYPE_COLORS[payload.logType as LogType] || LOG_TYPE_COLORS.NORMAL;

    return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill={color} viewBox="0 0 1024 1024">
            <circle cx="512" cy="512" r="512" />
        </svg>
    );
};

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  if (!data || data.length < 1) {
    return <div className="text-center text-brand-subtle py-10">No data to display for today.</div>;
  }

  const chartData = data.map(item => {
    const checkInDate = new Date(item.timestamp);
    const hoursSince8AM = (checkInDate.getHours() + checkInDate.getMinutes() / 60) - 8;
    // Baseline is calculated from 8 AM onwards. Before 8 AM, we can consider it full.
    const baselineValue = hoursSince8AM > 0 ? Math.max(0, 12 - hoursSince8AM) : 12;

    return {
      ...item,
      time: checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      avg: parseFloat(((item.energy + item.attention + item.readiness) / 3).toFixed(2)),
      baseline: parseFloat(baselineValue.toFixed(2)),
    };
  });

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#16213e" />
          <XAxis dataKey="time" stroke="#a0a0a0" fontSize={12} />
          <YAxis domain={[0, 12]} stroke="#a0a0a0" fontSize={12} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Line type="monotone" dataKey="energy" stroke="#8884d8" strokeWidth={2} dot={false} name="Energy"/>
          <Line type="monotone" dataKey="attention" stroke="#82ca9d" strokeWidth={2} dot={false} name="Attention" />
          <Line type="monotone" dataKey="readiness" stroke="#ffc658" strokeWidth={2} dot={false} name="Readiness" />
          <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeDasharray="5 5" name="Baseline" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="avg" stroke="#e94560" strokeWidth={3} activeDot={{ r: 6 }} dot={<CustomizedDot/>} name="Average Capacity" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;