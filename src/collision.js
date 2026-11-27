const EPSILON=1e-8;

function collideCircleAxis(position,obstacle,radius,axis,direction){
 const min=radius+(obstacle.radius||0);
 if(axis==='x'){
  const dz=position.z-obstacle.z;
  if(Math.abs(dz)>=min)return false;
  const reach=Math.sqrt(Math.max(0,min*min-dz*dz));
  const dx=position.x-obstacle.x;
  if(Math.abs(dx)>=reach)return false;
  position.x=obstacle.x+(direction>=0?-reach:reach);
  return true;
 }
 const dx=position.x-obstacle.x;
 if(Math.abs(dx)>=min)return false;
 const reach=Math.sqrt(Math.max(0,min*min-dx*dx));
 const dz=position.z-obstacle.z;
 if(Math.abs(dz)>=reach)return false;
 position.z=obstacle.z+(direction>=0?-reach:reach);
 return true;
}

function collideAabbAxis(position,obstacle,radius,axis,direction){
 const minX=obstacle.minX-radius,maxX=obstacle.maxX+radius;
 const minZ=obstacle.minZ-radius,maxZ=obstacle.maxZ+radius;
 if(axis==='x'){
  if(position.z<=minZ||position.z>=maxZ||position.x<=minX||position.x>=maxX)return false;
  position.x=direction>=0?minX:maxX;return true;
 }
 if(position.x<=minX||position.x>=maxX||position.z<=minZ||position.z>=maxZ)return false;
 position.z=direction>=0?minZ:maxZ;return true;
}

export function resolveCircleMovement(position,delta,radius,obstacles=[],bounds=null){
 if(!Number.isFinite(radius)||radius<=0)throw new TypeError('radius must be positive');
 const result={x:position.x,z:position.z},distance=Math.hypot(delta.x,delta.z);
 const stepSize=Math.max(.06,radius*.3),steps=Math.max(1,Math.ceil(distance/stepSize));
 const sx=delta.x/steps,sz=delta.z/steps;let collided=false;
 const clampBounds=()=>{
  if(!bounds||!Number.isFinite(bounds.radius))return false;
  const max=Math.max(0,bounds.radius-radius),d=Math.hypot(result.x,result.z);
  if(d<=max||d<EPSILON)return false;
  result.x*=max/d;result.z*=max/d;return true;
 };
 for(let i=0;i<steps;i++){
  result.x+=sx;
  for(const o of obstacles){
   if(o.type==='circle')collided=collideCircleAxis(result,o,radius,'x',sx)||collided;
   else if(o.type==='aabb')collided=collideAabbAxis(result,o,radius,'x',sx)||collided;
  }
  result.z+=sz;
  for(const o of obstacles){
   if(o.type==='circle')collided=collideCircleAxis(result,o,radius,'z',sz)||collided;
   else if(o.type==='aabb')collided=collideAabbAxis(result,o,radius,'z',sz)||collided;
  }
  collided=clampBounds()||collided;
 }
 return {position:result,collided};
}