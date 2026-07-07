import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, LayoutTemplate, TrendingUp, TrendingDown, ArrowUpRight, Clock, UserPlus, CreditCard, Eye, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar
} from 'recharts';
import { adminApi } from '../../../api/adminApi';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:8, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ fontSize:13, fontWeight:600, color: p.color, margin:'2px 0' }}>
            {p.dataKey === 'cards' ? '🎴 Thiệp: ' : p.dataKey === 'users' ? '👤 Users: ' : '🔥 Lượt dùng: '}{p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStatsData(data);
      } catch (error) {
        console.error('Failed to load admin stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 className="animate-spin text-rose-500" size={32} />
        <span className="text-zinc-500 font-medium">Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  if (!statsData) return null;  return (
    <div>
      {/* Stat cards */}
      <div className="adm-stat-grid">
        {statsData.stats.map((s: any) => (
          <div key={s.label} className="adm-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', gap: 0, padding: '20px 24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', height: 110 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.change}</span>
            </div>
            
            {/* Bottom row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</span>
              <div style={{ width: 80, height: 35, filter: `drop-shadow(0px 4px 6px ${s.color}50)` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.data.map((val: number) => ({ val }))} margin={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={s.color} 
                      strokeWidth={2.5} 
                      dot={(props: any) => {
                        const { cx, cy, index } = props;
                        if (index === s.data.length - 1) {
                          return <circle key={index} cx={cx} cy={cy} r={3.5} fill={s.color} stroke="#fff" strokeWidth={1.5} />;
                        }
                        return null;
                      }} 
                      activeDot={false} 
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-chart-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24, alignItems: 'stretch' }}>
        {/* Main Chart */}
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="adm-card-header">
            <span className="adm-card-title">Tăng trưởng thiệp & users (7 ngày)</span>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 500, color: '#64748b' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:10, height:10, borderRadius:2, background:'#f43f5e', display:'inline-block' }} /> Thiệp
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:10, height:10, borderRadius:2, background:'#6366f1', display:'inline-block' }} /> Users
              </span>
            </div>
          </div>
          <div className="adm-card-body" style={{ paddingTop: 8, flex: 1, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cards" stroke="#f43f5e" strokeWidth={2.5} fill="url(#colorCards)" dot={{ fill:'#f43f5e', r:3 }} activeDot={{ r:5 }} />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorUsers)" dot={{ fill:'#6366f1', r:3 }} activeDot={{ r:5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top templates */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Top mẫu thiệp được dùng</span>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 3, display: 'flex', gap: 2 }}>
              <button style={{ padding: '5px 12px', fontSize: 11, fontWeight: 500, color: '#64748b', background: 'transparent', border: 'none', borderRadius: 9, cursor: 'pointer' }}>Tháng</button>
              <button style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, color: '#fff', background: '#1e293b', border: 'none', borderRadius: 9, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>Năm</button>
            </div>
          </div>
          <div className="adm-card-body" style={{ paddingTop: 20, paddingBottom: 28, position: 'relative' }}>
            {(() => {
              const maxUses = statsData.topTemplates.length > 0 ? Math.max(...statsData.topTemplates.map((t: any) => t.uses)) : 0;
              const gridMax = Math.ceil(maxUses / 100) * 100 || 100;
              return (
                <div style={{ position: 'relative' }}>
                  {/* Dashed Grid Background */}
                  <div style={{ position: 'absolute', top: 22, bottom: -12, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} style={{ borderLeft: '1px dashed #e2e8f0', height: '100%', position: 'relative', width: 1 }}>
                        <span style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#94a3b8', background: '#fff', padding: '0 2px' }}>
                          {i === 0 ? '0' : `${(gridMax * i / 4)}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div style={{ position: 'relative', zIndex: 1 }} onMouseLeave={() => setHoverIndex(null)}>
                    {statsData.topTemplates.map((t: any, i: number) => {
                      const percent = (t.uses / gridMax) * 100;
                      // Mặc định highlight Top 1 (i === 0) nếu không hover ai, hoặc highlight chính phần tử đang được hover
                      const isHighlighted = hoverIndex === i || (hoverIndex === null && i === 0);
                      
                      return (
                        <div 
                          key={t.name} 
                          style={{ marginBottom: 20, cursor: 'pointer' }}
                          onMouseEnter={() => setHoverIndex(i)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--adm-text)', fontWeight: 500 }}>{t.name}</span>
                            <span style={{ fontSize: 13, color: isHighlighted ? 'var(--adm-pink)' : 'var(--adm-text-muted)', fontWeight: 700, transition: 'color 0.2s' }}>{t.uses.toLocaleString()}</span>
                          </div>
                          <div style={{ height: 12, background: 'transparent', borderRadius: 99, overflow: 'visible', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, background: '#f1f5f9', borderRadius: 99, opacity: 0.8 }} />
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              style={{ height: '100%', background: isHighlighted ? 'var(--adm-pink)' : '#94a3b8', borderRadius: 99, position: 'relative', transition: 'background 0.2s ease' }} 
                            >
                              {/* Tooltip */}
                              <AnimatePresence>
                                {hoverIndex === i && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                      position: 'absolute',
                                      right: 0, 
                                      top: -38,
                                      background: '#1e293b',
                                      color: '#fff',
                                      padding: '4px 10px',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      pointerEvents: 'none',
                                      zIndex: 20,
                                      whiteSpace: 'nowrap',
                                      transform: 'translateX(50%)' // Center it on the tip of the bar
                                    }}
                                  >
                                    Chiếm {(t.uses / statsData.topTemplates.reduce((sum: number, curr: any) => sum + curr.uses, 0) * 100 || 0).toFixed(1)}% tổng
                                    <div style={{
                                      position: 'absolute',
                                      bottom: -4,
                                      left: '50%',
                                      transform: 'translateX(-50%) rotate(45deg)',
                                      width: 8,
                                      height: 8,
                                      background: '#1e293b',
                                    }} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Hoạt động gần đây</span>
          <span style={{ fontSize:12, color:'var(--adm-pink)', fontWeight:600, cursor:'pointer' }}>Xem tất cả →</span>
        </div>
        <div>
          {statsData.activity.map((a: any, i: number) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 22px', borderBottom: i < statsData.activity.length-1 ? '1px solid var(--adm-border)' : 'none' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background: a.type === 'user' ? '#eef2ff' : '#fff1f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {a.type === 'user' ? <UserPlus size={15} color="#6366f1" /> : <FileText size={15} color="#f43f5e" />}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, color:'var(--adm-text)', margin:0 }}>{a.text}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--adm-text-muted)', flexShrink:0 }}>
                <Clock size={11} />{a.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
