// Import React (optional in newer React versions, but still safe to include)
import React from 'react';

// Import necessary components from Chart.js
import {
  Chart as ChartJS,
  CategoryScale,   // X-axis scale for categorical labels (e.g., station names)
  LinearScale,     // Y-axis for numeric values
  BarElement,      // The actual bar rendering
  Title,           // Title plugin (not used here, but registered in case needed)
  Tooltip,         // Enables tooltips when hovering over bars
  Legend           // Enables chart legend
} from 'chart.js';

// Import the Bar chart component wrapper from react-chartjs-2
import { Bar } from 'react-chartjs-2';

// Import raw defects data and type definitions
import defectsRaw from '../../data/defects.json';
import { DefectData } from '../../types';

// Typecast raw data to expected array of DefectData objects
const defects = defectsRaw as DefectData[];

// Register all necessary chart components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// React component to render a bar chart of defects per station
export function DefectsPerStationChart() {
  // Safety check: if data is not an array, show error and return null
  if (!Array.isArray(defects)) {
    console.error("Defects data is not an array.");
    return null;
  }

  // Extract unique station names from the defects data
  const stations = [...new Set(defects.map(d => d.station))];

  // Count how many defects occurred at each station
  const defectCounts = stations.map(
    station => defects.filter(d => d.station === station).length
  );

  // Format the data for Chart.js
  const chartData = {
    labels: stations, // X-axis: station names
    datasets: [
      {
        label: 'Defects per Station',
        backgroundColor: 'rgba(75,192,192,1)', // Teal blue bars
        data: defectCounts, // Y-axis: number of defects per station
      },
    ],
  };

  // Render the chart and a heading
  return (
    <div style={{ width: '600px', height: '400px' }}>
      <h2>Defects Per Station</h2>
      <Bar data={chartData} />
    </div>
  );
}
