// Import necessary components from Chart.js
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
  } from 'chart.js';
  // Import the Scatter chart component from react-chartjs-2
  import { Scatter } from 'react-chartjs-2';
  // Import defect data and type definitions
  import defectsRaw from '../../data/defects.json';
  import { DefectData } from '../../types';
  
  // Register chart components for Chart.js
  ChartJS.register(LinearScale, PointElement, Tooltip, Legend);
  
  // Helper function to compute the average of an array of numbers
  function computeAverage(data: number[]) {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }
  
  // Helper function to compute the standard deviation given data and mean
  function computeStdDev(data: number[], mean: number) {
    const squaredDiffs = data.map(n => (n - mean) ** 2);
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / data.length);
  }
  
  // Main component that renders the scatter plot
  export function DefectOutlierScatter3D() {
    // Validate that the data is an array
    const defects = Array.isArray(defectsRaw) ? defectsRaw : [];
  
    // Group defects by severityRating
    const severityGroups: { [key: number]: DefectData[] } = {};
    defects.forEach(defect => {
      const key = defect.severityRating;
      if (!severityGroups[key]) severityGroups[key] = [];
      severityGroups[key].push(defect);
    });
  
    // Arrays to separate normal defects and statistical outliers
    const outliers: DefectData[] = [];
    const normal: DefectData[] = [];
  
    // For each group of defects with the same severity rating:
    Object.entries(severityGroups).forEach(([severity, group]) => {
      // Compute average and standard deviation of resolution time
      const avgResTime = computeAverage(group.map(d => d.resolutionTimeHours));
      const stdResTime = computeStdDev(group.map(d => d.resolutionTimeHours), avgResTime);
  
      // Sort defects by how far they deviate from the average
      const sortedByDistance = group
        .map(d => ({
          ...d,
          deviation: Math.abs(d.resolutionTimeHours - avgResTime)
        }))
        .sort((a, b) => b.deviation - a.deviation);
  
      // Consider top 5 most deviated items as outliers
      outliers.push(...sortedByDistance.slice(0, 5));
      // Rest are considered normal
      normal.push(...sortedByDistance.slice(5));
    });
  
    // Compute max resolution time for plotting reference line and average severity
    const maxResolution = Math.max(...defects.map(d => d.resolutionTimeHours)) + 5;
    const avgSeverity = computeAverage(defects.map(d => d.severityRating));
  
    // Prepare data for the scatter chart
    const scatterData = {
      datasets: [
        {
          label: 'Normal Defects',
          data: normal.map(d => ({
            x: d.severityRating,
            y: d.resolutionTimeHours,
            z: parseInt(d.partNumber) || 0,
            station: d.station,
            defectName: d.defectName,
            partNumber: d.partNumber
          })),
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
          pointRadius: 5
        },
        {
          label: 'Outlier Defects',
          data: outliers.map(d => ({
            x: d.severityRating,
            y: d.resolutionTimeHours,
            z: parseInt(d.partNumber) || 0,
            station: d.station,
            defectName: d.defectName,
            partNumber: d.partNumber
          })),
          backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red
          pointRadius: 8
        },
        {
          label: 'Average Severity',
          data: [
            { x: avgSeverity, y: 0 },
            { x: avgSeverity, y: maxResolution }
          ],
          showLine: true,
          borderColor: 'rgba(255, 206, 86, 1)', // Yellow line
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    };
  
    // Configure chart options, including axes and tooltip formatting
    const options = {
      scales: {
        x: {
          title: { display: true, text: 'Severity Rating' },
          min: 0,
          max: 10
        },
        y: {
          title: { display: true, text: 'Resolution Time (hours)' },
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const raw = ctx.raw;
              return [
                `Station: ${raw.station}`,
                `Defect: ${raw.defectName}`,
                `Part: ${raw.partNumber}`,
                `Severity: ${raw.x}`,
                `Resolution: ${raw.y} hrs`
              ];
            }
          }
        }
      }
    };
  
    // Render the chart and legend explanations
    return (
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        <h2>Defect Outlier Detection (Severity vs Resolution Time)</h2>
        <Scatter data={scatterData} options={options} style={{ height: '600px' }} />
        <p>🔵 Normal defects</p>
        <p>🔴 Red = Outliers (5 max per severity, far from average resolution time)</p>
        <p>🟡 Yellow = Average severity line (x = {avgSeverity.toFixed(2)})</p>
      </div>
    );
  }
  