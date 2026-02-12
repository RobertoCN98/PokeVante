import Phaser from "phaser";
import Jugador from "../entities/jugador.js";
import Pokevon, { POKEVONES_INICIALES } from "../entities/pokevon.js";

const CELL_SIZE = 32; // Tamaño de cada celda en píxeles
const TILE_GRASS = 4; // Valor para la hierba alta
const TILE_GYM_ENTRANCE = 5; // Valor para la entrada al gimnasio

export default class Pueblo extends Phaser.Scene {
       constructor() {
              super({ key: "Pueblo" });
       }

       preload() {
              console.log("PRELOAD PUEBLO");
              this.load.image("mapaPueblo", "assets/map/mapaPrincipal.png");

              // Cargar sprite sheet del jugador
              this.load.spritesheet("jugador", "assets/sprites/jugadorPequeño.png", {
                     frameWidth: 32,
                     frameHeight: 32
              });
       }

       create() {
              console.log("CREATE PUEBLO");

              // Añadir la imagen del mapa
              const mapa = this.add.image(0, 0, "mapaPueblo").setOrigin(0, 0);

              console.log(`Tamaño del mapa: ${mapa.width}x${mapa.height}`);

              // Inicializar el grid basado en el tamaño del mapa
              this.initializeGrid(mapa.width, mapa.height);

              // Dibujar el grid de debug
              this.drawGridDebug();

              console.log(`Grid creado: ${this.mapGrid[0].length} columnas x ${this.mapGrid.length} filas`);

              // Inicializar party del jugador si no existe
              // Buscamos si ya existe en el registry (persistencia entre escenas)
              if (!this.registry.get('playerParty')) {
                     const starter = new Pokevon({ ...POKEVONES_INICIALES.charizard, nivel: 5, esDelJugador: true });
                     this.registry.set('playerParty', [starter]);
                     this.playerParty = this.registry.get('playerParty');
              } else {
                     this.playerParty = this.registry.get('playerParty');
              }

              // Evento para cuando se resume la escena (volver del combate o gimnasio)
              this.events.on('resume', (ctx, data) => {
                     console.log("Regresando a Pueblo...");
                     if (this.jugador) this.jugador.moving = false;
                     // Asegurar que input no queda pegado
                     this.input.keyboard.resetKeys();
              });

              // Recuperar posición guardada o usar posición inicial
              const savedPos = this.registry.get('playerPosition') || { x: 128, y: 128 };
              
              // Crear el jugador en la posición guardada o inicial
              this.jugador = new Jugador(this, savedPos.x, savedPos.y);

              // Guardar posición cuando se pausa la escena
              this.events.on('pause', () => {
                     if (this.jugador) {
                            this.registry.set('playerPosition', {
                                   x: this.jugador.x,
                                   y: this.jugador.y
                            });
                     }
              });

              // NUEVO: Configurar la cámara para seguir al jugador
              this.cameras.main.startFollow(this.jugador);
              this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);

              // Opcional: suavizar el movimiento de la cámara
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
              const cols = Math.ceil(mapWidth / CELL_SIZE);
              const rows = Math.ceil(mapHeight / CELL_SIZE);

              // Crear el array 2D del grid
              this.mapGrid = [];
              for (let y = 0; y < rows; y++) {
                     this.mapGrid[y] = [];
                     for (let x = 0; x < cols; x++) {
                            // Por defecto todo es suelo libre (0)
                            this.mapGrid[y][x] = 1;
                     }
              }

              // Ejemplo: definir zonas específicas
              // Bloquear una zona (paredes, árboles, etc.)
              //setGridArea(startX, startY, width, height, value)

              this.setGridArea(0, 23, 22, 2, 0); // NO TRANSITABLE
              this.setGridArea(19, 15, 3, 8, 0); // NO TRANSITABLE
              this.setGridArea(17, 14, 2, 3, 0); // NO TRANSITABLE
              this.setGridArea(20, 17, 14, 2, 0); // NO TRANSITABLE
              this.setGridArea(22, 15, 1, 2, 0); // NO TRANSITABLE
              this.setGridArea(21, 8, 2, 7, 0); // NO TRANSITABLE
              this.setGridArea(13, 8, 8, 2, 0); // NO TRANSITABLE
              this.setGridArea(7, 10, 8, 2, 0); // NO TRANSITABLE
              this.setGridArea(7, 7, 2, 3, 0); // NO TRANSITABLE
              this.setGridArea(23, 9, 22, 2, 0); // NO TRANSITABLE
              this.setGridArea(38, 7, 3, 2, 0); // NO TRANSITABLE
              this.setGridArea(27, 8, 3, 1, 0); // NO TRANSITABLE
              
              // Entrada al gimnasio (NUEVO)
              this.setGridArea(10, 8, 2, 2, TILE_GYM_ENTRANCE); // Entrada gimnasio

              // Zonas de batalla (Hierba)
              // Usamos TILE_GRASS (4) para la zona de hierba
              this.setGridArea(3, 3, 11, 4, TILE_GRASS);
              // Usaremos el 5 para el gym
              this.setGridArea(35, 3, 6, 5, 5);
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
              // 1 es bloqueado, 0 es libre, 4 es hierba, 5 es entrada gimnasio (también libre para caminar)
              return cellType === 0 || cellType === TILE_GRASS || cellType === 2 || cellType === 3 || cellType === TILE_GYM_ENTRANCE;
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
              // Probabilidad de encuentro 20%
              if (Math.random() < 0.2) {
                     console.log("¡Un Pokemon salvaje ha aparecido!");

                     // Seleccionar pokemon aleatorio de los disponibles (solo los que tienen sprite)
                     // Excluimos a Squirtle y usamos los que tienen nuevos spritesheets
                     const availableKeys = [
                            'charizard', 'cinderace', 'typhlosion',
                            'blastoise', 'feraligatr', 'samurott',
                            'meganium', 'sceptile', 'serperior'
                     ];
                     // Filtramos POKEVONES_INICIALES para usar solo estos
                     const validPokemons = Object.values(POKEVONES_INICIALES).filter(p => availableKeys.includes(p.sprite));

                     if (validPokemons.length === 0) {
                            console.error("No hay pokemons válidos con sprite para encontrar!");
                            return;
                     }

                     const randomConfig = validPokemons[Math.floor(Math.random() * validPokemons.length)];

                     // Crear instancia del enemigo
                     // Nivel aleatorio entre 2 y 5
                     const enemyLevel = Math.floor(Math.random() * 4) + 2;
                     const enemyPokemon = new Pokevon({ ...randomConfig, nivel: enemyLevel });

                     // Iniciar combate
                     this.scene.pause();
                     this.scene.launch('Combate', {
                            playerParty: this.playerParty,
                            enemyPokemon: enemyPokemon
                     });
              }
       }

       enterGym() {
              console.log("🏛️ Entrando al gimnasio...");

              // Guardar la posición actual para volver aquí al salir
              this.registry.set('playerPositionBeforeGym', {
                     x: this.jugador.x,
                     y: this.jugador.y
              });

              // Pausar Pueblo
              this.scene.pause('Pueblo');

              // Lanzar Gimnasio
              this.scene.launch('Gimnasio');
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
              graphics.alpha = 0.5; // Hacerlo semi-transparente globalmente si se desea

              for (let y = 0; y < this.mapGrid.length; y++) {
                     for (let x = 0; x < this.mapGrid[y].length; x++) {
                            const value = this.mapGrid[y][x];
                            let color = 0x00ff00; // Verde - suelo libre
                            let alpha = 0.1;

                            if (value === 1) {
                                   color = 0xff0000; // Rojo - bloqueado
                                   alpha = 0.3;
                            }
                            if (value === 2) {
                                   color = 0x0000ff; // Azul - hospital
                                   alpha = 0.3;
                            }
                            if (value === 3) {
                                   color = 0x800080; // Morado - gimnasio
                                   alpha = 0.3;
                            }
                            if (value === TILE_GRASS) {
                                   color = 0x006400; // Verde oscuro - hierba alta
                                   alpha = 0.4;
                            }
                            if (value === TILE_GYM_ENTRANCE) {
                                   color = 0xffa500; // Naranja - entrada gimnasio
                                   alpha = 0.5;
                            }

                            // Rellenar la celda
                            if (value !== 0) { // Solo dibujar si no es suelo normal para no saturar
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