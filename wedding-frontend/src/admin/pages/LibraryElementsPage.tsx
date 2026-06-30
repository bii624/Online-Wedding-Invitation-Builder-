import { useState } from 'react';
import { Search, Upload, Trash2, Tag, Crown } from 'lucide-react';

const ELEMENT_TYPES = ['all','icon','shape','illustration','sticker','frame','photo'];
const MOCK_ELEMENTS = [
  { id: '1', name: 'Hoa hồng', type: 'icon', isPremium: false, tags: ['hoa','cưới'], category: 'Hoa lá' },
  { id: '2', name: 'Nhẫn cưới', type: 'icon', isPremium: false, tags: ['nhẫn','cưới'], category: 'Phụ kiện' },
  { id: '3', name: 'Trái tim', type: 'shape', isPremium: false, tags: ['tình yêu'], category: 'Hình khối' },
  { id: '4', name: 'Bướm vàng', type: 'sticker', isPremium: true, tags: ['bướm','trang trí'], category: 'Sticker' },
  { id: '5', name: 'Khung hoa', type: 'frame', isPremium: true, tags: ['khung','hoa'], category: 'Khung viền' },
  { id: '6', name: 'Cặp đôi', type: 'illustration', isPremium: false, tags: ['cặp đôi','cưới'], category: 'Minh họa' },
  { id: '7', name: 'Chim bồ câu', type: 'icon', isPremium: false, tags: ['chim','tự do'], category: 'Động vật' },
  { id: '8', name: 'Ảnh nền vườn', type: 'photo', isPremium: true, tags: ['vườn','nền'], category: 'Ảnh stock' },
];

const TYPE_LABELS: Record<string, string> = { icon:'Icon', shape:'Hình khối', illustration:'Minh họa', sticker:'Sticker', frame:'Khung', photo:'Ảnh' };
const TYPE_COLORS: Record<string, string> = { icon:'adm-badge-indigo', shape:'adm-badge-green', illustration:'adm-badge-yellow', sticker:'adm-badge-pink', frame:'adm-badge-gray', photo:'adm-badge-gray' };
const EMOJI_MAP: Record<string, string> = { icon:'🎨', shape:'⬟', illustration:'🖼', sticker:'✨', frame:'🖼', photo:'📷' };
const BG_COLORS = ['#fce7f3','#fef3c7','#d1fae5','#ede9fe','#dbeafe','#fee2e2','#fef9c3','#f3e8ff'];

export function LibraryElementsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');

  const filtered = MOCK_ELEMENTS.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchPremium = premiumFilter === 'all' || (premiumFilter === 'premium' ? e.isPremium : !e.isPremium);
    return matchSearch && matchType && matchPremium;
  });

  return (
    <div>
      {/* Type summary */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {Object.entries(TYPE_LABELS).map(([type, label]) => {
          const count = MOCK_ELEMENTS.filter(e => e.type === type).length;
          return (
            <button key={type} onClick={() => setTypeFilter(type === typeFilter ? 'all' : type)}
              style={{ background: typeFilter === type ? 'var(--adm-pink-50)' : '#fff', border:`1px solid ${typeFilter === type ? 'var(--adm-pink-mid)' : 'var(--adm-border-mid)'}`, borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, color: typeFilter === type ? 'var(--adm-pink)' : 'var(--adm-text-muted)', cursor:'pointer', display:'flex', gap:6, alignItems:'center' }}>
              {EMOJI_MAP[type]} {label} <span style={{ background:'var(--adm-bg)', borderRadius:99, padding:'1px 7px', fontSize:11 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div className="adm-search" style={{ maxWidth:300 }}>
          <Search className="adm-search-icon" />
          <input placeholder="Tìm element..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="adm-select" value={premiumFilter} onChange={e => setPremiumFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button className="adm-btn adm-btn-outline"><Upload size={14} /> Upload hàng loạt</button>
          <button className="adm-btn adm-btn-primary"><Upload size={14} /> Upload element</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:14 }}>
        {filtered.map((el, i) => (
          <div key={el.id} style={{ background:'#fff', borderRadius:12, border:'1px solid var(--adm-border)', overflow:'hidden', transition:'all 0.18s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--adm-shadow-md)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--adm-pink-mid)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = 'var(--adm-border)'; }}>
            {/* Thumb */}
            <div style={{ background: BG_COLORS[i % BG_COLORS.length], height:100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>
              {EMOJI_MAP[el.type]}
            </div>
            {/* Info */}
            <div style={{ padding:'10px 12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:600, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{el.name}</span>
                {el.isPremium && <Crown size={12} color="#f59e0b" />}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span className={`adm-badge ${TYPE_COLORS[el.type]}`} style={{ fontSize:10, padding:'2px 8px' }}>{TYPE_LABELS[el.type]}</span>
                <button className="adm-btn adm-btn-danger-ghost adm-btn-icon" title="Xóa" style={{ padding:'4px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div style={{ display:'flex', gap:4, marginTop:6, flexWrap:'wrap' }}>
                {el.tags.map(tag => (
                  <span key={tag} style={{ fontSize:10, background:'var(--adm-bg)', color:'var(--adm-text-muted)', borderRadius:4, padding:'2px 6px', display:'flex', gap:3, alignItems:'center' }}>
                    <Tag size={9} />{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
