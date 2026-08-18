export type JourneyId = "italy-2026" | "asia-2025" | "okinawa" | "bali-australia" | "thailand-vietnam";
export type Journey = { id:JourneyId; number:string; title:string; eyebrow:string; route:string; href:string; image:string; alt:string; mapLabel:string };
export type MapStop = { id:string; label:string; journeyId:JourneyId; lat:number; lon:number };
export type MapRoute = { journeyId:JourneyId; stopIds:string[]; includeBase?:boolean };

export const journeys: Journey[] = [
  {id:"italy-2026",number:"01",title:"Italy, in motion.",eyebrow:"Jun 21 — Jul 06 · 2026",route:"Milano → Roma → Firenze → Pisa → Cinque Terre",href:"/travel/italy-2026/",image:"/assets/trips/italy-2026/cinque-terre-cover.jpg",alt:"Cinque Terre village on the Ligurian coast",mapLabel:"Italy / 2026"},
  {id:"asia-2025",number:"02",title:"Asia overland.",eyebrow:"Travel chapter · 2025",route:"Taiwan → Hong Kong → Tibet → Chongqing → Japan",href:"/travel/asia-2025/",image:"/assets/trips/china-japan/Tibet_landscape_2.jpg",alt:"Mountain landscape in Tibet",mapLabel:"Asia overland / 2025"},
  {id:"okinawa",number:"03",title:"Okinawa blue.",eyebrow:"Diving · Open water",route:"Okinawa → Training → Open water",href:"/travel/okinawa/",image:"/assets/trips/diving/Diving_in_okinawa.jpg",alt:"Diving in Okinawa",mapLabel:"Okinawa / Open water"},
  {id:"bali-australia",number:"04",title:"Southbound.",eyebrow:"Bali · Sydney · Uluru",route:"Bali → Sydney → Uluru",href:"/travel/bali-australia/",image:"/assets/trips/bali-australia/Sydney.jpg",alt:"Sydney Harbour and Opera House",mapLabel:"Bali · Sydney · Uluru"},
  {id:"thailand-vietnam",number:"05",title:"Friends & streets.",eyebrow:"Thailand · Vietnam",route:"Thailand → Vietnam → Together",href:"/travel/thailand-vietnam/",image:"/assets/trips/thailand-vietnam/Thai.jpg",alt:"Thailand travel moment",mapLabel:"Thailand · Vietnam"}
];

export const mapBase = { label:"Taipei", lat:25.0330, lon:121.5654 };
export const mapStops: MapStop[] = [
  {id:"milan",label:"Milano",journeyId:"italy-2026",lat:45.4642,lon:9.1900},
  {id:"rome",label:"Roma",journeyId:"italy-2026",lat:41.9028,lon:12.4964},
  {id:"florence",label:"Firenze",journeyId:"italy-2026",lat:43.7696,lon:11.2558},
  {id:"pisa",label:"Pisa",journeyId:"italy-2026",lat:43.7228,lon:10.4017},
  {id:"cinque-terre",label:"Cinque Terre",journeyId:"italy-2026",lat:44.1194,lon:9.7086},
  {id:"hong-kong",label:"Hong Kong",journeyId:"asia-2025",lat:22.3193,lon:114.1694},
  {id:"tibet",label:"Tibet",journeyId:"asia-2025",lat:31.7000,lon:88.1000},
  {id:"chongqing",label:"Chongqing",journeyId:"asia-2025",lat:29.5630,lon:106.5516},
  {id:"japan",label:"Japan",journeyId:"asia-2025",lat:36.2048,lon:138.2529},
  {id:"okinawa",label:"Okinawa",journeyId:"okinawa",lat:26.3344,lon:127.8056},
  {id:"bali",label:"Bali",journeyId:"bali-australia",lat:-8.4095,lon:115.1889},
  {id:"sydney",label:"Sydney",journeyId:"bali-australia",lat:-33.8688,lon:151.2093},
  {id:"uluru",label:"Uluru",journeyId:"bali-australia",lat:-25.3444,lon:131.0369},
  {id:"thailand",label:"Thailand",journeyId:"thailand-vietnam",lat:15.8700,lon:100.9925},
  {id:"vietnam",label:"Vietnam",journeyId:"thailand-vietnam",lat:14.0583,lon:108.2772}
];

export const mapRoutes: MapRoute[] = [
  {journeyId:"italy-2026",stopIds:["milan","rome","florence","pisa","cinque-terre"]},
  {journeyId:"asia-2025",stopIds:["hong-kong","tibet","chongqing","japan"],includeBase:true},
  {journeyId:"bali-australia",stopIds:["bali","sydney","uluru"]},
  {journeyId:"thailand-vietnam",stopIds:["thailand","vietnam"]}
];

const ROBINSON_X = [1,0.9986,0.9954,0.99,0.9822,0.973,0.96,0.9427,0.9216,0.8962,0.8679,0.835,0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322];
const ROBINSON_Y = [0,0.062,0.124,0.186,0.248,0.31,0.372,0.434,0.4958,0.5571,0.6176,0.6769,0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1];
const ROBINSON_CENTER_LON = 11.25;
const ROBINSON_LAT_COMPRESSION = 0.95623;

export function projectMapPoint(lat:number, lon:number) {
  const absLat = Math.min(90, Math.abs(lat));
  const band = Math.min(17, Math.floor(absLat / 5));
  const t = (absLat - band * 5) / 5;
  const xCoef = ROBINSON_X[band] + (ROBINSON_X[band + 1] - ROBINSON_X[band]) * t;
  const yCoef = ROBINSON_Y[band] + (ROBINSON_Y[band + 1] - ROBINSON_Y[band]) * t;
  const deltaLon = ((((lon - ROBINSON_CENTER_LON) + 180) % 360) + 360) % 360 - 180;
  const xRaw = 0.8487 * (deltaLon * Math.PI / 180) * xCoef;
  const yRaw = 1.3523 * yCoef * Math.sign(lat || 1) * ROBINSON_LAT_COMPRESSION;
  const xMax = 0.8487 * Math.PI;
  const yMax = 1.3523 * ROBINSON_LAT_COMPRESSION;
  return { x: ((xRaw + xMax) / (2 * xMax)) * 100, y: ((yMax - yRaw) / (2 * yMax)) * 100 };
}

export const heroSlides = [journeys[0], journeys[1], journeys[2], journeys[3]];
