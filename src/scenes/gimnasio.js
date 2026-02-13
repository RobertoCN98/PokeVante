import Phaser from "phaser";
import Jugador from "../entities/jugador.js";
import Pokevon, { POKEVONES_INICIALES } from "../entities/pokevon.js";

const CELL_SIZE = 32;

export default class Gimnasio extends Phaser.Scene {
    constructor() {
        super({ key: "Gimnasio" });
    }

    preload() {
        console.log("PRELOAD GIMNASIO");
        this.load.image("mapaGimnasio", "assets/map/gym.png");

        // Cargar sprite sheet del jugador (ya está cargado, pero por si acaso)
        if (!this.textures.exists("jugador")) {
            this.load.spritesheet("jugador", "assets/sprites/jugadorPequeño_32x32_correcto.png", {
                frameWidth: 32,
                frameHeight: 32
            });
        }
    }


    create() {
        console.log("CREATE GIMNASIO");

        // 1. Configurar Grid y Fondo
        this.rows = 20; // 20 * 32 = 640
        this.cols = 20; // 20 * 32 = 640

        // FONDO DEL GIMNASIO
        this.bg = this.add.image(0, 0, "bg_gimnasio")
            .setOrigin(0, 0)
            .setDepth(-100); // Fondo muy atrás
        // Ajustar al tamaño de la escena (640x480 para que no se vea "ampliada" / cortada)
        this.bg.displayWidth = 640;
        this.bg.displayHeight = 480;

        // Inicializar Grid
        this.mapGrid = [];
        for (let y = 0; y < this.rows; y++) {
            this.mapGrid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.mapGrid[y][x] = 1; // 1 = Caminable
            }
        }

        // Definir paredes (Bordes)
        // Arriba (ahora ocupa 7 filas: 0 a 6)
        for (let y = 0; y <= 6; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.mapGrid[y][x] = 0;
            }
        }
        // Abajo
        for (let x = 0; x < this.cols; x++) this.mapGrid[this.rows - 1][x] = 0;

        // Izquierda (ahora ocupa 5 columnas: 0, 1, 2, 3, 4)
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x <= 4; x++) {
                this.mapGrid[y][x] = 0;
            }
        }

        // Derecha (ahora ocupa 5 columnas: 15, 16, 17, 18, 19)
        for (let y = 0; y < this.rows; y++) {
            for (let x = this.cols - 5; x < this.cols; x++) {
                this.mapGrid[y][x] = 0;
            }
        }

        // Bloquear esquinas inferiores (crear pasillo central)
        // Izquierda abajo (x=0..7, y=12..19)
        for (let y = 12; y < this.rows; y++) {
            for (let x = 0; x <= 7; x++) {
                this.mapGrid[y][x] = 0;
            }
        }
        // Derecha abajo (x=12..19, y=12..19)
        for (let y = 12; y < this.rows; y++) {
            for (let x = 12; x < this.cols; x++) {
                this.mapGrid[y][x] = 0;
            }
        }

        const leaderGridX = 10;
        const leaderGridY = 7; // Movido 3 casillas abajo (antes 4)

        // Marcar posición del líder como ocupada (Bloqueada)
        this.mapGrid[leaderGridY][leaderGridX] = 0;

        this.leader = this.physics.add.staticSprite(
            leaderGridX * CELL_SIZE + 16,
            leaderGridY * CELL_SIZE + 16,
            "lidergimnasio"
        );

        this.leader.setScale(0.15);
        this.leader.refreshBody();
        this.leader.setDepth(50); // Líder por encima del fondo

        // 3. Jugador
        // Iniciar en el centro para asegurar que se ve
        this.entryX = 10 * CELL_SIZE;
        this.entryY = 14 * CELL_SIZE;
        this.jugador = new Jugador(this, this.entryX, this.entryY);
        console.log(`Jugador creado en: ${this.jugador.x}, ${this.jugador.y}`);
        this.jugador.setDepth(100); // Jugador por encima de todo

        // Cámara
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, 640, 480);

        // Estado del diálogo
        this.dialogueActive = false;

        // Texto de diálogo (oculto inicialmente)
        this.dialogueBox = this.add.rectangle(320, 400, 600, 100, 0x000000, 0.8)
            .setScrollFactor(0)
            .setDepth(1000)
            .setVisible(false);

        this.dialogueText = this.add.text(40, 360, "", {
            fontSize: '20px',
            fill: '#ffffff',
            wordWrap: { width: 560 }
        })
            .setScrollFactor(0)
            .setDepth(1001)
            .setVisible(false);

        // Opciones de diálogo (Luchar / Huir)
        this.optionFight = this.add.text(40, 420, "LUCHAR", {
            fontSize: '20px',
            fill: '#ff0000',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })
            .setScrollFactor(0)
            .setDepth(1002)
            .setVisible(false)
            .setInteractive()
            .on('pointerdown', () => this.startCombat())
            .on('pointerover', () => this.optionFight.setStyle({ fill: '#ffaaaa' }))
            .on('pointerout', () => this.optionFight.setStyle({ fill: '#ff0000' }));

        this.optionFlee = this.add.text(200, 420, "HUIR", {
            fontSize: '20px',
            fill: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })
            .setScrollFactor(0)
            .setDepth(1002)
            .setVisible(false)
            .setInteractive()
            .on('pointerdown', () => this.fleeCombat())
            .on('pointerover', () => this.optionFlee.setStyle({ fill: '#aaffaa' }))
            .on('pointerout', () => this.optionFlee.setStyle({ fill: '#00ff00' }));
    }

    update() {
        if (!this.jugador) return;

        // Si hay diálogo activo, bloqueamos movimiento
        if (this.dialogueActive) {
            return;
        }

        this.jugador.update();
        this.checkInteraction();
    }

    checkInteraction() {
        // Verificar posición grid
        const gridX = Math.floor(this.jugador.x / CELL_SIZE);
        const gridY = Math.floor(this.jugador.y / CELL_SIZE);

        // Si toca las casillas de abajo (y=18, ya que 19 es pared), volver al inicio
        // Si toca las casillas de abajo (y=18, ya que 19 es pared), volver al inicio
        if (gridY === 18) {
            console.log("Saliendo del gimnasio...");

            // Volver a la escena del Pueblo, justo debajo de la entrada del gimnasio
            // Entrada en Pueblo: (39, 6). Salida deseada: (39, 7).
            this.scene.start("Pueblo", {
                x: 39 * CELL_SIZE, // 39 * 32
                y: 7 * CELL_SIZE   // 7 * 32
            });
            return;
        }

        // Líder está en (10, 7). Trigger en (10, 8).
        if (gridX === 10 && gridY === 8 && !this.dialogueActive && !this.jugador.moving) {
            this.startDialogue();
        }
    }

    startDialogue() {
        this.dialogueActive = true;

        // Detener movimiento del jugador
        if (this.jugador.body) this.jugador.body.setVelocity(0);
        this.jugador.moving = true; // Bloquear input

        // Mostrar diálogo y opciones
        this.dialogueBox.setVisible(true);
        this.dialogueText.setVisible(true);
        this.dialogueText.setText("Líder: ¡Bienvenido! ¿Quieres desafiarme?");

        this.optionFight.setVisible(true);
        this.optionFlee.setVisible(true);
    }

    startCombat() {
        console.log("Iniciando combate...");

        // Usamos una configuración base de Charizard pero nivel alto
        const cinderaceConfig = POKEVONES_INICIALES.cinderace;
        // Crear instancia del enemigo (Líder)
        const enemyPokemon = new Pokevon({
            ...cinderaceConfig,
            nivel: 7
        });

        // Curar completamente al crearlo para asegurar stats correctos
        enemyPokemon.curacionCompleta();

        this.scene.start("Combate", {
            playerParty: this.jugador.pokemonParty || [], // Asumiendo que el jugador tiene party
            enemyPokemon: enemyPokemon,
            isGymLeader: true
        });
    }

    fleeCombat() {
        console.log("Huiste del combate.");

        // Ocultar UI
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
        this.optionFight.setVisible(false);
        this.optionFlee.setVisible(false);

        // Mover jugador una casilla abajo para evitar re-trigger inmediato
        const safeY = (8 + 1) * CELL_SIZE; // Posición (10, 9)
        this.jugador.y = safeY;

        // Reactivar movimiento
        this.dialogueActive = false;
        this.jugador.moving = false;
    }

    // --- Métodos requeridos por Jugador.js ---

    isWalkable(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);

        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
            return false; // Fuera de límites
        }

        return this.mapGrid[gridY][gridX] === 1;
    }

    getCellType(x, y) {
        // Retorna tipo de celda (0 suelo, etc.), no necesitamos lógica compleja aquí por ahora
        return 0;
    }

    drawGridDebug() {
        const graphics = this.add.graphics();
        graphics.setDepth(1000);

        for (let y = 0; y < this.mapGrid.length; y++) {
            for (let x = 0; x < this.mapGrid[y].length; x++) {
                const value = this.mapGrid[y][x];
                let color = 0x00ff00; // Verde - suelo libre
                let alpha = 0.2;

                if (value === 0) {
                    color = 0xff0000; // Rojo - bloqueado (paredes/lider)
                    alpha = 0.4;
                }

                // Dibujar el borde de la celda
                graphics.lineStyle(1, color, 0.6);
                graphics.strokeRect(
                    x * CELL_SIZE,
                    y * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );

                // Rellenar la celda con color semi-transparente
                graphics.fillStyle(color, alpha);
                graphics.fillRect(
                    x * CELL_SIZE,
                    y * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
    }
}
