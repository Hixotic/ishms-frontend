import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Pill,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";

import { getPatientById } from "./APIS/apiHandler";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("vitals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);

        const data = await getPatientById(id);

        if (!isMounted) return;

        if (!data) {
          setError("Patient not found");
          setPatient(null);
        } else {
          setPatient(data);
          setMedications(data.medications || []);
          setReports(data.reports || []);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load patient");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading patient...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error || "No patient found"}</div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* TOP BAR */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 mb-4"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl font-bold">{patient.name}</h1>
        <p className="text-gray-500">ID: {patient.id}</p>

        <div className="mt-3 flex gap-4">
          <button
            onClick={() => setActiveTab("vitals")}
            className={`px-4 py-2 rounded-lg ${activeTab === "vitals" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            <Heart size={16} className="inline mr-1" />
            Vitals
          </button>

          <button
            onClick={() => setActiveTab("care")}
            className={`px-4 py-2 rounded-lg ${activeTab === "care" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            <FileText size={16} className="inline mr-1" />
            Care
          </button>

          <button
            onClick={() => setActiveTab("meds")}
            className={`px-4 py-2 rounded-lg ${activeTab === "meds" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            <Pill size={16} className="inline mr-1" />
            Medications
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* VITALS */}
        {activeTab === "vitals" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Heart className="mx-auto text-red-500" />
              <p className="text-xl font-bold">{patient.vitals?.hr || "--"}</p>
              <p className="text-sm text-gray-500">Heart Rate</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xl">🌡️</p>
              <p className="text-xl font-bold">
                {patient.vitals?.temp || "--"}°C
              </p>
              <p className="text-sm text-gray-500">Temp</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xl font-bold">{patient.vitals?.bp || "--"}</p>
              <p className="text-sm text-gray-500">Blood Pressure</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-xl font-bold">{patient.vitals?.o2 || "--"}%</p>
              <p className="text-sm text-gray-500">Oxygen</p>
            </div>
          </div>
        )}

        {/* CARE */}
        {activeTab === "care" && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-600">Diagnosis</p>
              <p>{patient.diagnosis || "No data"}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-600">Treatment</p>
              <p>{patient.treatment || "No data"}</p>
            </div>

            {reports.map((r, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">{r.date}</p>
                <p>
                  <b>Diagnosis:</b> {r.diagnosis}
                </p>
                <p>
                  <b>Treatment:</b> {r.treatment}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* MEDS */}
        {activeTab === "meds" && (
          <div className="space-y-3">
            {medications.length === 0 && (
              <p className="text-gray-500">No medications</p>
            )}

            {medications.map((m) => (
              <div
                key={m.id}
                className="p-4 border rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.dosage}</p>
                </div>

                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                  Administer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
