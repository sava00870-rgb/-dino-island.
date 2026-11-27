export const SAVE_VERSION=1;
export function serializeSave(data){
 return JSON.stringify({version:SAVE_VERSION,data:{
  player:data.player||{x:0,z:0,hp:100},inventory:data.inventory||{},
  structures:Array.isArray(data.structures)?data.structures:[],seed:String(data.seed||'dino-island'),
  progression:data.progression||{xp:0,level:1,skills:{}}
 }});
}
export function parseSave(raw){
 const defaults={player:{x:0,z:0,hp:100},inventory:{wood:0,stone:0,fiber:0},structures:[],seed:'dino-island',progression:{xp:0,level:1,skills:{}}};
 try{
  const parsed=JSON.parse(raw);if(!parsed||!Number.isInteger(parsed.version)||parsed.version>SAVE_VERSION||parsed.version<1)throw new Error('Unsupported save version');
  const data=parsed.data;if(!data||typeof data!=='object')throw new Error('Invalid save data');
  const player=data.player&&typeof data.player==='object'?data.player:defaults.player;
  const inventory=data.inventory&&typeof data.inventory==='object'?data.inventory:defaults.inventory;
  const structures=Array.isArray(data.structures)?data.structures.filter(v=>v&&typeof v==='object'):[];
  return {ok:true,data:{...defaults,...data,player:{...defaults.player,...player},inventory:{...defaults.inventory,...inventory},structures,progression:{...defaults.progression,...(data.progression||{})}}};
 }catch(error){return {ok:false,error:error.message,data:defaults}}
}
export function saveToStorage(storage,data,key='dino-island-save'){
 try{storage.setItem(key,serializeSave(data));return true}catch{return false}
}
export function loadFromStorage(storage,key='dino-island-save'){
 try{return parseSave(storage.getItem(key))}catch(error){return {ok:false,error:error.message,data:parseSave('').data}}
}