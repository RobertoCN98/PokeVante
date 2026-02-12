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
              this.load.spritesheet("jugador", "assets/sprites/jugador_sprite.png", {
                     frameWidth: 32,
                     frameHeight: 32
              });
       }

       create(data) {
              console.log("CREATE PUEBLO");

              // Añadir la imagen del mapa
              const mapa = this.add.image(0, 0, "mapaPueblo").setOrigin(0, 0);

              console.log(`Tamaño del mapa: ${mapa.width}x${mapa.height}`);

              // Inicializar el grid basado en el tamaño del mapa
              this.initializeGrid(mapa.width, mapa.height);

              // Dibujar el grid de debug
              this.drawGridDebug();

              console.log(`Grid creado: ${this.mapGrid[0].length} columnas x ${this.mapGrid.length} filas`);

              // Crear el jugador
              // Si pasamos datos (x, y), usarlos. Si no, posición por defecto (32, 32)
              const startX = (data && data.x) ? data.x : 32;
              const startY = (data && data.y) ? data.y : 32;

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

              this.setGridArea(0, 23, 22, 2, 1); // NO TRANSITABLE
              this.setGridArea(19, 15, 3, 8, 1); // NO TRANSITABLE
              this.setGridArea(17, 14, 2, 3, 1); // NO TRANSITABLE
              this.setGridArea(20, 17, 14, 2, 1); // NO TRANSITABLE
              this.setGridArea(22, 15, 1, 2, 1); // NO TRANSITABLE
              this.setGridArea(21, 8, 2, 7, 1); // NO TRANSITABLE
              this.setGridArea(13, 8, 8, 2, 1); // NO TRANSITABLE
              this.setGridArea(7, 10, 8, 2, 1); // NO TRANSITABLE
              this.setGridArea(7, 7, 2, 3, 1); // NO TRANSITABLE
              this.setGridArea(23, 9, 22, 2, 1); // NO TRANSITABLE
              this.setGridArea(38, 7, 3, 2, 1); // NO TRANSITABLE
              this.setGridArea(27, 8, 3, 1, 1); // NO TRANSITABLE
              // Entradas a edificios
              //this.setGridArea(20, 8, 6, 5, 2);
              this.setGridArea(25, 3, 8, 5, 2);
              // Zonas de batalla
              // this.setGridArea(3, 3, 11, 4, 3); // OLD: Todo el gimnasio trigger
              // this.setGridArea(3, 3, 11, 4, 1); // Bloquear edificio del gimnasio
              // this.setGridArea(7, 6, 3, 1, 3); // Puerta del gimnasio (Tile type 3) - WIDER ENTRANCE

              // NUEVO GIMNASIO (Coordenadas actualizadas: 38,6; 39,6; 40,6)
              // this.setGridArea(26, 12, 6, 4, 1); // Bloqueo anterior (comentado)
              this.setGridArea(38, 6, 3, 1, 3); // Puerta en (38,6), (39,6), (40,6)

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

              return this.mapGrid[gridY][gridX] === 0 || this.mapGrid[gridY][gridX] === 2 || this.mapGrid[gridY][gridX] === 3; // Suelo libre y entradas
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