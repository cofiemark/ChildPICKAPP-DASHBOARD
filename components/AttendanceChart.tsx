import React, { useMemo, useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface AttendanceChartProps {
  trendRecords: AttendanceRecord[];
  overviewRecords: AttendanceRecord[];
}

const statusColors: Record<AttendanceStatus | 'Late', string> = {
    [AttendanceStatus.PRESENT]: '#34d399', // emerald-400
    [AttendanceStatus.CHECKED_OUT]: '#38bdf8', // sky-400
    [AttendanceStatus.ABSENT]: '#94a3b8', // slate-400
    'Late': '#f59e0b', // amber-500
};

// --- Tooltip Component ---
const Tooltip: React.FC<{ content: React.ReactNode, position: { x: number, y: number } }> = ({ content, position }) => {
    if (!content) return null;
    return (
        <div 
            className="absolute bg-slate-800 text-white text-xs rounded-md py-1 px-2 pointer-events-none transition-opacity duration-200 shadow-lg z-10"
            style={{ left: position.x + 10, top: position.y + 10 }}
        >
            {content}
        </div>
    );
};

// --- Helper function to check for lateness ---
const isEventLate = (time: Date | null, type: 'check-in' | 'check-out', settings: any): boolean => {
    if (!time) return false;
    
    const getThresholdTime = (threshold: string): Date => {
        const [hours, minutes] = threshold.split(':').map(Number);
        const thresholdDate = new Date(time);
        thresholdDate.setHours(hours, minutes, 0, 0);
        return thresholdDate;
    };

    if (type === 'check-in') return time >= getThresholdTime(settings.lateThreshold);
    if (type === 'check-out') return time >= getThresholdTime(settings.lateCheckOutThreshold);
    return false;
};

// --- Line Chart Component ---
const LineChart: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
    const { settings } = useSettings();
    const [tooltip, setTooltip] = useState<{ content: React.ReactNode, pos: { x: number, y: number } } | null>(null);

    const lineChartData = useMemo(() => {
        const data: { [key: string]: { present: number; absent: number; late: number; date: Date } } = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            data[dateString] = { present: 0, absent: 0, late: 0, date: date };
        }

        records.forEach(record => {
            const dateString = record.date.toISOString().split('T')[0];
            if (data[dateString]) {
                if (record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.CHECKED_OUT) {
                    data[dateString].present += 1;
                } else if (record.status === AttendanceStatus.ABSENT) {
                    data[dateString].absent += 1;
                }

                if (isEventLate(record.checkInTime, 'check-in', settings) || isEventLate(record.checkOutTime, 'check-out', settings)) {
                    data[dateString].late += 1;
                }
            }
        });
        return Object.values(data);
    }, [records, settings]);

    const PADDING = { top: 10, right: 20, bottom: 25, left: 30 };
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 100;
    const width = SVG_WIDTH - PADDING.left - PADDING.right;
    const height = SVG_HEIGHT - PADDING.top - PADDING.bottom;

    const maxValue = Math.max(...lineChartData.map(d => Math.max(d.present, d.absent, d.late)), 5);
    
    const xScale = (index: number) => PADDING.left + (index / (lineChartData.length - 1)) * width;
    const yScale = (value: number) => PADDING.top + height - (value / maxValue) * height;

    const generatePath = (dataKey: 'present' | 'absent' | 'late') => {
        return lineChartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[dataKey])}`).join(' ');
    };
    
    const handleMouseOver = (e: React.MouseEvent, data: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ content: data.content, pos: { x: rect.left, y: rect.top } });
    };

    return (
        <div className="relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                {/* Y-Axis Grid Lines & Labels */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const y = PADDING.top + (i * height / 5);
                    const value = Math.round(maxValue * (1 - i / 5));
                    return (
                        <g key={i} className="text-xs text-slate-400">
                            <line x1={PADDING.left} x2={SVG_WIDTH - PADDING.right} y1={y} y2={y} stroke="#f1f5f9" />
                            <text x={PADDING.left - 5} y={y + 3} textAnchor="end">{value}</text>
                        </g>
                    );
                })}
                
                {/* X-Axis Labels */}
                {lineChartData.map((d, i) => (
                    <text key={i} x={xScale(i)} y={SVG_HEIGHT - 5} textAnchor="middle" className="text-xs text-slate-500">
                        {d.date.toLocaleDateString([], { weekday: 'short' })}
                    </text>
                ))}
                
                {/* Data Lines */}
                <path d={generatePath('present')} fill="none" stroke={statusColors[AttendanceStatus.PRESENT]} strokeWidth="2" />
                <path d={generatePath('absent')} fill="none" stroke={statusColors[AttendanceStatus.ABSENT]} strokeWidth="2" />
                <path d={generatePath('late')} fill="none" stroke={statusColors['Late']} strokeWidth="2" strokeDasharray="4 2" />

                {/* Data Points & Hover Targets */}
                {lineChartData.map((d, i) => (
                    <g key={i}>
                        <circle cx={xScale(i)} cy={yScale(d.present)} r="3" fill={statusColors[AttendanceStatus.PRESENT]} stroke="white" strokeWidth="1" />
                        <circle cx={xScale(i)} cy={yScale(d.absent)} r="3" fill={statusColors[AttendanceStatus.ABSENT]} stroke="white" strokeWidth="1" />
                         <circle cx={xScale(i)} cy={yScale(d.late)} r="3" fill={statusColors['Late']} stroke="white" strokeWidth="1" />
                        <rect 
                           x={xScale(i)-10} y={0} width="20" height={SVG_HEIGHT} fill="transparent"
                           onMouseMove={(e) => handleMouseOver(e, { content: 
                             <div>
                               <p className="font-bold">{d.date.toLocaleDateString()}</p>
                               <p style={{color: statusColors[AttendanceStatus.PRESENT]}}>Present: {d.present}</p>
                               <p style={{color: statusColors[AttendanceStatus.ABSENT]}}>Absent: {d.absent}</p>
                               <p style={{color: statusColors['Late']}}>Late Events: {d.late}</p>
                             </div> 
                           })}
                           onMouseLeave={() => setTooltip(null)}
                        />
                    </g>
                ))}
            </svg>
            {tooltip && <Tooltip content={tooltip.content} position={{ x: tooltip.pos.x, y: tooltip.pos.y }} />}
        </div>
    );
};

// --- Donut Chart Component ---
const DonutChart: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    const donutData = useMemo(() => {
        const stats = {
            [AttendanceStatus.PRESENT]: 0,
            [AttendanceStatus.CHECKED_OUT]: 0,
            [AttendanceStatus.ABSENT]: 0,
        };
        records.forEach(r => {
            if (stats[r.status] !== undefined) {
                stats[r.status]++;
            }
        });
        const total = records.length;
        if (total === 0) return [];
        
        return Object.entries(stats).map(([status, count]) => ({
            status: status as AttendanceStatus,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
        })).filter(item => item.count > 0);
    }, [records]);

    if (records.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data for selected range.</div>;
    }

    const radius = 55;
    const strokeWidth = 15;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <svg viewBox="0 0 140 140" className="transform -rotate-90">
                <g>
                    {donutData.map(({ status, percentage }) => {
                        const offset = (accumulatedPercentage / 100) * circumference;
                        const dash = (percentage / 100) * circumference;
                        accumulatedPercentage += percentage;

                        return (
                            <circle
                                key={status}
                                r={radius}
                                cx="70"
                                cy="70"
                                fill="transparent"
                                stroke={statusColors[status]}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-300"
                                style={{
                                    transform: hoveredSegment === status ? 'scale(1.08)' : 'scale(1)',
                                    transformOrigin: 'center',
                                    filter: hoveredSegment === status ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                                }}
                                onMouseEnter={() => setHoveredSegment(status)}
                                onMouseLeave={() => setHoveredSegment(null)}
                            />
                        );
                    })}
                </g>
            </svg>
             <div className="absolute text-center">
                <p className="text-xl font-bold text-slate-800">{records.length}</p>
                <p className="text-xs text-slate-500">Total Records</p>
            </div>
            {hoveredSegment && (
                <div className="absolute text-center bg-white p-2 rounded-lg shadow-lg pointer-events-none">
                    <p className="font-semibold" style={{color: statusColors[hoveredSegment as AttendanceStatus]}}>{hoveredSegment}</p>
                    <p className="text-sm text-slate-600">{donutData.find(d => d.status === hoveredSegment)?.count} ({donutData.find(d => d.status === hoveredSegment)?.percentage.toFixed(1)}%)</p>
                </div>
            )}
        </div>
    );
};


const AttendanceChart: React.FC<AttendanceChartProps> = ({ trendRecords, overviewRecords }) => {
    const { settings } = useSettings();

    const lateStats = useMemo(() => {
        let lateCheckIns = 0;
        let lateCheckOuts = 0;

        overviewRecords.forEach(record => {
            if (isEventLate(record.checkInTime, 'check-in', settings)) {
                lateCheckIns++;
            }
            if (isEventLate(record.checkOutTime, 'check-out', settings)) {
                lateCheckOuts++;
            }
        });

        return { lateCheckIns, lateCheckOuts };
    }, [overviewRecords, settings]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Last 7 Days Trend</h3>
                <LineChart records={trendRecords} />
                 <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 -mt-2 text-xs text-slate-600">
                    <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full mr-1.5" style={{backgroundColor: statusColors[AttendanceStatus.PRESENT]}}></span>Present/Checked Out</div>
                    <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full mr-1.5" style={{backgroundColor: statusColors[AttendanceStatus.ABSENT]}}></span>Absent</div>
                    <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full mr-1.5" style={{backgroundColor: statusColors['Late']}}></span>Late Events</div>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col justify-center min-h-[120px]">
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-1">Overview for Selected Range</h3>
                <DonutChart records={overviewRecords} />
                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-around text-center">
                    <div>
                        <p className="font-bold text-lg text-amber-600">{lateStats.lateCheckIns}</p>
                        <p className="text-xs text-slate-500">Late Check-ins</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-amber-600">{lateStats.lateCheckOuts}</p>
                        <p className="text-xs text-slate-500">Late Check-outs</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceChart;