const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const music = document.getElementById("bgMusic");

let objects = [];
let score = 0;

const img = new Image();
img.src = "assets/luciernaga.png";

const SIZE = 30;
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;

// Control del juego
let timer = 30;
let gameRunning = false;
let interval;

// Mejor puntuación
let bestScore = localStorage.getItem("bestScore") || 0;
document.getElementById("bestScore").innerText = bestScore;

// Crear objeto sin superposición
function createObject() {
    let obj;
    let valid = false;

    while (!valid) {
        obj = {
            x: Math.random() * (canvas.width - SIZE),
            y: Math.random() * (canvas.height - SIZE),
            dx: (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED) * (Math.random() < 0.5 ? -1 : 1),
            dy: (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED) * (Math.random() < 0.5 ? -1 : 1),
            size: SIZE,
            type: Math.floor(Math.random() * 4)
        };

        valid = true;

        for (let o of objects) {
            let dx = o.x - obj.x;
            let dy = o.y - obj.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < SIZE) {
                valid = false;
                break;
            }
        }
    }

    return obj;
}

// Inicializar objetos
for (let i = 0; i < 25; i++) {
    objects.push(createObject());
}

// Movimiento
function update() {
    objects.forEach(obj => {

        if (obj.type === 0) obj.y += obj.dy;
        if (obj.type === 1) obj.x += obj.dx;

        if (obj.type === 2) {
            obj.x += obj.dx;
            obj.y += obj.dy;
        }

        if (obj.type === 3) {
            obj.x += Math.cos(Date.now() / 400) * obj.dx;
            obj.y += Math.sin(Date.now() / 400) * obj.dy;
        }

        // Rebote en bordes
        if (obj.x <= 0) {
            obj.x = 0;
            obj.dx = Math.abs(obj.dx);
        }

        if (obj.x >= canvas.width - obj.size) {
            obj.x = canvas.width - obj.size;
            obj.dx = -Math.abs(obj.dx);
        }

        if (obj.y <= 0) {
            obj.y = 0;
            obj.dy = Math.abs(obj.dy);
        }

        if (obj.y >= canvas.height - obj.size) {
            obj.y = canvas.height - obj.size;
            obj.dy = -Math.abs(obj.dy);
        }
    });

    resolveCollisions();
}

// Colisiones
function resolveCollisions() {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {

            let a = objects[i];
            let b = objects[j];

            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < SIZE && dist > 0) {

                let overlap = SIZE - dist;
                let nx = dx / dist;
                let ny = dy / dist;

                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;
                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;

                let tempDx = a.dx;
                let tempDy = a.dy;

                a.dx = b.dx;
                a.dy = b.dy;

                b.dx = tempDx;
                b.dy = tempDy;
            }
        }
    }
}

// Dibujar
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {

        let glow = 15 + Math.sin(Date.now() / 200 + obj.x) * 12;

        let gradient = ctx.createRadialGradient(
            obj.x + obj.size / 2,
            obj.y + obj.size / 2,
            2,
            obj.x + obj.size / 2,
            obj.y + obj.size / 2,
            25
        );

        gradient.addColorStop(0, "rgba(0,255,150,0.8)");
        gradient.addColorStop(1, "rgba(0,255,150,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(obj.x + obj.size / 2, obj.y + obj.size / 2, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0,255,150,1)";
        ctx.shadowBlur = glow;

        ctx.drawImage(img, obj.x, obj.y, obj.size, obj.size);

        ctx.restore();
    });
}

// Loop principal
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

img.onload = () => {
    gameLoop();
};

// Click en luciérnagas
canvas.addEventListener("click", function(e) {

    if (!gameRunning) return;

    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];

        if (
            mx > obj.x &&
            mx < obj.x + obj.size &&
            my > obj.y &&
            my < obj.y + obj.size
        ) {
            objects.splice(i, 1);
            objects.push(createObject());

            score++;
            document.getElementById("score").innerText = score;
            break;
        }
    }
});

// Botón iniciar
document.getElementById("startBtn").addEventListener("click", () => {

    if (gameRunning) return;

    music.play().catch(() => {});

    score = 0;
    timer = 30;
    gameRunning = true;

    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timer;

    document.getElementById("startBtn").disabled = true;

    clearInterval(interval);

    interval = setInterval(() => {
        timer--;
        document.getElementById("timer").innerText = timer;

        if (timer <= 0) {
            endGame();
        }
    }, 1000);
});

// Finalizar juego
function endGame() {
    gameRunning = false;
    clearInterval(interval);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        document.getElementById("bestScore").innerText = bestScore;
    }

    document.getElementById("startBtn").disabled = false;

    alert("Tiempo terminado. Puntuación: " + score);
}