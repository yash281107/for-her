document.addEventListener('DOMContentLoaded', () => {
    // --- 1. EMOJI RAIN ENGINE ---
    const canvas = document.getElementById('emoji-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const emojiSet = ['✨', '💖', '🦴', '🧬', '💧', '🌸'];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    class Particle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
            this.size = Math.random() * 20 + 15;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -12 - 4;
            this.gravity = 0.5; this.opacity = 1;
        }
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX; this.y += this.speedY;
            this.opacity -= 0.015;
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px serif`;
            ctx.fillText(this.emoji, this.x, this.y);
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.update(); p.draw();
            if (p.opacity <= 0) particles.splice(i, 1);
        });
        requestAnimationFrame(animate);
    }
    animate();

    // Burst emojis on every click
    window.addEventListener('mousedown', (e) => {
        for (let i = 0; i < 10; i++) particles.push(new Particle(e.clientX, e.clientY));
    });

    // --- 2. VAULT & HYDRATION LOGIC ---
    const dateInput = document.getElementById('dashboard-date');
    const today = new Date().toLocaleDateString('en-CA'); 
    dateInput.value = today;

    const loadDay = (date) => {
        const raw = localStorage.getItem(`app_vault_${date}`);
        document.querySelectorAll('input, textarea').forEach(el => {
            if (el.type === 'checkbox') el.checked = false;
            else if (el.id !== 'dashboard-date') el.value = '';
        });
        if (raw) {
            const data = JSON.parse(raw);
            Object.keys(data).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.type === 'checkbox' ? el.checked = data[key] : el.value = data[key];
            });
            updateWaterUI(data['water_val'] || 0);
            updateMoodUI(data['mood_val']);
        } else {
            updateWaterUI(0);
            updateMoodUI(null);
        }
    };

    const saveDay = () => {
        const data = {};
        document.querySelectorAll('input, textarea').forEach(el => {
            if (el.id === 'dashboard-date') return;
            data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        localStorage.setItem(`app_vault_${dateInput.value}`, JSON.stringify(data));
        const s = document.getElementById('save-indicator');
        s.style.opacity = '1'; setTimeout(() => s.style.opacity = '0', 1000);
    };

    dateInput.addEventListener('change', (e) => loadDay(e.target.value));
    document.addEventListener('input', (e) => { if(e.target.id) saveDay(); });

    const updateWaterUI = (count) => {
        document.querySelectorAll('.drop').forEach((d, i) => d.classList.toggle('active', i < count));
    };

    const updateMoodUI = (val) => {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.val == val));
    };

    document.querySelectorAll('.drop').forEach((drop, index) => {
        drop.onclick = (e) => {
            e.stopPropagation();
            const val = index + 1;
            document.getElementById('water_val').value = val;
            updateWaterUI(val);
            saveDay();
        };
    });

    window.selectMood = (val) => {
        document.getElementById('mood_val').value = val;
        updateMoodUI(val);
        saveDay();
    };

    loadDay(today);
});