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

window.renderAugments = function() {
    const histDiv = document.getElementById('augment-history'); if(!histDiv) return; histDiv.innerHTML = '';
    window.player.augments.forEach(aug => {
        const iconEl = document.createElement('div'); iconEl.className = 'history-icon'; iconEl.innerText = aug.icon; 
        const tooltip = document.createElement('div'); tooltip.className = 'custom-tooltip'; tooltip.innerHTML = `<strong>${aug.name}</strong><br>${aug.desc}<br><span style="color:#f1c40f">보유: ${aug.count}개</span>`; iconEl.appendChild(tooltip);
        if (aug.count > 1) { const badge = document.createElement('div'); badge.className = 'stack-badge'; badge.innerText = `x${aug.count}`; iconEl.appendChild(badge); }
        histDiv.appendChild(iconEl);
    });
};

// =====================================
// 게임 멈춤 없이 100% 자동 랜덤 증강 부여 시스템
// =====================================
window.showLevelUpModal = function() {
    const baseAugmentPool = [
        { id: 'damage', name: '⚔️ 예리한 칼날', desc: '평타 데미지 +5', unique: false, icon: '⚔️' }, { id: 'cooldown', name: '⚡ 가벼운 몸놀림', desc: '평타 공격 쿨타임 감소', unique: false, icon: '🏃' },
        { id: 'multishot', name: '🏹 다중 발사', desc: '평타 발사 개수 1개 추가', unique: false, icon: '🏹' }, { id: 'maxhp', name: '💖 강인한 체력', desc: '최대 체력 +30 및 100% 회복', unique: false, icon: '💖' },
        { id: 'weapon_fire', name: '🔥 화염검', desc: '화염 잔상 및 추가 피해', unique: true, icon: '🔥' }, { id: 'weapon_ice', name: '❄️ 얼음검', desc: '서리 이펙트 및 빙결', unique: true, icon: '❄️' },
        { id: 'weapon_lightning', name: '⚡ 뇌전검', desc: '투사체 속도 대폭 증가', unique: true, icon: '⚡' }, { id: 'weapon_dark', name: '🌑 암흑검', desc: '투사체 거대화 및 피흡 2', unique: true, icon: '🌑' },
        { id: 'skill_dash', name: '💨 돌진 베기', desc: '대시 중 적 충돌 시 데미지', unique: true, icon: '💨' }, { id: 'skill_parry_heal', name: '💚 치유 패링', desc: '패링 성공 시 체력 회복', unique: true, icon: '💚' },
        { id: 'skill_wave', name: '🌊 파도 베기', desc: '평타 시 30% 확률 3갈래', unique: true, icon: '🌊' }
    ];

    let availablePool = baseAugmentPool.filter(aug => { if (aug.unique && window.player.augments.some(a => a.id === aug.id)) return false; if (aug.id.startsWith('weapon_') && window.player.weaponType !== 'normal') return false; return true; });
    if (!window.player.hasSkill) { availablePool.push({ id: 'skill', name: '🌀 회전베기 스킬', desc: '[R]키 주변 전체 공격', unique: true, icon: '🌀' }); } else { availablePool.push({ id: 'skill_cooldown', name: '⏳ 깨달음', desc: '회전베기 스킬 쿨타임 감소', unique: false, icon: '⏳' }); }

    if (availablePool.length === 0) availablePool = baseAugmentPool;

    // 랜덤으로 능력 1개 자동 선택
    availablePool.sort(() => 0.5 - Math.random());
    const chosen = availablePool[0];

    // 캐릭터 위에 화려한 이펙트 실행
    window.createLevelUpEffect(window.player.x, window.player.y);
    
    // 약간 딜레이 후 어떤 능력을 먹었는지 표시
    setTimeout(() => {
        window.spawnDamageText(window.player.x, window.player.y - 20, chosen.name + " 획득!", 'heal');
    }, 400);

    // 창 띄우지 않고 자동으로 백그라운드 적용
    window.selectAugment(chosen.id, chosen.name, chosen.icon, chosen.desc);
};

window.gainExp = function(amount) {
    window.player.exp += (amount * 1.5); 
    if (window.player.exp >= window.player.maxExp) { 
        window.player.level++; 
        window.player.exp -= window.player.maxExp; 
        window.player.maxExp = Math.floor(window.player.maxExp * 1.15); 
        window.updateUI(); 
        window.showLevelUpModal(); // 자동으로 랜덤 효과 부여됨 (멈춤 없음)
    } 
    window.updateUI();
};

window.selectAugment = function(type, name, icon, desc) {
    let existing = window.player.augments.find(a => a.id === type);
    if (existing) { existing.count++; } else { window.player.augments.push({ id: type, name: name, icon: icon, desc: desc, count: 1 }); } 
    window.renderAugments();

    if (type === 'damage') window.player.damage += 5; 
    else if (type === 'cooldown') window.player.baseAttackCooldown = Math.max(10, window.player.baseAttackCooldown - 5); 
    else if (type === 'multishot') window.player.attackCount += 1; 
    else if (type === 'maxhp') { window.player.maxHp += 30; window.player.hp = window.player.maxHp; }
    else if (type === 'weapon_fire') { window.player.weaponType = 'fire'; if(window.playerSwordEl) window.playerSwordEl.style.background = 'linear-gradient(to right, #e74c3c, #f1c40f)'; } 
    else if (type === 'weapon_ice') { window.player.weaponType = 'ice'; if(window.playerSwordEl) window.playerSwordEl.style.background = 'linear-gradient(to right, #00ffff, #fff)'; } 
    else if (type === 'weapon_lightning') { window.player.weaponType = 'lightning'; if(window.playerSwordEl) window.playerSwordEl.style.background = 'linear-gradient(to right, #f1c40f, #00ffff)'; } 
    else if (type === 'weapon_dark') { window.player.weaponType = 'dark'; if(window.playerSwordEl) window.playerSwordEl.style.background = 'linear-gradient(to right, #8e44ad, #2c3e50)'; window.player.lifesteal = 2; }
    else if (type === 'skill_dash') window.player.dashDamage = true; 
    else if (type === 'skill_parry_heal') window.player.parryHeal = true; 
    else if (type === 'skill_wave') window.player.waveChance = true; 
    else if (type === 'skill') { window.player.hasSkill = true; if(window.skillStatusEl) window.skillStatusEl.classList.remove('hidden'); if(document.getElementById('btn-skill')) document.getElementById('btn-skill').classList.remove('hidden'); if(document.getElementById('mob-skill')) document.getElementById('mob-skill').classList.remove('hidden'); } 
    else if (type === 'skill_cooldown') window.player.maxSkillCooldown = Math.max(180, window.player.maxSkillCooldown - 100);

    window.updateUI(); 
};
