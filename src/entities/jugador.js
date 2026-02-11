import Phaser from "phaser";

export default class Jugador extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "jugador_spritesheet", 0); // Frame inicial 0 (Abajo)

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.cellSize = 32;   // tamaño de la celda
        this.moving = false;
        this.direction = 0;   // 0=abajo, 1=derecha, 2=izquierda, 3=arriba

        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // --- AJUSTES DE ESCALA Y ORIGEN ---
        // Objetivo: 1x2 casillas = 32x64 px.
        // Origen en la parte inferior centrada (0.5, 1) para "pisar" bien.
        this.setOrigin(0.5, 1);
        this.setDepth(100);

        // Frame original estimado: 280x928 (o lo que cargue Phaser).
        // Queremos que el sprite sea VISUALMENTE más grande (180% de la celda).
        const scaleFactor = 1.8;
        const targetW = 32 * scaleFactor;
        const targetH = 64 * scaleFactor;

        let finalScale = 0.09; // Valor por defecto seguro para fallback

        if (this.width > 0 && this.height > 0) {
            const sX = targetW / this.width;
            const sY = targetH / this.height;
            // "Manteniendo la proporción original" -> Usar Math.min para 'contain'
            finalScale = Math.min(sX, sY);

            // Aplicar escala calculada
            this.setScale(finalScale);

            // --- COLLIDER ---
            // El collider debe permanecer en tamaño lógico de pies (24x24 world pixels).
            // Phaser escala el body junto con el sprite.
            // Para mantener 24px world size: unscaledBodySize = 24 / finalScale.

            const unscaledBodySize = 24 / finalScale;
            this.body.setSize(unscaledBodySize, unscaledBodySize);

            // Offset para centrar abajo (Origin 0.5, 1)
            // Body Top-Left relative to Texture Top-Left (unscaled).
            const offX = (this.width - unscaledBodySize) / 2;
            const offY = this.height - unscaledBodySize;
            this.body.setOffset(offX, offY);

        } else {
            // Fallback: usaremos valores hardcoded para la textura de 280x928 y scale ~0.09
            // Scale ~ 0.09
            this.setScale(finalScale);
            // Unscaled Body ~ 266 (24 / 0.09)
            this.body.setSize(266, 266);
            this.body.setOffset((280 - 266) / 2, 928 - 266);
        }
    }

    update() {
        if (this.moving) return;

        let targetX = this.x;
        let targetY = this.y;
        let newDirection = this.direction;

        // Detectar tecla
        if (this.keys.left.isDown) {
            targetX -= this.cellSize;
            newDirection = 1; // mover izquierda -> frame 2
        } else if (this.keys.right.isDown) {
            targetX += this.cellSize;
            newDirection = 2; // mover derecha -> frame 1
        } else if (this.keys.up.isDown) {
            targetY -= this.cellSize;
            newDirection = 3; // mover arriba -> frame 3
        } else if (this.keys.down.isDown) {
            targetY += this.cellSize;
            newDirection = 0; // mover abajo -> frame 0
        } else {
            return;
        }

        this.direction = newDirection;
        this.updateFrame(); // Actualizar frame según dirección

        // Verificar si la celda destino es transitable
        if (this.scene.isWalkable(targetX, targetY)) {
            this.moveTo(targetX, targetY);
        }
    }

    updateFrame() {
        // Frame 0: Abajo
        // Frame 1: Derecha (según corrección usuario)
        // Frame 2: Izquierda (según corrección usuario)
        // Frame 3: Arriba

        if (this.direction === 0) {
            this.setFrame(0); // Abajo
        } else if (this.direction === 1) {
            this.setFrame(2); // Izquierda (según corrección: Mover Izquierda -> Frame 2)
        } else if (this.direction === 2) {
            this.setFrame(1); // Derecha (según corrección: Mover Derecha -> Frame 1)
        } else if (this.direction === 3) {
            this.setFrame(3); // Arriba
        }
    }

    moveTo(targetX, targetY) {
        this.moving = true;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 150,
            onComplete: () => {
                this.moving = false;
                this.updateFrame(); // Asegurar frame correcto al parar

                const cellType = this.scene.getCellType(this.x, this.y);
                if (cellType === 2) console.log("🏥 Hospital");
                else if (cellType === 3) console.log("💪 Gimnasio");
            },
        });
    }
}