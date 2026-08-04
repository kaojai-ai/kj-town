const migrationDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "long",
});

export function formatLastMigrateContent(
  rawContent: string,
  formatDate = (date: Date) => migrationDateFormatter.format(date),
): string {
  const content = rawContent.trim();
  const epochLine = content.split(/\r?\n/, 1)[0];

  if (!/^\d+$/.test(epochLine)) {
    throw new Error("LAST_MIGRATE.md must start with an epoch timestamp");
  }

  const migratedAt = new Date(Number(epochLine) * 1_000);

  if (Number.isNaN(migratedAt.getTime())) {
    throw new Error("LAST_MIGRATE.md contains an invalid epoch timestamp");
  }

  return `${formatDate(migratedAt)}\n${content}`;
}
