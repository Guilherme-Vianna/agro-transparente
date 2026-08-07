// Dates from `@db.Date` columns have no time component — they must always be
// formatted in UTC, otherwise the displayed day shifts depending on the
// server's local timezone (e.g. UTC midnight renders as the previous day in
// America/Sao_Paulo).
export function formatDate(date: Date | string | null) {
  if (!date) return "—"
  const value = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(value)
}

export function addDaysUTC(date: Date, days: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}
