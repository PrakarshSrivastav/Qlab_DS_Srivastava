
import {
  Chart as ChartJS,
  CategoryScale,   // Used for X-axis with string labels (e.g., car models)
  LinearScale,     // Used for Y-axis with numeric values (defect counts)
  BarElement,      // Core component for rendering bars
  Title,           // Optional plugin for adding chart titles
  Tooltip,         // Enables tooltip display on hover
  Legend           // Enables chart legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

import defectsRaw from '../../data/defects.json';
import { DefectData } from '../../types';

const defects = defectsRaw as DefectData[];

// Register required Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export function DefectsPerModelChart() {
  const models = [...new Set(defects.map(d => d.carModel))];

  // Count how many defects are associated with each car model
  const defectCounts = models.map(
    model => defects.filter(d => d.carModel === model).length
  );

  // Structure data in the format expected by Chart.js
  const chartData = {
    labels: models, // X-axis labels: car models
    datasets: [
      {
        label: 'Defects per Model',
        backgroundColor: 'rgba(75,192,192,1)',
        data: defectCounts
      }
    ]
  };

  return (
    <div style={{ width: '600px', height: '400px' }}>
      <h2>Defects Per Model</h2>
      <Bar data={chartData} />
    </div>
  );
}
