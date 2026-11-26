function hash2(x,z,seed){
 let h=(x*374761393+z*668265263+seed*1442695041)|0;
 h=Math.imul(h^(h>>>13),1274126177);
 return ((h^(h>>>16))>>>0)/4294967295;
}
function smooth(t){return t*t*(3-2*t)}
function valueNoise(x,z,seed){
 const x0=Math.floor(x),z0=Math.floor(z),tx=smooth(x-x0),tz=smooth(z-z0);
 const a=hash2(x0,z0,seed),b=hash2(x0+1,z0,seed),c=hash2(x0,z0+1,seed),d=hash2(x0+1,z0+1,seed);
 const top=a+(b-a)*tx,bottom=c+(d-c)*tx;
 return top+(bottom-top)*tz;
}
function seedNumber(seed){let h=2166136261;for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}

export function createWorld(seed='dino-island',config={}){
 const radius=config.radius||100, innerRadius=radius*.91, seedId=seedNumber(seed);
 const sampleHeight=(x,z)=>{
  const broad=(valueNoise(x*.018,z*.018,seedId)-.5)*9;
  const detail=(valueNoise(x*.065,z*.065,seedId+17)-.5)*2.8;
  const mountain=Math.exp(-(((x+34)**2)/(2*24**2)+((z-28)**2)/(2*27**2)))*23;
  const ridge=Math.exp(-((x+42)**2)/(2*11**2))*Math.max(0,1-Math.abs(z)/95)*8;
  const swamp=-Math.exp(-(((x-24)**2)/(2*22**2)+((z+28)**2)/(2*18**2)))*2.5;
  const edge=Math.max(0,(Math.hypot(x,z)-innerRadius)/Math.max(1,radius-innerRadius));
  return Math.max(-3,(broad+detail+mountain+ridge+swamp)*(1-smooth(Math.min(1,edge)))-edge*4);
 };
 const sampleBiome=(x,z)=>{
  const d=Math.hypot(x,z);
  if(d>radius*.82)return 'beach';
  if(x<-16&&z>5)return 'mountains';
  if(x>12&&z>0)return 'forest';
  if(x<0&&z<0)return 'swamp';
  if(z<-18)return 'meadow';
  if(x>0&&z>22)return 'rocky';
  return 'meadow';
 };
 const isLand=(x,z)=>Math.hypot(x,z)<=innerRadius;
 return {seed:String(seed),radius,innerRadius,sampleHeight,sampleBiome,isLand};
}