import Phaser from "phaser";
import Jugador from "../entities/jugador.js";

const CELL_SIZE = 32; // Tamaño de cada celda en píxeles

export default class Pueblo extends Phaser.Scene {
       constructor() {
              super({ key: "Pueblo" });
       }

       preload() {
              console.log("PRELOAD PUEBLO");
              this.load.image("mapaPueblo", "assets/map/mapaPrincipal.png");

              // Cargar sprite sheet del jugador
              // Configuración para 4 frames horizontales (1120 / 4 = 280)
              this.load.spritesheet("jugador_spritesheet", "assets/sprites/jugadorPequeño.png", {
                     frameWidth: 280,
                     frameHeight: 928
              });
       }

       create(data) {
              console.log("CREATE PUEBLO");

              // Crear animaciones globales standard (Left=Row1, Right=Row2, Up=Row3, Down=Row0)
              if (!this.anims.exists("caminar-abajo")) {
                     this.anims.create({
                            key: "caminar-abajo",
                            frames: this.anims.generateFrameNumbers("jugador_spritesheet", { frames: [0, 1, 2, 3] }),
                            frameRate: 10,
                            repeat: -1
                     });
                     this.anims.create({
                            key: "caminar-izquierda",
                            frames: this.anims.generateFrameNumbers("jugador_spritesheet", { frames: [16, 17, 18, 19] }),
                            frameRate: 10,
                            repeat: -1
                     });
                     this.anims.create({
                            key: "caminar-derecha",
                            frames: this.anims.generateFrameNumbers("jugador_spritesheet", { frames: [32, 33, 34, 35] }),
                            frameRate: 10,
                            repeat: -1
                     });
                     this.anims.create({
                            key: "caminar-arriba",
                            frames: this.anims.generateFrameNumbers("jugador_spritesheet", { frames: [48, 49, 50, 51] }),
                            frameRate: 10,
                            repeat: -1
                     });
              }

              // Añadir la imagen del mapa
              const mapa = this.add.image(0, 0, "mapaPueblo").setOrigin(0, 0);

              console.log(`Tamaño del mapa: ${mapa.width}x${mapa.height}`);

              // Inicializar el grid basado en el tamaño del mapa
              this.initializeGrid(mapa.width, mapa.height);

              // Dibujar el grid de debug
              this.drawGridDebug();

              console.log(`Grid creado: ${this.mapGrid[0].length} columnas x ${this.mapGrid.length} filas`);

              // Determinar posición inicial del jugador
              let startX = 32;
              let startY = 32;

              if (data && data.fromCasa) {
                     if (data.returnX !== undefined && data.returnY !== undefined) {
                            startX = data.returnX;
                            startY = data.returnY;
                     } else {
                            // Fallback por defecto
                            startX = 400;
                            startY = 400;
                     }
              }

              // Crear el jugador en una posición inicial
              this.jugador = new Jugador(this, startX, startY);

              // NUEVO: Configurar la cámara para seguir al jugador
              this.cameras.main.startFollow(this.jugador);
              this.cameras.main.setBounds(0, 0, mapa.width, mapa.height);

              // Opcional: suavizar el movimiento de la cámara
              this.cameras.main.setLerp(0.1, 0.1);
       }

       update() {
              // Actualizar el jugador cada frame
              if (this.jugador) {
                     this.jugador.update();

                     // Verificar si el jugador está en la entrada de la casa
                     const x = this.jugador.x;
                     const y = this.jugador.y;
                     const type = this.getCellType(x, y);

                     if (type === 4) {
                            this.scene.start("Casa", { entryX: x, entryY: y });
                     }
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
                            this.mapGrid[y][x] = 0;
                     }
              }

              // Ejemplo: definir zonas específicas
              // Bloquear una zona (paredes, árboles, etc.)
              //setGridArea(startX, startY, width, height, value)

              // Zonas bloqueadas eliminadas a petición del usuario
              // (Anteriormente líneas 99-110)

              // Entrada a Casa 2 (Abajo)
              // Entrada a Casa 2 (Abajo)
              this.setGridCell(11, 21, 4);
              this.setGridCell(12, 21, 4);
              this.setGridCell(11, 22, 4);
              this.setGridCell(12, 22, 4);

              // Entradas a edificios
              //this.setGridArea(20, 8, 6, 5, 2);

              // Zonas de batalla
              this.setGridArea(3, 3, 11, 4, 3);

              // Entrada a Casa
              this.setGridCell(20, 8, 4);

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

              return this.mapGrid[gridY][gridX] === 0 || this.mapGrid[gridY][gridX] === 4; // Suelo libre y entradas son caminables
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

       drawGridDebug() {
              const graphics = this.add.graphics();
              graphics.setDepth(1000);

              for (let y = 0; y < this.mapGrid.length; y++) {
                     for (let x = 0; x < this.mapGrid[y].length; x++) {
                            const value = this.mapGrid[y][x];
                            let color = 0x00ff00; // Verde - suelo libre
                            let alpha = 0.2;

                            if (value === 1) {
                                   color = 0xff0000; // Rojo - bloqueado
                                   alpha = 0.4;
                            }
                            if (value === 2) {
                                   color = 0x0000ff; // Azul - hospital
                                   alpha = 0.4;
                            }
                            if (value === 3) {
                                   color = 0x800080; // Morado - gimnasio
                                   alpha = 0.4;
                            }
                            if (value === 4) {
                                   color = 0xffff00; // Amarillo - casa
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