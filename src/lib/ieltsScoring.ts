/**
 * Official IELTS Raw Score to Band Conversion
 * Source: Official IELTS, British Council, Cambridge Assessment
 */

export function rawToReadingBand(rawScore: number, testType: 'academic' | 'general' = 'academic'): number {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));

  if (testType === 'academic') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 33) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 27) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 19) return 5.5;
    if (score >= 15) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 8) return 3.5;
    if (score >= 6) return 3.0;
    if (score >= 4) return 2.5;
    if (score >= 2) return 2.0;
    return 1.0;
  } else {
    // General Training Reading requires higher raw scores for equal bands
    if (score >= 40) return 9.0;
    if (score >= 39) return 8.5;
    if (score >= 37) return 8.0;
    if (score >= 36) return 7.5;
    if (score >= 34) return 7.0;
    if (score >= 32) return 6.5;
    if (score >= 30) return 6.0;
    if (score >= 27) return 5.5;
    if (score >= 23) return 5.0;
    if (score >= 19) return 4.5;
    if (score >= 15) return 4.0;
    if (score >= 12) return 3.5;
    if (score >= 9) return 3.0;
    if (score >= 6) return 2.5;
    if (score >= 3) return 2.0;
    return 1.0;
  }
}

export function rawToListeningBand(rawScore: number): number {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

/**
 * Calculates overall IELTS Band from 4 skill scores with official half-band rounding rule:
 * Average ends in .25 -> rounds up to .5
 * Average ends in .75 -> rounds up to next whole band
 * e.g. (6.5 + 6.5 + 6.0 + 6.0) / 4 = 6.25 -> Band 6.5
 * e.g. (6.5 + 6.5 + 6.5 + 7.0) / 4 = 6.625 -> Band 6.5
 * e.g. (7.0 + 7.0 + 7.0 + 7.5) / 4 = 7.125 -> Band 7.0
 * e.g. (7.5 + 7.5 + 8.0 + 8.0) / 4 = 7.75 -> Band 8.0
 */
export function calculateOverallBand(reading: number, listening: number, writing: number, speaking: number): number {
  const mean = (reading + listening + writing + speaking) / 4;
  const wholePart = Math.floor(mean);
  const fraction = mean - wholePart;

  if (fraction < 0.25) {
    return wholePart;
  } else if (fraction < 0.75) {
    return wholePart + 0.5;
  } else {
    return wholePart + 1.0;
  }
}

export function formatBand(band: number): string {
  return band.toFixed(1);
}

export function getBandDescriptor(band: number): { title: string; summary: string } {
  if (band >= 8.5) {
    return {
      title: 'Expert User (Band 9 / 8.5)',
      summary: 'Has fully operational command of the language: appropriate, accurate and fluent with complete understanding.',
    };
  }
  if (band >= 7.5) {
    return {
      title: 'Very Good User (Band 8 / 7.5)',
      summary: 'Operational command with only occasional unsystematic inaccuracies. Handles complex detailed argumentation well.',
    };
  }
  if (band >= 6.5) {
    return {
      title: 'Competent / Good User (Band 7 / 6.5)',
      summary: 'Generally handles complex language well and understands detailed reasoning despite some inaccuracies.',
    };
  }
  if (band >= 5.5) {
    return {
      title: 'Modest / Competent User (Band 6 / 5.5)',
      summary: 'Has partial command of the language, coping with overall meaning in most situations with frequent errors.',
    };
  }
  return {
    title: 'Developing User (< Band 5.5)',
    summary: 'Basic competence is limited to familiar situations with frequent problems in understanding and expression.',
  };
}
