import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi, vitalSignsApi } from '../lib/api';
import * as mockData from '../lib/mockData';
import { ArrowLeft, Check, AlertCircle, Heart } from 'lucide-react';

export default function VitalSignsEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ heartRate: '', temperature: '', systolicPressure: '', diastolicPressure: '', oxygenLevel: '', respirationRate: '', background: '' });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      try {
        let data = await patientApi.getPatientById(id);
        if (!data) data = mockData.getPatientById(id);
        return data;
      } catch (err) {
        return mockData.getPatientById(id);
      }
    },
  });

  useEffect(() => {
    if (patient) {
      // Get the latest vitals from any available source
      let latest = {};
      
      if (Array.isArray(patient.vitalSigns) && patient.vitalSigns.length > 0) {
        latest = patient.vitalSigns[0];
      } else if (patient.lastVitals) {
        latest = patient.lastVitals;
      } else if (patient.vitals) {
        latest = patient.vitals;
      }

      // Normalize field names (support both camelCase and PascalCase)
      setForm({
        heartRate: latest.HeartRate ? String(latest.HeartRate) : (latest.heartRate ? String(latest.heartRate) : ''),
        temperature: latest.Temperature ? String(latest.Temperature) : (latest.temperature ? String(latest.temperature) : ''),
        systolicPressure: latest.SystolicPressure ? String(latest.SystolicPressure) : (latest.systolicPressure ? String(latest.systolicPressure) : ''),
        diastolicPressure: latest.DiastolicPressure ? String(latest.DiastolicPressure) : (latest.diastolicPressure ? String(latest.diastolicPressure) : ''),
        oxygenLevel: latest.OxygenLevel ? String(latest.OxygenLevel) : (latest.oxygenLevel ? String(latest.oxygenLevel) : (latest.oxygenSaturation ? String(latest.oxygenSaturation) : '')),
        respirationRate: latest.RespirationRate ? String(latest.RespirationRate) : (latest.respirationRate ? String(latest.respirationRate) : (latest.respiratoryRate ? String(latest.respiratoryRate) : '')),
        background: patient.background || patient.admissionDiagnosis || ''
      });
    }
  }, [patient]);

  const addVitalsMutation = useMutation({
    mutationFn: (vitalData) => vitalSignsApi.addVitalSigns(vitalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(`/patient/${id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.heartRate && !form.temperature && !form.systolicPressure && !form.oxygenLevel && !form.respirationRate) return;
    addVitalsMutation.mutate({
      patientId: id,
      heartRate: form.heartRate ? parseInt(form.heartRate) : null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      systolicPressure: form.systolicPressure ? parseInt(form.systolicPressure) : null,
      diastolicPressure: form.diastolicPressure ? parseInt(form.diastolicPressure) : null,
      oxygenLevel: form.oxygenLevel ? parseInt(form.oxygenLevel) : null,
      respirationRate: form.respirationRate ? parseInt(form.respirationRate) : null,
      recordedAt: new Date().toISOString(),
      background: form.background,
    });
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!patient) return <div className="min-h-screen bg-background flex items-center justify-center text-center"><p className="text-lg text-muted-foreground mb-4">Patient not found</p><button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Back to Dashboard</button></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(`/patient/${patient.id}`)} className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"><ArrowLeft size={20} /><span>Back</span></button>
        <h1 className="text-3xl font-bold">Record Vital Signs</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-muted-foreground text-sm">Name</p><p className="font-bold">{patient.fullName || patient.name}</p></div>
            <div><p className="text-muted-foreground text-sm">ID</p><p className="font-bold">{patient.id}</p></div>
            <div><p className="text-muted-foreground text-sm">Room</p><p className="font-bold">{patient.roomNumber || 'N/A'}</p></div>
            <div><p className="text-muted-foreground text-sm">Age</p><p className="font-bold">{patient.age}</p></div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Heart size={24} className="text-red-500" />Record Vital Signs</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label><input type="number" value={form.heartRate} onChange={e => setForm({...form, heartRate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
              <div><label className="block text-sm font-medium mb-2">Temperature (°C)</label><input type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
              <div><label className="block text-sm font-medium mb-2">Systolic (mmHg)</label><input type="number" value={form.systolicPressure} onChange={e => setForm({...form, systolicPressure: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
              <div><label className="block text-sm font-medium mb-2">Diastolic (mmHg)</label><input type="number" value={form.diastolicPressure} onChange={e => setForm({...form, diastolicPressure: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
              <div><label className="block text-sm font-medium mb-2">Oxygen Level (%)</label><input type="number" value={form.oxygenLevel} onChange={e => setForm({...form, oxygenLevel: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
              <div><label className="block text-sm font-medium mb-2">Respiration Rate</label><input type="number" value={form.respirationRate} onChange={e => setForm({...form, respirationRate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-input" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-2">Background (ISBAR)</label><textarea value={form.background} onChange={e => setForm({...form, background: e.target.value})} placeholder="Enter patient background information for ISBAR handover..." className="w-full px-4 py-2 border border-border rounded-lg bg-input h-32" required /></div>
            <div className="flex gap-4">
              <button type="submit" disabled={addVitalsMutation.isPending} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {addVitalsMutation.isPending ? 'Saving...' : <><Check size={20} />Save Vital Signs</>}
              </button>
              <button type="button" onClick={() => navigate(`/patient/${patient.id}`)} className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
