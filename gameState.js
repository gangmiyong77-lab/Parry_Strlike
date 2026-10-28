const container = document.getElementById('game-container');
const playerEl = document.getElementById('player');
const parryStatusEl = document.getElementById('parry-status');
const skillStatusEl = document.getElementById('skill-status');

// Dash Status UI 세팅
let dashStatusEl = document.getElementById('dash-status');
if (!dashStatusEl && parryStatusEl && parryStatusEl.parentNode) {
    dashStatusEl = document.createElement('div');
    dashStatusEl.id = 'dash-status';
    dashStatusEl.style.marginTop = '5px'; dashStatusEl.style.fontWeight = 'bold'; dashStatusEl.style.fontSize = '14px';
    parryStatusEl.parentNode.insertBefore(dashStatusEl, parryStatusEl.nextSibling);
}

const floatingCdEl = document.getElementById('floating-cd') || document.createElement('div');

// 플레이어 검 무기 세팅
let playerSwordEl = document.getElementById('player-sword');
if (!playerSwordEl && playerEl) {
    playerSwordEl = document.createElement('div');
    playerSwordEl.id = 'player-sword';
    playerSwordEl.className = 'sword';
    playerEl.appendChild(playerSwordEl);
}

// 오디오 설정
const audioDead = new Audio('./Dead.mp3'); const audioAttack1 = new Audio('./Attack1.mp3'); const audioAttack2 = new Audio('./Attack2.mp3'); const audioParry = new Audio('./Parry.mp3'); const audioParryed = new Audio('./Parryed.mp3'); const audioSwing = new Audio('./Swing.mp3');
function playSound(type) {
    let sound; if (type === 'hit') sound = Math.random() < 0.5 ? audioAttack1 : audioAttack2; else if (type === 'dead') sound = audioDead; else if (type === 'parry') sound = audioParry; else if (type === 'parryed') sound = audioParryed; else if (type === 'swing') sound = audioSwing;
    if (sound) { sound.volume = 0.1; sound.currentTime = 0; sound.play().catch(e => {}); }
}

// 전역 게임 상태 변수
let GAME_WIDTH = container.clientWidth; 
let GAME_HEIGHT = container.clientHeight;
window.addEventListener('resize', () => { GAME_WIDTH = container.clientWidth; GAME_HEIGHT = container.clientHeight; });

let isPaused = true;
let isMobileEnv = false; 
let bossLevel = 1; 
let bosses = []; 
let projectiles = []; 
let blasters = [];
let isAttacking = false;

let mousePos = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
const keys = { w: false, a: false, s: false, d: false };

let joyActive = false; let joyCenter = { x: 0, y: 0 }; let joystickDelta = { x: 0, y: 0 };
let player; // characterModel.js 에서 초기화됨
