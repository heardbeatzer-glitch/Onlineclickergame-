// --- 1. GAME DATA (De 50+ Items) ---
const characters = [
    { name: "Frikandel", price: 100, icon: "🌭" },
    { name: "Sok", price: 500, icon: "🧦" },
    { name: "Pak Melk", price: 1000, icon: "🥛" },
    { name: "Kroon", price: 5000, icon: "👑" },
    { name: "Kawaii Kat", price: 8000, icon: "🐱" },
    { name: "Kawaii Boba", price: 10000, icon: "🧋" },
    { name: "Kawaii Eenhoorn", price: 15000, icon: "🦄" },
    { name: "Iron Man", price: 100000, icon: "🚀" },
    { name: "Spider-Man", price: 250000, icon: "🕷️" },
    { name: "The Hulk", price: 500000, icon: "💪" },
    // Voeg hier zelf de rest van de 50 namen toe op dezelfde manier!
];

// --- 2. GAME STATE ---
let balance = parseFloat(localStorage.getItem('balance')) || 0;
let clickPower = parseInt(localStorage.getItem('clickPower')) || 1;
let autoRate = parseInt(localStorage.getItem('autoRate')) || 0;
let username = localStorage.getItem('username') || "";
let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || [];

let upgClickCost = 10;
let upgAutoCost = 50;

// --- 3. CORE LOGIC ---
window.onload = () => {
    if (!username) {
        document.getElementById('login-overlay').classList.remove('hidden');
    } else {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('display-username').innerText = username;
        startGamerLoop();
    }
    renderShop();
    updateUI();
};

function login() {
    let input = document.getElementById('username-input').value;
    if (input.length > 2) {
        username = input;
        localStorage.setItem('username', username);
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('display-username').innerText = username;
        startGamerLoop();
    }
}

const coin = document.getElementById('coin');
coin.addEventListener('mousedown', (e) => {
    balance += clickPower;
    spawnText(e.clientX, e.clientY, `+€${clickPower}`);
    updateUI();
});

// Upgrades
document.getElementById('upg-click').onclick = () => {
    if (balance >= upgClickCost) {
        balance -= upgClickCost;
        clickPower++;
        upgClickCost = Math.floor(upgClickCost * 1.5);
        updateUI();
    }
};

document.getElementById('upg-auto').onclick = () => {
    if (balance >= upgAutoCost) {
        balance -= upgAutoCost;
        autoRate += 2;
        upgAutoCost = Math.floor(upgAutoCost * 1.5);
        updateUI();
    }
};

function startGamerLoop() {
    setInterval(() => {
        balance += autoRate;
        updateUI();
        saveGame();
    }, 1000);
}

// --- 4. SOCIAL SYSTEM (Geld Sturen) ---
function openGiftMenu() {
    let amount = prompt("Hoeveel geld wil je in een code stoppen?");
    amount = parseInt(amount);
    if (amount > 0 && balance >= amount) {
        balance -= amount;
        let code = btoa(username + "|" + amount + "|" + Date.now()).substring(0, 8);
        localStorage.setItem('gift_' + code, amount);
        
        document.getElementById('gift-modal').classList.remove('hidden');
        document.getElementById('gift-title').innerText = "Code Gegenereerd!";
        document.getElementById('gift-content').innerHTML = `
            <p>Stuur deze code naar je vriend:</p>
            <h2 style="background:#eee; padding:10px;">${code}</h2>
        `;
        updateUI();
    }
}

function claimGiftMenu() {
    let code = prompt("Voer de geheime code van je vriend in:");
    let giftValue = localStorage.getItem('gift_' + code);
    if (giftValue) {
        balance += parseInt(giftValue);
        localStorage.removeItem('gift_' + code);
        alert("Je hebt €" + giftValue + " ontvangen!");
        updateUI();
    } else {
        alert("Ongeldige of al gebruikte code!");
    }
}

// --- 5. SHOP & UI ---
function renderShop() {
    const list = document.getElementById('character-list');
    characters.forEach(char => {
        let div = document.createElement('div');
        div.className = 'shop-item';
        div.id = 'char-' + char.name;
        div.innerHTML = `<span>${char.icon} ${char.name}</span> <span>€${char.price}</span>`;
        div.onclick = () => buyChar(char);
        list.appendChild(div);
    });
}

function buyChar(char) {
    if (balance >= char.price && !ownedSkins.includes(char.name)) {
        balance -= char.price;
        ownedSkins.push(char.name);
        alert(char.name + " gekocht!");
        updateUI();
    }
}

function updateUI() {
    document.getElementById('balance').innerText = `€${Math.floor(balance).toLocaleString()}`;
    document.getElementById('cps').innerText = `Inkomen: €${autoRate} /sec`;
    document.getElementById('click-cost').innerText = `€${upgClickCost}`;
    document.getElementById('auto-cost').innerText = `€${upgAutoCost}`;
    
    // Check betaalbaarheid
    document.getElementById('upg-click').className = balance >= upgClickCost ? "upgrade-card available" : "upgrade-card";
    document.getElementById('upg-auto').className = balance >= upgAutoCost ? "upgrade-card available" : "upgrade-card";
}

function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('autoRate', autoRate);
    localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
}

function spawnText(x, y, txt) {
    const div = document.createElement('div');
    div.className = 'float-text';
    div.innerText = txt;
    div.style.left = x + 'px'; div.style.top = y + 'px';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 800);
}

function closeModals() { document.querySelectorAll('.overlay').forEach(o => { if(o.id !== 'login-overlay') o.classList.add('hidden') }); }
