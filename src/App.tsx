import React, { useState, useEffect } from 'react';
import './App.css';
import { DataTable } from './components/TableView/DataTable';
import { DefectsPerModelChart } from './components/GraphicalView/DefectsPerModelChart';
import { StationPerformanceScatterPlot } from './components/GraphicalView/StationReview';
import { DefectOutlierScatter3D } from './components/GraphicalView/3DScatterPlot';
import { DefectsPerStationChart } from './components/GraphicalView/DefectPerStation';
import OutlierDetection from './defects/OutlierDetection';
import { DefectData } from './types';
import defectDataJson from './data/defects.json';

function App() {
  const [defectData, setDefectData] = useState<DefectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<keyof DefectData>('severityRating');

  useEffect(() => {
    try {
      // Type assertion to ensure the imported JSON matches our DefectData type
      const typedData = defectDataJson as DefectData[];
      setDefectData(typedData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load defect data');
      setLoading(false);
      console.error('Error loading defect data:', err);
    }
  }, []);

  if (loading) {
    return <div className="app-container">Loading defect data...</div>;
  }

  if (error) {
    return <div className="app-container error">{error}</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>BMW iX0 Quality Dashboard</h1>
        <p>Monitor and analyze vehicle defects to maintain the highest production standards.</p>
      </header>

      <section className="section">
        <h2 className="section-title">Defect Table</h2>
        <DataTable />
      </section>

      <section className="section">
        <DefectsPerModelChart />
      </section>
      
      <section className="section">
        <h2 className="section-title">Station Review</h2>
        <StationPerformanceScatterPlot />
      </section>
      
      <section className="section">
        <h2 className="section-title">Outlier Detection</h2>
        <DefectOutlierScatter3D />
      </section>
      
      <section className="section">
        <DefectsPerStationChart />
      </section>

      <section className="section">
        <h2 className="section-title">Statistical Outlier Analysis</h2>
        {defectData.length > 0 ? (
          <OutlierDetection 
            data={defectData}
            //selectedMetric={selectedMetric}
            zScoreThreshold={2.5}
            onOutlierDetected={(results) => console.log('Outliers detected:', results)}
          />
        ) : (
          <p>No defect data available for analysis</p>
        )}
      </section>
    </div>
  );
}

export default App;