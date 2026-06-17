
/**
 * NEWS2 (National Early Warning Score) Calculator
 * 
 * Standard NEWS2 scoring system used by the UK NHS:
 * - Score 0-4: Low risk (Green)
 * - Score 5-6: Medium risk (Amber/Yellow)  
 * - Score 7+: High risk (Red)
 * 
 * Each physiological parameter is scored 0-3 based on deviation from normal ranges.
 */

// Score individual vital sign based on NEWS2 parameters
const scoreRespirationRate = (rate) => {
  if (rate == null) return 0;
  if (rate <= 8) return 3;
  if (rate >= 9 && rate <= 11) return 1;
  if (rate >= 12 && rate <= 20) return 0;
  if (rate >= 21 && rate <= 24) return 2;
  if (rate >= 25) return 3;
  return 0;
};

const scoreOxygenSaturation = (spo2) => {
  if (spo2 == null) return 0;
  if (spo2 <= 91) return 3;
  if (spo2 >= 92 && spo2 <= 93) return 2;
  if (spo2 >= 94 && spo2 <= 95) return 1;
  if (spo2 >= 96) return 0;
  return 0;
};

const scoreHeartRate = (rate) => {
  if (rate == null) return 0;
  if (rate <= 40) return 3;
  if (rate >= 41 && rate <= 50) return 1;
  if (rate >= 51 && rate <= 90) return 0;
  if (rate >= 91 && rate <= 110) return 1;
  if (rate >= 111 && rate <= 130) return 2;
  if (rate >= 131) return 3;
  return 0;
};

const scoreSystolicBP = (bp) => {
  if (bp == null) return 0;
  if (bp <= 90) return 3;
  if (bp >= 91 && bp <= 100) return 2;
  if (bp >= 101 && bp <= 110) return 1;
  if (bp >= 111 && bp <= 219) return 0;
  if (bp >= 220) return 3;
  return 0;
};

const scoreTemperature = (temp) => {
  if (temp == null) return 0;
  if (temp <= 35.0) return 3;
  if (temp >= 35.1 && temp <= 36.0) return 1;
  if (temp >= 36.1 && temp <= 38.0) return 0;
  if (temp >= 38.1 && temp <= 39.0) return 1;
  if (temp >= 39.1) return 2;
  return 0;
};

/**
 * Calculate NEWS2 score from vital signs
 * @param {Object} vitals - Object containing vital sign measurements
 * @param {number} vitals.respirationRate - Respiration rate (breaths/min)
 * @param {number} vitals.oxygenSaturation - SpO2 (%)
 * @param {number} vitals.heartRate - Heart rate (bpm)
 * @param {number} vitals.systolicPressure - Systolic blood pressure (mmHg)
 * @param {number} vitals.temperature - Temperature (°C)
 * @returns {number} Total NEWS2 score (0-20)
 */
export const calculateNewsScore = (vitals) => {
  if (!vitals) return null;

  const respirationRate = vitals.respirationRate ?? vitals.respiratoryRate ?? vitals.RespirationRate ?? vitals.RespiratoryRate;
  const oxygenSaturation = vitals.oxygenSaturation ?? vitals.oxygenLevel ?? vitals.OxygenSaturation ?? vitals.OxygenLevel;
  const heartRate = vitals.heartRate ?? vitals.HeartRate;
  const systolicPressure = vitals.systolicPressure ?? vitals.SystolicPressure;
  const temperature = vitals.temperature ?? vitals.Temperature;

  // If no vitals data at all, return null
  if (respirationRate == null && oxygenSaturation == null && 
      heartRate == null && systolicPressure == null && 
      temperature == null) {
    return null;
  }

  const total = 
    scoreRespirationRate(respirationRate) +
    scoreOxygenSaturation(oxygenSaturation) +
    scoreHeartRate(heartRate) +
    scoreSystolicBP(systolicPressure) +
    scoreTemperature(temperature);

  return total;
};

/**
 * Get the risk level based on NEWS2 score
 * @param {number|null} score - NEWS2 score
 * @returns {string} Risk level: 'low', 'medium', 'high', or 'unknown'
 */
export const getNewsRiskLevel = (score) => {
  if (score == null) return 'unknown';
  if (score <= 4) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
};

/**
 * Get CSS class name for NEWS2 score border color
 * @param {number|null} score - NEWS2 score
 * @returns {string} CSS class name
 */
export const getNewsBorderColorClass = (score) => {
  const risk = getNewsRiskLevel(score);
  switch (risk) {
    case 'low': return 'border-news-low';
    case 'medium': return 'border-news-medium';
    case 'high': return 'border-news-high animate-pulse-critical';
    default: return 'border-border';
  }
};

/**
 * Get CSS class name for NEWS2 score text color
 * @param {number|null} score - NEWS2 score
 * @returns {string} CSS class name
 */
export const getNewsTextColorClass = (score) => {
  const risk = getNewsRiskLevel(score);
  switch (risk) {
    case 'low': return 'text-news-low';
    case 'medium': return 'text-news-medium';
    case 'high': return 'text-news-high';
    default: return 'text-muted-foreground';
  }
};

/**
 * Get CSS class name for NEWS2 score background color
 * @param {number|null} score - NEWS2 score
 * @returns {string} CSS class name
 */
export const getNewsBgColorClass = (score) => {
  const risk = getNewsRiskLevel(score);
  switch (risk) {
    case 'low': return 'bg-news-low';
    case 'medium': return 'bg-news-medium';
    case 'high': return 'bg-news-high';
    default: return 'bg-secondary';
  }
};

/**
 * Get label for NEWS2 risk level
 * @param {number|null} score - NEWS2 score
 * @returns {string} Risk label
 */
export const getNewsRiskLabel = (score) => {
  const risk = getNewsRiskLevel(score);
  switch (risk) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    default: return 'Unknown';
  }
};
