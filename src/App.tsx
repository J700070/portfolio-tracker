
import './App.css';
import TransactionsTable from './TransactionsTable'
import transactions from './transactions.json'
import {ITransactions,ISimpleTransaction} from './interfaces/tableInterfaces'
import Queue from './Queue'

/* Current Prices: */
let prices:any = {
  "AUTOHOME INC. AMERICAN": 40.73,
  "BROOKFIELD ASSET MANAG": 47.10,
  "ALIBABA GROUP HOLDING": 124.36,
  "FACEBOOK INC. - CLASS": 295.81,
}

let totalGains = 0
let totalIRR = 0
let totalValidStocks = 0
let visitedStocks:string[] = []

function App() {
  let comisions = 0
  let comisionsCurrency = transactions[0].Transaction_Costs_Currency
  transactions.forEach((transaction) => (comisions += Math.abs(Number(transaction['Transaction_Costs']))))
  let stockTransactions = getSimpleTransactions()
  calculatePerformance(stockTransactions)
  console.log(totalValidStocks)
  totalIRR = totalIRR / totalValidStocks
  return (
    <div className="App grid grid-rows-2 gap-4">
      <div className="p-5">
        <p><b>[MAL] Total Ganancias (%)<span className="text-sm">*</span>:</b> {(totalIRR).toFixed(2) + " %"}</p>
        <p><b>Total Ganancias<span className="text-sm">*</span>:</b> {(totalGains).toFixed(2) + " " + comisionsCurrency}</p>
        <p><b>Total Comisiones<span className="text-sm">**</span>:</b> {(comisions).toFixed(2) + " " + comisionsCurrency}</p>
        <p><b>Total Ganancias Netas:</b> {(totalGains - comisions).toFixed(2) + " " + comisionsCurrency}</p>
        <div className="text-xs pt-2">
          <p><i>*No incluye dividendos</i></p>
          <p><i>**No incluye costes fijos como el mantenimiento anual de la cuenta</i></p>
        </div>
      </div>
      <div>
        <TransactionsTable/>
      </div>
    </div>
  );
}
export default App;

function getSimpleTransactions(){
  let stockTransactions:ISimpleTransaction[] = []
  transactions.forEach((transaction) => (stockTransactions.push(convertToSimpleTransaction(transaction))))
  return stockTransactions
}

function convertToSimpleTransaction(transaction:ITransactions){
  let quantity = Math.abs(Number(transaction['Quantity']))
  let price = Number(transaction['Price'])
  let totalLocalValue = Math.abs(quantity) * Number(price)
  let convertedPrice = price / (transaction["Exchange_Rate"] !== "" ? Number(transaction["Exchange_Rate"]) : 1)
  let totalValue = totalLocalValue / (transaction["Exchange_Rate"] !== "" ? Number(transaction["Exchange_Rate"]) : 1)
  let comision = Number(transaction['Transaction_Costs'])

  let simpleTransaction:ISimpleTransaction = 
  {
    Date: changeDateFormat(transaction['Date']),
    Product: transaction['Product'],
    Type: (Number(transaction['Quantity']) > 0 ? "BUY" : "SELL"),
    Quantity: quantity,
    Price: price,
    Currency: transaction['Price_Currency'],
    TotalLocalValue: totalLocalValue,
    ConvertedPrice: convertedPrice,
    TotalValue: totalValue,
    Comision: comision,
    Total: totalValue - comision
  }


  return simpleTransaction
}

function calculatePerformance(transactions:ISimpleTransaction[]){
  transactions.forEach((transaction)=>(!visitedStocks.includes(transaction.Product) ? calculateStockPerformane(transactions.filter(trans =>  trans.Product === transaction.Product ),transaction.Product ) : ""))
  return
}

function calculateStockPerformane(list: ISimpleTransaction[], product:string ){
  visitedStocks.push(product)

  list = list.sort((a,b) => Number(a.Date) - Number(b.Date))

  let q = 0
  let v = 0

  let transactionBenefit = 0
  let transactionIRR = 0
  let stockBenefit = 0
  let stockIRR = 0

  let numberOfSells = 0
  let buyQ = new Queue()


  console.log(product)
  console.log("Transactions:")

  list.forEach((t)=> {
    if(t.Quantity === 0){
      console.log("============================>" + product)
      return
    }
    if(t.Type === 'BUY'){

      q += t.Quantity
      v += t.TotalValue
      
      for(let i = 0; i<t.Quantity ; i++ ){
        buyQ.enqueue(t.ConvertedPrice)
      }

    }else if(t.Type === 'SELL'){
      numberOfSells++

      if(q-t.Quantity < 0){
        throw new Error("ERROR: Transacción no válida")
      }
      
      q = q-t.Quantity
      v = v-t.TotalValue

      for(let i = 0; i<t.Quantity ; i++ ){
        let elem = buyQ.dequeue()
        transactionBenefit += t.ConvertedPrice - elem
        transactionIRR += ((t.ConvertedPrice - elem)/elem * 100)
      }
      
      console.log("Benefit: " + transactionBenefit.toFixed(2))
      stockBenefit += transactionBenefit

      transactionIRR = transactionIRR/t.Quantity
      console.log("IRR: " + transactionIRR.toFixed(2) + " %")

      stockIRR += transactionIRR
    }else{
      throw new Error("ERROR: Transacción no válida")
    }
  })
  /* 
  Si Q = 0 -> Posición cerrada
  Si Q > 0 -> Posición abierta, se necesita la cotización actual para saber beneficio
  Si Q < 0 -> ERROR

  Si V = 0 -> BreakEven (Sin comisiones)
  Si V > 0 -> Perdida en la posición por valor de V
  Si V < 0 -> Ganancia en la posición por valor de V
  
  Si buyQ.getLenght() > 0 -> Posición abierta
  */
  if(stockBenefit === 0){
    return
  }

  if(q > 0){
    let currentPrice = prices[product]
    
    //Simulamos que cerramos la transacción a precio actual
    numberOfSells++

    for(let i = 0; i< q ; i++ ){
      let elem = buyQ.dequeue()
      transactionBenefit += currentPrice - elem
      transactionIRR += ((currentPrice - elem)/elem * 100)
    }
    stockBenefit += transactionBenefit

    transactionIRR = transactionIRR/q
    stockIRR += transactionIRR

    //Aquí acaba la "transacción"


    totalGains += stockBenefit
    stockIRR = stockIRR / numberOfSells
    totalIRR += stockIRR

  }else{
    totalGains += -v
    stockIRR = stockIRR / numberOfSells
    totalIRR += stockIRR
  }

  


  totalValidStocks++
  console.log("Stock Benefit: " + stockBenefit.toFixed(2))
  console.log("Stock IRR: " + stockIRR.toFixed(2) + " %")
  console.log("=========================")
}

function changeDateFormat(dateString:String){
  let day: number = Number(dateString.substring(0,2))
  let month: number = Number(dateString.substring(3,5))
  let year: number = Number(dateString.substring(6))

  let date:Date = new Date(year, month, day)

  return date
}
