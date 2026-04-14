export interface LogEntry {
  id?: string;
  user_id?: string;
  timestamp?: string;
  bristol_type: number | null;
  color?: string | null;
  size?: string | null;
  duration_minutes?: number | null;
  strain: string | null;
  urgency: string | null;
  symptoms: string[] | null;
  notes?: string | null;
  created_at?: string;
}

const strainMap: Record<string, number> = {
  None: 0,
  Mild: 3,
  Moderate: 6,
  Severe: 10,
};

export const averageStrain = (logs: LogEntry[]): number => {
  if (!logs.length) return 0;
  const total = logs.reduce((sum, log) => {
    return sum + (strainMap[log.strain ?? ""] ?? 0);
  }, 0);
  return total / logs.length;
};

export const symptomScore = (logs: LogEntry[]): number => {
  if (!logs.length) return 100;
  let penalty = 0;
  logs.forEach((log) => {
    if (log.symptoms?.includes("Blood")) penalty += 40;
    if (log.symptoms?.includes("Mucus")) penalty += 20;
    if (log.urgency === "High") penalty += 15;
  });
  return Math.max(0, 100 - penalty);
};

export const calculateGutHealthScore = (logs: LogEntry[]): number => {
  if (logs.length < 7) return 50;
  const recent = logs.slice(0, 30);
  const frequencyScore = Math.min(100, (recent.length / 7) * 100);
  const logsWithBristol = recent.filter((l) => l.bristol_type !== null);
  const consistencyScore =
    logsWithBristol.length === 0
      ? 0
      : (logsWithBristol.filter(
          (l) => l.bristol_type! >= 3 && l.bristol_type! <= 4
        ).length /
          logsWithBristol.length) *
        100;
  const easeScore = 100 - averageStrain(recent) * 10;
  return Math.round(
    0.35 * frequencyScore +
      0.35 * consistencyScore +
      0.2 * easeScore +
      0.1 * symptomScore(recent)
  );
};
