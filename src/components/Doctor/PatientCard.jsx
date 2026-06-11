export const PatientCard = ({ p }) => {
  const color = p.status === "Critical" ? 'var(--critical)' : 'var(--warning)';
  return (
    <div style={{ 
      background: 'white', borderRadius: '16px', border: '1px solid var(--border)', 
      padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{p.name}</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>MRN: {p.mrn} • {p.bed}</span>
        </div>
        <div style={{ background: color, color: 'white', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', fontWeight: 800 }}>NEWS2</div>
          <div style={{ fontSize: '20px', fontWeight: 900 }}>{p.news}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
        <Vital val={p.hr} lab="HR" color={p.hr > 100 ? 'red' : null} />
        <Vital val={p.bp} lab="BP" />
        <Vital val={p.spo2 + '%'} lab="SPO2" color={p.spo2 < 92 ? 'red' : null} />
        <Vital val={p.temp} lab="TEMP" />
        <Vital val={p.rr} lab="RR" />
      </div>

      {p.alert && <div style={{ background: p.status === 'Critical' ? 'var(--critical-bg)' : 'var(--warning-bg)', color: color, padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginBottom: '20px' }}>⚠️ {p.alert}</div>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Review</button>
        <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Medication</button>
      </div>
    </div>
  );
};

const Vital = ({ lab, val, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-light)' }}>{lab}</div>
    <div style={{ fontSize: '14px', fontWeight: 800, color: color || 'var(--text-main)' }}>{val}</div>
  </div>
);