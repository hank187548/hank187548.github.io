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

export function projectMapPoint(lat:number, lon:number) {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 };
}

export const heroSlides = [journeys[0], journeys[1], journeys[2], journeys[3]];
