let nextStructureId=1;
export function validatePlacement(piece,transform,world){
 if(world.slopeAt(transform.x,transform.z)>(piece.maxSlope??.35))return {valid:false,reason:'Слишком крутой склон'};
 if(world.overlaps(transform,piece))return {valid:false,reason:'Место занято'};
 if(world.playerDistance(transform)>12)return {valid:false,reason:'Слишком далеко'};
 if(!world.hasResources(piece.cost||{}))return {valid:false,reason:'Не хватает ресурсов'};
 return {valid:true,reason:'Можно построить'};
}
export function createStructure(pieceId,transform){
 return {id:pieceId+'-'+nextStructureId++,pieceId,x:transform.x,z:transform.z,y:transform.y||0,rotation:transform.rotation||0};
}
export function resetStructureIds(){nextStructureId=1;}