import Phaser from "phaser";
import Jugador from "../entities/jugador.js";

export default class Casa extends Phaser.Scene {
    constructor() {
        super({ key: "Casa" });
    }

    preload() {
        this.load.image("casa", "assets/map/casa.jpg");
        // Cargar spritesheet (igual que en Pueblo)
        this.load.spritesheet("jugador_spritesheet", "assets/sprites/jugadorPequeño.png", {
            frameWidth: 280,
            frameHeight: 928
        });
    }

    create(data) {
        this.entryData = data;

        // Crear animaciones globales si no existen (copiado de Pueblo)
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

        // Add background image
        const mapa = this.add.image(0, 0, "casa").setOrigin(0, 0);
        mapa.setScale(0.75); // Scale down to make it look "less amplified"

        // Set world bounds to match the SCALED image size
        this.physics.world.setBounds(0, 0, mapa.displayWidth, mapa.displayHeight);

        // Create player at the center/default spawn
        const centerX = mapa.displayWidth / 2;
        // Spawn 1 tile above the exit (moved further down for more space)
        const spawnY = mapa.displayHeight - 128;
        this.jugador = new Jugador(this, centerX, spawnY);

        // Camera follow
        this.cameras.main.startFollow(this.jugador);
        this.cameras.main.setBounds(0, 0, mapa.displayWidth, mapa.displayHeight);

        // Text for interaction
        const cameraWidth = this.cameras.main.width;
        const cameraHeight = this.cameras.main.height;

        this.interactionText = this.add.text(cameraWidth / 2, cameraHeight - 30, "Es una Nintendo Switch", {
            fontSize: "18px",
            fill: "#000000",
            backgroundColor: "#ffffff",
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setScrollFactor(0) // Fix to camera
            .setDepth(1000)
            .setVisible(false);

        // DEBUG: Draw collision zones
        this.drawDebug();
    }

    update() {
        if (this.jugador) {
            this.jugador.update();

            // Check if player moves out of bounds at the bottom to trigger exit
            // Exit trigger closer to bottom for more space
            if (this.jugador.y >= this.physics.world.bounds.height - 96) {
                let returnX = 400;
                let returnY = 400;

                if (this.entryData && this.entryData.entryX !== undefined) {
                    returnX = this.entryData.entryX;
                    returnY = this.entryData.entryY + 32; // Spawn below the entrance
                }

                this.scene.start("Pueblo", { fromCasa: true, returnX: returnX, returnY: returnY });
            }

            // Check for interaction with the "Nintendo Switch"
            const centerX = this.physics.world.bounds.width / 2;
            const centerY = this.physics.world.bounds.height / 2;

            // Interaction point matches the new table bottom
            // Table moved down 2 tiles + extended 2 tiles (total +128), starts at centerY + 64
            // Table Bottom is centerY + 64 + 160 = centerY + 224
            const interactionX = centerX;
            const interactionY = centerY + 224 + 16;

            const dist = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, interactionX, interactionY);

            if (dist < 50) {
                this.interactionText.setVisible(true);
            } else {
                this.interactionText.setVisible(false);
            }
        }
    }

    // Allow movement anywhere within the world bounds, EXCEPT table and walls
    isWalkable(x, y) {
        const width = this.physics.world.bounds.width;
        const height = this.physics.world.bounds.height;

        // Check world bounds
        if (x < 0 || x > width || y < 0 || y > height) {
            return false;
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const spawnY = height - 128;

        // Hallway Top: Create passage between table and hallway
        // Table ends at centerY + 224, hallway starts lower to create space
        const hallwayTop = centerY + 288;

        // 1. Table Collision: Extended 2 more tiles down
        // New: y starts at centerY + 64, height is 160px (96 + 64)
        if (x > centerX - 128 && x < centerX + 96 &&
            y > centerY + 64 && y < centerY + 224) {
            return false;
        }

        // 2. Hallway / Entrance Walls
        if (y > hallwayTop) {
            // Left Passage Wall: x < centerX - 64
            if (x < centerX - 64) return false;

            // Right Passage Wall: moved 1 tile right
            // Previous: x > centerX + 32 (+1 tile)
            // New: x > centerX + 64 (+2 tiles)
            if (x > centerX + 64) return false;
        } else {
            // 3. Upper Area Walls
            // Top Wall: extended 1 tile down
            if (y < centerY - 96) {
                return false;
            }

            // Right Wall: moved 1 tile right (32px)
            // Previous: x > centerX + 192
            // New: x > centerX + 224
            if (x > centerX + 224) {
                return false;
            }
            // Left Wall: 3 tiles (96px) left of table (table left is -128) -> -224
            if (x < centerX - 224) {
                return false;
            }

            // 4. Upper Right Corner (L-shaped)
            // Vertical part: 2 tiles down from top (64px)
            // Horizontal part: 6 tiles left from right (192px)
            const cornerVerticalHeight = 64; // 2 tiles down
            const cornerHorizontalWidth = 192; // 6 tiles left

            // Right edge of the room
            const rightEdge = width;

            // Vertical part of corner: from right edge, going left until cornerHorizontalWidth
            // From top to cornerVerticalHeight down
            if (x > rightEdge - cornerHorizontalWidth && y < cornerVerticalHeight) {
                return false;
            }
        }

        return true;
    }

    drawDebug() {
        const graphics = this.add.graphics();
        graphics.setDepth(900);
        graphics.fillStyle(0xff0000, 0.5); // Red, semi-transparent

        const width = this.physics.world.bounds.width;
        const height = this.physics.world.bounds.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const spawnY = height - 128;
        const hallwayTop = centerY + 288;

        // Draw Table (moved down 64px, height extended to 160px)
        graphics.fillRect(centerX - 128, centerY + 64, 224, 160);

        // Draw Upper Right Wall (above Hallway) - moved 1 tile right
        graphics.fillRect(centerX + 224, 0, width - (centerX + 224), hallwayTop);

        // Draw Upper Left Wall
        graphics.fillRect(0, 0, centerX - 224, hallwayTop);

        // Draw Top Wall (extended 1 tile down)
        graphics.fillRect(0, 0, width, centerY - 96);

        // Draw Upper Right Corner (L-shaped)
        // Horizontal part: 6 tiles (192px) from right edge, 2 tiles (64px) tall
        graphics.fillRect(width - 192, 0, 192, 64);

        // Draw Hallway Left Wall (Bottom)
        // From x=0 to x=centerX-64
        graphics.fillRect(0, hallwayTop, centerX - 64, height - hallwayTop);

        // Draw Hallway Right Wall (Bottom) - moved 1 tile right
        // From x=centerX+64 to width
        graphics.fillRect(centerX + 64, hallwayTop, width - (centerX + 64), height - hallwayTop);
    }

    getCellType(x, y) {
        return 0; // Default to normal ground
    }
}