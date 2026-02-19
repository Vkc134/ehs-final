import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import StatCard from "@/components/dashboard/StatCard";
import VisitsTable from "@/components/dashboard/VisitsTable";
import PatientsTable from "@/components/dashboard/PatientsTable";
import FormDialog from "@/components/dashboard/FormDialog";
import PatientDetailsModal from "@/components/dashboard/PatientDetailsModal"; // Added import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  Users,
  Activity,
  Calendar,
  UserPlus,
  ClipboardPlus,
  Stethoscope,
  Heart,
  Thermometer,
  Scale,
  Search,
  Eye,
  AlertCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5266"}/api`;




export default function NurseDashboard() {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("ehs_token")}`,
  };

  // State
  // State
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [openPatient, setOpenPatient] = useState(false);
  const [openVisit, setOpenVisit] = useState(false);
  const [openVitals, setOpenVitals] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [openDoctorSelect, setOpenDoctorSelect] = useState(false);
  const [openPatientSelect, setOpenPatientSelect] = useState(false); // Added for Patient Combobox
  const [openUpload, setOpenUpload] = useState(false);

  const [openPatientDetails, setOpenPatientDetails] = useState(false); // Added for details modal
  const [selectedPatient, setSelectedPatient] = useState(null); // To track which patient to view

  const [showAllPatients, setShowAllPatients] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [previewData, setPreviewData] = useState(null);

  // Forms
  const [patientForm, setPatientForm] = useState({
    patientFirstName: "",
    patientLastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    prescription: "",
    bloodGroup: "",
    isVyasa: null,
    age: "",
  });

  const [visitForm, setVisitForm] = useState({
    patientId: "",
    consultantDoctorName: "",
    priority: "Normal",
  });

  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: "",
    pulse: "",
    temperature: "",
    SpO2: "", // Fixed casing to match backend SpO2 property
    weight: "",
    height: "",
    bmi: "",
  });

  // Calculate BMI whenever weight or height changes
  useEffect(() => {
    if (vitalsForm.weight && vitalsForm.height) {
      const w = parseFloat(vitalsForm.weight);
      const h = parseFloat(vitalsForm.height) / 100; // convert cm to m
      if (w > 0 && h > 0) {
        const bmiVal = (w / (h * h)).toFixed(1);
        setVitalsForm(prev => ({ ...prev, bmi: bmiVal }));
      }
    }
  }, [vitalsForm.weight, vitalsForm.height]);

  // Load Data
  const loadPatients = async () => {
    try {
      const res = await axios.get(`${API}/patients`, { headers });
      console.log("Patients fetched:", res.data);
      if (Array.isArray(res.data)) {
        setPatients(res.data);
        if (res.data.length === 0) toast.info("No patients found in database.");
      } else {
        console.error("Unexpected patient data format:", res.data);
        toast.error("Invalid patient data format received.");
        // Fallback for debugging: if wrapped in data property
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          setPatients(res.data.data);
          toast.success("Recovered patients from nested data property.");
        }
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
      toast.error(`Failed to load patients: ${error.message}`);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await axios.get(`${API.replace("/api", "/auth")}/doctors`, { headers });
      setDoctors(res.data);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    }
  };

  const loadVisits = async () => {
    try {
      const res = await axios.get(`${API}/visits`, { headers });
      setVisits(res.data);
    } catch (error) {
      console.error("Failed to load visits:", error);
    }
  };

  useEffect(() => {
    loadPatients();
    loadVisits();
    loadDoctors();

    const interval = setInterval(loadVisits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Today's Visits Filter
  const todayVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return visits.filter((v) => {
      const dateVal = v.createdAt || v.createdOn;
      if (!dateVal) return false;
      // Backend sends UTC but might miss 'Z'. Append it to force UTC parsing.
      const d = new Date(dateVal.endsWith("Z") ? dateVal : dateVal + "Z");
      return d >= today && d < tomorrow;
    });
  }, [visits]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) =>
      `${p.patientFirstName} ${p.patientLastName}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [patients, searchText]);

  // Actions
  const createPatient = async (e) => {
    e.preventDefault();

    if (!patientForm.bloodGroup || patientForm.isVyasa === null || !patientForm.patientFirstName || !patientForm.age || !patientForm.phoneNumber) {
      toast.error("Please fill all required fields (First Name, Age, Phone, Blood Group, Vyasa Status)");
      return;
    }

    // Calculate approximate DOB
    const year = new Date().getFullYear() - parseInt(patientForm.age);
    const dob = `${year}-01-01`; // Default to Jan 1st

    const payload = { ...patientForm, dateOfBirth: dob };
    // Remove age from payload if backend doesn't accept it, but backend ignores unknown fields usually.
    // However, ensure 'dateOfBirth' is set correctly.

    try {
      await axios.post(`${API}/patients`, payload, { headers });
      toast.success("Patient registered successfully");
      setOpenPatient(false);
      setPatientForm({
        patientFirstName: "",
        patientLastName: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        phoneNumber: "",
        email: "",
        address: "",
        prescription: "",
        bloodGroup: "",
        isVyasa: null,
      });
      loadPatients();
    } catch (error) {
      toast.error("Failed to register patient");
    }
  };

  const createVisit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API}/visits`,
        { ...visitForm, patientId: Number(visitForm.patientId) },
        { headers }
      );
      toast.success("Visit created successfully");
      setOpenVisit(false);
      setVisitForm({ patientId: "", consultantDoctorName: "", priority: "Normal" });
      loadVisits();
    } catch (error) {
      toast.error("Failed to create visit");
    }
  };

  const saveVitals = async (e) => {
    e.preventDefault();

    if (!selectedVisit) return;

    try {
      await axios.post(
        `${API}/vitals`,
        { visitId: selectedVisit.visitId, ...vitalsForm },
        { headers }
      );

      await axios.put(
        `${API}/visits/${selectedVisit.visitId}/status`,
        { status: "Vitals Recorded" },
        { headers }
      );

      toast.success("Vitals recorded successfully");
      setOpenVitals(false);
      setVitalsForm({ bloodPressure: "", pulse: "", temperature: "", SpO2: "", weight: "", height: "", bmi: "" });
      loadVisits();
    } catch (error) {
      toast.error("Failed to record vitals");
    }
  };

  const loadPreview = async (visitId) => {
    try {
      const res = await axios.get(`${API}/vitals/preview/${visitId}`, { headers });
      setPreviewData(res.data);
      setOpenPreview(true);
    } catch (error) {
      toast.error("Failed to load vitals preview");
    }
  };

  // Abnormal Check
  const isAbnormal = (label, value) => {
    if (!value) return false;
    if (label === "SpO₂") return Number(value) < 92;
    if (label === "Pulse") return Number(value) < 60 || Number(value) > 100;
    if (label === "BP" && typeof value === "string") {
      const [s, d] = value.split("/").map(Number);
      return s > 140 || d > 90;
    }
    return false;
  };

  const handleRecordVitals = (visit) => {
    setSelectedVisit(visit);
    setOpenVitals(true);
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Slower stagger
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 }, // Larger offset
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70, // Softer spring
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 40%, #f5f3ff 100%)" }}>
      <Navbar title="Nurse Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Greeting Header */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">Welcome back! 👋</h1>
                  <p className="text-slate-400 text-sm font-medium">Here's your patient care summary for today</p>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Today</p>
                <p className="text-sm font-bold text-slate-600">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
            </div>
            {/* Subtle left accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-500 to-indigo-600" />
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Patients"
              value={patients.length}
              icon={Users}
              gradient="info"
            />
            <StatCard
              title="Active Visits"
              value={todayVisits.filter((v) => v.status !== "Completed").length}
              icon={Activity}
              gradient="success"
            />
            <StatCard
              title="Today's Visits"
              value={todayVisits.length}
              icon={Calendar}
              gradient="primary"
            />
          </motion.div>

          {/* Action Bar */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Register Patient */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpenPatient(true)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-sm">Register Patient</p>
                <p className="text-blue-100 text-xs font-medium">Add new patient record</p>
              </div>
            </motion.button>

            {/* Create Visit */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpenVisit(true)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <ClipboardPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-sm">Create Visit</p>
                <p className="text-emerald-100 text-xs font-medium">Schedule a new visit</p>
              </div>
            </motion.button>

            {/* All Patients toggle */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAllPatients(!showAllPatients)}
              className={`flex items-center gap-4 p-4 rounded-2xl text-left shadow-lg transition-all ${showAllPatients
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-200"
                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-slate-200"
                }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${showAllPatients ? "bg-white/20" : "bg-white shadow-sm"
                }`}>
                <Users className={`h-5 w-5 ${showAllPatients ? "text-white" : "text-violet-600"}`} />
              </div>
              <div>
                <p className="font-black text-sm">All Patients</p>
                <p className={`text-xs font-medium ${showAllPatients ? "text-violet-100" : "text-slate-500"}`}>
                  {showAllPatients ? "Showing patient list" : "View full patient list"}
                </p>
              </div>
            </motion.button>
          </motion.div>


          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {!showAllPatients ? (
                <motion.div
                  key="visits"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <VisitsTable
                    visits={todayVisits}
                    onRecordVitals={handleRecordVitals}
                    onPreview={loadPreview}
                    onUpload={(visit) => {
                      setSelectedVisit(visit);
                      setOpenUpload(true);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PatientsTable
                    patients={filteredPatients}
                    onSearch={(val) => setSearchText(val)}
                    onView={(patient) => {
                      setSelectedPatient(patient);
                      setOpenPatientDetails(true);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        open={openPatientDetails}
        onOpenChange={setOpenPatientDetails}
        patient={selectedPatient}
      />

      <UploadDialog
        open={openUpload}
        onOpenChange={setOpenUpload}
        visit={selectedVisit}
        onUploadSuccess={loadVisits}
      />

      {/* Register Patient Dialog */}
      <FormDialog
        open={openPatient}
        onOpenChange={setOpenPatient}
        title="Register New Patient"
        icon={<UserPlus className="h-5 w-5 text-primary-foreground" />}
        maxWidth="2xl"
      >
        <form onSubmit={createPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              required
              className="rounded-lg"
              onChange={(e) =>
                setPatientForm({ ...patientForm, patientFirstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              className="rounded-lg"
              onChange={(e) =>
                setPatientForm({ ...patientForm, patientLastName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter age"
              required
              className="rounded-lg"
              onChange={(e) =>
                setPatientForm({ ...patientForm, age: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select
              onValueChange={(v) => setPatientForm({ ...patientForm, gender: v })}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              required
              className="rounded-lg"
              onChange={(e) =>
                setPatientForm({ ...patientForm, phoneNumber: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email (optional)"
              className="rounded-lg"
              onChange={(e) =>
                setPatientForm({ ...patientForm, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Blood Group *</Label>
            <Select
              onValueChange={(v) => setPatientForm({ ...patientForm, bloodGroup: v })}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vyasa Patient? *</Label>
            <Select
              onValueChange={(v) =>
                setPatientForm({ ...patientForm, isVyasa: v === "true" })
              }
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="true">Vyasa</SelectItem>
                <SelectItem value="false">Non-Vyasa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter address"
              className="rounded-lg resize-none"
              onChange={(e) =>
                setPatientForm({ ...patientForm, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              placeholder="Enter prescription details"
              className="rounded-lg resize-none"
              onChange={(e) =>
                setPatientForm({ ...patientForm, prescription: e.target.value })
              }
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="md:col-span-2"
          >
            <Button
              type="submit"
              className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity py-6 text-base font-semibold"
            >
              Register Patient
            </Button>
          </motion.div>
        </form>
      </FormDialog>

      {/* Create Visit Dialog */}
      <FormDialog
        open={openVisit}
        onOpenChange={setOpenVisit}
        title="Create New Visit"
        icon={<ClipboardPlus className="h-5 w-5 text-primary-foreground" />}
      >
        <form onSubmit={createVisit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <Popover open={openPatientSelect} onOpenChange={setOpenPatientSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPatientSelect}
                  className="w-full justify-between rounded-lg font-normal h-10 px-3 border-input bg-background"
                >
                  {visitForm.patientId
                    ? patients.find((p) => p.patientId.toString() === visitForm.patientId.toString())
                      ? `${patients.find((p) => p.patientId.toString() === visitForm.patientId.toString()).patientFirstName} ${patients.find((p) => p.patientId.toString() === visitForm.patientId.toString()).patientLastName}`
                      : "Select patient..."
                    : "Select patient..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border shadow-xl">
                <Command>
                  <CommandInput placeholder="Search patient by name..." className="h-9" />
                  <CommandEmpty>No patient found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {patients.map((p) => {
                      const fullName = `${p.patientFirstName} ${p.patientLastName}`;
                      return (
                        <CommandItem
                          key={p.patientId}
                          value={fullName}
                          onSelect={() => {
                            setVisitForm({ ...visitForm, patientId: p.patientId.toString() });
                            setOpenPatientSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              visitForm.patientId.toString() === p.patientId.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold">{fullName}</span>
                            <span className="text-[10px] text-muted-foreground">ID: {p.patientId} • {p.phoneNumber}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor">Consultant Doctor *</Label>
            <Popover open={openDoctorSelect} onOpenChange={setOpenDoctorSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDoctorSelect}
                  className="w-full justify-between rounded-lg font-normal h-10 px-3 border-input bg-background"
                >
                  {visitForm.consultantDoctorName
                    ? doctors.find((d) => (d.name || d.email) === visitForm.consultantDoctorName)?.name || visitForm.consultantDoctorName
                    : "Select doctor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border shadow-xl">
                <Command>
                  <CommandInput placeholder="Search doctor by typing..." className="h-9" />
                  <CommandEmpty>No doctor found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {doctors.map((d) => {
                      const displayName = d.name || d.email;
                      const subLabel = d.credentials || d.role;
                      return (
                        <CommandItem
                          key={d.id}
                          value={displayName}
                          onSelect={() => {
                            setVisitForm({
                              ...visitForm,
                              consultantDoctorName: displayName
                            });
                            setOpenDoctorSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              visitForm.consultantDoctorName === displayName ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold">{displayName}</span>
                            {subLabel && <span className="text-[10px] text-muted-foreground">{subLabel}</span>}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              defaultValue="Normal"
              onValueChange={(v) => setVisitForm({ ...visitForm, priority: v })}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              className="w-full rounded-xl gradient-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity py-5 text-base font-semibold"
            >
              Create Visit
            </Button>
          </motion.div>
        </form>
      </FormDialog>

      {/* Record Vitals Dialog */}
      <FormDialog
        open={openVitals}
        onOpenChange={setOpenVitals}
        title="Record Vitals"
        icon={<Stethoscope className="h-5 w-5 text-primary-foreground" />}
      >
        <form onSubmit={saveVitals} className="space-y-4">
          {selectedVisit && (
            <div className="p-3 rounded-lg bg-accent/50 border border-border mb-4">
              <p className="text-sm text-muted-foreground">
                Recording vitals for: {" "}
                <span className="font-medium text-foreground">
                  {selectedVisit.patientName}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-emergency" />
                Blood Pressure *
              </Label>
              <Input
                placeholder="e.g., 120/80"
                required
                className="rounded-lg"
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Pulse *
              </Label>
              <Input
                placeholder="e.g., 72"
                required
                className="rounded-lg"
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, pulse: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-warning" />
                Temperature *
              </Label>
              <Input
                placeholder="e.g., 98.6"
                required
                className="rounded-lg"
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, temperature: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-info" />
                SpO₂ *
              </Label>
              <Input
                placeholder="e.g., 98"
                required
                className="rounded-lg"
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, SpO2: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-success" />
                Weight (kg) *
              </Label>
              <Input
                placeholder="e.g., 70"
                required
                className="rounded-lg"
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, weight: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Height (cm)
              </Label>
              <Input
                placeholder="e.g., 170"
                className="rounded-lg"
                value={vitalsForm.height || ""}
                onChange={(e) =>
                  setVitalsForm({ ...vitalsForm, height: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                BMI
              </Label>
              <Input
                readOnly
                placeholder="Auto-calculated"
                className="rounded-lg bg-slate-50"
                value={vitalsForm.bmi || ""}
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              className="w-full rounded-xl gradient-success text-primary-foreground shadow-lg hover:opacity-90 transition-opacity py-5 text-base font-semibold"
            >
              Save Vitals
            </Button>
          </motion.div>
        </form>
      </FormDialog>

      {/* Vitals Preview Dialog */}
      <FormDialog
        open={openPreview}
        onOpenChange={setOpenPreview}
        title="Vitals Preview"
        icon={<Eye className="h-5 w-5 text-primary-foreground" />}
      >
        {previewData && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "BP", value: previewData.bloodPressure, unit: "mmHg", icon: Heart, color: "text-emergency" },
              { label: "Pulse", value: previewData.pulse, unit: "bpm", icon: Activity, color: "text-primary" },
              { label: "Temp", value: previewData.temperature, unit: "°F", icon: Thermometer, color: "text-warning" },
              { label: "SpO₂", value: previewData.spO2 || previewData.spo2, unit: "%", icon: Activity, color: "text-info" },
              { label: "Weight", value: previewData.weight, unit: "kg", icon: Scale, color: "text-success" },
              { label: "Height", value: previewData.height, unit: "cm", icon: Activity, color: "text-purple-500" },
              { label: "BMI", value: previewData.bmi, unit: "", icon: Activity, color: "text-slate-600" },
            ].map(({ label, value, unit, icon: Icon, color }) => {
              if (!value) return null;
              const abnormal = isAbnormal(label, value);
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center ${abnormal
                    ? "bg-emergency/5 border-emergency/30"
                    : "bg-accent/30 border-border"
                    }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${color}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className={`text-2xl font-black ${abnormal ? "text-emergency" : "text-foreground"
                        }`}
                    >
                      {value}
                    </span>
                    {unit && <span className="text-xs font-semibold text-muted-foreground">{unit}</span>}
                  </div>
                  {abnormal && (
                    <div className="flex items-center gap-1 mt-1 text-emergency text-[10px] font-bold uppercase">
                      <AlertCircle className="h-3 w-3" />
                      Check
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </FormDialog>
    </div>
  );
}

function UploadDialog({ open, onOpenChange, visit, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !visit) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload File
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("ehs_token")}`
        },
      });

      const attachmentPath = uploadRes.data.filePath;

      // 2. Update Visit
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/visits/${visit.visitId}/attachment`,
        { attachmentPath },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("ehs_token")}` }
        }
      );

      toast.success("File attached successfully");
      onUploadSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Attach File"
      icon={<ClipboardPlus className="h-5 w-5 text-primary-foreground" />}
    >
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <div className="flex flex-col items-center justify-center py-4">
            {file ? (
              <>
                <p className="font-semibold text-green-600">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-600">Click to select a file</p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG up to 5MB</p>
              </>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload & Attach"}
        </Button>
      </form>
    </FormDialog>
  );
}
