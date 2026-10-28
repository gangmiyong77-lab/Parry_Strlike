let oldStyle = document.getElementById('game-dynamic-style');
if (oldStyle) oldStyle.remove();
document.querySelectorAll('#opening-screen, #btn-giveup, #leaderboard-modal, #tutorial-modal').forEach(el => el.remove());

const style = document.createElement('style');
style.id = 'game-dynamic-style';
style.innerHTML = `
    @media (min-width: 769px) { #mobile-controls { display: none !important; } }
    #mobile-controls { position: absolute; bottom: 30px; left: 0; width: 100%; display: flex; justify-content: space-between; padding: 0 30px; box-sizing: border-box; z-index: 100; pointer-events: none; touch-action: none; }
    #joystick-area { width: 130px; height: 130px; border-radius: 50%; background: rgba(0,0,0,0.4); position: relative; pointer-events: auto; }
    #joystick-knob { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.8); position: absolute; top: 40px; left: 40px; }
    #action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; pointer-events: auto; }
    .mob-btn { width: 60px; height: 60px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.5); color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; user-select: none; }
    .mob-btn:active { background: rgba(255,255,255,0.5); }
    
    #player { background: #3498db; border: 2px solid #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; z-index: 20; position: relative; transition: filter 0.2s; }
    #player-sword { position: absolute; width: 45px; height: 10px; background: #bdc3c7; left: 25px; top: 20px; border-radius: 5px; transform-origin: left center; transition: all 0.3s; z-index: -1; }
    .attack-anim #player-sword { animation: playerSwing 0.2s ease-out; }
    @keyframes playerSwing { 0% { transform: rotate(0deg); } 50% { transform: rotate(140deg); } 100% { transform: rotate(0deg); } }

    .ig-eyes { position: absolute; top: 12px; width: 100%; display: flex; justify-content: center; gap: 6px; z-index: 5; pointer-events: none; }
    .ig-eye { width: 12px; height: 12px; background: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 3px rgba(0,0,0,0.5); }
    .ig-pupil { width: 6px; height: 6px; background: black; border-radius: 50%; transition: 0.2s; }
    .eye-glow .ig-pupil { background: red; box-shadow: 0 0 10px red; transform: scale(1.2); }

    .ig-boss-weapon { position: absolute; top: 20px; left: -30px; width: 50px; height: 12px; background: #7f8c8d; border-radius: 4px; transform-origin: right center; animation: igBossWeaponIdle 2s infinite alternate; z-index: -1; }
    .boss-attack-anim .ig-boss-weapon { animation: igBossSwing 0.2s ease-out; }
    @keyframes igBossWeaponIdle { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }
    @keyframes igBossSwing { 0% { transform: rotate(0deg); } 50% { transform: rotate(-130deg); } 100% { transform: rotate(0deg); } }

    .player-stunned { background: #9b59b6 !important; box-shadow: 0 0 20px #8e44ad, inset 0 0 15px #000 !important; animation: stunShake 0.1s infinite; filter: grayscale(0.3); }
    @keyframes stunShake { 0%, 100% { transform: translate(2px, 1px) } 25% { transform: translate(-2px, -1px) } 50% { transform: translate(1px, 2px) } 75% { transform: translate(-1px, -2px) } }
    .stun-indicator { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); color: #f1c40f; font-weight: bold; font-size: 18px; text-shadow: 0 0 10px red; white-space: nowrap; animation: blink 0.3s infinite; z-index: 50; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    .dash-shadow { position: absolute; width: 50px; height: 50px; background-color: rgba(52, 152, 219, 0.2); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 5; animation: shadowFade 0.3s ease-out forwards; }
    @keyframes shadowFade { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } }

    #opening-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 25, 30, 0.95); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .title-text { font-size: 48px; font-weight: bold; text-shadow: 0 0 20px #3498db; margin-bottom: 10px; text-align: center; }
    
    .menu-btn { padding: 15px 40px; font-size: 20px; font-weight: bold; background: transparent; color: white; border: 2px solid #3498db; border-radius: 10px; cursor: pointer; transition: 0.2s; margin-top: 10px; width: 280px; }
    .menu-btn:hover { background: #3498db; box-shadow: 0 0 20px #3498db; transform: scale(1.05); }

    #leaderboard-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 95%; max-width: 700px; height: 80vh; background: #1a1a2e; border: 4px solid #f1c40f; border-radius: 15px; padding: 0; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(241, 196, 15, 0.5); z-index: 500; }
    .lb-header { background: #2c3e50; padding: 15px; border-bottom: 3px solid #f1c40f; border-radius: 10px 10px 0 0; text-align: center; }
    .lb-header h2 { color: #f1c40f; margin: 0; text-shadow: 0 0 10px #f1c40f; font-size: 24px; }
    .lb-content { flex: 1; background: white; padding: 5px; }
    .lb-close-btn { padding: 15px; background: #e74c3c; color: white; border: none; font-weight: bold; font-size: 16px; cursor: pointer; border-radius: 0 0 10px 10px; transition: 0.2s; }
    .lb-close-btn:hover { background: #c0392b; }
    .leaderboard-iframe { width: 100%; height: 100%; border: none; border-radius: 10px; background: white; }

    #tutorial-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 500px; background: rgba(10, 15, 20, 0.98); border: 2px solid #f1c40f; border-radius: 15px; padding: 25px; color: white; z-index: 400; box-shadow: 0 0 30px #f1c40f; overflow-y: auto; max-height: 80%; }
    
    #augment-history { position: absolute; top: 10px; right: 10px; display: flex; gap: 12px; z-index: 50; flex-wrap: wrap-reverse; justify-content: flex-end; max-width: 300px; }
    .history-icon { position: relative; width: 40px; height: 40px; background: rgba(0,0,0,0.8); border: 1px solid #aaa; border-radius: 5px; display: flex; justify-content: center; align-items: center; font-size: 20px; box-shadow: 0 0 5px black; cursor: pointer; transition: 0.2s; pointer-events: auto; }
    .history-icon:hover { border-color: #f1c40f; box-shadow: 0 0 10px #f1c40f; z-index: 60; }
    .custom-tooltip { visibility: hidden; background-color: rgba(10, 15, 20, 0.95); color: #fff; text-align: right; border: 2px solid #f1c40f; border-radius: 8px; padding: 12px; position: absolute; z-index: 1000; top: 120%; right: 0; white-space: nowrap; font-size: 14px; opacity: 0; transition: opacity 0.1s; box-shadow: 0 0 15px #f1c40f; line-height: 1.5; pointer-events: none;}
    .history-icon:hover .custom-tooltip { visibility: visible; opacity: 1; }
    .stack-badge { position: absolute; bottom: -6px; right: -6px; background: #e74c3c; color: white; font-size: 12px; font-weight: bold; border-radius: 50%; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; border: 2px solid #fff; box-shadow: 0 0 5px black; z-index: 55; }

    .slash { position: absolute; pointer-events: none; z-index: 15; display: flex; justify-content: center; align-items: center; clip-path: polygon(0% 0%, 100% 50%, 0% 100%, 30% 50%); }
    .slash-elemental { background: transparent !important; clip-path: none !important; filter: drop-shadow(0 0 10px currentColor); }
    .slash-purple { background: #8e44ad !important; filter: drop-shadow(0 0 10px #8e44ad) !important; }
    .slash-green { background: #2ecc71 !important; clip-path: none !important; border-radius: 10px !important; filter: drop-shadow(0 0 8px #2ecc71) !important; }
    .slash-chain { background: #95a5a6 !important; width: 50px !important; height: 6px !important; clip-path: none !important; border-radius: 0 !important; filter: drop-shadow(0 0 5px #7f8c8d) !important; }
    .slash-lightning { filter: drop-shadow(0 0 10px #00ffff) !important; }
    .slash-dark { filter: drop-shadow(0 0 15px #8e44ad) !important; }

    #btn-giveup { position: absolute; bottom: 20px; right: 20px; z-index: 900; background: #c0392b; color: white; border: 2px solid #fff; padding: 10px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 0 15px rgba(0,0,0,0.8); transition: transform 0.2s; display: none; }
    #btn-giveup:hover { transform: scale(1.1); }
    @media (max-width: 768px) { #btn-giveup { bottom: 130px !important; right: 15px !important; opacity: 0.8; } }
`;
if(window.container) window.container.appendChild(style); // head 대신 container 내부에 삽입(안전성)

if(window.container) {
    window.container.insertAdjacentHTML('beforeend', `
        <div id="opening-screen">
            <div class="title-text">PARRY STRIKE<br><span style="font-size:24px; color:#e74c3c;">Boss Rush</span></div>
            <button id="btn-start-game" class="menu-btn" onclick="window.startGame()">▶ 게임 시작</button>
            <button id="btn-show-lb-main" class="menu-btn" style="border-color: #9b59b6; color: #9b59b6;" onclick="window.showLeaderboard()">🏆 랭킹 리더보드 확인</button>
            <button class="menu-btn" style="border-color: #f1c40f; color: #f1c40f; margin-top: 10px;" onclick="window.showTutorial()">📖 패턴 요약 보기</button>
        </div>
        <button id="btn-giveup" onclick="window.giveUpGame()">🏳️ 포기</button>

        <div id="leaderboard-modal" class="modal hidden">
            <div class="lb-header"><h2>🏆 명예의 전당 (Leaderboard) 🏆</h2></div>
            <div class="lb-content">
                <iframe class="leaderboard-iframe" src=""></iframe>
            </div>
            <button class="lb-close-btn" onclick="window.closeLeaderboard()">❌ 닫기</button>
        </div>

        <div id="tutorial-modal" class="modal hidden" style="padding:25px;">
            <h3 style="color:#f1c40f; text-align:center; border-bottom:1px solid #555; padding-bottom:10px;">📖 패턴 요약</h3>
            <p style="font-size:14px; line-height:1.6; text-align:left;">
                🟨 <b>[노란색] 돌진:</b> 패링 시 기절<br>
                🟪 <b>[보라색] 검기:</b> 패링 실패 시 2초 기절<br>
                ⛓️ <b>[회색] 체인:</b> 끌어오기 방어<br>
                🟩 <b>[초록색] 레이저:</b> 연쇄 자동 반사<br>
                🟥 <b>[빨간색 ❌]:</b> 패링 절대 불가! 대시(Shift) 회피!
            </p>
            <button style="width:100%; padding:10px; background:#3498db; color:#fff; border:none; border-radius:5px;" onclick="window.closeTutorial()">확인 완료</button>
        </div>
    `);
}

const gameOverModal = document.getElementById('game-over-modal');
if (gameOverModal) {
    gameOverModal.innerHTML = `
        <h2 style="color: #e74c3c; font-size: 32px; margin-top: 0; text-shadow: 2px 2px 5px black;">게임 종료</h2>
        <p id="final-score" style="font-size: 18px; margin-bottom: 15px;"></p>
        <div style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #f1c40f;">
            <h3 style="margin-top: 0; color: #f1c40f; font-size: 16px;">🏆 최고기록 갱신</h3>
            <input type="text" id="nickname-input" placeholder="닉네임을 입력하세요" style="width: 85%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: none; font-size: 14px; text-align: center;">
            <button class="restart-btn" id="btn-submit-score" style="background: #27ae60; padding: 12px; margin: 0;" onclick="window.submitScore()">기록 갱신하기</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button class="restart-btn" style="background: #8e44ad; padding: 12px; margin: 0; flex: 1;" onclick="window.showLeaderboard()">📊 리더보드</button>
            <button class="restart-btn" style="background: #34495e; padding: 12px; margin: 0; flex: 1;" onclick="window.returnToMenu()">🏠 메인 메뉴</button>
        </div>
        <button class="restart-btn" style="padding: 12px; margin: 0;" onclick="window.restartGame()">다시 시작하기</button>
    `;
}
