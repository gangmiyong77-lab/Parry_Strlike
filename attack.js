window.getDistance = function(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); };
window.getClosestBossTo = function(targetX, targetY) {
    if(window.bosses.length === 0) return null; let closest = window.bosses[0]; let minDist = window.getDistance(targetX, targetY, closest.x, closest.y);
    for(let i=1; i<window.bosses.length; i++) { let dist = window.getDistance(targetX, targetY, window.bosses[i].x, window.bosses[i].y); if(dist < minDist) { closest = window.bosses[i]; minDist = dist; } } return closest;
};

window.spawnDamageText = function(x, y, damage, type = 'normal') {
    const el = document.createElement('div'); el.className = 'damage-text ' + (type === 'crit' ? 'crit-text' : type === 'fire' ? 'fire-text' : type === 'heal' ? 'heal-text' : type === 'gold' ? 'gold-text' : type === 'player' ? 'player-dmg-text' : ''); el.innerText = isNaN(damage) ? damage : (type === 'heal' ? `+${damage} HP` : Math.floor(damage));
    el.style.left = x + 'px'; el.style.top = (y - 30) + 'px'; const randX = (Math.random() - 0.5) * 40; el.style.transform = `translateX(calc(-50% + ${randX}px))`; window.container.appendChild(el); setTimeout(() => el.remove(), 600);
};
window.spawnParticles = function(x, y, color, count) {
    for (let i = 0; i < count; i++) { let p = document.createElement('div'); p.className = 'particle'; p.style.backgroundColor = color; p.style.width = (Math.random() * 6 + 4) + 'px'; p.style.height = p.style.width; p.style.left = x + 'px'; p.style.top = y + 'px'; let angle = Math.random() * Math.PI * 2; let dist = Math.random() * 60 + 20; p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--ty', Math.sin(angle) * dist + 'px'); window.container.appendChild(p); setTimeout(() => p.remove(), 400); }
};
window.spawnFireTrail = function(x, y) { let t = document.createElement('div'); t.className = 'fire-trail'; t.style.left = x + 'px'; t.style.top = y + 'px'; window.container.appendChild(t); setTimeout(() => t.remove(), 300); };
window.createDashShadow = function() { let shadow = document.createElement('div'); shadow.className = 'dash-shadow'; shadow.style.left = window.player.x + 'px'; shadow.style.top = window.player.y + 'px'; window.container.appendChild(shadow); setTimeout(() => shadow.remove(), 300); };

window.createLevelUpEffect = function(x, y) {
    let pillar = document.createElement('div'); pillar.className = 'levelup-pillar'; pillar.style.left = x + 'px'; pillar.style.top = (y + 25) + 'px'; window.container.appendChild(pillar); setTimeout(() => pillar.remove(), 600);
    let txt = document.createElement('div'); txt.className = 'levelup-text'; txt.innerText = 'LEVEL UP!'; txt.style.left = x + 'px'; txt.style.top = (y - 50) + 'px'; window.container.appendChild(txt); setTimeout(() => txt.remove(), 1000);
    window.spawnParticles(x, y, '#f1c40f', 20); window.playSound('parryed');
};

window.createParryEffect = function(x, y) {
    let ring = document.createElement('div'); ring.style.position = 'absolute'; ring.style.width = '50px'; ring.style.height = '50px'; ring.style.border = '4px solid #00ffff'; ring.style.borderRadius = '50%'; ring.style.left = x + 'px'; ring.style.top = y + 'px'; ring.style.transform = 'translate(-50%, -50%)'; ring.style.pointerEvents = 'none'; ring.style.zIndex = '50';
    ring.animate([ { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1, borderWidth: '4px' }, { transform: 'translate(-50%, -50%) scale(2.5)', opacity: 0, borderWidth: '0px' } ], { duration: 400, easing: 'ease-out' });
    window.container.appendChild(ring); setTimeout(() => ring.remove(), 400);
    for (let i = 0; i < 6; i++) { let spark = document.createElement('div'); spark.style.position = 'absolute'; spark.style.width = '4px'; spark.style.height = '15px'; spark.style.background = '#00ffff'; spark.style.borderRadius = '2px'; spark.style.left = x + 'px'; spark.style.top = y + 'px'; spark.style.zIndex = '100'; spark.style.pointerEvents = 'none'; spark.style.boxShadow = '0 0 10px #00ffff'; let angle = (Math.PI * 2 / 6) * i; spark.animate([ { transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(0) scale(1)`, opacity: 1 }, { transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(-50px) scale(0)`, opacity: 0 } ], { duration: 300, easing: 'ease-out' }); window.container.appendChild(spark); setTimeout(() => spark.remove(), 300); }
};

window.takeDamage = function(amount) {
    window.player.hp -= amount; window.updateUI(); window.playSound('hit'); window.playerEl.classList.add('hit-flash'); window.container.classList.add('screen-shake');
    window.spawnDamageText(window.player.x, window.player.y, amount, 'player'); window.spawnParticles(window.player.x, window.player.y, '#e74c3c', 10);
    setTimeout(() => { window.playerEl.classList.remove('hit-flash'); window.container.classList.remove('screen-shake'); }, 300);
};

window.bossHitEffect = function(targetBoss, x, y, damage, isCrit = false) {
    window.playSound('hit'); targetBoss.el.classList.add('boss-hit-flash'); setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    window.spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal'); window.spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);
};

// ===============================================
// 알림창 완전 삭제 & 자연스러운 다음 웨이브 진행
// ===============================================
window.checkBossDeath = function(b) {
    if (b.hp <= 0) {
        window.playSound('dead'); b.el.remove(); b.uiEl.remove(); window.bosses = window.bosses.filter(boss => boss !== b);
        
        let earnedGold = 10 * window.bossLevel;
        window.totalGold += earnedGold;
        window.saveMeta();
        window.spawnDamageText(b.x, b.y, `+${earnedGold}G`, 'gold');

        if (window.bosses.length === 0) { 
            window.bossLevel++; 
            window.player.hp = Math.min(window.player.maxHp, window.player.hp + 50); 
            // 흐름을 끊는 알람창(alert) 대신 중앙에 글자만 띄웁니다!
            window.spawnDamageText(window.GAME_WIDTH / 2, window.GAME_HEIGHT / 2, 'WAVE CLEAR!', 'crit');
            window.spawnBosses(); 
            window.updateUI(); 
        }
    }
};

window.doAttack = function() {
    if(window.isPaused || window.player.isStunned || window.player.isPulled || window.player.attackCooldown > 0 || window.player.isDashing) return;
    window.playSound('swing'); window.playerEl.classList.add('attack-anim'); setTimeout(() => window.playerEl.classList.remove('attack-anim'), 200);
    let target = window.isMobileEnv ? window.getClosestBossTo(window.player.x, window.player.y) : window.getClosestBossTo(window.mousePos.x, window.mousePos.y);
    let tx = target ? target.x : window.player.x; let ty = target ? target.y : window.player.y - 10; const baseAngle = Math.atan2(ty - window.player.y, tx - window.player.x);
    if(window.playerSwordEl) { window.playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { window.playerSwordEl.style.transform = 'rotate(0deg)'; }, 200); }

    if (window.player.waveChance && Math.random() < 0.3) { window.spawnProjectile(window.player.x, window.player.y, baseAngle - 0.3, 8, window.player.damage, false, 70); window.spawnProjectile(window.player.x, window.player.y, baseAngle, 8, window.player.damage, false, 70); window.spawnProjectile(window.player.x, window.player.y, baseAngle + 0.3, 8, window.player.damage, false, 70); } 
    else { window.spawnProjectile(window.player.x, window.player.y, baseAngle, 8, window.player.damage, false, 70); }
    window.player.attackQueue = window.player.attackCount - 1; window.player.burstTimer = 8; window.player.attackCooldown = window.player.baseAttackCooldown;
};

window.activateParry = function() {
    if(window.isPaused || window.player.isStunned || window.player.isPulled || window.player.parryCooldown > 0 || window.player.isParrying || window.player.isDashing) return;
    window.playSound('parry'); window.player.isParrying = true; window.player.parryTimer = 60; window.playerEl.classList.add('parrying'); window.playerEl.classList.remove('parry-cd');
    if(window.parryStatusEl) { window.parryStatusEl.innerText = "패링 중!! (이동 불가)"; window.parryStatusEl.style.color = "#00ffff"; }
};

window.doSkill = function() {
    if (window.player.hasSkill && window.player.skillCooldown <= 0 && !window.isPaused && !window.player.isStunned && !window.player.isPulled && !window.player.isDashing) {
        window.playSound('swing'); window.player.skillCooldown = window.player.maxSkillCooldown; window.playerEl.classList.add('parry-deflect'); setTimeout(() => window.playerEl.classList.remove('parry-deflect'), 200);
        window.spawnParticles(window.player.x, window.player.y, '#f1c40f', 30); for (let i = 0; i < 8; i++) window.spawnProjectile(window.player.x, window.player.y, (Math.PI / 4) * i, 10, window.player.damage * window.player.skillDamageMult, false, 120, true);
    }
};

window.doDash = function() {
    if (window.isPaused || window.player.isStunned || window.player.isPulled || window.player.dashCooldown > 0 || window.player.isDashing) return;
    window.playSound('swing'); window.player.isDashing = true; window.player.dashTimer = 12; window.player.dashCooldown = 90;
    let dx = 0, dy = 0; if (window.joystickDelta.x !== 0 || window.joystickDelta.y !== 0) { dx = window.joystickDelta.x; dy = window.joystickDelta.y; } else { if (window.keys.w) dy -= 1; if (window.keys.s) dy += 1; if (window.keys.a) dx -= 1; if (window.keys.d) dx += 1; if (dx === 0 && dy === 0) dx = 1; }
    let len = Math.hypot(dx, dy); window.player.dashDir = { x: dx/len, y: dy/len }; window.playerEl.style.opacity = '0.4'; setTimeout(() => window.playerEl.style.opacity = '1', 200);
};

window.spawnProjectile = function(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false, customClass = '') {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''} ${customClass}`;
    let isElemental = (!isBoss && window.player.weaponType !== 'normal');

    if (isElemental) {
        el.classList.add('slash-elemental'); el.style.width = size + 'px'; el.style.height = size + 'px'; el.style.fontSize = (size * 0.8) + 'px';
        if (window.player.weaponType === 'fire') { el.style.color = '#e74c3c'; el.innerText = '🔥'; } else if (window.player.weaponType === 'ice') { el.style.color = '#00ffff'; el.innerText = '❄️'; size *= 1.5; } else if (window.player.weaponType === 'lightning') { el.style.color = '#f1c40f'; el.innerText = '⚡'; speed *= 1.5; } else if (window.player.weaponType === 'dark') { el.style.color = '#8e44ad'; el.innerText = '🌑'; size *= 1.8; damage *= 1.2; }
    } else {
        el.style.width = size + 'px'; el.style.height = (size * 0.8) + 'px'; 
        let color = 'white'; if (customClass.includes('slash-purple')) color = '#8e44ad'; else if (isBoss) color = '#e74c3c';
        el.style.backgroundColor = color; el.style.filter = `drop-shadow(0 0 8px ${color})`;
        if (customClass.includes('slash-chain')) { el.style.width = '50px'; el.style.height = '6px'; } else if (isLaser) { el.style.width = size + 'px'; el.style.height = (size/3) + 'px'; }
    }

    el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`; 
    if (isUnparryable && isBoss) {
        const cross = document.createElement('div'); cross.innerText = '❌'; cross.style.position = 'absolute'; cross.style.top = '50%'; cross.style.left = '50%'; cross.style.transform = `translate(-50%, -50%) rotate(${-angle}rad)`; cross.style.fontSize = (size * 0.4) + 'px'; cross.style.textShadow = '0 0 5px black'; el.appendChild(cross);
    }
    window.container.appendChild(el);
    window.projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && (window.player.weaponType === 'ice' || window.player.weaponType === 'dark') ? size/2 * 1.5 : size/2), el, isGrab, owner, isUnparryable, timer: 0 });
};

window.createBlaster = function(x, y, angle, owner) {
    window.playSound('parry'); const el = document.createElement('div'); el.className = 'gaster-blaster'; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    const eye = document.createElement('div'); eye.innerText = '❌'; eye.style.position = 'absolute'; eye.style.right = '-10px'; eye.style.top = '-15px'; eye.style.fontSize = '20px'; eye.style.textShadow = '0 0 10px #f00'; el.appendChild(eye);
    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph); window.container.appendChild(el); window.blasters.push({ x, y, angle, timer: 35, el, telegraph, owner });
};
