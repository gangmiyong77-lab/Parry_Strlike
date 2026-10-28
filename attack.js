function getDistance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function getClosestBossTo(targetX, targetY) {
    if(bosses.length === 0) return null; let closest = bosses[0]; let minDist = getDistance(targetX, targetY, closest.x, closest.y);
    for(let i=1; i<bosses.length; i++) { let dist = getDistance(targetX, targetY, bosses[i].x, bosses[i].y); if(dist < minDist) { closest = bosses[i]; minDist = dist; } } return closest;
}

function spawnDamageText(x, y, damage, type = 'normal') {
    const el = document.createElement('div'); el.className = 'damage-text ' + (type === 'crit' ? 'crit-text' : type === 'fire' ? 'fire-text' : type === 'heal' ? 'heal-text' : type === 'player' ? 'player-dmg-text' : ''); el.innerText = isNaN(damage) ? damage : (type === 'heal' ? `+${damage} HP` : Math.floor(damage));
    el.style.left = x + 'px'; el.style.top = (y - 30) + 'px'; const randX = (Math.random() - 0.5) * 40; el.style.transform = `translateX(calc(-50% + ${randX}px))`; container.appendChild(el); setTimeout(() => el.remove(), 600);
}
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) { let p = document.createElement('div'); p.className = 'particle'; p.style.backgroundColor = color; p.style.width = (Math.random() * 6 + 4) + 'px'; p.style.height = p.style.width; p.style.left = x + 'px'; p.style.top = y + 'px'; let angle = Math.random() * Math.PI * 2; let dist = Math.random() * 60 + 20; p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); p.style.setProperty('--ty', Math.sin(angle) * dist + 'px'); container.appendChild(p); setTimeout(() => p.remove(), 400); }
}
function spawnFireTrail(x, y) { let t = document.createElement('div'); t.className = 'fire-trail'; t.style.left = x + 'px'; t.style.top = y + 'px'; container.appendChild(t); setTimeout(() => t.remove(), 300); }

function createParryEffect(x, y) {
    let ring = document.createElement('div'); ring.style.position = 'absolute'; ring.style.width = '50px'; ring.style.height = '50px'; ring.style.border = '4px solid #00ffff'; ring.style.borderRadius = '50%'; ring.style.left = x + 'px'; ring.style.top = y + 'px'; ring.style.transform = 'translate(-50%, -50%)'; ring.style.pointerEvents = 'none'; ring.style.zIndex = '50';
    ring.animate([ { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 1, borderWidth: '4px' }, { transform: 'translate(-50%, -50%) scale(2.5)', opacity: 0, borderWidth: '0px' } ], { duration: 400, easing: 'ease-out' });
    container.appendChild(ring); setTimeout(() => ring.remove(), 400);

    for (let i = 0; i < 6; i++) {
        let spark = document.createElement('div'); spark.style.position = 'absolute'; spark.style.width = '4px'; spark.style.height = '15px'; spark.style.background = '#00ffff'; spark.style.borderRadius = '2px'; spark.style.left = x + 'px'; spark.style.top = y + 'px'; spark.style.zIndex = '100'; spark.style.pointerEvents = 'none'; spark.style.boxShadow = '0 0 10px #00ffff';
        let angle = (Math.PI * 2 / 6) * i; spark.animate([ { transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(0) scale(1)`, opacity: 1 }, { transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(-50px) scale(0)`, opacity: 0 } ], { duration: 300, easing: 'ease-out' });
        container.appendChild(spark); setTimeout(() => spark.remove(), 300);
    }
}
function createDashShadow() { let shadow = document.createElement('div'); shadow.className = 'dash-shadow'; shadow.style.left = player.x + 'px'; shadow.style.top = player.y + 'px'; container.appendChild(shadow); setTimeout(() => shadow.remove(), 300); }

function createBlaster(x, y, angle, owner) {
    playSound('parry'); const el = document.createElement('div'); el.className = 'gaster-blaster'; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    const eye = document.createElement('div'); eye.innerText = '❌'; eye.style.position = 'absolute'; eye.style.right = '-10px'; eye.style.top = '-15px'; eye.style.fontSize = '20px'; eye.style.textShadow = '0 0 10px #f00'; el.appendChild(eye);
    const telegraph = document.createElement('div'); telegraph.className = 'blaster-telegraph'; el.appendChild(telegraph); container.appendChild(el); blasters.push({ x, y, angle, timer: 35, el, telegraph, owner });
}

function takeDamage(amount) {
    player.hp -= amount; updateUI(); playSound('hit'); playerEl.classList.add('hit-flash'); container.classList.add('screen-shake');
    spawnDamageText(player.x, player.y, amount, 'player'); spawnParticles(player.x, player.y, '#e74c3c', 10);
    setTimeout(() => { playerEl.classList.remove('hit-flash'); container.classList.remove('screen-shake'); }, 300);
}

function bossHitEffect(targetBoss, x, y, damage, isCrit = false) {
    playSound('hit'); targetBoss.el.classList.add('boss-hit-flash'); setTimeout(() => targetBoss.el.classList.remove('boss-hit-flash'), 200);
    spawnDamageText(targetBoss.x, targetBoss.y, damage, isCrit ? 'crit' : 'normal'); spawnParticles(x, y, isCrit ? '#f1c40f' : '#e74c3c', 12);
}

function checkBossDeath(b) {
    if (b.hp <= 0) {
        playSound('dead'); b.el.remove(); b.uiEl.remove(); bosses = bosses.filter(boss => boss !== b);
        if (bosses.length === 0) { bossLevel++; player.hp = Math.min(player.maxHp, player.hp + 50); setTimeout(() => alert(`웨이브 클리어! 다음 단계(Lv.${bossLevel})로 진입합니다!\n(적 ${bossLevel}마리 등장, 체력 소폭 회복)`), 100); spawnBosses(); updateUI(); }
    }
}

function doAttack() {
    if(isPaused || player.isStunned || player.isPulled || player.attackCooldown > 0 || player.isDashing) return;
    playSound('swing'); playerEl.classList.add('attack-anim'); setTimeout(() => playerEl.classList.remove('attack-anim'), 200);
    let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y);
    let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10; const baseAngle = Math.atan2(ty - player.y, tx - player.x);
    if(playerSwordEl) { playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200); }

    if (player.waveChance && Math.random() < 0.3) { spawnProjectile(player.x, player.y, baseAngle - 0.3, 8, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 8, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 8, player.damage, false, 70); } 
    else { spawnProjectile(player.x, player.y, baseAngle, 8, player.damage, false, 70); }
    player.attackQueue = player.attackCount - 1; player.burstTimer = 8; player.attackCooldown = player.baseAttackCooldown;
}

function activateParry() {
    if(isPaused || player.isStunned || player.isPulled || player.parryCooldown > 0 || player.isParrying || player.isDashing) return;
    playSound('parry'); player.isParrying = true; player.parryTimer = 60; playerEl.classList.add('parrying'); playerEl.classList.remove('parry-cd');
    if(parryStatusEl) { parryStatusEl.innerText = "패링 중!! (이동 불가)"; parryStatusEl.style.color = "#00ffff"; }
}

function doSkill() {
    if (player.hasSkill && player.skillCooldown <= 0 && !isPaused && !player.isStunned && !player.isPulled && !player.isDashing) {
        playSound('swing'); player.skillCooldown = player.maxSkillCooldown; playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
        spawnParticles(player.x, player.y, '#f1c40f', 30); for (let i = 0; i < 8; i++) spawnProjectile(player.x, player.y, (Math.PI / 4) * i, 10, player.damage * player.skillDamageMult, false, 120, true);
    }
}

function doDash() {
    if (isPaused || player.isStunned || player.isPulled || player.dashCooldown > 0 || player.isDashing) return;
    playSound('swing'); player.isDashing = true; player.dashTimer = 12; player.dashCooldown = 90;
    let dx = 0, dy = 0; if (joystickDelta.x !== 0 || joystickDelta.y !== 0) { dx = joystickDelta.x; dy = joystickDelta.y; } else { if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1; if (dx === 0 && dy === 0) dx = 1; }
    let len = Math.hypot(dx, dy); player.dashDir = { x: dx/len, y: dy/len }; playerEl.style.opacity = '0.4'; setTimeout(() => playerEl.style.opacity = '1', 200);
}

function spawnProjectile(x, y, angle, speed, damage, isBoss, size, isHeavy = false, isGrab = false, owner = null, isLaser = false, isUnparryable = false, customClass = '') {
    const el = document.createElement('div');
    el.className = `slash ${isBoss ? 'boss-slash' : ''} ${isHeavy ? 'heavy-slash' : ''} ${isLaser ? 'laser-slash' : ''} ${isUnparryable ? 'unparryable-attack' : ''} ${customClass}`;
    let isElemental = (!isBoss && player.weaponType !== 'normal');

    if (isElemental) {
        el.classList.add('slash-elemental'); el.style.width = size + 'px'; el.style.height = size + 'px'; el.style.fontSize = (size * 0.8) + 'px';
        if (player.weaponType === 'fire') { el.style.color = '#e74c3c'; el.innerText = '🔥'; } else if (player.weaponType === 'ice') { el.style.color = '#00ffff'; el.innerText = '❄️'; size *= 1.5; } else if (player.weaponType === 'lightning') { el.style.color = '#f1c40f'; el.innerText = '⚡'; speed *= 1.5; } else if (player.weaponType === 'dark') { el.style.color = '#8e44ad'; el.innerText = '🌑'; size *= 1.8; damage *= 1.2; }
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
    container.appendChild(el);
    projectiles.push({ x, y, angle, speed, damage, isBoss, radius: (!isBoss && (player.weaponType === 'ice' || player.weaponType === 'dark') ? size/2 * 1.5 : size/2), el, isGrab, owner, isUnparryable, timer: 0 });
}
