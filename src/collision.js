const EPSILON = 1e-8;

function resolveCircle(position, obstacle, radius, movement) {
 const dx=position.x-obstacle.x, dz=position.z-obstacle.z;
 const min=radius+(obstacle.radius||0), distSq=dx*dx+dz*dz;
 if(distSq>=min*min) return false;
 const dist=Math.sqrt(distSq);
 const nx=dist>EPSILON?dx/dist:(Math.hypot(movement.x,movement.z)>EPSILON?-movement.x/Math.hypot(movement.x,movement.z):1);
 const nz=dist>EPSILON?dz/dist:(Math.hypot(movement.x,movement.z)>EPSILON?-movement.z/Math.hypot(movement.x,movement.z):0);
 position.x=obstacle.x+nx*min; position.z=obstacle.z+nz*min;
 return true;
}

function resolveAabb(position, obstacle, radius, axis) {
 const minX=obstacle.minX-radius, maxX=obstacle.maxX+radius;
 const minZ=obstacle.minZ-radius, maxZ=obstacle.maxZ+radius;
 if(position.x<=minX||position.x>=maxX||position.z<=minZ||position.z>=maxZ) return false;
 if(axis==='x') position.x=position.x-(position.x-(minX+maxX)/2)>0?maxX:minX;
 else position.z=position.z-(position.z-(minZ+maxZ)/2)>0?maxZ:minZ;
 return true;
}

export function resolveCircleMovement(position, delta, radius, obstacles=[], bounds=null) {
 if(!Number.isFinite(radius)||radius<=0) throw new TypeError('radius must be positive');
 const result={x:position.x,z:position.z};
 const distance=Math.hypot(delta.x,delta.z);
 const stepSize=Math.max(0.08,radius*0.35);
 const steps=Math.max(1,Math.ceil(distance/stepSize));
 const sx=delta.x/steps, sz=delta.z/steps;
 let collided=false;
 const applyBounds=()=>{
  if(!bounds||!Number.isFinite(bounds.radius)) return false;
  const max=bounds.radius-radius, d=Math.hypot(result.x,result.z);
  if(d<=max||d<EPSILON) return false;
  result.x*=max/d; result.z*=max/d; return true;
 };
 for(let i=0;i<steps;i++){
  result.x+=sx;
  for(const obstacle of obstacles){
   if(obstacle.type==='circle') collided=resolveCircle(result,obstacle,radius,{x:sx,z:0})||collided;
   else if(obstacle.type==='aabb') collided=resolveAabb(result,obstacle,radius,'x')||collided;
  }
  collided=applyBounds()||collided;
  result.z+=sz;
  for(const obstacle of obstacles){
   if(obstacle.type==='circle') collided=resolveCircle(result,obstacle,radius,{x:0,z:sz})||collided;
   else if(obstacle.type==='aabb') collided=resolveAabb(result,obstacle,radius,'z')||collided;
  }
  collided=applyBounds()||collided;
 }
 return {position:result,collided};
}