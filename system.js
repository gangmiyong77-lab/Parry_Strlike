window.addEventListener('keydown', e => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; if (e.code === 'Space') { e.preventDefault(); activateParry(); } if (e.key.toLowerCase() === 'r') { doSkill(); } if (e.key === 'Shift') { e.preventDefault(); doDash(); }});
window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

container.addEventListener('mousemove', e => { const rect = container.getBoundingClientRect(); mousePos.x = e.clientX - rect.left; mousePos.y = e.clientY - rect.top; });
container.addEventListener('mousedown', e => {
    if(e.target.closest('#mobile-controls') || e.target.closest('.modal') || e.target.closest('#opening-screen') || e.target.closest('#btn-giveup')) return;
    isMobileEnv = false;
    if (e.button === 0) isAttacking = true; else if (e.button === 2) activateParry();
});
window.addEventListener('mouseup', e => { if (e.button === 0) isAttacking = false; });
window.addEventListener('touchstart', () => { isMobileEnv = true; }, {passive: true});

if(joyArea) {
    joyArea.addEventListener('touchstart', (e) => { joyActive = true; let rect = joyArea.getBoundingClientRect(); joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; updateJoystick(e.touches[0]); });
    joyArea.addEventListener('touchmove', (e) => { if (joyActive) { e.preventDefault(); updateJoystick(e.touches[0]); } }, {passive: false});
    joyArea.addEventListener('touchend', () => { joyActive = false; joyKnob.style.transform = `translate(0px, 0px)`; joystickDelta = { x: 0, y: 0 }; });
}

const mobAttack = document.getElementById('mob-attack'); if(mobAttack) { mobAttack.addEventListener('touchstart', (e) => { e.preventDefault(); isAttacking = true; }, {passive: false}); mobAttack.addEventListener('touchend', (e) => { e.preventDefault(); isAttacking = false; }, {passive: false}); }
const mobParry = document.getElementById('mob-parry'); if(mobParry) mobParry.addEventListener('touchstart', (e) => { e.preventDefault(); activateParry(); }, {passive: false});
const mobDash = document.getElementById('mob-dash'); if(mobDash) mobDash.addEventListener('touchstart', (e) => { e.preventDefault(); doDash(); }, {passive: false});
const mobSkill = document.getElementById('mob-skill'); if(mobSkill) mobSkill.addEventListener('touchstart', (e) => { e.preventDefault(); doSkill(); }, {passive: false});

function renderAugments() {
    const histDiv = document.getElementById('augment-history'); if(!histDiv) return; histDiv.innerHTML = '';
    player.augments.forEach(aug => {
        const iconEl = document.createElement('div'); iconEl.className = 'history-icon'; iconEl.innerText = aug.icon; 
        const tooltip = document.createElement('div'); tooltip.className = 'custom-tooltip'; tooltip.innerHTML = `<strong>${aug.name}</strong><br>${aug.desc}<br><span style="color:#f1c40f">보유: ${aug.count}개</span>`; iconEl.appendChild(tooltip);
        if (aug.count > 1) { const badge = document.createElement('div'); badge.className = 'stack-badge'; badge.innerText = `x${aug.count}`; iconEl.appendChild(badge); }
        histDiv.appendChild(iconEl);
    });
}

function showLevelUpModal() {
    isPaused = true; const modal = document.getElementById('level-up-modal'); if(modal) modal.classList.remove('hidden');
    
    const baseAugmentPool = [
        { id: 'damage', name: '⚔️ 예리한 칼날', desc: '평타 데미지 +5', unique: false, icon: '⚔️' }, { id: 'cooldown', name: '⚡ 가벼운 몸놀림', desc: '평타 공격 쿨타임 감소', unique: false, icon: '🏃' },
        { id: 'multishot', name: '🏹 다중 발사', desc: '평타 발사 개수 1개 추가', unique: false, icon: '🏹' }, { id: 'maxhp', name: '💖 강인한 체력', desc: '최대 체력 +30 및 100% 회복', unique: false, icon: '💖' },
        { id: 'weapon_fire', name: '🔥 화염검 (무기)', desc: '화염 잔상 및 타격시 추가 피해', unique: true, icon: '🔥' }, { id: 'weapon_ice', name: '❄️ 얼음검 (무기)', desc: '서리 이펙트 및 4타 적중시 빙결', unique: true, icon: '❄️' },
        { id: 'weapon_lightning', name: '⚡ 뇌전검 (무기)', desc: '투사체 속도 대폭 증가', unique: true, icon: '⚡' }, { id: 'weapon_dark', name: '🌑 암흑검 (무기)', desc: '투사체 거대화 및 피흡 2 부여', unique: true, icon: '🌑' },
        { id: 'skill_dash', name: '💨 돌진 베기 (스킬)', desc: '대시 중 적과 충돌 시 데미지', unique: true, icon: '💨' }, { id: 'skill_parry_heal', name: '💚 치유의 패링', desc: '패링 성공 시 체력 20 회복', unique: true, icon: '💚' },
        { id: 'skill_wave', name: '🌊 파도 베기', desc: '평타 시 30% 확률로 3갈래 발사', unique: true, icon: '🌊' }
    ];

    let availablePool = baseAugmentPool.filter(aug => { if (aug.unique && player.augments.some(a => a.id === aug.id)) return false; if (aug.id.startsWith('weapon_') && player.weaponType !== 'normal') return false; return true; });
    if (!player.hasSkill) { availablePool.push({ id: 'skill', name: '🌀 회전베기 스킬', desc: '[R]키로 주변 적 전체 공격 획득', unique: true, icon: '🌀' }); } else { availablePool.push({ id: 'skill_cooldown', name: '⏳ 깨달음', desc: '회전베기 스킬 쿨타임 감소', unique: false, icon: '⏳' }); }

    availablePool.sort(() => 0.5 - Math.random());
    const containerEl = document.getElementById('augment-container'); if(!containerEl) return;
    
    containerEl.innerHTML = '';
    availablePool.slice(0, 3).forEach(aug => {
        const btn = document.createElement('button'); btn.className = 'aug-btn'; btn.innerHTML = `<strong>${aug.name}</strong><br><span style="font-size:13px; color:#aaa;">${aug.desc}</span>`; 
        btn.onclick = () => window.selectAugment(aug.id, aug.name, aug.icon, aug.desc); 
        containerEl.appendChild(btn);
    });
}

function gainExp(amount) {
    player.exp += (amount * 1.5); if (player.exp >= player.maxExp) { player.level++; player.exp -= player.maxExp; player.maxExp = Math.floor(player.maxExp * 1.15); updateUI(); showLevelUpModal(); } updateUI();
}

window.selectAugment = function(type, name, icon, desc) {
    let existing = player.augments.find(a => a.id === type);
    if (existing) { existing.count++; } else { player.augments.push({ id: type, name: name, icon: icon, desc: desc, count: 1 }); } renderAugments();

    if (type === 'damage') player.damage += 5; else if (type === 'cooldown') player.baseAttackCooldown = Math.max(10, player.baseAttackCooldown - 5); else if (type === 'multishot') player.attackCount += 1; else if (type === 'maxhp') { player.maxHp += 30; player.hp = player.maxHp; }
    else if (type === 'weapon_fire') { player.weaponType = 'fire'; if(playerSwordEl) playerSwordEl.style.background = 'linear-gradient(to right, #e74c3c, #f1c40f)'; } else if (type === 'weapon_ice') { player.weaponType = 'ice'; if(playerSwordEl) playerSwordEl.style.background = 'linear-gradient(to right, #00ffff, #fff)'; } else if (type === 'weapon_lightning') { player.weaponType = 'lightning'; if(playerSwordEl) playerSwordEl.style.background = 'linear-gradient(to right, #f1c40f, #00ffff)'; } else if (type === 'weapon_dark') { player.weaponType = 'dark'; if(playerSwordEl) playerSwordEl.style.background = 'linear-gradient(to right, #8e44ad, #2c3e50)'; player.lifesteal = 2; }
    else if (type === 'skill_dash') player.dashDamage = true; else if (type === 'skill_parry_heal') player.parryHeal = true; else if (type === 'skill_wave') player.waveChance = true; else if (type === 'skill') { player.hasSkill = true; if(skillStatusEl) skillStatusEl.classList.remove('hidden'); if(document.getElementById('btn-skill')) document.getElementById('btn-skill').classList.remove('hidden'); if(document.getElementById('mob-skill')) document.getElementById('mob-skill').classList.remove('hidden'); } else if (type === 'skill_cooldown') player.maxSkillCooldown = Math.max(180, player.maxSkillCooldown - 100);

    document.querySelectorAll('#level-up-modal').forEach(el => el.classList.add('hidden')); 
    updateUI(); isPaused = false; requestAnimationFrame(update);
};
