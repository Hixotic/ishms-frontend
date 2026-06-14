import { useState } from "react";
import { Card, CardHeader, SectionTitle, Button, Toast } from "../components/ui";
import { useToast } from "../hooks/useToast";
import { Building2, Lock, Activity } from "lucide-react";

function Toggle({ enabled, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-all duration-200 ${enabled ? "bg-accent" : "bg-slate-200"}`}
    >
      <span className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-200 ${enabled ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

const labelCls = "block text-[12px] font-semibold text-txt-secondary mb-1.5";
const inputCls = "w-full h-9 rounded-lg border border-slate-200 bg-surf text-[13px] text-txt-primary px-3 outline-none focus:border-accent focus:bg-white transition-colors";


export default function Settings({ onLogout }) {
  const { toasts, show, remove } = useToast();
  const [general, setGeneral] = useState({ hospitalName: "Al-Noor General Hospital", timezone: "Africa/Cairo" });
  const [security, setSecurity] = useState({ sessionTimeout: 30, mfa: false });
  const [clinical, setClinical] = useState({ news2Threshold: 5, autoEscalate: true });

  const save = () => show("Settings saved successfully", "success");
  const reset = () => {
    setGeneral({ hospitalName: "Al-Noor General Hospital", timezone: "Africa/Cairo" });
    setSecurity({ sessionTimeout: 30, mfa: false });
    setClinical({ news2Threshold: 5, autoEscalate: true });
    show("Settings reset to defaults", "info");
  };

  // Logout handler for settings page
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("ishms_user");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">System Settings</h1>
        <p className="text-txt-secondary text-[13px] mt-0.5">Configure hospital system preferences</p>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Building2 size={16} className="text-accent" /><SectionTitle>General Settings</SectionTitle></div>
        </CardHeader>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Hospital Name</label>
            <input className={inputCls} value={general.hospitalName} onChange={e => setGeneral(g => ({ ...g, hospitalName: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Timezone</label>
            <select className={inputCls} value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}>
              {["Africa/Cairo","UTC","Asia/Riyadh","Europe/London","America/New_York"].map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Lock size={16} className="text-warning" /><SectionTitle>Security Settings</SectionTitle></div>
        </CardHeader>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-txt-primary">Session Timeout</p>
              <p className="text-[12px] text-txt-muted mt-0.5">Auto-logout after inactivity</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="h-9 rounded-lg border border-slate-200 bg-surf text-[13px] px-3 outline-none focus:border-accent" value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: +e.target.value }))}>
                {[15,30,60,120].map(v => <option key={v} value={v}>{v} minutes</option>)}
              </select>
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-txt-primary">Multi-Factor Authentication</p>
              <p className="text-[12px] text-txt-muted mt-0.5">Require MFA for all users</p>
            </div>
            <Toggle enabled={security.mfa} onToggle={() => setSecurity(s => ({ ...s, mfa: !s.mfa }))} />
          </div>
        </div>
      </Card>

      {/* Clinical */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Activity size={16} className="text-danger" /><SectionTitle>Clinical Settings</SectionTitle></div>
        </CardHeader>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-txt-primary">NEWS2 Alert Threshold</p>
              <p className="text-[12px] text-txt-muted mt-0.5">Trigger alerts when NEWS2 score reaches this value</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={10} step={1} value={clinical.news2Threshold}
                onChange={e => setClinical(c => ({ ...c, news2Threshold: +e.target.value }))}
                className="w-28 accent-accent"
              />
              <span className={`font-manrope font-bold text-[18px] w-6 text-center ${clinical.news2Threshold >= 7 ? "text-danger" : clinical.news2Threshold >= 4 ? "text-warning" : "text-success"}`}>
                {clinical.news2Threshold}
              </span>
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-txt-primary">Auto-Escalate Critical Alerts</p>
              <p className="text-[12px] text-txt-muted mt-0.5">Automatically notify senior staff for critical NEWS2</p>
            </div>
            <Toggle enabled={clinical.autoEscalate} onToggle={() => setClinical(c => ({ ...c, autoEscalate: !c.autoEscalate }))} />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={save}>Save Changes</Button>
        <Button variant="outline" onClick={reset}>Reset Defaults</Button>
        <Button variant="danger" onClick={handleLogout}>Log out from Dashboard</Button>
      </div>
    </div>
  );
}
