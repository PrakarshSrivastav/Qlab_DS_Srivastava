import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
  } from 'chart.js';
  import { Scatter } from 'react-chartjs-2';
  import defectsRaw from '../../data/defects.json';
  import { DefectData } from '../../types';
  
  const defects = defectsRaw as DefectData[];
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  export function StationPerformanceScatterPlot() {
    // Calculate average resolution time per station
    const stationStats: Record<string, { totalTime: number; count: number }> = {};
  
    defects.forEach(defect => {
      if (!stationStats[defect.station]) {
        stationStats[defect.station] = { totalTime: 0, count: 0 };
      }
      stationStats[defect.station].totalTime += defect.resolutionTimeHours;
      stationStats[defect.station].count += 1;
    });
  
    // Create array of unique stations with their average times
    const stations = Object.keys(stationStats);
    const stationData = stations.map(station => ({
      station,
      avgTime: stationStats[station].totalTime / stationStats[station].count
    }));
  
    // Sort stations by name for consistent ordering
    stationData.sort((a, b) => a.station.localeCompare(b.station));
  
    const scatterData = {
      labels: stationData.map(data => data.station), // Use station names as labels
      datasets: [{
        label: 'Average Resolution Time (hours)',
        data: stationData.map(data => ({
          x: data.station, // Use station name as x value
          y: data.avgTime
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 8,
        pointHoverRadius: 10,
      }]
    };
  
    const options: ChartOptions<'scatter'> = {
      scales: {
        x: {
          type: 'category', // Use category scale for discrete station names
          title: {
            display: true,
            text: 'Stations'
          },
          ticks: {
            autoSkip: false // Ensure all station names are shown
          }
        },
        y: {
          title: {
            display: true,
            text: 'Average Resolution Time (hours)'
          },
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.x}: ${context.parsed.y.toFixed(2)} hours`;
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      }
    };
  
    return (
      <div style={{ width: '800px', height: '500px', margin: '20px auto' }}>
        <h2>Station Performance Metrics</h2>
        <h3>Average Resolution Time per Station</h3>
        <Scatter data={scatterData} options={options} />
      </div>
    );
  }