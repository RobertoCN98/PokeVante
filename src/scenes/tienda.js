const CELL_SIZE = 48; // tamaño de la cuadrícula lógica

class MiniPokemon extends Phaser.Scene {
    constructor() {
        super({ key: 'MiniPokemon' });
    }

    preload() {
        // ----------------------------
        // PON AQUÍ LA RUTA DE TU MAPA
        // ----------------------------
        this.load.image('mapa', 'assets/map/mapaPrincipal.png');

        // ----------------------------
        // PON AQUÍ LA RUTA DE TU SPRITESHEET DEL JUGADOR
        // ----------------------------
        this.load.spritesheet('jugador', 'assets/sprites/jugador.png', { 
            frameWidth: 100,  // ancho de cada frame en tu spritesheet
            frameHeight: 100  // alto de cada frame en tu spritesheet
        });
    }

    create() {
        // ----------------------------
        // MOSTRAR MAPA
        // ----------------------------
        this.map = this.add.image(0, 0, 'mapa').setOrigin(0, 0);

        // ----------------------------
        // CREAR MATRIZ AUTOMÁTICA SEGÚN MAPA
        // ----------------------------
        const rows = Math.floor(this.map.height / CELL_SIZE);
        const cols = Math.floor(this.map.width / CELL_SIZE);

        // Inicializar todo suelo (0 = caminable)
        this.mapGrid = Array.from({ length: rows }, () => Array(cols).fill(1));

        // Ahora puedes cambiar manualmente bloques:
        // Ejemplos:
        // this.mapGrid[8][12] = 3; // tienda 
        // this.mapGrid[10][19] = 2; // puerta hospital
        // this.mapGrid[14][8] = 4; // casa
        // this.mapGrid[4][26] = 5; // gym

        // Suelo libre para caminar
        this.mapGrid[15][0] = 0;
        this.mapGrid[16][0] = 0; 
        this.mapGrid[15][1] = 0; 
        this.mapGrid[16][1] = 0; 
        this.mapGrid[15][2] = 0; 
        this.mapGrid[16][2] = 0; 
        this.mapGrid[15][3] = 0; 
        this.mapGrid[16][3] = 0; 
        this.mapGrid[15][4] = 0; 
        this.mapGrid[16][4] = 0; 
        this.mapGrid[15][5] = 0; 
        this.mapGrid[16][5] = 0; 
        this.mapGrid[15][6] = 0;
        this.mapGrid[16][6] = 0; 
        this.mapGrid[15][7] = 0; 
        this.mapGrid[16][7] = 0; 
        this.mapGrid[15][8] = 0; 
        this.mapGrid[16][8] = 0; 
        this.mapGrid[15][9] = 0; 
        this.mapGrid[16][9] = 0; 
        this.mapGrid[15][10] = 0; 
        this.mapGrid[16][10] = 0; 
        this.mapGrid[15][11] = 0; 
        this.mapGrid[16][11] = 0; 
        this.mapGrid[15][12] = 0;
        this.mapGrid[16][12] = 0; 
        this.mapGrid[15][13] = 0; 
        this.mapGrid[16][13] = 0; 
        this.mapGrid[15][14] = 0; 
        this.mapGrid[16][14] = 0;

        this.mapGrid[14][13] = 0; 
        this.mapGrid[13][13] = 0; 
        this.mapGrid[12][13] = 0; 
        this.mapGrid[11][13] = 0; 
        this.mapGrid[10][13] = 0; 
        this.mapGrid[15][14] = 0; 
        this.mapGrid[14][14] = 0; 
        this.mapGrid[13][14] = 0; 
        this.mapGrid[12][14] = 0; 
        this.mapGrid[10][14] = 0; 
        this.mapGrid[9][11] = 0;
        this.mapGrid[9][12] = 0;
        this.mapGrid[11][14] = 0;

        this.mapGrid[11][15] = 0;
        this.mapGrid[12][15] = 0;
        this.mapGrid[11][16] = 0;
        this.mapGrid[12][16] = 0;
        this.mapGrid[11][17] = 0;
        this.mapGrid[12][17] = 0;
        this.mapGrid[11][18] = 0;
        this.mapGrid[12][18] = 0;
        this.mapGrid[11][19] = 0;
        this.mapGrid[12][19] = 0;
        this.mapGrid[11][20] = 0;
        this.mapGrid[12][20] = 0;
        this.mapGrid[11][21] = 0;
        this.mapGrid[12][21] = 0;

        this.mapGrid[9][14] = 0;
        this.mapGrid[8][14] = 0;
        this.mapGrid[7][14] = 0;
        this.mapGrid[6][14] = 0;
        this.mapGrid[5][14] = 0;

        this.mapGrid[5][13] = 0;
        this.mapGrid[5][12] = 0;
        this.mapGrid[5][11] = 0;
        this.mapGrid[5][10] = 0;
        this.mapGrid[5][9] = 0;

        this.mapGrid[6][9] = 0;
        this.mapGrid[6][8] = 0;
        this.mapGrid[6][7] = 0;
        this.mapGrid[6][6] = 0;
        this.mapGrid[6][5] = 0;
        this.mapGrid[5][5] = 0;

        this.mapGrid[6][15] = 0;
        this.mapGrid[6][16] = 0;
        this.mapGrid[6][17] = 0;
        this.mapGrid[6][18] = 0;
        this.mapGrid[6][19] = 0;
        this.mapGrid[6][20] = 0;
        this.mapGrid[6][21] = 0;
        this.mapGrid[6][22] = 0;
        this.mapGrid[6][23] = 0;
        this.mapGrid[6][24] = 0;
        this.mapGrid[6][25] = 0;
        this.mapGrid[6][26] = 0;
        this.mapGrid[6][27] = 0;
        this.mapGrid[6][28] = 0;
        this.mapGrid[6][29] = 0;

        this.mapGrid[5][25] = 0;
        this.mapGrid[5][26] = 0;


        this.mapGrid[10][12] = 0;

        this.mapGrid[10][11] = 0;


        // Hierba
        this.mapGrid[4][2] = 0;
        this.mapGrid[4][3] = 0;
        this.mapGrid[4][4] = 0;
        this.mapGrid[4][5] = 0;
        this.mapGrid[4][6] = 0;
        this.mapGrid[4][7] = 0;
        this.mapGrid[4][8] = 0;

        this.mapGrid[3][2] = 0;
        this.mapGrid[3][3] = 0;
        this.mapGrid[3][4] = 0;
        this.mapGrid[3][5] = 0;
        this.mapGrid[3][6] = 0;
        this.mapGrid[3][7] = 0;
        this.mapGrid[3][8] = 0;

        this.mapGrid[2][2] = 0;
        this.mapGrid[2][3] = 0;
        this.mapGrid[2][4] = 0;
        this.mapGrid[2][5] = 0;
        this.mapGrid[2][6] = 0;
        this.mapGrid[2][7] = 0;
        this.mapGrid[2][8] = 0;

        // ----------------------------
        // CREAR JUGADOR
        // ----------------------------
        this.playerCellX = 1;
        this.playerCellY = 15;

        this.player = this.physics.add.sprite(
            this.playerCellX * CELL_SIZE + CELL_SIZE / 2,
            this.playerCellY * CELL_SIZE + CELL_SIZE / 2,
            'jugador',
            0
        );

        // ----------------------------
        // CONTROLES
        // ----------------------------
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // ----------------------------
        // MUNDO Y CÁMARA
        // ----------------------------
        this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
        this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
        this.cameras.main.startFollow(this.player);

        // ----------------------------
        // ANIMACIONES
        // ----------------------------
        this.createAnimations();

        // ----------------------------
        // DEBUG OPCIONAL
        // ----------------------------
        this.drawGridDebug();
    }

    createAnimations() {
        this.anims.create({
            key: 'caminar_abajo',
            frames: this.anims.generateFrameNumbers('jugador', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'caminar_arriba',
            frames: this.anims.generateFrameNumbers('jugador', { start: 3, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'caminar_izq',
            frames: this.anims.generateFrameNumbers('jugador', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'caminar_der',
            frames: this.anims.generateFrameNumbers('jugador', { start: 9, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
    }

    update() {
        this.handleMovement();
    }

    // ----------------------------
    // MOVIMIENTO POR CUADRÍCULA
    // ----------------------------
tryMove(dx, dy, animKey) {
    const newX = this.playerCellX + dx;
    const newY = this.playerCellY + dy;
    const cellValue = this.mapGrid[newY]?.[newX];

    if (cellValue === undefined || cellValue === 1 || this.moving) return;

    // Inicia el movimiento
    this.moving = true;
    this.player.anims.play(animKey, true);

    this.tweens.add({
        targets: this.player,
        x: newX * CELL_SIZE + CELL_SIZE / 2,
        y: newY * CELL_SIZE + CELL_SIZE / 2,
        duration: 150,
        onComplete: () => {
            this.playerCellX = newX;
            this.playerCellY = newY;
            this.moving = false;
            this.player.anims.stop();
        }
    });

    // Manejar puertas
    if (cellValue === 2) this.scene.start('Hospital');
    if (cellValue === 3) this.scene.start('Gym');
}



handleMovement() {
    // Si ya está moviéndose, no aceptar nuevas teclas
    if (this.moving) return;

    // ARRIBA
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
        this.tryMove(0, -1, 'caminar_arriba');
    }
    // ABAJO
    else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        this.tryMove(0, 1, 'caminar_abajo');
    }
    // IZQUIERDA
    else if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.tryMove(-1, 0, 'caminar_izq');
    }
    // DERECHA
    else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.tryMove(1, 0, 'caminar_der');
    }
}



    // ----------------------------
    // FUNCION DEBUG PARA VER MATRIZ
    // ----------------------------
    drawGridDebug() {
        const graphics = this.add.graphics();
        graphics.setDepth(1000);

        for (let y = 0; y < this.mapGrid.length; y++) {
            for (let x = 0; x < this.mapGrid[y].length; x++) {
                const value = this.mapGrid[y][x];
                let color = 0x00ff00; // suelo libre
                if (value === 1) color = 0xff0000; // bloqueado
                if (value === 2) color = 0x0000ff; // hospital
                if (value === 3) color = 0x800080; // gym

                graphics.lineStyle(1, color, 0.8);
                graphics.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// ----------------------------
// CONFIGURACIÓN PHASER
// ----------------------------
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MiniPokemon]
};

// ----------------------------
// INICIALIZAR JUEGO
// ----------------------------
new Phaser.Game(config);
