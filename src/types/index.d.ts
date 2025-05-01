export interface DefectData {
  date: string;
  time: string;
  defectName: string;
  station: string;
  partOfCar: string;
  reporterName: string;
  partNumber: string;
  severityRating: number;
  carModel: string;
  motorType: string;
  designPackage: string;
  productionShift: string;
  resolutionTimeHours: number;
  rootCauseIdentified: string;
  defectCategory: string;
}

export interface Threshold {
  upper?: number;
  lower?: number;
}
export interface OutlierDetectionResult {
  isOutlier: boolean;
  reason?: string;
  metricValue?: number;
  threshold?: number;
  method?: 'dynamic' | 'static';
  record?: DefectData; // Add the original record
  metricName?: string; // Add which metric was checked
}


export interface StaticThresholds {
  severityRating: { upper: number; lower: number };
  resolutionTimeHours: { upper: number };
  // Add other metrics as needed
}