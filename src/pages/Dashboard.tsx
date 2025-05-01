import { DataTable } from '../components/TableView/DataTable';
import { DefectsPerModelChart } from '../components/GraphicalView/DefectsPerModelChart';

export default function Dashboard() {
  return (
    <div>
      <h1>BMW Quality Dashboard</h1>
      <DataTable />
      <DefectsPerModelChart />
    </div>
  );
}
