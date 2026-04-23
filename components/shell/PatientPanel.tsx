interface Patient {
  id: string;
  name: string;
  status: "active" | "paused" | "closed";
  lastSession?: string;
  riskLevel?: "low" | "medium" | "high";
  pendingAnalysis?: boolean;
}

interface PatientPanelProps {
  patients: Patient[];
}

export function PatientPanel(_props: PatientPanelProps) {
  return null;
}
