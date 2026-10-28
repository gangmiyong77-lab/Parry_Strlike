// =========================================================
// 전역(Window) 제어 함수 (메인 메뉴 기능 포함)
// =========================================================
window.startGame = function() { 
    player = initPlayer(); // 플레이어 완전 초기화
    bossLevel = 1; // 보스 1단계부터
    document.querySelectorAll('#opening-screen').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#btn-giveup').forEach(el => el.style.display = 'block');
    isPaused = false; 
    spawnBosses(); 
    updateUI(); 
    requestAnimationFrame(update); 
};
window.showTutorial = function() { document.querySelectorAll('#tutorial-modal').forEach(el => el.classList.remove('hidden')); };
window.closeTutorial = function() { document.querySelectorAll('#tutorial-modal').forEach(el => el.classList.add('hidden')); };

window.showLeaderboard = function() { 
    // 구글 시트 URL 뒤에 현재시간(난수)을 붙여 항상 최신 데이터를 강제로 불러옵니다.
    const nocacheUrl = "https://docs.google.com/spreadsheets/d/190rTIf_nsxscNZ3qhOHnHQgTBXnRvxGke9gcQ7CVyuQ/htmlembed?widget=false&headers=false&chrome=false&t=" + new Date().getTime();
    document.querySelectorAll('.leaderboard-iframe').forEach(iframe => iframe.src = nocacheUrl);
    document.querySelectorAll('#leaderboard-modal').forEach(el => el.classList.remove('hidden')); 
};
window.closeLeaderboard = function() { document.querySelectorAll('#leaderboard-modal').forEach(el => el.classList.add('hidden')); };

window.giveUpGame = function() {
    if (isPaused) return;
    if (confirm("게임을 포기하시겠습니까?\n(현재 도달한 레벨로 최고 기록을 갱신할 수 있습니다.)")) player.hp = 0; 
};

window.returnToMenu = function() {
    // 낡은 상태를 버리고 완전히 깔끔하게 메인 메뉴로 돌아가기 위해 페이지 리로드
    window.location.reload();
};

window.submitScore = function() {
    const nicknameInput = document.getElementById('nickname-input');
    if(!nicknameInput) return;
    const nickname = nicknameInput.value.trim();
    if (!nickname) { alert("닉네임을 입력해주세요!"); return; }

    // 기존 최고 기록(로컬 스토리지) 검사
    let bestLevel = parseInt(localStorage.getItem('parry_best_level')) || 0;
    if (player.level <= bestLevel) {
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
    formData.append('entry.1187942698', player.level);
    formData.append('entry.1748204136', dateStr);

    fetch(formUrl, { method: 'POST', mode: 'no-cors', body: formData })
        .then(() => { 
            submitBtn.innerHTML = '✅ 갱신 완료!'; 
            submitBtn.style.background = '#34495e'; 
            nicknameInput.disabled = true; 
            // 갱신에 성공했다면 최고기록을 덮어씁니다.
            localStorage.setItem('parry_best_level', player.level); 
        })
        .catch(e => { submitBtn.innerHTML = '❌ 전송 실패 (재시도)'; submitBtn.disabled = false; });
};

window.restartGame = function() {
    bossLevel = 1; 
    player = initPlayer(); // 플레이어 완벽 초기화 (증강 삭제)
    if(playerSwordEl) playerSwordEl.style.background = '#bdc3c7'; // 기본검 색상 복구
    if(skillStatusEl) skillStatusEl.classList.add('hidden');
    if(document.getElementById('btn-skill')) document.getElementById('btn-skill').classList.add('hidden');
    if(document.getElementById('mob-skill')) document.getElementById('mob-skill').classList.add('hidden');

    projectiles.forEach(p => p.el.remove()); projectiles = []; blasters.forEach(b => b.el.remove()); blasters = [];
    document.querySelectorAll('#game-over-modal').forEach(el => el.classList.add('hidden'));

    playerEl.classList.remove('player-grabbed', 'parrying', 'parry-deflect', 'parry-cd', 'hit-flash', 'player-stunned'); 
    
    let stunInd = document.getElementById('stun-indicator'); if(stunInd) stunInd.remove();
    document.querySelectorAll('#btn-giveup').forEach(el => el.style.display = 'block');
    
    spawnBosses(); updateUI(); renderAugments(); 
    isPaused = false; requestAnimationFrame(update);
};

// ==========================================
// 메인 게임 루프
// ==========================================
function update() {
    if (isPaused) return;

    if (isAttacking) doAttack();
    if (player.autoParryTimer > 0) player.autoParryTimer--;
    if (player.dashCooldown > 0) player.dashCooldown--;
    if(dashStatusEl) {
        if (player.dashCooldown <= 0) { dashStatusEl.innerText = "[Shift] 대시 준비 완료"; dashStatusEl.style.color = "#2ecc71"; } else { dashStatusEl.innerText = `대시 쿨타임: ${(player.dashCooldown/60).toFixed(1)}초`; dashStatusEl.style.color = "#7f8c8d"; }
    }

    if (player.isStunned) {
        player.stunTimer--; 
        if(parryStatusEl) { parryStatusEl.innerText = `기절됨! (${Math.ceil(player.stunTimer/60)}초)`; parryStatusEl.style.color = "red"; }
        let stunInd = document.getElementById('stun-indicator');
        if (!stunInd) { stunInd = document.createElement('div'); stunInd.id = 'stun-indicator'; stunInd.className = 'stun-indicator'; stunInd.innerText = '기절!'; playerEl.appendChild(stunInd); playerEl.classList.add('player-stunned'); }
        if (player.stunTimer <= 0) { player.isStunned = false; if (stunInd) stunInd.remove(); playerEl.classList.remove('player-stunned'); }
    } else if (player.isPulled) {
        player.pullTimer--;
        if (player.pullTarget && player.pullTarget.hp > 0) { let dx = player.pullTarget.x - player.x; let dy = player.pullTarget.y - player.y; let dist = Math.hypot(dx, dy); if (dist > 30) { player.x += (dx / dist) * 10; player.y += (dy / dist) * 10; } }
        if(parryStatusEl) { parryStatusEl.innerText = "사슬에 끌려가는 중!!"; parryStatusEl.style.color = "orange"; }
        if (player.pullTimer <= 0) player.isPulled = false;
    } else if (player.isDashing) {
        player.x += player.dashDir.x * 15; player.y += player.dashDir.y * 15; player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y)); player.dashTimer--; if (player.dashTimer % 2 === 0) createDashShadow();
        if (player.dashDamage) { bosses.forEach(b => { if (getDistance(player.x, player.y, b.x, b.y) < player.radius + b.radius + 30) { if (b.dashHitDelay <= 0) { b.hp -= player.damage; gainExp(player.damage); bossHitEffect(b, b.x, b.y, player.damage, true); checkBossDeath(b); b.dashHitDelay = 30; } } }); }
        if (player.dashTimer <= 0) player.isDashing = false;
    } else if (!player.isParrying) {
        if (joystickDelta.x !== 0 || joystickDelta.y !== 0) { let nextX = player.x + joystickDelta.x * player.speed; let nextY = player.y + joystickDelta.y * player.speed; player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, nextX)); player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, nextY)); } 
        else { if (keys.w && player.y > player.radius) player.y -= player.speed; if (keys.s && player.y < GAME_HEIGHT - player.radius) player.y += player.speed; if (keys.a && player.x > player.radius) player.x -= player.speed; if (keys.d && player.x < GAME_WIDTH - player.radius) player.x += player.speed; }
    }

    playerEl.style.left = player.x + 'px'; playerEl.style.top = player.y + 'px';

    if (player.attackQueue > 0 && !player.isStunned && !player.isPulled) {
        player.burstTimer--;
        if (player.burstTimer <= 0) {
            playSound('swing');
            let target = isMobileEnv ? getClosestBossTo(player.x, player.y) : getClosestBossTo(mousePos.x, mousePos.y); let tx = target ? target.x : player.x; let ty = target ? target.y : player.y - 10; let baseAngle = Math.atan2(ty - player.y, tx - player.x);
            if(playerSwordEl) { playerSwordEl.style.transform = `rotate(${baseAngle}rad)`; setTimeout(() => { playerSwordEl.style.transform = 'rotate(0deg)'; }, 200); }
            if (player.waveChance && Math.random() < 0.3) { spawnProjectile(player.x, player.y, baseAngle - 0.3, 8, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle, 8, player.damage, false, 70); spawnProjectile(player.x, player.y, baseAngle + 0.3, 8, player.damage, false, 70); } 
            else { spawnProjectile(player.x, player.y, baseAngle, 8, player.damage, false, 70); }
            player.attackQueue--; player.burstTimer = 8;
        }
    }

    if(player.attackCooldown > 0) player.attackCooldown--;

    if (player.isParrying) {
        player.parryTimer--;
        if (player.parryTimer <= 0) { player.isParrying = false; playerEl.classList.remove('parrying'); playerEl.classList.add('parry-cd'); player.parryCooldown = 300; }
    } else if (!player.isStunned && !player.isPulled) {
        if (player.parryCooldown > 0) {
            player.parryCooldown--; let secondsLeft = Math.ceil(player.parryCooldown / 60);
            if(parryStatusEl) { parryStatusEl.innerText = `패링 쿨타임: ${secondsLeft}초`; parryStatusEl.style.color = "#e74c3c"; }
            if(floatingCdEl) { floatingCdEl.innerText = `${secondsLeft}초`; }
            if (player.parryCooldown <= 0) { 
                if(parryStatusEl) { parryStatusEl.innerText = "패링 준비 완료"; parryStatusEl.style.color = "#3498db"; }
                if(floatingCdEl) { floatingCdEl.innerText = ""; } 
                playerEl.classList.remove('parry-cd'); 
            }
        }
    }

    if (player.hasSkill && skillStatusEl) {
        if (player.skillCooldown > 0) { player.skillCooldown--; skillStatusEl.innerText = `회전베기: ${Math.ceil(player.skillCooldown / 60)}초`; skillStatusEl.style.color = "#e74c3c"; } 
        else { skillStatusEl.innerText = "회전베기: 준비 완료!"; skillStatusEl.style.color = "#f1c40f"; }
    }

    bossLogic();

    for (let i = blasters.length - 1; i >= 0; i--) {
        let bl = blasters[i]; bl.timer--;
        if (bl.timer === 0) {
            playSound('swing'); bl.telegraph.remove(); spawnProjectile(bl.x, bl.y, bl.angle, 15, 15, true, 100, true, false, bl.owner, true, true);
            bl.el.style.opacity = '0'; bl.el.style.transform = `translate(-50%, -50%) rotate(${bl.angle}rad) translateX(-20px)`;
        } else if (bl.timer === -15) { bl.el.remove(); blasters.splice(i, 1); }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed; p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'; p.el.style.transform = `translate(-50%, -50%) rotate(${p.angle}rad)`; p.timer++;

        if (!p.isBoss && player.weaponType === 'fire' && p.timer % 2 === 0) { spawnFireTrail(p.x, p.y); }
        if (p.x < -100 || p.x > GAME_WIDTH + 100 || p.y < -100 || p.y > GAME_HEIGHT + 100) { p.el.remove(); projectiles.splice(i, 1); continue; }

        if (p.isBoss) {
            if (getDistance(p.x, p.y, player.x, player.y) < player.radius + p.radius) {
                if (player.isDashing) { } 
                else if ((player.isParrying || player.autoParryTimer > 0) && !p.isUnparryable) {
                    let isAutoParry = (player.autoParryTimer > 0 && !player.isParrying);
                    if (!isAutoParry) { if (player.parryHeal) { player.hp = Math.min(player.maxHp, player.hp + 20); spawnDamageText(player.x, player.y, 20, 'heal'); } }

                    createParryEffect(player.x, player.y); spawnDamageText(player.x, player.y - 40, 'PARRY!', 'crit');
                    player.autoParryTimer = 6; playSound('parryed'); player.isParrying = false; 
                    playerEl.classList.remove('parrying', 'parry-cd'); playerEl.classList.add('parry-deflect'); setTimeout(() => playerEl.classList.remove('parry-deflect'), 200);
                    
                    player.parryCooldown = 0; if(floatingCdEl) floatingCdEl.innerText = ""; if(parryStatusEl) parryStatusEl.style.color = "#2ecc71";
                    
                    if (p.el.classList.contains('slash-purple')) {
                        if(parryStatusEl) parryStatusEl.innerText = "스턴 공격 패링 성공!";
                        if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y, 20, true); checkBossDeath(p.owner); } p.el.remove(); projectiles.splice(i, 1); 
                    } else if (p.el.classList.contains('slash-chain')) {
                        if(parryStatusEl) parryStatusEl.innerText = "사슬 튕겨내기 성공!";
                        if(p.owner) { p.owner.hp -= 20; bossHitEffect(p.owner, p.owner.x, p.owner.y, 20, true); checkBossDeath(p.owner); } p.el.remove(); projectiles.splice(i, 1); 
                    } else {
                        if(parryStatusEl) parryStatusEl.innerText = "패링 반사 성공!";
                        p.isBoss = false; p.el.classList.remove('boss-slash', 'heavy-slash', 'laser-slash', 'unparryable-attack', 'slash-green');
                        let target = isMobileEnv ? getClosestBossTo(p.x, p.y) : getClosestBossTo(mousePos.x, mousePos.y); 
                        p.angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle + Math.PI; p.speed *= 1.5; p.damage *= 2;
                    }
                } else {
                    let isChain = p.el.classList.contains('slash-chain');
                    if (p.isGrab) {
                        player.isStunned = true; player.stunTimer = 120; takeDamage(20); 
                        p.el.remove(); projectiles.splice(i, 1);
                    } else if (isChain) {
                        player.isPulled = true; player.pullTimer = 40; player.pullTarget = p.owner; takeDamage(5); p.el.remove(); projectiles.splice(i, 1);
                    } else {
                        takeDamage(p.damage); p.el.remove(); projectiles.splice(i, 1); 
                    }
                }
            }
        } else {
            for(let j = bosses.length - 1; j >= 0; j--) {
                let b = bosses[j];
                if (getDistance(p.x, p.y, b.x, b.y) < b.radius + p.radius) {
                    b.hp -= p.damage; gainExp(p.damage);
                    if (player.lifesteal > 0 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + player.lifesteal);
                    updateUI(); bossHitEffect(b, p.x, p.y, p.damage, false);
                    if (player.weaponType === 'ice') { b.freezeStack++; spawnParticles(p.x, p.y, '#00ffff', 5); if (b.freezeStack >= 4) { b.isFrozen = true; b.freezeTimer = 180; b.freezeStack = 0; b.el.classList.add('frozen-boss'); spawnDamageText(b.x, b.y, 'FREEZE!', 'crit'); } } else if (player.weaponType === 'fire') { spawnParticles(p.x, p.y, '#e67e22', 15); b.hp -= 5; spawnDamageText(b.x, b.y + 20, 5, 'fire'); }
                    p.el.remove(); projectiles.splice(i, 1); checkBossDeath(b); break;
                }
            }
        }
    }

    if (player.hp <= 0) {
        playSound('dead'); 
        const finalScore = document.getElementById('final-score');
        if(finalScore) finalScore.innerText = `현재 도달: Boss Wave ${bossLevel} / 플레이어 Lv. ${player.level}`;
        
        document.querySelectorAll('#game-over-modal').forEach(el => el.classList.remove('hidden')); 
        isPaused = true; 
        document.querySelectorAll('#btn-giveup').forEach(el => el.style.display = 'none'); 
        
        // 갱신 버튼 상태 초기화
        const submitBtn = document.getElementById('btn-submit-score');
        if (submitBtn) { submitBtn.innerHTML = '기록 갱신하기'; submitBtn.disabled = false; submitBtn.style.background = '#27ae60'; }
        const nickInput = document.getElementById('nickname-input');
        if (nickInput) { nickInput.disabled = false; }
        return;
    }
    
    requestAnimationFrame(update);
}
