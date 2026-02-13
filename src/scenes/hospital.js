import Phaser from "phaser";
import Jugador from "../entities/jugador.js";

const CELL_SIZE = 32;

export default class Hospital extends Phaser.Scene {
    constructor() {
        super({ key: "Hospital" });
    }

    init(data) {
        console.log("INIT HOSPITAL", data);
        this.party = data.party || [];
        this.returnX = data.returnX || 32; // Default return position
        this.returnY = data.returnY || 32;
    }

    preload() {
        // Reuse assets loaded in Pueblo if they are global, 
        // otherwise we might need to load them again or ensure they are in a global cache.
        // Assuming 'jugador' sprite is already loaded or we load it here.
        if (!this.textures.exists("jugador")) {
            this.load.spritesheet("jugador", "assets/sprites/jugador_sprite.png", {
                frameWidth: 32,
                frameHeight: 32
            });
        }
        this.load.image("background", "assets/map/CentroPokevante.png");
    }

    create() {
        console.log("CREATE HOSPITAL");

        // 1. Initialize Grid
        this.initializeGrid();
        this.backGround =
            this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background")
                .setOrigin(0, 0)
                .setDepth(-1000);
        // Escalar el patrón para que el ALTO del tile encaje con el alto de la pantalla
        const tileH = this.textures.get("background").getSourceImage().height; // 1536
        const scaleY = this.scale.height / tileH;
        // Mantener proporción (mismo factor en X e Y)
        this.backGround.setTileScale(scaleY, scaleY);

        // 3. Nurse / Counter Area
        // Nurse at center top (approx 12, 4)
        this.nurseX = 12;
        this.nurseY = 4;
        // Debug rect for nurse
        // this.add.rectangle(this.nurseX * CELL_SIZE, this.nurseY * CELL_SIZE, CELL_SIZE, CELL_SIZE, 0xff0000, 0.5).setOrigin(0, 0);

        // 4. Player
        // Spawn player at bottom center
        const spawnX = 12 * CELL_SIZE;
        const spawnY = 16 * CELL_SIZE;
        this.jugador = new Jugador(this, spawnX, spawnY, this.party);

        // 5. Input for Interaction
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // 6. UI Text
        this.msgText = this.add.text(10, 550, "Muevete con WASD. Presiona 'E' frente a la enfermera para curar.", { color: "#000", fontSize: "20px" });

        // Exit zone debug text
        // this.add.text(12 * CELL_SIZE, 18 * CELL_SIZE, "SALIDA", { color: "#000", fontSize: "10px" });
    }

    update() {
        if (this.jugador) {
            this.jugador.update();

            // Interaction logic
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.checkHeal();
            }

            // Exit logic
            // If player walks into the exit (bottom center), return to Pueblo
            const pGridX = Math.round(this.jugador.x / CELL_SIZE);
            const pGridY = Math.round(this.jugador.y / CELL_SIZE);

            // Exit at bottom row (18) around center (11, 12, 13)
            if (pGridY >= 18 && (pGridX >= 11 && pGridX <= 13)) {
                this.scene.start('Pueblo', { party: this.party, x: this.returnX, y: this.returnY });
            }
        }
    }

    checkHeal() {
        // Check if player is adjacent to Nurse
        const pGridX = Math.round(this.jugador.x / CELL_SIZE);
        const pGridY = Math.round(this.jugador.y / CELL_SIZE);

        const dist = Phaser.Math.Distance.Between(pGridX, pGridY, this.nurseX, this.nurseY);

        // Distance < 3 because counter is in between
        if (dist <= 2.5) {
            console.log("Intentando curar...");
            this.healParty();
        } else {
            this.msgText.setText("Acércate más a la enfermera.");
        }
    }

    healParty() {
        if (!this.party || this.party.length === 0) return;

        let healedCount = 0;
        this.party.forEach(p => {
            p.curacionCompleta();
            healedCount++;
        });

        this.msgText.setText(`¡Tu equipo (${healedCount} pokemons) ha sido curado!`);

        // Visual feedback
        this.cameras.main.flash(500, 0, 255, 0);
    }

    initializeGrid() {
        const cols = 25; // 800 / 32
        const rows = 19; // 600 / 32
        this.mapGrid = [];

        for (let y = 0; y < rows; y++) {
            this.mapGrid[y] = [];
            for (let x = 0; x < cols; x++) {
                // Default walkable
                this.mapGrid[y][x] = 0;

                // Walls around
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    this.mapGrid[y][x] = 1; // Blocked
                }
            }
        }

        // Salida (desbloquear pared abajo centro)
        this.mapGrid[18][11] = 0;
        this.mapGrid[18][12] = 0;
        this.mapGrid[18][13] = 0;

        // Counter / Nurse Area
        // Bloquear recuadro alrededor de la enfermera
        // Nurse at 12,4. Counter likely at row 5.

        // Bloquear fila 5 (mostrador)
        for (let x = 10; x <= 14; x++) {
            this.mapGrid[5][x] = 1;
        }

        // Bloquear detrás del mostrador (donde está la enfermera)
        for (let x = 10; x <= 14; x++) {
            this.mapGrid[4][x] = 1;
        }

        // Bloquear otras decoraciones típicas (esquinas, plantas) si es necesario
        // Por ahora dejamos el resto libre
    }

    // Required by Jugador
    isWalkable(x, y) {
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);

        if (!this.mapGrid[gridY] || this.mapGrid[gridY][gridX] === undefined) {
            return false;
        }
        return this.mapGrid[gridY][gridX] === 0;
    }

    // Required by Jugador
    getCellType(x, y) {
        // We don't have special cell types here yet, just return 0
        return 0;
    }

    drawGridDebug() {
        const graphics = this.add.graphics();
        // White background floor

        for (let y = 0; y < this.mapGrid.length; y++) {
            for (let x = 0; x < this.mapGrid[y].length; x++) {
                const value = this.mapGrid[y][x];
                let color = 0xffffff;
                if (value === 1) color = 0x555555; // Wall

                graphics.fillStyle(color, 1);
                graphics.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                graphics.lineStyle(1, 0xcccccc, 1);
                graphics.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}
