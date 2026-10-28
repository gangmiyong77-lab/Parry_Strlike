// 전역 변수 설정 (모든 파일에서 참조 가능)
window.container = document.getElementById('game-container');
window.playerEl = document.getElementById('player');
window.parryStatusEl = document.getElementById('parry-status');
window.skillStatusEl = document.getElementById('skill-status');

window.dashStatusEl = document.getElementById('dash-status');
if (!window.dashStatusEl && window.parryStatusEl && window.parryStatusEl.parentNode) {
    window.dashStatusEl = document.createElement('div');
    window.dashStatusEl.id = 'dash-status';
    window.dashStatusEl.style.marginTop = '5px'; window.dashStatusEl.style.fontWeight = 'bold'; window.dashStatusEl.style.fontSize = '14px';
    window.parryStatusEl.parentNode.insertBefore(window.dashStatusEl, window.parryStatusEl.nextSibling);
}

window.floatingCdEl = document.getElementById('floating-cd') || document.createElement('div');

window.playerSwordEl = document.getElementById('player-sword');
if (!window.playerSwordEl && window.playerEl) {
    window.playerSwordEl = document.createElement('div');
    window.playerSwordEl.id = 'player-sword';
    window.playerSwordEl.className = 'sword';
    window.playerEl.appendChild(window.playerSwordEl);
}

// 오디오 설정
window.audioDead = new Audio('./Dead.mp3'); window.audioAttack1 = new Audio('./Attack1.mp3'); window.audioAttack2 = new Audio('./Attack2.mp3'); window.audioParry = new Audio('./Parry.mp3'); window.audioParryed = new Audio('./Parryed.mp3'); window.audioSwing = new Audio('./Swing.mp3');
window.playSound = function(type) {
    let sound; if (type === 'hit') sound = Math.random() < 0.5 ? window.audioAttack1 : window.audioAttack2; else if (type === 'dead') sound = window.audioDead; else if (type === 'parry') sound = window.audioParry; else if (type === 'parryed') sound = window.audioParryed; else if (type === 'swing') sound = window.audioSwing;
    if (sound) { sound.volume = 0.1; sound.currentTime = 0; sound.play().catch(e => {}); }
};

window.GAME_WIDTH = window.container ? window.container.clientWidth : window.innerWidth; 
window.GAME_HEIGHT = window.container ? window.container.clientHeight : window.innerHeight;
window.addEventListener('resize', () => { 
    if(window.container) { window.GAME_WIDTH = window.container.clientWidth; window.GAME_HEIGHT = window.container.clientHeight; }
});

// 상점 및 재화 시스템 메타 데이터 (로컬 스토리지 연동)
window.totalGold = parseInt(localStorage.getItem('parry_gold')) || 0;
window.unlockedItems = JSON.parse(localStorage.getItem('parry_unlocks')) || [];
window.equippedWeapon = localStorage.getItem('parry_equipped_weapon') || 'normal';

window.saveMeta = function() {
    localStorage.setItem('parry_gold', window.totalGold);
    localStorage.setItem('parry_unlocks', JSON.stringify(window.unlockedItems));
    localStorage.setItem('parry_equipped_weapon', window.equippedWeapon);
    window.updateGoldUI();
};

window.isPaused = true; window.isMobileEnv = false; 
window.bossLevel = 1; window.bosses = []; window.projectiles = []; window.blasters = [];
window.isAttacking = false;
window.mousePos = { x: window.GAME_WIDTH / 2, y: window.GAME_HEIGHT / 2 };
window.keys = { w: false, a: false, s: false, d: false };
window.joyActive = false; window.joyCenter = { x: 0, y: 0 }; window.joystickDelta = { x: 0, y: 0 };
window.player = null;
