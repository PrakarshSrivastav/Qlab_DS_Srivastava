import { DefectData } from '../../types';
import defects from '../../data/defects.json';

export function DataTable() {
  const allData: DefectData[] = defects;

  // Function to get top 5 most common defect names with counts
  const getTopDefects = (data: DefectData[]) => {
    const defectCounts: Record<string, number> = {};

    // Count occurrences of each defect name
    data.forEach(defect => {
      defectCounts[defect.defectName] = (defectCounts[defect.defectName] || 0) + 1;
    });

    // Get top 5 defect names with counts
    return Object.entries(defectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Take top 5
      .map(([defectName, count]) => ({ defectName, count }));
  };

  // Get top 5 defects with counts
  const topDefects = getTopDefects(allData);

  // Get one representative record for each top defect
  const topDefectsData = topDefects.map(({ defectName }) => 
    allData.find(defect => defect.defectName === defectName)
  ).filter(Boolean) as DefectData[];

  // Get all unique column names from the data
  const columnNames = allData.length > 0 ? Object.keys(allData[0]) : [];

  return (
    <div style={{ 
      margin: '20px', 
      overflowX: 'auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#333', marginBottom: '16px' }}>
        Top 5 Most Common Defects
      </h2>
      
      {/* Summary of top defects with counts */}
      <div style={{ 
        backgroundColor: '#f5f5f5',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Defect Frequency Summary</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {topDefects.map(({ defectName, count }, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{defectName}:</span> 
              <span style={{ marginLeft: '8px' }}>{count} occurrences</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#2c3e50',
            color: 'white'
          }}>
            {columnNames.map((column) => (
              <th 
                key={column} 
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #ddd'
                }}
              >
                {column.split(/(?=[A-Z])/).join(' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topDefectsData.map((defect, index) => (
            <tr 
              key={index} 
              style={{ 
                borderBottom: '1px solid #ddd',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9'
              }}
            >
              {columnNames.map((column) => (
                <td 
                  key={column} 
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    color: column === 'defectName' ? '#e74c3c' : 'inherit',
                    fontWeight: column === 'defectName' ? 'bold' : 'normal'
                  }}
                >
                  {/* @ts-ignore - dynamic property access */}
                  {defect[column as keyof DefectData]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}