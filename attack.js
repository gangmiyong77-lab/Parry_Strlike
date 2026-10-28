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
    let html = `<div style="text-align:center; font-weight:bold; font-size:2
