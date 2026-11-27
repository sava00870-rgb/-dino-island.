const SKILLS={
 survival:{maxHealth:10,maxStamina:5},
 gathering:{gatherYield:.2,toolDurability:.15},
 combat:{meleeDamage:.15,damageReduction:.1},
 builder:{buildCost:-.1,structureDurability:.2}
};
export function createProgression(data={}){
 const state={xp:Math.max(0,data.xp||0),level:Math.max(1,data.level||1),skillPoints:Math.max(0,data.skillPoints||0),skills:{...(data.skills||{})},modifiers:{maxHealth:100,maxStamina:100,gatherYield:1,toolDurability:1,meleeDamage:1,damageReduction:0,buildCost:1,structureDurability:1}};
 applySkills(state);return state;
}
function threshold(level){return level*100}
function applySkills(p){
 p.modifiers={maxHealth:100,maxStamina:100,gatherYield:1,toolDurability:1,meleeDamage:1,damageReduction:0,buildCost:1,structureDurability:1};
 for(const id of Object.keys(p.skills)){const skill=SKILLS[id];if(!skill)continue;for(const [key,value] of Object.entries(skill))p.modifiers[key]+=value*p.skills[id]}
}
export function addExperience(p,amount){
 if(!Number.isFinite(amount)||amount<=0)return p;
 p.xp+=amount;
 while(p.xp>=threshold(p.level)){p.xp-=threshold(p.level);p.level++;p.skillPoints++}
 return p;
}
export function buySkill(p,id){
 if(!SKILLS[id]||p.skillPoints<1||(p.skills[id]||0)>=5)return false;
 p.skills[id]=(p.skills[id]||0)+1;p.skillPoints--;applySkills(p);return true;
}