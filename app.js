const WS_URL = 'wss://echo-ws-service.herokuapp.com';

const chat = document.getElementById('chat');
const input = document.getElementById('input');
const btnSend = document.getElementById('send');
const btnGeo = document.getElementById('geo');

let ws;
let ignoreNext = false;

function addMsg(text, cls = '') {
    const el = document.createElement('div');
    el.className = `msg ${cls}`.trim();
el.innerHTML = text;
chat.appendChild(el);
chat.scrollTop = chat.scrollHeight;
}


function connect() {
    ws = new WebSocket(WS_URL);
    ws.addEventListener('open', () => addMsg('Соединение установлено', 'system'));
    ws.addEventListener('close', () => addMsg('Соединение закрыто', 'system'));
    ws.addEventListener('error', () => addMsg('Ошибка WebSocket', 'system'));
    ws.addEventListener('message', (e) => {
    if (ignoreNext) { ignoreNext = false; return; }
        addMsg(escapeHtml(e.data), 'server');
    });
}
connect();


function sendText() {
    const text = input.value.trim();
    if (!text || ws.readyState !== 1) return;
        ws.send(text);
        addMsg(escapeHtml(text), 'me');
        input.value = '';
        input.focus();
}


btnSend.addEventListener('click', sendText);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendText(); });


btnGeo.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
        addMsg('Геолокация не поддерживается', 'system');
    return;
}
navigator.geolocation.getCurrentPosition(({ coords }) => {
    const { latitude: lat, longitude: lon } = coords;
    const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
addMsg(`<a href="${link}" target="_blank" rel="noopener">Гео‑локация</a>`, 'me');
if (ws.readyState === 1) { ignoreNext = true; ws.send(link); }
}, (err) => {
    addMsg('Не удалось получить координаты: ' + (err?.message || 'ошибка'), 'system');
}, { enableHighAccuracy: true, timeout: 10000 });
});


function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}
