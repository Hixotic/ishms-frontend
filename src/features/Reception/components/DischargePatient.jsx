import React, { useState } from "react";
import {
  X,
  Home,
  Truck,
  Hospital,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react";
import { dischargePatient } from "../../APIS/apiHandler";
import { formatBedId, HandleDepartmentByBedId } from "../../APIS/Handler";

export const DischargeModal = ({ patient, isOpen, onClose, onSuccess }) => {
  const [isDischarging, setIsDischarging] = useState(false);
  const [dischargeType, setDischargeType] = useState("Home");
  const [notes, setNotes] = useState("");

  const handleDischarge = async () => {
    try {
      setIsDischarging(true);
      await dischargePatient(patient.id || patient.patientId);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert("Failed to discharge.");
    } finally {
      setIsDischarging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-8 space-y-8">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl font-black text-slate-900">
            Discharge Patient
          </h3>
          <button onClick={onClose}>
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Destination Selection */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "Home", icon: Home, label: "Home" },
            { id: "Transfer", icon: Truck, label: "Transfer" },
            { id: "Facility", icon: Hospital, label: "Facility" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setDischargeType(type.id)}
              className={`p-4 rounded-2xl border-2 ${dischargeType === type.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100"}`}
            >
              <type.icon size={20} className="mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase">
                {type.label}
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Clinical notes..."
          className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4"
        />

        <button
          onClick={handleDischarge}
          disabled={isDischarging}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-blue-700"
        >
          {isDischarging ? (
            <Loader2 className="animate-spin inline" />
          ) : (
            "Complete Discharge"
          )}
        </button>
      </div>
    </div>
  );
};
