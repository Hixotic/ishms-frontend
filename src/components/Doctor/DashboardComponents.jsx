import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PatientCard = ({ p }) => {
  const navigate = useNavigate();
  const record = p.vitalSigns?.[0] || {};
  const vitals = {
    heartRate: record.HeartRate || record.heartRate,
    systolicPressure: record.SystolicPressure || record.systolicPressure,
    diastolicPressure: record.DiastolicPressure || record.diastolicPressure,
    oxygenLevel: record.OxygenLevel || record.oxygenLevel,
    temperature: record.Temperature || record.temperature,
    respirationRate: record.RespirationRate || record.respirationRate,
  };
  const newsColor = p.newsScore >= 7 ? 'var(--critical)' : p.newsScore >= 5 ? 'var(--warning)' : 'var(--stable)';

  const handleNavigate = () => navigate(`/patients/${p.id}`);

  return (
    <div style={{ 
      background: 'white', borderRadius: '16px', border: '1px solid var(--border)', 
      padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 
            onClick={handleNavigate}
            style={{ margin: 0, fontSize: '20px', fontWeight: 900, cursor: 'pointer', color: 'var(--text-main)' }}
          >
            {p.fullName}
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
            MRN: {p.mrn} • {p.ward} / {p.bed}
          </div>
        </div>
        <div style={{ background: newsColor, color: 'white', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', minWidth: '60px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800 }}>NEWS2</div>
          <div style={{ fontSize: '20px', fontWeight: 900 }}>{p.newsScore}</div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', 
        background: '#F8FAFC', padding: '15px 10px', borderRadius: '12px', marginBottom: '20px' 
      }}>
        <Vital l="HR" v={vitals.heartRate} c={vitals.heartRate > 100 ? 'var(--critical)' : null} />
        <Vital l="BP" v={`${vitals.systolicPressure}/${vitals.diastolicPressure}`} />
        <Vital l="SpO2" v={vitals.oxygenLevel + '%'} c={vitals.oxygenLevel < 92 ? 'var(--critical)' : null} />
        <Vital l="TEMP" v={vitals.temperature} />
        <Vital l="RR" v={vitals.respirationRate} c={vitals.respirationRate > 20 ? 'var(--critical)' : null} />
      </div>

      {p.inConsult ? (
        <div style={{ padding: '15px', borderRadius: '10px', border: '1px dashed var(--border)', textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>🔒 In Consult with {p.inConsult}</span>
        </div>
      ) : p.alertMessage ? (
        <div style={{ 
          background: p.status === 'Critical' ? 'var(--critical-bg)' : 'var(--warning-bg)', 
          color: p.status === 'Critical' ? 'var(--critical)' : 'var(--warning)', 
          padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, marginBottom: '20px', lineHeight: '1.4'
        }}>
          ⚠️ {p.alertMessage}
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{p.alertTime}</div>
        </div>
      ) : (
        <div style={{ height: '54px' }} /> 
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleNavigate} style={btnSec}>Review</button>
        <button style={btnSec}>Acknowledge</button>
        <button style={btnPri}>Medication</button>
      </div>
    </div>
  );
};

const Vital = ({ l, v, c }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>{l}</div>
    <div style={{ fontSize: '14px', fontWeight: 900, color: c || 'var(--text-main)' }}>{v}</div>
  </div>
);

const btnSec = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 800, fontSize: '12px', cursor: 'pointer' };
const btnPri = { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '12px', cursor: 'pointer' };

export const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    flex: 1, background: 'white', padding: '20px', borderRadius: '12px',
    borderTop: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '32px', fontWeight: 900, color: color, margin: '5px 0' }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{sub}</div>
  </div>
);