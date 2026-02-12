import Phaser from "phaser";
import Jugador from "../entities/jugador.js";
import Pokevon, { POKEVONES_INICIALES } from "../entities/pokevon.js";

const CELL_SIZE = 32; // Tamaño de cada celda en píxeles
const TILE_GRASS = 4; // Valor para hierba/combate
const TILE_EXIT = 6; // Valor para la salida del gimnasio

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

        // Añadir la imagen del mapa
        const mapa = this.add.image(0, 0, "mapaGimnasio").setOrigin(0, 0);

        console.log(`Tamaño del mapa gimnasio: ${mapa.width}x${mapa.height}`);

        // Inicializar el grid basado en el tamaño del mapa
        this.initializeGrid(mapa.width, mapa.height);

        // Dibujar el grid de debug
        this.drawGridDebug();

        console.log(`Grid gimnasio creado: ${this.mapGrid[0].length} columnas x ${this.mapGrid.length} filas`);

        // Recuperar party del jugador del registry
        this.playerParty = this.registry.get('playerParty');
        
        if (!this.playerParty || this.playerParty.length === 0) {
            console.error("¡No hay party del jugador!");
            // Volver a Pueblo si no hay party
            this.scene.stop("Gimnasio");
            this.scene.resume("Pueblo");
            return;
        }

        // Evento para cuando se resume la escena (volver del combate)
        this.events.on('resume', (ctx, data) => {
            console.log("Regresando a Gimnasio...");
            if (this.jugador) this.jugador.moving = false;
            this.input.keyboard.resetKeys();
        });

        // Crear el jugador en la posición de entrada
        this.jugador = new Jugador(this, 128, 1184); // Cerca de la parte inferior (entrada)

        // Configurar la cámara para seguir al jugador
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);
        this.cameras.main.setLerp(0.1, 0.1);

        // Crear controles móviles
        this.createMobileControls();
    }

    update() {
        // Actualizar el jugador cada frame
        if (this.jugador) {
            this.jugador.update();
        }
    }

    initializeGrid(mapWidth, mapHeight) {
        // Calcular cuántas celdas hay en el mapa
        // 832 / 32 = 26 columnas
        // 1248 / 32 = 39 filas
        const cols = Math.ceil(mapWidth / CELL_SIZE);
        const rows = Math.ceil(mapHeight / CELL_SIZE);

        console.log(`Grid: ${cols} columnas x ${rows} filas`);

        // Crear el array 2D del grid
        this.mapGrid = [];
        for (let y = 0; y < rows; y++) {
            this.mapGrid[y] = [];
            for (let x = 0; x < cols; x++) {
                // Por defecto todo es suelo libre (0)
                this.mapGrid[y][x] = 0;
            }
        }

        // Definir la salida (parte inferior del mapa)
        this.setGridArea(11, 37, 4, 2, TILE_EXIT); // Zona de salida en la parte inferior

        // Definir zona de combates (hierba/entrenadores en el medio)
        // Colocar en el centro del gimnasio
        this.setGridArea(8, 8, 10, 12, TILE_GRASS); // Zona de combates en el medio
    }

    // Función auxiliar para pintar un área rectangular del grid
    setGridArea(startX, startY, width, height, value) {
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                if (this.mapGrid[y] && this.mapGrid[y][x] !== undefined) {
                    this.mapGrid[y][x] = value;
                }
            }
        }
    }

    // Función para pintar una celda individual
    setGridCell(x, y, value) {
        if (this.mapGrid[y] && this.mapGrid[y][x] !== undefined) {
            this.mapGrid[y][x] = value;
        }
    }

    // Verificar si una posición es caminable
    isWalkable(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);

        if (!this.mapGrid[gridY] || this.mapGrid[gridY][gridX] === undefined) {
            return false;
        }

        const cellType = this.mapGrid[gridY][gridX];
        // 0 es libre, 6 es salida, 4 es hierba/combate (también transitables)
        return cellType === 0 || cellType === TILE_EXIT || cellType === TILE_GRASS;
    }

    // Obtener el tipo de celda en una posición
    getCellType(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);

        if (!this.mapGrid[gridY] || this.mapGrid[gridY][gridX] === undefined) {
            return -1;
        }

        return this.mapGrid[gridY][gridX];
    }

    checkEncounter() {
        // Probabilidad de encuentro 30% (un poco más alta que en Pueblo)
        if (Math.random() < 0.3) {
            console.log("¡Un Pokémon del gimnasio apareció!");

            // Pokémon más fuertes para el gimnasio (nivel 8-12)
            const availableKeys = [
                'blastoise', 'feraligatr', 'samurott' // Pokémon tipo agua para gimnasio
            ];
            
            const validPokemons = Object.values(POKEVONES_INICIALES).filter(p => availableKeys.includes(p.sprite));

            if (validPokemons.length === 0) {
                console.error("No hay pokemons válidos con sprite para encontrar!");
                return;
            }

            const randomConfig = validPokemons[Math.floor(Math.random() * validPokemons.length)];

            // Nivel aleatorio entre 8 y 12 (más altos que en Pueblo)
            const enemyLevel = Math.floor(Math.random() * 5) + 8;
            const enemyPokemon = new Pokevon({ ...randomConfig, nivel: enemyLevel });

            // Iniciar combate
            this.scene.pause();
            this.scene.launch('Combate', {
                playerParty: this.playerParty,
                enemyPokemon: enemyPokemon,
                isGymLeader: false // No es líder, es combate normal
            });
        }
    }

    exitGym() {
        console.log("Saliendo del gimnasio...");

        // Guardar posición del jugador en Pueblo (donde estaba antes de entrar)
        const savedPos = this.registry.get('playerPositionBeforeGym') || { x: 128, y: 128 };

        // Detener gimnasio
        this.scene.stop('Gimnasio');

        // Reanudar Pueblo
        this.scene.resume('Pueblo');
    }

    createMobileControls() {
        // Crear controles virtuales para móvil
        const buttonSize = 60;
        const padding = 20;
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // D-Pad (izquierda inferior)
        const dpadX = padding + buttonSize;
        const dpadY = screenHeight - padding - buttonSize;

        // Botón ARRIBA
        const btnUp = this.add.circle(dpadX, dpadY - buttonSize, buttonSize / 2, 0x4a90e2, 0.7)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive();
        this.add.text(dpadX, dpadY - buttonSize, "↑", { fontSize: "32px", color: "#fff" })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Botón ABAJO
        const btnDown = this.add.circle(dpadX, dpadY + buttonSize, buttonSize / 2, 0x4a90e2, 0.7)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive();
        this.add.text(dpadX, dpadY + buttonSize, "↓", { fontSize: "32px", color: "#fff" })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Botón IZQUIERDA
        const btnLeft = this.add.circle(dpadX - buttonSize, dpadY, buttonSize / 2, 0x4a90e2, 0.7)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive();
        this.add.text(dpadX - buttonSize, dpadY, "←", { fontSize: "32px", color: "#fff" })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Botón DERECHA
        const btnRight = this.add.circle(dpadX + buttonSize, dpadY, buttonSize / 2, 0x4a90e2, 0.7)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive();
        this.add.text(dpadX + buttonSize, dpadY, "→", { fontSize: "32px", color: "#fff" })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Botón de ACCIÓN (derecha inferior)
        const btnAction = this.add.circle(
            screenWidth - padding - buttonSize,
            screenHeight - padding - buttonSize,
            buttonSize / 2,
            0xe74c3c,
            0.7
        ).setScrollFactor(0)
            .setDepth(10000)
            .setInteractive();
        this.add.text(
            screenWidth - padding - buttonSize,
            screenHeight - padding - buttonSize,
            "E",
            { fontSize: "32px", color: "#fff", fontStyle: "bold" }
        ).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Eventos de los botones
        btnUp.on('pointerdown', () => {
            if (this.jugador) this.jugador.handleMobileInput('up');
        });

        btnDown.on('pointerdown', () => {
            if (this.jugador) this.jugador.handleMobileInput('down');
        });

        btnLeft.on('pointerdown', () => {
            if (this.jugador) this.jugador.handleMobileInput('left');
        });

        btnRight.on('pointerdown', () => {
            if (this.jugador) this.jugador.handleMobileInput('right');
        });

        btnAction.on('pointerdown', () => {
            if (this.jugador) this.jugador.handleMobileInput('action');
        });
    }

    drawGridDebug() {
        const graphics = this.add.graphics();
        graphics.setDepth(50); // Cambiar de 1000 a 50 para que no tape al jugador
        graphics.alpha = 0.5;

        for (let y = 0; y < this.mapGrid.length; y++) {
            for (let x = 0; x < this.mapGrid[y].length; x++) {
                const value = this.mapGrid[y][x];
                let color = 0x00ff00; // Verde - suelo libre
                let alpha = 0.1;

                if (value === TILE_EXIT) {
                    color = 0xffff00; // Amarillo - salida
                    alpha = 0.4;
                }
                if (value === TILE_GRASS) {
                    color = 0x006400; // Verde oscuro - zona de combate
                    alpha = 0.5;
                }

                // Rellenar la celda
                if (value !== 0) {
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
}