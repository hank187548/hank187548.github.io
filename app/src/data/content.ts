export type Journey = { id:string; number:string; title:string; eyebrow:string; route:string; href:string; image:string; alt:string; mapX:string; mapY:string; mapLabel:string };
export type WorkItem = { number:string; kicker:string; title:string; description:string; tags:string[]; href:string; code:string };

export const journeys: Journey[] = [
  {id:"italy-2026",number:"01",title:"Italy, in motion.",eyebrow:"Jun 21 — Jul 06 · 2026",route:"Milano → Roma → Firenze → Cinque Terre",href:"/travel/italy-2026/",image:"/assets/trips/italy-2026/cinque-terre-cover.jpg",alt:"Cinque Terre village on the Ligurian coast",mapX:"53.5%",mapY:"26.2%",mapLabel:"Italy / 2026"},
  {id:"asia-2025",number:"02",title:"Asia overland.",eyebrow:"Travel chapter · 2025",route:"Taiwan → Tibet → Chongqing → Japan",href:"/travel/asia-2025/",image:"/assets/trips/china-japan/Tibet_landscape_2.jpg",alt:"Mountain landscape in Tibet",mapX:"75.3%",mapY:"33.6%",mapLabel:"Tibet · Chongqing · Japan / 2025"},
  {id:"okinawa",number:"03",title:"Okinawa blue.",eyebrow:"Diving · Open water",route:"Training below the surface",href:"/travel/okinawa/",image:"/assets/trips/diving/Diving_in_okinawa.jpg",alt:"Diving in Okinawa",mapX:"85.5%",mapY:"35.4%",mapLabel:"Okinawa / Open water"},
  {id:"bali-australia",number:"04",title:"Southbound.",eyebrow:"Bali · Sydney · Uluru",route:"Beach, surf, road, and red earth",href:"/travel/bali-australia/",image:"/assets/trips/bali-australia/Sydney.jpg",alt:"Sydney Harbour and Opera House",mapX:"88.8%",mapY:"63.2%",mapLabel:"Bali · Sydney · Uluru"},
  {id:"thailand-vietnam",number:"05",title:"Friends & streets.",eyebrow:"Thailand · Vietnam",route:"Night markets and local guides",href:"/travel/thailand-vietnam/",image:"/assets/trips/thailand-vietnam/Thai.jpg",alt:"A travel moment in Thailand",mapX:"79.2%",mapY:"43.2%",mapLabel:"Thailand · Vietnam"}
];

export const workItems: WorkItem[] = [
  {number:"01",kicker:"Qlib / Taiwan Equity / Research System",title:"Taiwan equity research pipeline",description:"End-to-end research and trading workflow for Taiwan equities, from model experiments and backtests to scheduled execution and alerts.",tags:["Python","Qlib","LightGBM","CatBoost"],href:"https://github.com/hank187548/qlib-public",code:"TWSE / RESEARCH"},
  {number:"02",kicker:"BTC / Sequence Modeling",title:"Market direction forecasting",description:"GRU + attention experiments for BTC/USDT with preprocessing, triple-barrier labels, hyperparameter search, and scheduled inference.",tags:["GRU","Attention","Time series"],href:"https://github.com/hank187548/Binance3_public",code:"BTC / SIGNAL"},
  {number:"03",kicker:"Vision / Applied ML",title:"Computer vision research",description:"Image-processing experiments spanning morphology, contour analysis, enhancement, and practical vision pipelines.",tags:["Python","Vision","Image processing"],href:"https://github.com/hank187548/Image-Processing",code:"CV / EXPERIMENTS"}
];

export const heroSlides = [journeys[0], journeys[1], journeys[2], journeys[3]];
