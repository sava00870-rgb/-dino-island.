export function createInventory(initial={},maxSlots=24,stackLimit=99){
 if(!Number.isInteger(maxSlots)||maxSlots<1||!Number.isInteger(stackLimit)||stackLimit<1)throw new TypeError('invalid inventory limits');
 const items={};for(const [id,count] of Object.entries(initial))if(Number.isInteger(count)&&count>0)items[id]=count;
 return {items,maxSlots,stackLimit};
}
function usedSlots(inv){return Object.values(inv.items).reduce((sum,count)=>sum+Math.ceil(count/inv.stackLimit),0)}
export function addItem(inv,id,count=1){
 if(!id||!Number.isInteger(count)||count<1)return {added:0,remaining:count};
 let remaining=count,added=0;
 while(remaining>0){
  const current=inv.items[id]||0,slots=usedSlots(inv),inStack=current%inv.stackLimit;
  if(inStack>0){const amount=Math.min(remaining,inv.stackLimit-inStack);inv.items[id]=current+amount;added+=amount;remaining-=amount;continue}
  if(slots>=inv.maxSlots)break;
  const amount=Math.min(remaining,inv.stackLimit);inv.items[id]=current+amount;added+=amount;remaining-=amount;
 }
 return {added,remaining};
}
export function removeItem(inv,id,count=1){
 if(!Number.isInteger(count)||count<1||(inv.items[id]||0)<count)return false;
 inv.items[id]-=count;if(inv.items[id]===0)delete inv.items[id];return true;
}
export function craftItem(inv,recipe){
 for(const [id,count] of Object.entries(recipe.ingredients||{}))if((inv.items[id]||0)<count)return {ok:false,reason:'Не хватает: '+id};
 const preview=createInventory({...inv.items},inv.maxSlots,inv.stackLimit);
 for(const [id,count] of Object.entries(recipe.ingredients||{}))removeItem(preview,id,count);
 const output=addItem(preview,recipe.output.id,recipe.output.count||1);
 if(output.remaining)return {ok:false,reason:'Нет места в инвентаре'};
 for(const [id,count] of Object.entries(recipe.ingredients||{}))removeItem(inv,id,count);
 addItem(inv,recipe.output.id,recipe.output.count||1);
 return {ok:true,reason:'Создано: '+recipe.output.id};
}