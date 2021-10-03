import {Grid, GridColumn as Column} from "@progress/kendo-react-grid"
import transactions from './transactions.json'

function TransactionsTable() {
  return (
      <Grid className="overflow-auto" style={{ height: '49vh'}} data={transactions}>
        <Column field="Date" />
        <Column field="Time" />
        <Column field="Product" />
        <Column field="ISIN" />
        <Column field="Market" />
        <Column field="Execution_Center" />
        <Column field="Quantity" />
        <Column field="Price" />
        <Column field="Price_Currency" />
        <Column field="Local_Value" />
        <Column field="Value" />
        <Column field="Currency" />
        <Column field="Exchange_Rate" />
        <Column field="Transaction_Costs" />
        <Column field="Transaction_Costs_Currency" />
        <Column field="Total" />
        <Column field="Total_Currency" />
        <Column field="Order_ID" />
    </Grid>
  );
}

export default TransactionsTable;
