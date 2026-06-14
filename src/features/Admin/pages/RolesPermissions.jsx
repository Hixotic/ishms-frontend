import { useState } from "react";
import { Card, CardHeader, SectionTitle, Button, Toast } from "../components/ui";
import { permissions } from "../data/mockData";
import { useToast } from "../hooks/useToast";
import { Shield } from "lucide-react";

const actionKeys = ["view", "create", "edit", "delete"];
const actionLabels = { view: "View", create: "Create", edit: "Edit", delete: "Delete" };
const roleColors = { Nurse: "bg-blue-100 text-blue-700", Doctor: "bg-purple-100 text-purple-700", HOD: "bg-cyan-100 text-cyan-700", Admin: "bg-red-100 text-red-700" };

export default function RolesPermissions() {
  const [matrix, setMatrix] = useState(permissions.matrix);
  const { toasts, show, remove } = useToast();

  const toggle = (role, action, idx) => {
    setMatrix(m => ({
      ...m,
      [role]: {
        ...m[role],
        [action]: m[role][action].map((v, i) => i === idx ? !v : v),
      },
    }));
  };

  const handleSave = () => show("Permissions saved successfully", "success");

  return (
    <div className="flex flex-col gap-5">
      <Toast toasts={toasts} remove={remove} />

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope font-extrabold text-txt-primary text-2xl">Roles & Permissions</h1>
          <p className="text-txt-secondary text-[13px] mt-0.5">Manage RBAC access control for each role</p>
        </div>
        <Button variant="primary" onClick={handleSave}><Shield size={15} /> Save Changes</Button>
      </div>

      {permissions.roles.map(role => (
        <Card key={role}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${roleColors[role]}`}>{role}</span>
              <SectionTitle>Permission Matrix</SectionTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-txt-secondary uppercase tracking-wide w-48">Module</th>
                  {actionKeys.map(a => (
                    <th key={a} className="px-4 py-3 text-center text-[11px] font-bold text-txt-secondary uppercase tracking-wide">{actionLabels[a]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.modules.map((mod, idx) => (
                  <tr key={mod} className="border-b border-slate-50 hover:bg-surf/60">
                    <td className="px-5 py-3 font-medium text-txt-primary">{mod}</td>
                    {actionKeys.map(action => {
                      const enabled = matrix[role][action][idx];
                      return (
                        <td key={action} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggle(role, action, idx)}
                            className={`relative inline-flex items-center w-10 h-5 rounded-full transition-all duration-200 focus:outline-none ${enabled ? "bg-accent" : "bg-slate-200"}`}
                          >
                            <span className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-200 ${enabled ? "translate-x-5" : "translate-x-1"}`} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
