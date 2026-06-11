import React from 'react';
import { X, Printer, PenLine, User, Activity, ClipboardList, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

const ISBARModal = ({ patient, isbar, onClose, onWriteReport }) => {
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString();
    
    // Professional Print Layout with CSS
    const printHtml = `
      <html>
        <head>
          <title>ISBAR Handover Report - ${patient.fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 4px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header-left h1 { margin: 0; color: #1e3a8a; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; font-size: 28px; }
            .header-right { text-align: right; font-size: 12px; color: #64748b; font-weight: 700; }
            .patient-info { background: #f8fafc; padding: 25px; border-radius: 15px; margin-bottom: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; border: 1px solid #e2e8f0; }
            .info-item label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 5px; }
            .info-item span { font-size: 14px; font-weight: 700; color: #1e293b; }
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 15px; margin-bottom: 15px; letter-spacing: 0.15em; }
            .section-content { font-size: 14px; padding-left: 19px; color: #334155; text-align: justify; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; font-weight: 700; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <h1>ISBAR Handover</h1>
              <p style="margin: 5px 0 0 0; font-weight: 700; color: #64748b; font-size: 12px;">Clinical Handover Documentation</p>
            </div>
            <div class="header-right">
              <p>Generated: ${currentDate}</p>
              <p>Confidential Medical Record</p>
            </div>
          </div>
          
          <div class="patient-info">
            <div class="info-item"><label>Patient Name</label><span>${patient.fullName}</span></div>
            <div class="info-item"><label>Patient ID</label><span>${patient.id}</span></div>
            <div class="info-item"><label>Location / Bed</label><span>Ward A - Bed ${patient.bedId}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Identify</div>
            <div class="section-content">${isbar.identify}</div>
          </div>
          <div class="section">
            <div class="section-title">Situation</div>
            <div class="section-content">${isbar.situation}</div>
          </div>
          <div class="section">
            <div class="section-title">Background</div>
            <div class="section-content">${isbar.background}</div>
          </div>
          <div class="section">
            <div class="section-title">Assessment</div>
            <div class="section-content">${isbar.assessment}</div>
          </div>
          <div class="section">
            <div class="section-title">Recommendation</div>
            <div class="section-content">${isbar.recommendation}</div>
          </div>

          <div class="footer">
            Electronic Medical Record System • Authorized Clinical Access Only • Page 1 of 1
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printHtml);
    printWindow.document.close();
    // Wait for styles/fonts to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const sections = [
    { l: 'Identify', v: isbar.identify, c: 'blue', icon: <User size={14} /> },
    { l: 'Situation', v: isbar.situation, c: 'amber', icon: <Activity size={14} /> },
    { l: 'Background', v: isbar.background, c: 'emerald', icon: <Info size={14} /> },
    { l: 'Assessment', v: isbar.assessment, c: 'rose', icon: <AlertCircle size={14} /> },
    { l: 'Recommendation', v: isbar.recommendation, c: 'violet', icon: <CheckCircle2 size={14} /> }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <ClipboardList size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase">ISBAR Handover</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black rounded-md uppercase tracking-widest">Confidential</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    {patient.fullName} • Bed {patient.bedId}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/60 hover:text-white border border-white/5 hover:border-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 hide-scrollbar bg-slate-50/30">
          {sections.map((item, i) => (
            <div key={i} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-${item.c}-50 text-${item.c}-600`}>
                  {item.icon}
                </div>
                <h3 className={`text-[10px] font-black text-${item.c}-900 uppercase tracking-[0.2em]`}>
                  {item.l}
                </h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm font-semibold pl-1">
                {item.v}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
          <button 
            onClick={handlePrint} 
            className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Printer size={18} />
            Generate PDF Report
          </button>
          <button 
            onClick={onWriteReport} 
            className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <PenLine size={18} />
            Finalize Report
          </button>
        </div>
      </div>
      
      {/* Scrollbar Hide CSS */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ISBARModal;
