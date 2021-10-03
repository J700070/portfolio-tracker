export interface ITransactions {
    Date: string;
    Time: string;
    Product: string;
    ISIN: string;
    Market: string;
    Execution_Center: string;
    Quantity: string,
    Price: string;
    Price_Currency: string;
    Local_Value: string;
    Value: string;
    Currency: string;
    Exchange_Rate: string;
    Transaction_Costs: string;
    Transaction_Costs_Currency: string;
    Total: string;
    Total_Currency: string;
    Order_ID: string;
  }

  export interface ISimpleTransaction {
    Date: Date,
    Product: string,
    Type: "BUY" | "SELL",
    Quantity: number,
    Price: number,
    Currency: string,
    TotalLocalValue: number,
    ConvertedPrice: number,
    TotalValue: number,
    Comision:number,
    Total: number
  }
