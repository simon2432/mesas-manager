import { effectiveTodayYmd } from "@/src/store/operationalDay.store";

type Props = {
  value: string;
  onChange: (ymd: string) => void;
  minYmd?: string;
  maxYmd?: string;
};

export function WebDateInput({ value, onChange, minYmd, maxYmd }: Props) {
  const max = maxYmd ?? effectiveTodayYmd();
  return (
    <input
      type="date"
      value={value}
      min={minYmd}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        borderRadius: 8,
        border: "1px solid #e2e4e8",
        marginTop: 8,
        marginBottom: 8,
        boxSizing: "border-box",
        fontFamily: "system-ui, sans-serif",
      }}
    />
  );
}
