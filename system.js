window.addEventListener('keydown', e => { if(window.keys.hasOwnProperty(e.key.toLowerCase())) window.keys[e.key.toLowerCase()] = true; if (e.code === 'Space') { e.preventDefault(); window.activateParry(); } if (e.key.toLowerCase() === 'r') { window.doSkill(); } if (e.key === 'Shift') { e.preventDefault(); window.doDash(); }});
window.addEventListener('keyup', e => { if(window.keys.hasOwnProperty(e.key.toLowerCase())) window.keys[e.key.toLowerCase()] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

window.container.addEventListener('mousemove', e => { const rect = window.container.getBoundingClientRect(); window.mousePos.x = e.clientX - rect.left; window.mousePos.y = e.clientY - rect.top; });
window.container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal') || e.target.closest('#opening-screen') || e.target.closest('#btn-giveup')) return;
    window.isMobileEnv = false;
    if (e.button === 0) window.isAttacking = true; else if (e.button === 2) window.activateParry();
});
window.addEventListener('mouseup', e => { if (e.button === 0) window.isAttacking = false; });
window.addEventListener('touchstart', () => { window.isMobileEnv = true; }, {passive: true});

let joyArea = document.getElementById('joystick-area');
let joyKnob = document.getElementById('joystick-knob');
if(joyArea && joyKnob) {
    joyArea.addEventListener('touchstart', (e) => { window.joyActive = true; let rect = joyArea.getBoundingClientRect(); window.joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; updateJoystick(e.touches[0]); });
    joyArea.addEventListener('touchmove', (e) => { if (window.joyActive) { e.preventDefault(); updateJoystick(e.touches[0]); } }, {passive: false});
    joyArea.addEventListener('touchend', () => { window.joyActive = false; joyKnob.style.transform = `translate(0px, 0px)`; window.joystickDelta = { x: 0, y: 0 }; });
}
function updateJoystick(touch) { let dx = touch.clientX - window.joyCenter.x; let dy = touch.clientY - window.joyCenter.y; let dist = Math.hypot(dx, dy); let maxDist = 40; if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; } joyKnob.style.transform = `translate(${dx}px, ${dy}px)`; window.joystickDelta = { x: dx / maxDist, y: dy / maxDist }; }

const mobAttack = document.getElementById('mob-attack'); if(mobAttack) { mobAttack.addEventListener('touchstart', (e) => { e.preventDefault(); window.isAttacking = true; }, {passive: false}); mobAttack.addEventListener('touchend', (e) => { e.preventDefault(); window.isAttacking = false; }, {passive: false}); }
const mobParry = document.getElementById('mob-parry'); if(mobParry) mobParry.addEventListener('touchstart', (e) => { e.preventDefault(); window.activateParry(); }, {passive: false});
const mobDash = document.getElementById('mob-dash'); if(mobDash) mobDash.addEventListener('touchstart', (e) => { e.preventDefault(); window.doDash(); }, {passive: false});
const mobSkill = document.getElementById('mob-skill'); if(mobSkill) mobSkill.addEventListener('touchstart', (e) => { e.preventDefault(); window.doSkill(); }, {passive: false});

// =====================================
// 레벨업 시 스킬 배제 (순수 스탯 강화만 남김)
// =====================================
window.gainExp = function(amount) {
    window.player.exp += (amount * 1.5); 
    if (window.player.exp >= window.player.maxExp) { 
        window.player.level++; 
        window.player.exp -= window.player.maxExp; 
        window.player.maxExp = Math.floor(window.player.maxExp * 1.15); 
        window.updateUI(); 
        window.autoLevelUpStat();
    } 
    window.updateUI();
};

window.autoLevelUpStat = function() {
    const statPool = [
        { id: 'damage', name: '공격력 상승' }, 
        { id: 'cooldown', name: '공격속도 증가' },
        { id: 'multishot', name: '다중 발사' }, 
        { id: 'maxhp', name: '최대 체력 상승' }
    ];
    
    // 스킬 관련 쿨타임 감소 추가 조건
    if (window.player.hasSkill) {
        statPool.push({ id: 'skill_cooldown', name: '스킬 쿨감소' });
    }

    statPool.sort(() => 0.5 - Math.random());
    const chosen = statPool[0];

    window.createLevelUpEffect(window.player.x, window.player.y);
    setTimeout(() => { window.spawnDamageText(window.player.x, window.player.y - 20, chosen.name, 'heal'); }, 400);

    if (chosen.id === 'damage') window.player.damage += 5; 
    else if (chosen.id === 'cooldown') window.player.baseAttackCooldown = Math.max(10, window.player.baseAttackCooldown - 5); 
    else if (chosen.id === 'multishot') window.player.attackCount += 1; 
    else if (chosen.id === 'maxhp') { window.player.maxHp += 30; window.player.hp = window.player.maxHp; }
    else if (chosen.id === 'skill_cooldown') window.player.maxSkillCooldown = Math.max(180, window.player.maxSkillCooldown - 100);

    window.updateUI(); 
};
