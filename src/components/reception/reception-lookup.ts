const PLATE_PATTERN = /^[A-Za-z0-9]{3}-[0-9]{3}$/;

export function isPlateLookup(term: string): boolean {
  return PLATE_PATTERN.test(term.trim());
}

export function normalizeLookupTerm(term: string): string {
  const trimmed = term.trim();
  return isPlateLookup(trimmed) ? trimmed.toUpperCase() : trimmed;
}
