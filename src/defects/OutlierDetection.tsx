import React, { useState, useEffect } from 'react';
import { DefectData, OutlierDetectionResult, Threshold, StaticThresholds } from '../types';
import './OutlierDetection.css'; // Create this CSS file for styling

interface OutlierDetectionProps {
  data: DefectData[];
  zScoreThreshold?: number;
  onOutlierDetected?: (results: OutlierDetectionResult[]) => void;
}

const OutlierDetection: React.FC<OutlierDetectionProps> = ({
  data,
  zScoreThreshold = 2,
  onOutlierDetected,
}) => {
  const [outliers, setOutliers] = useState<OutlierDetectionResult[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<keyof DefectData>('severityRating');
  const [numericColumns, setNumericColumns] = useState<(keyof DefectData)[]>([]);

  // Static thresholds configuration
  const staticThresholds: StaticThresholds = {
    severityRating: { upper: 5, lower: 1 },
    resolutionTimeHours: { upper: 72 }
  };

  // Find numeric columns on component mount
  useEffect(() => {
    if (data.length > 0) {
      const numericCols = (Object.keys(data[0]) as (keyof DefectData)[]).filter(
        key => typeof data[0][key] === 'number'
      );
      setNumericColumns(numericCols);
    }
  }, [data]);

  const checkStaticThreshold = (
    record: DefectData, 
    metric: keyof DefectData
  ): OutlierDetectionResult => {
    const thresholds = staticThresholds[metric as keyof StaticThresholds] as Threshold | undefined;
    
    if (!thresholds) {
      return { 
        isOutlier: false,
        record,
        metricName: metric as string
      };
    }

    const value = record[metric] as number;
    const baseResult = {
      metricValue: value,
      method: 'static' as const,
      record,
      metricName: metric as string
    };

    if (thresholds.upper !== undefined && value > thresholds.upper) {
      return {
        ...baseResult,
        isOutlier: true,
        reason: `Exceeds maximum allowed value of ${thresholds.upper}`,
        threshold: thresholds.upper
      };
    }
    
    if (thresholds.lower !== undefined && value < thresholds.lower) {
      return {
        ...baseResult,
        isOutlier: true,
        reason: `Below minimum allowed value of ${thresholds.lower}`,
        threshold: thresholds.lower
      };
    }
    
    return {
      ...baseResult,
      isOutlier: false
    };
  };

  const checkDynamicThreshold = (
    record: DefectData,
    metric: keyof DefectData
  ): OutlierDetectionResult => {
    const numericValues = data
      .map(d => d[metric])
      .filter(v => typeof v === 'number') as number[];
    
    const value = record[metric] as number;
    
    const baseResult = {
      metricValue: value,
      method: 'dynamic' as const,
      record,
      metricName: metric as string
    };

    if (numericValues.length < 2) {
      return {
        ...baseResult,
        isOutlier: false,
        reason: 'Not enough data for comparison'
      };
    }
    
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const stdDev = Math.sqrt(
      numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length
    );
    
    if (stdDev === 0) {
      return {
        ...baseResult,
        isOutlier: false,
        reason: 'No variation in data'
      };
    }
    
    const zScore = (value - mean) / stdDev;
    
    if (Math.abs(zScore) > zScoreThreshold) {
      return {
        ...baseResult,
        isOutlier: true,
        reason: `Value is ${zScore.toFixed(2)} standard deviations from the mean`,
        threshold: zScoreThreshold
      };
    }
    
    return {
      ...baseResult,
      isOutlier: false
    };
  };

  const detectOutliers = () => {
    const results: OutlierDetectionResult[] = [];
    
    data.forEach(record => {
      const staticResult = checkStaticThreshold(record, selectedMetric);
      if (staticResult.isOutlier) {
        results.push(staticResult);
        return;
      }

      const dynamicResult = checkDynamicThreshold(record, selectedMetric);
      if (dynamicResult.isOutlier) {
        results.push(dynamicResult);
      }
    });

    // Sort by most extreme outliers first
    const sortedResults = results.sort((a, b) => {
      if (a.method === 'static' && b.method === 'static') {
        return (b.metricValue ?? 0) - (a.metricValue ?? 0);
      }
      return (b.metricValue ?? 0) - (a.metricValue ?? 0);
    });

    // Limit to 10 outliers
    const limitedResults = sortedResults.slice(0, 10);
    setOutliers(limitedResults);
    onOutlierDetected?.(limitedResults);
  };

  // Calculate statistics for display
  const numericValues = data
    .map(d => d[selectedMetric])
    .filter(v => typeof v === 'number') as number[];
  
  const mean = numericValues.length > 0 
    ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length)
    : 0;
  
  const stdDev = numericValues.length > 1 
    ? Math.sqrt(numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length)
    : 0;

  return (
    <div className="outlier-detection">
      <div className="detection-header">
        <h2>Outlier Detection</h2>
        <button onClick={() => setShowHelp(!showHelp)} className="help-button">?</button>
      </div>
      
      {showHelp && (
        <div className="help-box">
          <p>Detects outliers using static thresholds and z-score analysis.</p>
          <p>Showing max 10 most significant outliers.</p>
        </div>
      )}

      <div className="metric-selector">
        <label>Select Metric: </label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as keyof DefectData)}
        >
          {numericColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>

      <div className="stats-summary">
        <p>Analyzing: <strong>{selectedMetric}</strong></p>
        <p>Mean: {mean.toFixed(2)}</p>
        <p>Std Dev: {stdDev.toFixed(2)}</p>
        <p>Records: {numericValues.length}</p>
      </div>

      <button onClick={detectOutliers} className="detect-button">Detect Outliers</button>

      {outliers.length > 0 && (
        <div className="results">
          <h3>Top {outliers.length} Outliers Found:</h3>
          <div className="outliers-container">
            {outliers.map((outlier, i) => (
              <div key={i} className="outlier-card">
                <h4>{outlier.record?.defectName}</h4>
                <p><strong>Reason:</strong> {outlier.reason}</p>
                <p><strong>Value:</strong> {outlier.metricValue}</p>
                <p><strong>Method:</strong> {outlier.method}</p>
                
                <div className="outlier-details">
                  <p><strong>Resolution Time:</strong> {outlier.record?.resolutionTimeHours} hours</p>
                  <p><strong>Station:</strong> {outlier.record?.station}</p>
                  <p><strong>Part:</strong> {outlier.record?.partOfCar}</p>
                  <p><strong>Root Cause:</strong> {outlier.record?.rootCauseIdentified}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlierDetection;