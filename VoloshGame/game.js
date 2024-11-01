const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const rows = 5;  
const cols = 8;
const cellWidth = canvasWidth / cols;
const cellHeight = canvasHeight / rows;

let money = 100;

let gameStarted = false;
let countdown = 20;
let countdownInterval;
let gameOver = false; 


const plants = [
    {
        name: "Sunflower",
        type: "sunflower",
        cost: 50,
        color: 'yellow',
        generateMoney: true,
        reloadTime: 5000,
        width: cellWidth - 10,
        height: cellHeight - 10,
        health: 3,
        image: 'game.img/images.jpg' 
    },
    {
        name: "Shooter",
        type: "shooter",
        cost: 100,
        color: 'green',
        shoots: true,
        reloadTime: 1000,
        projectileSpeed: 5,
        damage: 1,
        width: cellWidth - 10,
        height: cellHeight - 10,
        health: 3,
        image: 'path/to/shooter-image.png' 
    },
    {
        name: "Tank",
        type: "tank",
        cost: 150,
        color: 'darkgreen',
        width: cellWidth - 10,
        height: cellHeight - 10,
        health: 10,
        image: 'path/to/tank-image.png' 
    }
];

let selectedPlant = null;

const enemies = [];
const enemySpawnInterval = 3000; 

const grid = Array(rows).fill().map(() => Array(cols).fill(null));

function startCountdown() {
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            gameStarted = true;
            showMessage("Zombies are coming...", 3000);
            spawnZombies();
        }
    }, 1000);
}

function showMessage(message, duration) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText(message, canvasWidth / 2 - 150, canvasHeight / 2);
    setTimeout(() => {
        if (message === "Zombies are coming...") {
            gameStarted = true;
        }
    }, duration);
}

function spawnZombies() {
    setInterval(() => {
        const row = Math.floor(Math.random() * rows);
        enemies.push({
            type: "Regular Zombie",
            color: 'brown',
            speed: 0.5,
            health: 3,
            width: cellWidth - 10,
            height: cellHeight - 10,
            x: canvasWidth,
            y: row * cellHeight + 10,
            row: row
        });
    }, enemySpawnInterval);
}

canvas.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (selectedPlant && !grid[row][col] && money >= selectedPlant.cost && !gameOver) {
        grid[row][col] = {
            ...selectedPlant,
            x: col * cellWidth + 5,
            y: row * cellHeight + 5,
            projectiles: [],
            canShoot: selectedPlant.shoots ? true : false,
            lastMoneyGenerated: Date.now(),
        };
        money -= selectedPlant.cost;
    }
});

document.getElementById('sunflower').addEventListener('click', () => {
    selectedPlant = plants.find(plant => plant.type === 'sunflower');
});
document.getElementById('shooter').addEventListener('click', () => {
    selectedPlant = plants.find(plant => plant.type === 'shooter');
});
document.getElementById('tank').addEventListener('click', () => {
    selectedPlant = plants.find(plant => plant.type === 'tank');
});

function updatePlants() {
    grid.forEach(row => {
        row.forEach(plant => {
            if (plant && plant.shoots && plant.canShoot) {
                plant.projectiles.push({
                    x: plant.x + plant.width,
                    y: plant.y + plant.height / 2 - 5,
                    width: 10,
                    height: 10,
                    speed: plant.projectileSpeed,
                    damage: plant.damage,
                });
                plant.canShoot = false;
                setTimeout(() => plant.canShoot = true, plant.reloadTime);
            }

            if (plant && plant.generateMoney && Date.now() - plant.lastMoneyGenerated > plant.reloadTime) {
                money += 25;
                plant.lastMoneyGenerated = Date.now();
            }

            if (plant && plant.projectiles) {
                plant.projectiles.forEach((projectile, pIndex) => {
                    projectile.x += projectile.speed;

                    enemies.forEach((enemy, eIndex) => {
                        if (
                            projectile.x < enemy.x + enemy.width &&
                            projectile.x + projectile.width > enemy.x &&
                            projectile.y < enemy.y + enemy.height &&
                            projectile.y + projectile.height > enemy.y
                        ) {
                            enemy.health -= projectile.damage;
                            if (enemy.health <= 0) {
                                enemies.splice(eIndex, 1);
                            }
                            plant.projectiles.splice(pIndex, 1);
                        }
                    });
                });
            }
        });
    });
}

function updateEnemies() {
    if (!gameStarted || gameOver) return;


    enemies.forEach((enemy, index) => {
        enemy.x -= enemy.speed;


        if (enemy.x + enemy.width < 0) {
            gameOver = true;
            showGameOver();
            return;
        }


        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
        }


        const plant = grid[enemy.row].find(plant => plant && enemy.x < plant.x + plant.width);
        if (plant) {
            plant.health -= 0.01;
            if (plant.health <= 0) {
                grid[enemy.row][grid[enemy.row].indexOf(plant)] = null;
            }
        }
    });
}


function showGameOver() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.fillText("Game Over", canvasWidth / 2 - 150, canvasHeight / 2);
}


function draw() {

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);


    ctx.strokeStyle = 'black';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        }
    }


    grid.forEach(row => {
        row.forEach(plant => {
            if (plant) {
                ctx.fillStyle = plant.color;
                ctx.fillRect(plant.x, plant.y, plant.width, plant.height);

                plant.projectiles.forEach(projectile => {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
                });
            }
        });
    });

    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Money: ${money}`, 10, 30);

    if (!gameStarted) {
        ctx.font = '30px Arial';
        ctx.fillText(`Game starts in: ${countdown}`, canvasWidth / 2 - 150, canvasHeight / 2);
    }
}

function gameLoop() {
    updatePlants(); 
    updateEnemies(); 
    draw();
    requestAnimationFrame(gameLoop);
}

startCountdown();
gameLoop();
