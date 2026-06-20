import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { patientApi, medicationApi } from "../lib/api";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";

export default function MedicationAdmin() {
  const navigate = useNavigate();
  const { id, medicationId } = useParams();
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [amountGiven, setAmountGiven] = useState("");
  const [patient, setPatient] = useState(null);
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientData = await patientApi.getPatientById(id);
        setPatient(patientData);

        // Fetch medications specifically from the medication API (Doctor's interface data)
        let medications = [];
        try {
          medications = await medicationApi.getPatientMedications(id);
        } catch (err) {
          console.warn("Failed to fetch medications from API:", err);
        }

        // Combine with medications in patient object as fallback
        const combinedMedications = [
          ...(medications || []),
          ...(patientData?.activeMedications || []),
          ...(patientData?.medications || []),
        ];

        // Find the specific medication by ID
        let med = combinedMedications.find(
          (m) => String(m.id) === String(medicationId),
        );

        setMedication(med || null);

        if (!med) {
          setError("Medication not found. Please select a valid medication.");
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load medication data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id && medicationId) {
      fetchData();
    }
  }, [id, medicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patient || !medication) {
      setError("Missing patient or medication data");
      return;
    }

    try {
      setSubmitting(true);
      const administrationData = {
        patientId: patient.id,
        medicationId: medication.id,
        amountGiven: amountGiven || medication.dosage || medication.dose,
        administeredAt: new Date().toISOString(),
        notes: notes,
      };

      await medicationApi.administerMedication(administrationData);

      setSubmitted(true);
      setTimeout(() => {
        navigate(`/nurse/patient/${patient.id}`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting medication:", err);
      setError("Failed to record medication administration. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground mt-4">
            Loading medication data...
          </p>
        </div>
      </div>
    );
  }

  if (!patient || !medication) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          {error && (
            <div className="mb-4 flex items-center justify-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <p className="text-lg">{error}</p>
            </div>
          )}
          {!error && (
            <p className="text-lg text-muted-foreground mb-4">Data not found</p>
          )}
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-status-stable rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Medication Administered Successfully
          </h2>
          <p className="text-muted-foreground mb-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Normalize medication field names for display
  const medName = medication.name || medication.medicationName || "Unknown";
  const medDosage = medication.dosage || medication.dose || "N/A";
  const medFrequency = medication.frequency || "N/A";
  const medRoute = medication.route || medication.administrationRoute || "N/A";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/nurse/patient/${patient.id}`)}
          className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold">Administer Medication</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Name</p>
              <p className="font-bold">
                {patient.fullName || patient.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">ID</p>
              <p className="font-bold">{patient.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Room</p>
              <p className="font-bold">{patient.roomNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Age</p>
              <p className="font-bold">{patient.age || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">Medication Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Medication Name
              </p>
              <p className="text-2xl font-bold text-primary">{medName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Prescribed Dosage
              </p>
              <p className="text-2xl font-bold">{medDosage}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Frequency</p>
              <p className="text-lg font-bold">{medFrequency}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Route</p>
              <p className="text-lg font-bold">{medRoute}</p>
            </div>
            {medication.prescribedBy && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Prescribed By
                </p>
                <p className="text-lg font-bold">{medication.prescribedBy}</p>
              </div>
            )}
            {medication.prescribedDate && (
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Prescription Date
                </p>
                <p className="text-lg font-bold">{medication.prescribedDate}</p>
              </div>
            )}
            {medication.instructions && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground text-sm mb-1">
                  Instructions
                </p>
                <p className="text-sm">{medication.instructions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">
            Record Medication Administration
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-bold mb-4 text-blue-900 dark:text-blue-100">
                Safety Verification Checklist
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">Verified patient identity</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">
                    Verified medication name and dosage
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">
                    Verified medication expiration date
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">Verified no allergies</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount Administered
              </label>
              <input
                type="text"
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                placeholder={`e.g., ${medDosage}`}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Time of Administration
              </label>
              <input
                type="time"
                defaultValue={new Date().toTimeString().slice(0, 5)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any relevant observations or comments..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-status-stable text-white rounded-lg font-bold hover:bg-status-stable/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!submitting && <Check size={20} />}
                <span>
                  {submitting
                    ? "Submitting..."
                    : "Confirm Medication Administration"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/nurse/patient/${patient.id}`)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
