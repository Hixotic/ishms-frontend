import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { patientApi } from "../lib/api";
import ISBARModule from "../components/ISBARModule";
import { ArrowLeft } from "lucide-react";

export default function ISBARPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patientIdInput, setPatientIdInput] = useState(id || "");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatient = async (patientId) => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await patientApi.getPatientById(patientId);
      if (data) {
        setPatient(data);
      } else {
        setError("Patient not found");
        setPatient(null);
      }
    } catch (err) {
      setError("Failed to load patient data");
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatient(id);
    }
  }, [id]);

  const handleGenerateClick = (e) => {
    e.preventDefault();
    if (patientIdInput) {
      fetchPatient(patientIdInput);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() =>
            patient ? navigate(`/nurse/patient/${patient.id}`) : navigate("/")
          }
          className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold">ISBAR Handover</h1>
        <p className="text-muted-foreground mt-2">
          Generate automated ISBAR reports by entering Patient ID.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-8">
          <form
            onSubmit={handleGenerateClick}
            className="flex flex-col sm:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2">
                Enter Patient ID
              </label>
              <input
                type="text"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                placeholder="e.g., P001"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !patientIdInput}
              className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Generate ISBAR"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">
              Fetching patient data and generating report...
            </p>
          </div>
        )}

        {patient && !loading && <ISBARModule patient={patient} />}
      </div>
    </div>
  );
}
