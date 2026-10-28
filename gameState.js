// 전역 변수 (모든 파일에서 참조 가능하도록 window 객체 사용)
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

window.isPaused = true;
window.isMobileEnv = false; 
window.bossLevel = 1; 
window.bosses = []; 
window.projectiles = []; 
window.blasters = [];
window.isAttacking = false;

window.mousePos = { x: window.GAME_WIDTH / 2, y: window.GAME_HEIGHT / 2 };
window.keys = { w: false, a: false, s: false, d: false };

window.joyActive = false; window.joyCenter = { x: 0, y: 0 }; window.joystickDelta = { x: 0, y: 0 };
window.player = null; // characterModel.js 에서 채워집니다.
