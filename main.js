// =====================================
// 메인 상점 시스템 로직
// =====================================
window.shopItems = [
    { id: 'weapon_fire', type: 'weapon', name: '🔥 화염검', desc: '화염 잔상 및 5의 화상 피해', price: 500 },
    { id: 'weapon_ice', type: 'weapon', name: '❄️ 얼음검', desc: '4타 적중 시 보스를 얼림', price: 1000 },
    { id: 'weapon_lightning', type: 'weapon', name: '⚡ 뇌전검', desc: '투사체의 속도가 크게 증가', price: 1500 },
    { id: 'weapon_dark', type: 'weapon', name: '🌑 암흑검', desc: '거대 투사체 + 공격 시 체력 흡수', price: 2500 },
    { id: 'skill_whirlwind', type: 'skill', name: '🌀 회전베기 (R버튼)', desc: '주변 전체를 휩쓰는 광역기', price: 800 },
    { id: 'skill_dash', type: 'skill', name: '💨 돌진 베기', desc: '대시(Shift) 중 적과 충돌 시 데미지', price: 1200 },
    { id: 'skill_parry_heal', type: 'skill', name: '💚 치유의 패링', desc: '패링 성공 시 체력 20 확정 회복', price: 1500 },
    { id: 'skill_wave', type: 'skill', name: '🌊 파도 베기', desc: '기본 공격 시 30% 확률로 3갈래 발사', price: 2000 }
];

window.openShop = function() {
    window.renderShop();
    document.querySelectorAll('#shop-modal').forEach(el => el.classList.remove('hidden'));
};

window.closeShop = function() {
    document.querySelectorAll('#shop-modal').forEach(el => el.classList.add('hidden'));
};

window.buyItem = function(id, price, type) {
    if (window.totalGold < price) { alert("골드가 부족합니다!"); return; }
    window.totalGold -= price;
    window.unlockedItems.push(id);
    if (type === 'weapon') window.equippedWeapon = id.replace('weapon_', '');
    window.saveMeta();
    window.renderShop();
};

window.equipWeapon = function(id) {
    window.equippedWeapon = id.replace('weapon_', '');
    window.saveMeta();
    window.renderShop();
};

window.renderShop = function() {
    const content = document.getElementById('shop-content');
    if(!content) return;
    let html = `<div style="text-align:center; font-weight:bold; font-size:20px; margin-bottom:15px; color:#c0392b;">현재 골드: 🪙 ${window.totalGold} G</div>`;
    
    window.shopItems.forEach(item => {
        let isUnlocked = window.unlockedItems.includes(item.id);
        let isEquipped = (item.type === 'weapon' && window.equippedWeapon === item.id.replace('weapon_', ''));
        
        let btnHtml = '';
        if (!isUnlocked) {
            btnHtml = `<button style="background:#27ae60; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold; cursor:pointer;" onclick="window.buyItem('${item.id}', ${item.price}, '${item.type}')">🪙 ${item.price}G 구매</button>`;
        } else if (item.type === 'weapon') {
            if (isEquipped) btnHtml = `<button style="background:#7f8c8d; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold; cursor:default;" disabled>장착됨</button>`;
            else btnHtml = `<button style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold; cursor:pointer;" onclick="window.equipWeapon('${item.id}')">장착하기</button>`;
        } else {
            btnHtml = `<button style="background:#8e44ad; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold; cursor:default;" disabled>보유중</button>`;
        }

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:10px; margin-bottom:10px; border-radius:8px; border-left: 5px solid ${item.type==='weapon' ? '#e74c3c' : '#8e44ad'}; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                <div style="text-align:left;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:3px;">${item.name}</div>
                    <div style="font-size:12px; color:#555;">${item.desc}</div>
                </div>
                <div>${btnHtml}</div>
            </div>
        `;
    });
    content.innerHTML = html;
};

// =====================================
// 게임 전역 제어
// =====================================
window.startGame = function() { 
    window.player = window.initPlayer(); 
    window.bossLevel = 1; 
    document.querySelectorAll('#opening-screen').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#btn-giveup').forEach(el => el.style.display = 'block');
    window.updateWeaponAppearance(); // 시작 시 상점 장착 무기 적용
    window.isPaused = false; 
    window.spawnBosses(); 
    window.updateUI(); 
    requestAnimationFrame(window.update); 
};

window.showTutorial = function() { document.querySelectorAll('#tutorial-modal').forEach(el => el.classList.remove('hidden')); };
window.closeTutorial = function() { document.querySelectorAll('#tutorial-modal').forEach(el => el.classList.add('hidden')); };
window.showLeaderboard = function() { 
    const nocacheUrl = "https://docs.google.com/spreadsheets/d/190rTIf_nsxscNZ3qhOHnHQgTBXnRvxGke9gcQ7CVyuQ/htmlembed?widget=false&headers=false&chrome=false&t=" + new Date().getTime();
    document.querySelectorAll('.leaderboard-iframe').forEach(iframe => iframe.src = nocacheUrl);
    document.querySelectorAll('#leaderboard-modal').forEach(el => el.classList.remove('hidden')); 
};
window.closeLeaderboard = function() { document.querySelectorAll('#leaderboard-modal').forEach(el => el.classList.add('hidden')); };

window.giveUpGame = function() {
    if (window.isPaused) return;
    if (confirm("게임을 포기하시겠습니까?\n(현재 도달한 레벨로 기록을 갱신할 수 있습니다.)")) window.player.hp = 0; 
};

window.returnToMenu = function() { window.location.reload(); };

window.submitScore = function() {
    const nicknameInput = document.getElementById('nickname-input');
    if(!nicknameInput) return;
    const nickname = nicknameInput.value.trim();
    if (!nickname) { alert("닉네임을 입력해주세요!"); return; }

    let bestLevel = parseInt(localStorage.getItem('parry_best_level')) || 0;
    if (window.player.level <= bestLevel) {
        alert(`기존 최고 기록(Lv.${bestLevel})보다 높아야 갱신이 가능합니다!\n더 높은 레벨에 도달해주세요.`);
        return;
    }

    const submitBtn = document.getElementById('btn-submit-score');
    submitBtn.innerHTML = '전송 중...'; submitBtn.disabled = true;

    const now = new Date();
    const dateStr = `${now.getFullYear()}. ${now.getMonth()+1}. ${now.getDate()}. ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdUNFntaS4Uc79QYWnjTPDOwDV82SZlLKvucKeQ9l8l6ybHXQ/formResponse';
    const formData = new FormData();
    formData.append('entry.225873384', nickname);
    formData.append('entry.1187942698', window.player.level);
    formData.append('entry.1748204136', dateStr);

    fetch(formUrl, { method: 'POST', mode: 'no-cors', body: formData })
        .then(() => { 
            submitBtn.innerHTML = '✅ 갱신 완료!'; submitBtn.style.background = '#34495e'; nicknameInput.disabled = true; 
            localStorage.setItem('parry_best_level', window.player.level); 
        })
        .catch(e => { submitBtn.innerHTML = '❌ 전송 실패 (재시도)'; submitBtn.disabled = false; });
};

window.restartGame = function() {
    window.bossLevel = 1; 
    window.player = window.initPlayer(); 
    window.updateWeaponAppearance();
    
    window.projectiles.forEach(p => p.el.remove()); window.projectiles = []; window.blasters.forEach(b => b.el.remove()); window.blasters = [];
    document.querySelectorAll('#game-over-modal').forEach(el => el.classList.add('hidden'));

    window.playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash', 'player-stunned'); 
    
    let stunInd = document.getElementById('stun-indicator'); if(stunInd) stunInd.remove();
    document.querySelectorAll('#btn-giveup').forEach(el => el.style.display = 'block');
    
    window.spawnBosses(); window.updateUI(); 
    window.isPaused = false; requestAnimationFrame(window.update);
};

// =====================================
// 게임 메인 루프 (보스 패턴 & 이동)
// =====================================
window.bossLogic = function() {
    window.bosses.forEach(boss => {
        if (boss.isFrozen) { boss.freezeTimer--; if (boss.freezeTimer <= 0) { boss.isFrozen = false; boss.el.classList.remove('frozen-boss'); } boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px'; boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px'; return; }
        if (boss.dashHitDelay > 0) boss.dashHitDelay--;

        if (boss.state === 'idle') {
            boss.x += boss.vx; if (boss.x < boss.radius + 50 || boss.x > window.GAME_WIDTH - boss.radius - 50) boss.vx *= -1; boss.stateTimer++;
            if (boss.stateTimer > 120) {
                const rand = Math.random(); boss.stateTimer = 0;
                if (window.bossLevel < 2) { if (rand < 0.2) boss.state = 'pattern1'; else if (rand < 0.4) boss.state = 'pattern2'; else if (rand < 0.6) boss.state = 'pattern3'; else if (rand < 0.8) boss.state = 'pattern6'; else boss.state = 'pattern5'; } 
                else if (window.bossLevel < 4) { if (rand < 0.15) boss.state = 'pattern1'; else if (rand < 0.3) boss.state = 'pattern5'; else if (rand < 0.45) boss.state = 'pattern6'; else if (rand < 0.6) boss.state = 'pattern8'; else if (rand < 0.75) boss.state = 'pattern9'; else boss.state = 'pattern3'; } 
                else { if (rand < 0.1) boss.state = 'pattern1'; else if (rand < 0.2) boss.state = 'pattern2'; else if (rand < 0.35) boss.state = 'pattern5'; else if (rand < 0.5) boss.state = 'pattern6'; else if (rand < 0.65) boss.state = 'pattern8'; else if (rand < 0.8) boss.state = 'pattern9'; else boss.state = 'pattern7'; }
            }
        } else {
            boss.stateTimer++; const angleToPlayer = Math.atan2(window.player.y - boss.y, window.player.x - boss.x);
            if (boss.stateTimer === 1 && boss.state !== 'pattern7' && boss.state !== 'pattern8') boss.el.classList.add('eye-glow');

            if (boss.state === 'pattern1') { if(boss.stateTimer === 10) { window.playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 15, true, 100, false, false, boss); } if(boss.stateTimer > 40) window.resetBossState(boss); }
            else if (boss.state === 'pattern2') { if(boss.stateTimer === 1) boss.el.classList.add('boss-telegraph'); if(boss.stateTimer === 100) { window.playSound('swing'); boss.el.classList.remove('eye-glow', 'boss-telegraph'); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 6, 20, true, 180, true, false, boss); } if(boss.stateTimer > 130) window.resetBossState(boss); }
            else if (boss.state === 'pattern3') { if(boss.stateTimer === 20 || boss.stateTimer === 40 || boss.stateTimer === 60) { if(boss.stateTimer === 20) boss.el.classList.remove('eye-glow'); window.playSound('swing'); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 6, 10, true, 100, false, false, boss); setTimeout(() => boss.el.classList.remove('boss-attack-anim'), 100); } if(boss.stateTimer > 100) window.resetBossState(boss); }
            else if (boss.state === 'pattern4') { if(boss.stateTimer === 30) { window.playSound('swing'); boss.el.classList.remove('eye-glow'); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 7, 20, true, 100, false, false, boss); } if(boss.stateTimer > 70) window.resetBossState(boss); }
            else if (boss.state === 'pattern5') { 
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#f1c40f'; boss.el.classList.add('boss-telegraph', 'boss-shake'); let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'dash-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 10px red'; boss.el.appendChild(warning); }
                if (boss.stateTimer === 60) { boss.el.classList.remove('eye-glow', 'boss-telegraph', 'boss-shake'); let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-dashing'); boss.el.style.backgroundColor = '#e67e22'; boss.el.style.transform = 'translate(-50%, -50%) scale(1.1)'; boss.el.style.transition = 'none'; boss.vx = Math.cos(angleToPlayer) * boss.dashSpeed; boss.vy = Math.sin(angleToPlayer) * boss.dashSpeed; }
                if (boss.stateTimer > 60 && boss.stateTimer < 90) {
                    boss.x += boss.vx; boss.y += boss.vy;
                    if (window.getDistance(boss.x, boss.y, window.player.x, window.player.y) < window.player.radius + boss.radius) {
                        if (window.player.isDashing) { } 
                        else if (window.player.isParrying || window.player.autoParryTimer > 0) { 
                            window.createParryEffect(window.player.x, window.player.y); window.spawnDamageText(window.player.x, window.player.y - 40, 'PARRY!', 'crit');
                            window.player.autoParryTimer = 6; window.playSound('parryed'); window.player.isParrying = false; window.playerEl.classList.remove('parrying', 'parry-cd'); window.playerEl.classList.add('parry-deflect'); setTimeout(() => window.playerEl.classList.remove('parry-deflect'), 200);
                            if (window.player.parryHeal) { window.player.hp = Math.min(window.player.maxHp, window.player.hp + 20); window.spawnDamageText(window.player.x, window.player.y, 20, 'heal'); }
                            window.player.parryCooldown = 0; if(window.parryStatusEl) { window.parryStatusEl.innerText = "돌진 저지 성공! (기절)"; window.parryStatusEl.style.color = "#2ecc71"; }
                            boss.hp -= 100; window.gainExp(50); boss.stateTimer = 90; window.bossHitEffect(boss, boss.x, boss.y, 100, true); window.checkBossDeath(boss);
                        } else { window.takeDamage(30); boss.stateTimer = 90; }
                    }
                }
                if (boss.stateTimer >= 90) { boss.el.classList.remove('boss-dashing'); window.resetBossState(boss); }
            }
            else if (boss.state === 'pattern6') { 
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#8e44ad'; boss.el.classList.add('boss-telegraph', 'boss-shake'); let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #8e44ad'; boss.el.appendChild(warning); }
                if (boss.stateTimer === 60) { window.playSound('swing'); boss.el.style.backgroundColor = '#c0392b'; boss.el.classList.remove('boss-telegraph', 'boss-shake'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 10, 0, true, 120, false, true, boss, false, false, 'slash-purple'); }
                if (boss.stateTimer > 100) window.resetBossState(boss);
            }
            else if (boss.state === 'pattern9') { 
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#7f8c8d'; boss.el.classList.add('boss-telegraph'); let warning = document.createElement('div'); warning.innerText = '⛓️'; warning.className = 'chain-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '30px'; warning.style.textShadow = '0 0 15px #7f8c8d'; boss.el.appendChild(warning); }
                if (boss.stateTimer === 50) { window.playSound('swing'); boss.el.style.backgroundColor = '#bdc3c7'; boss.el.classList.remove('boss-telegraph'); let warn = boss.el.querySelector('.chain-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 12, 5, true, 40, false, false, boss, false, false, 'slash-chain'); }
                if (boss.stateTimer > 90) window.resetBossState(boss);
            }
            else if (boss.state === 'pattern8') { 
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#2ecc71'; boss.el.classList.add('boss-telegraph'); let warning = document.createElement('div'); warning.innerText = '❗'; warning.className = 'grab-warning'; warning.style.position = 'absolute'; warning.style.top = '-40px'; warning.style.left = '50%'; warning.style.transform = 'translateX(-50%)'; warning.style.fontSize = '40px'; warning.style.textShadow = '0 0 15px #2ecc71'; boss.el.appendChild(warning); }
                if (boss.stateTimer >= 60 && boss.stateTimer <= 80) { if (boss.stateTimer === 60) { boss.el.classList.remove('boss-telegraph'); let warn = boss.el.querySelector('.grab-warning'); if(warn) warn.remove(); boss.el.classList.add('boss-attack-anim'); } if (boss.stateTimer % 2 === 0) { window.playSound('swing'); window.spawnProjectile(boss.x, boss.y, angleToPlayer, 15, 5, true, 40, false, false, boss, false, false, 'slash-green'); } }
                if (boss.stateTimer > 100) window.resetBossState(boss);
            }
            else if (boss.state === 'pattern7') { 
                if (boss.stateTimer === 1) { boss.el.style.backgroundColor = '#000'; boss.el.style.boxShadow = '0 0 20px #f00'; }
                boss.x += Math.cos(angleToPlayer) * 1.5; boss.y += Math.sin(angleToPlayer) * 1.5; const timings = [30, 70, 100, 150, 180, 230, 260];
                if (timings.includes(boss.stateTimer)) { let orbitAngle = (boss.stateTimer * 0.1) + Math.random(); let bx = window.player.x + Math.cos(orbitAngle) * 250; let by = window.player.y + Math.sin(orbitAngle) * 250; window.createBlaster(bx, by, Math.atan2(window.player.y - by, window.player.x - bx), boss); }
                if (boss.stateTimer > 300) { window.resetBossState(boss); }
            }
        }
        boss.x = Math.max(boss.radius, Math.min(window.GAME_WIDTH - boss.radius, boss.x)); boss.y = Math.max(boss.radius, Math.min(window.GAME_HEIGHT - boss.radius, boss.y)); boss.el.style.left = boss.x + 'px'; boss.el.style.top = boss.y + 'px'; boss.uiEl.style.left = boss.x + 'px'; boss.uiEl.style.top = (boss.y - boss.radius - 15) + 'px';
    });
};

window.resetBossState = function(boss) {
    boss.state = 'idle'; boss.stateTimer = 0; boss.vy = 0; boss.vx = 1.2;
    boss.el.classList.remove('boss-attack-anim', 'boss-telegraph', 'boss-dashing', 'eye-glow', 'boss-shake'); boss.el.style.backgroundColor = ''; boss.el.style.boxShadow = 'none'; boss.el.style.transform = 'translate(-50%, -50%) scale(1)'; boss.el.style.transition = 'none';
    let warn = boss.el.querySelector('.dash-warning'); if(warn) warn.remove(); let warn2 = boss.el.querySelector('.grab-warning'); if(warn2) warn2.remove(); let warn3 = boss.el.querySelector('.chain-warning'); if(warn3) warn3.remove();
};

window.update = function() {
    if (window.isPaused) return;

    if (window.isAttacking) window.doAttack();
    if (window.player.autoParryTimer > 0) window.player.autoParryTimer--;
    if (window.player.dashCooldown > 0) window.player.dashCooldown--;
    if(window.dashStatusEl) {
        if (window.player.dashCooldown <= 0) { window.dashStatusEl.innerText = "[Shift] 대시 준비 완료"; window.dashStatusEl.style.color = "#2ecc71"; } else { window.dashStatusEl.innerText = `대시 쿨타임: ${(window.player.dashCooldown/60).toFixed(1)}초`; window.dashStatusEl.style.color = "#7f8c8d"; }
    }

    if (window.player.isStunned) {
        window.player.stunTimer--; 
        if(window.parryStatusEl) { window.parryStatusEl.innerText = `기절됨! (${Math.ceil(window.player.stunTimer/60)}초)`; window.parryStatusEl.style.color = "red"; }
        let stunInd = document.getElementById('stun-indicator');
        if (!stunInd) { stunInd = document.createElement('div'); stunInd.id = 'stun-indicator'; stunInd.className = 'stun-indicator'; stunInd.innerText = '기절!'; window.playerEl.appendChild(stunInd); window.playerEl.classList.add('player-stunned'); }
        if (window.player.stunTimer <= 0) { window.player.isStunned = false; if (stunInd) stunInd.remove(); window.playerEl.classList.remove('player-stunned'); }
    } else if (window.player.isPulled) {
        window.player.pullTimer--;
        if (window.player.pullTarget && window.player.pullTarget.hp > 0) { let dx = window.player.pullTarget.x - window.player.x; let dy = window.player.pullTarget.y - window.player.y; let dist = Math.hypot(dx, dy); if (dist > 30) { window.player.x += (dx / dist) * 10; window.player.y += (dy / dist) * 10; } }
        if(window.parryStatusEl) { window.parryStatusEl.innerText = "사슬에 끌려가는 중!!"; window.parryStatusEl.style.color = "orange"; }
        if (window.player.pullTimer <= 0) window.player.isPulled = false;
    } else if (window.player.isDashing) {
        window.player.x += window.player.dashDir.x * 15; window.player.y += window.player.dashDir.y * 15; window.player.x = Math.max(window.player.radius, Math.min(window.GAME_WIDTH - window.player.radius, window.player.x)); window.player.y = Math.max(window.player.radius, Math.min(window.GAME_HEIGHT - window.player.radius, window.player.y)); window.player.dashTimer--; if (window.player.dashTimer % 2 === 0) window.createDashShadow();
        if (window.player.dashDamage) { window.bosses.forEach(b => { if (window.getDistance(window.player.x, window.player.y, b.x, b.y) < window.player.radius + b.radius + 30) { if (b.dashHitDelay <= 0) { b.hp -= window.player.damage; window.gainExp(window.player.damage); window.bossHitEffect(b, b.x, b.y, window.player.damage, true); window.checkBossDeath(b); b.dashHitDelay = 30; } } }); }
        if (window.player.dashTimer <= 0) window.player.isDashing = false;
    } else if (!window.player.isParrying) {
        if (window.joystickDelta.x !== 0 || window.joystickDelta.y !== 0) { let nextX = window.player.x + window.joystickDelta.x * window.player.speed; let nextY = window.player.y + window.joystickDelta.y * window.player.speed; window.player.x = Math.max(window.player.radius, Math.min(window.GAME_WIDTH - window.player.radius, nextX)); window.player.y = Math.max(window.player.radius, Math.min(window.GAME_HEIGHT - window.player.radius, nextY)); } 
        else { if (window.keys.w && window.player.y > window.player.radius) window.player.y -= window.player.speed; if (window.keys.s && window.player.y < window.GAME_HEIGHT - window.player.radius) window.player.y += window.player.speed; if (window.keys.a && window.player.x > window.player.radius) window.player.x -= window.player.speed; if (window.keys.d && window.player.x < window.GAME_WIDTH - window.player.radius) window.player.x += window.player.speed; }
    }

    window.playerEl.style.left = window.player.x + 'px'; window.playerEl.style.top = window.player.y + 'px';

    if (window.player.attackQueue > 0 && !window.player.isStunned && !window.player.isPulled) {
        window.player.burstTimer--;
        if (window.player.burstTimer <= 0) {
            window.playSound('swing');
            let target = window.isMobileEnv ? window.getClosestBossTo(window.player.x, window.player.y) : window.getClosestBossTo(window.mousePos.x, window.mousePos.y); let tx = target ? target.x : window.player.x; let ty = target ? target.y : window.player.y - 10; let baseAngle = Math.atan2(ty - window.player.y, tx - window.player.x);
            if(window.playerSwordEl) { window.playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { window.playerSwordEl.style.transform = 'rotate(0deg)'; }, 200); }
            if (window.player.waveChance && Math.random() < 0.3) { window.spawnProjectile(window.player.x, window.player.y, baseAngle - 0.3, 8, window.player.damage, false, 70); window.spawnProjectile(window.player.x, window.player.y, baseAngle, 8, window.player.damage, false, 70); window.spawnProjectile(window.player.x, window.player.y, baseAngle + 0.3, 8, window.player.damage, false, 70); } 
            else { window.spawnProjectile(window.player.x, window.player.y, baseAngle, 8, window.player.damage, false, 70); }
            window.player.attackQueue--; window.player.burstTimer = 8;
        }
    }

    if(window.player.attackCooldown > 0) window.player.attackCooldown--;

    if (window.player.isParrying) {
        window.player.parryTimer--;
        if (window.player.parryTimer <= 0) { window.player.isParrying = false; window.playerEl.classList.remove('parrying'); window.playerEl.classList.add('parry-cd'); window.player.parryCooldown = 300; }
    } else if (!window.player.isStunned && !window.player.isPulled) {
        if (window.player.parryCooldown > 0) {
            window.player.parryCooldown--; let secondsLeft = Math.ceil(window.player.parryCooldown / 60);
            if(window.parryStatusEl) { window.parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; window.parryStatusEl.style.color = "#e74c3c"; }
            if(window.floatingCdEl) { window.floatingCdEl.innerText = `${secondsLeft}초`; }
            if (window.player.parryCooldown <= 0) { 
                if(window.parryStatusEl) { window.parryStatusEl.innerText = "패링 준비 완료"; window.parryStatusEl.style.color = "#3498db"; }
                if(window.floatingCdEl) { window.floatingCdEl.innerText = ""; } 
                window.playerEl.classList.remove('parry-cd'); 
            }
        }
    }

    if (window.player.hasSkill && window.skillStatusEl) {
        if (window.player.skillCooldown > 0) { window.player.skillCooldown--; window.skillStatusEl.innerText = `회전베기: ${Math.ceil(window.player.skillCooldown / 60)}초`; window.skillStatusEl.style.color = "#e74c3c"; } 
        else { window.skillStatusEl.innerText = "회전베기: 준비 완료!"; window.skillStatusEl.style.color = "#f1c40f"; }
    }

    window.bossLogic();

    for (let i = window.projectiles.length - 1; i >= 0; i--) {
        let p = window.projectiles[i]; p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed; p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'; p.el.style.transform = `translate(-50%, -50%) rotate(${p.angle}rad)`; p.timer++;

        if (!p.isBoss &&
