window.initPlayer = () => ({
    x: window.GAME_WIDTH / 2, y: window.GAME_HEIGHT - 100, speed: 2.2, radius: 25, hp: 100, maxHp: 100, exp: 0, maxExp: 200, level: 1, damage: 10,
    attackCount: 1, baseAttackCooldown: 30, attackCooldown: 0, attackQueue: 0, burstTimer: 0,
    isParrying: false, parryTimer: 0, parryCooldown: 0, autoParryTimer: 0, isDashing: false, dashTimer: 0, dashCooldown: 0, dashDir: {x: 1, y: 0},
    hasSkill: false, skillCooldown: 0, maxSkillCooldown: 600,
    isStunned: false, stunTimer: 0, isPulled: false, pullTimer: 0, pullTarget: null,
    lifesteal: 0, skillDamageMult: 2, weaponType: 'normal', dashDamage: false, parryHeal: false, waveChance: false, augments: []
});
window.player = window.initPlayer();

window.spawnBosses = function() {
    window.bosses.forEach(b => { b.el.remove(); b.uiEl.remove(); }); window.bosses = [];
    for(let i = 0; i < window.bossLevel; i++) {
        const el = document.createElement('div'); el.className = 'character idle'; 
        el.style.display = 'flex'; el.style.position = 'absolute'; el.style.transform = 'translate(-50%, -50%)'; el.style.zIndex = '10'; el.style.justifyContent = 'center'; el.style.alignItems = 'center'; el.style.borderRadius = '50%'; el.style.width = '100px'; el.style.height = '100px';
        let eyeHtml = `<div class="ig-eyes"><div class="ig-eye boss-eye"><div class="ig-pupil"></div></div><div class="ig-eye boss-eye"><div class="ig-pupil"></div></div></div>`;
        let bossNameStr = ""; let nameColor = "#fff";

        if (window.bossLevel >= 9) { el.classList.add('boss-cosmic'); el.innerHTML = '<div class="boss-core"></div>' + eyeHtml + '<div class="ig-boss-weapon" style="background:linear-gradient(to right, #fff, #8e44ad); width:80px; height:15px; box-shadow: 0 0 15px #8e44ad;"></div>'; bossNameStr = `Lv.${window.bossLevel} Cosmic Being`; nameColor = "#9b59b6"; } 
        else if (window.bossLevel >= 7) { el.classList.add('boss-mecha'); el.innerHTML = '<div class="boss-visor"></div><div class="ig-boss-weapon" style="background:#00ffff; width:60px; height:8px; box-shadow:0 0 10px #00ffff;"></div>'; bossNameStr = `Lv.${window.bossLevel} Mecha Boss`; nameColor = "#00ffff"; } 
        else if (window.bossLevel >= 5) { el.style.border = '4px solid #f1c40f'; el.style.backgroundColor = '#8e44ad'; el.innerHTML = '<div class="boss-horns"><div class="boss-horn" style="transform:rotate(-20deg);"></div><div class="boss-horn" style="transform:rotate(20deg);"></div></div><div class="boss-crown"></div>' + eyeHtml + '<div class="ig-boss-weapon" style="background:linear-gradient(to right, #8e44ad, #2c3e50); width:70px; height:18px;"></div>'; bossNameStr = `Lv.${window.bossLevel} Demon Knight`; nameColor = "#f1c40f"; } 
        else if (window.bossLevel >= 3) { el.style.border = '4px solid #95a5a6'; el.style.backgroundColor = '#c0392b'; el.innerHTML = '<div class="boss-helmet"></div>' + eyeHtml + '<div class="ig-boss-weapon" style="background:#2c3e50; width:55px;"></div>'; bossNameStr = `Lv.${window.bossLevel} Armored Orc`; nameColor = "#e74c3c"; } 
        else { el.classList.add('boss-slime'); el.innerHTML = eyeHtml + '<div class="ig-boss-weapon" style="background:#27ae60; width:40px; height:10px;"></div>'; bossNameStr = `Lv.${window.bossLevel} Mutant Slime`; nameColor = "#2ecc71"; }

        const uiEl = document.createElement('div'); uiEl.style.position = 'absolute'; uiEl.style.width = '100px'; uiEl.style.transform = 'translate(-50%, -15px)'; uiEl.style.textAlign = 'center'; uiEl.style.zIndex = '11';
        const nameEl = document.createElement('div'); nameEl.innerText = bossNameStr; nameEl.style.color = nameColor; nameEl.style.fontSize = '12px'; nameEl.style.fontWeight = 'bold'; nameEl.style.marginBottom = '2px'; nameEl.style.textShadow = '1px 1px 2px #000';
        const hpBg = document.createElement('div'); hpBg.style.width = '100%'; hpBg.style.height = '8px'; hpBg.style.backgroundColor = 'rgba(0,0,0,0.5)'; hpBg.style.border = '1px solid #000';
        const hpFill = document.createElement('div'); hpFill.style.width = '100%'; hpFill.style.height = '100%'; hpFill.style.backgroundColor = '#e74c3c'; hpFill.style.transition = 'width 0.1s';
        hpBg.appendChild(hpFill); uiEl.appendChild(nameEl); uiEl.appendChild(hpBg); window.container.appendChild(el); window.container.appendChild(uiEl);

        let maxHp = 50 + (window.bossLevel * 100); let spacing = window.GAME_WIDTH / (window.bossLevel + 1);
        window.bosses.push({ x: spacing * (i + 1), y: 100 + (Math.random() * 80), radius: 50, hp: maxHp, maxHp: maxHp, state: 'idle', stateTimer: Math.floor(Math.random() * 40), vx: 1.2 * (i % 2 === 0 ? 1 : -1), vy: 0, dashSpeed: 12 + (window.bossLevel * 0.5), dashHitDelay: 0, freezeStack: 0, isFrozen: false, freezeTimer: 0, el: el, uiEl: uiEl, hpFill: hpFill });
    }
    const topBossName = document.getElementById('boss-name'); if(topBossName) topBossName.innerText = `WAVE ${window.bossLevel} (적 ${window.bossLevel}마리)`;
};

window.updateUI = function() {
    const pHP = document.getElementById('player-hp'); const pEXP = document.getElementById('player-exp'); const pLVL = document.getElementById('player-level');
    if(pHP) pHP.style.width = (Math.max(0, window.player.hp) / window.player.maxHp * 100) + '%'; 
    if(pEXP) pEXP.style.width = (window.player.exp / window.player.maxExp * 100) + '%'; 
    if(pLVL) pLVL.innerText = window.player.level;
    
    let totalHp = 0; let totalMaxHp = 0; 
    window.bosses.forEach(b => { totalHp += b.hp; totalMaxHp += b.maxHp; b.hpFill.style.width = (Math.max(0, b.hp) / b.maxHp * 100) + '%'; });
    const bossHpTop = document.getElementById('boss-hp'); if(bossHpTop && totalMaxHp > 0) bossHpTop.style.width = (Math.max(0, totalHp) / totalMaxHp * 100) + '%';
};
