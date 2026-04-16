const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let objects = [];
let score = 0;

const img = new Image();
img.src = "assets/luciernaga.png";

const MIN_SPEED = 0.5;
const MAX_SPEED = 2.2;
const SIZE = 30;

// Crear objeto SIN encimarse
function createObject() {
    let newObj;
    let valid = false;

    while (!valid) {
        newObj = {
            x: Math.random() * (canvas.width - SIZE),
            y: Math.random() * (canvas.height - SIZE),
            dx: (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED) * (Math.random() < 0.5 ? -1 : 1),
            dy: (Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED) * (Math.random() < 0.5 ? -1 : 1),
            size: SIZE,
            type: Math.floor(Math.random() * 4)
        };

        valid = true;

        for (let obj of objects) {
            let dx = obj.x - newObj.x;
            let dy = obj.y - newObj.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < SIZE) {
                valid = false;
                break;
            }
        }
    }

    return newObj;
}

// Inicializar 25 sin encimarse
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

        // Rebote bordes
        if (obj.x < 0 || obj.x > canvas.width - obj.size) obj.dx *= -1;
        if (obj.y < 0 || obj.y > canvas.height - obj.size) obj.dy *= -1;
    });

    resolveCollisions();
}

// Colisiones REALISTAS (ya no se traban)
function resolveCollisions() {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {

            let obj1 = objects[i];
            let obj2 = objects[j];

            let dx = obj2.x - obj1.x;
            let dy = obj2.y - obj1.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < SIZE && dist > 0) {

                // Separarlos para evitar que se peguen
                let overlap = SIZE - dist;
                let nx = dx / dist;
                let ny = dy / dist;

                obj1.x -= nx * overlap / 2;
                obj1.y -= ny * overlap / 2;
                obj2.x += nx * overlap / 2;
                obj2.y += ny * overlap / 2;

                // Intercambiar velocidades (rebote más natural)
                let tempDx = obj1.dx;
                let tempDy = obj1.dy;

                obj1.dx = obj2.dx;
                obj1.dy = obj2.dy;

                obj2.dx = tempDx;
                obj2.dy = tempDy;

                // efecto choque breve
                ctx.fillStyle = "yellow";
                ctx.fillRect(obj1.x, obj1.y, 8, 8);
            }
        }
    }
}

// Dibujar
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
        ctx.drawImage(img, obj.x, obj.y, obj.size, obj.size);
    });
}

// Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Esperar carga de imagen
img.onload = () => {
    gameLoop();
};

// Click eliminar + respawn SIN encimarse
canvas.addEventListener("click", function(e) {
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