
import csv from "csvtojson";
import path from 'path';
import { CovidData } from "./models/CovidData";
import { CovidDataTotal } from "./models/CovidDataTotal";

let dataJson: CovidData[] = [];
let higherData: CovidDataTotal;
let lowerData: CovidDataTotal;
let moreAfectedState: CovidDataTotal;
let length: number;
let totalData: CovidDataTotal[] = [];
let counter: number = 0;
let futureState: string = "";

function excelToJson () : Promise<CovidData[]> {
  return new Promise<CovidData[]>(async (resolve, reject) => {
    let data: CovidData[] = [];
    const csvFilePath = './data.csv';
    const absolutepath = path.resolve('./src', csvFilePath);
    const json = await csv().fromFile(absolutepath);
    json.forEach(function (value){
      data.push({UID:value.UID, Province_State:value.Province_State, Population:Number(value.Population), Deaths:Number(value.Muertes)});
      //console.log(counter++);
    })
    //console.log('Total de datos: ' + (data.length -1));
    //console.log(data[0]); 
    resolve(data)
  });
}

function groupData (dataJson : CovidData[]) : Promise<CovidDataTotal[]> {
  return new Promise<CovidDataTotal[]>(async (resolve, reject) => {
    let data: CovidDataTotal[] = [];

    //console.log(dataJson[0].Province_State);
    let contador: number = 1;
    let totalPopulation: number =0;
    let totalDeaths: number =0;
  
    for (let index:number = 0; index < dataJson.length; index++) {
      futureState = dataJson[(contador)].Province_State;
      //console.log(futureState);
      if (contador< (dataJson.length-1)) {
        contador++;
      }
      if (futureState === dataJson[index].Province_State) {
        totalPopulation = totalPopulation + dataJson[index].Population;
        totalDeaths = totalDeaths + dataJson[index].Deaths;
        data[counter] = {UID:dataJson[index].UID, Province_State:dataJson[index].Province_State, TotalPopulation:totalPopulation, TotalDeaths:totalDeaths};
      } else {
        totalPopulation = totalPopulation + dataJson[index].Population;
        totalDeaths = totalDeaths + dataJson[index].Deaths;
        data[counter] = {UID:dataJson[index].UID, Province_State:dataJson[index].Province_State, TotalPopulation:totalPopulation, TotalDeaths: totalDeaths};
        counter++;
        totalPopulation = 0;
        totalDeaths = 0;
      }
      //console.log(totalData);
    }
    //console.log(data);
    resolve(data)
  });
  
}

function getHigher (totalData : CovidDataTotal[]) : Promise<CovidDataTotal> {
  return new Promise<CovidDataTotal>(async (resolve, reject) => {
    let data: CovidDataTotal = {UID:0, Province_State: "", TotalPopulation: 0, TotalDeaths: 0}; 
    totalData.forEach(element => {
      if(element.TotalDeaths > data.TotalDeaths){
        data = element;
      }
    });
    resolve(data)
  });
  
}

function getLower (totalData : CovidDataTotal[]) : Promise<CovidDataTotal> {
  return new Promise<CovidDataTotal>(async (resolve, reject) => {
    let data: CovidDataTotal = totalData[0]; 
    totalData.forEach(element => { 
      if((element.TotalDeaths <= data.TotalDeaths) && element.TotalPopulation!=0){
        data = element;
      }
    });
    resolve(data)
  });
}

function getPercentage (totalData : CovidDataTotal[]) : void {
  let porcentage : number = 0;
  totalData.forEach(element => {
      porcentage = (element.TotalDeaths/element.TotalPopulation)*100;
      console.log('el porcentaje de muertes por covid-19 en ' + element.Province_State  + 'es de ' + porcentage + '% con una población total de ' + element.TotalPopulation + ' personas');
      console.log();
  });
}

function getMoreAfectedState (totalData : CovidDataTotal[]) : void {
  let data: CovidDataTotal = totalData[0]; 
  let highPorcentage : number = 0;
  totalData.forEach(element => {
    let porcentage : number = 0;
    if (element.TotalPopulation != 0) {
      porcentage = (element.TotalDeaths/element.TotalPopulation)*100;
    }else{
      porcentage = 0;
    }
    //highPorcentage = porcentage;
    if (porcentage > highPorcentage) {
      highPorcentage = porcentage;
      data = element;
    }
  });
  console.log('El estado más afectado por el covid-19 es ' + data.Province_State  + ' con un porcentaje de muertes por covid de ' + highPorcentage + '% mayor que en los otros estados en comparación con su población');
}

async function App() {
  dataJson = await excelToJson();
  totalData = await groupData(dataJson);
  higherData = await getHigher(totalData);
  lowerData = await getLower(totalData);
  //moreAfectedState = await getMoreAfectedState(totalData);
  
  //console.log('Datos acumulados' );
  //console.log(totalData);
  console.log('1. El estado con mayor acumulado de muertes es' );
  console.log(higherData.Province_State + ' con un total de ' + higherData.TotalDeaths + ' muertes');

  console.log('2. El estado con menor acumulado de muertes es' );
  console.log(lowerData.Province_State + ' con un total de ' + lowerData.TotalDeaths + ' muertes');

  console.log('3. Porcentajes' );
  getPercentage(totalData);
  
  console.log('4. Estado más afectado' );
  getMoreAfectedState(totalData);

  /* console.log('El estado más afectado por el covid-19 es ' + moreAfectedState.Province_State  + ' ya que tiene el mayor porcentaje de muertes por covid (' + ((moreAfectedState.TotalDeaths/moreAfectedState.TotalPopulation)*100) + '%) en comparación con su población '); */

  //console.log(higherData);
  //console.log(lowerData);
}

App();


  

/* function getMoreAfectedState (totalData : CovidDataTotal[]) : Promise<CovidDataTotal> {
  return new Promise<CovidDataTotal>(async (resolve, reject) => {

    let data: CovidDataTotal = totalData[0]; 
    let highPorcentage : number = 0;
    totalData.forEach(element => {
      
      let porcentage : number = 0;
      porcentage = (element.TotalDeaths/element.TotalPopulation)*100;
      if (porcentage > highPorcentage) {
        highPorcentage = porcentage;
        data = element;
      }
    });
    
    resolve(data)
  });
  
} */