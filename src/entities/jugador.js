import Phaser from "phaser";

export default class Jugador extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "jugador", 0); // frame 0 = mirando abajo

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.cellSize = 32;   // tamaño de la celda (debe coincidir con CELL_SIZE)
        this.moving = false;  // bloquea movimiento mientras se anima
        this.direction = 0;   // 0=abajo, 1=derecha, 2=arriba, 3=izquierda

        // Teclas W/A/S/D
        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Ajuste del cuerpo para Phaser Arcade
        this.body.setSize(28, 28); // Ajustar hitbox más pequeña que el sprite
        this.body.setOffset(2, 2);
        this.setOrigin(0, 0); // alineación top-left para que cuadre con el grid
        this.setDepth(100); // Asegurar que se dibuje sobre el mapa
    }

    update() {
        // console.log("Jugador update running");
        if (this.moving) return;

        let targetX = this.x;
        let targetY = this.y;
        let newDirection = this.direction;

        // Detectar tecla presionada y calcular nueva posición
        // Detectar tecla presionada y calcular nueva posición
        if (this.keys.left.isDown) {
            targetX -= this.cellSize;
            newDirection = 3; // izquierda
        } else if (this.keys.right.isDown) {
            targetX += this.cellSize;
            newDirection = 1; // derecha
        } else if (this.keys.up.isDown) {
            targetY -= this.cellSize;
            newDirection = 2; // arriba
        } else if (this.keys.down.isDown) {
            targetY += this.cellSize;
            newDirection = 0; // abajo
        } else {
            return; // No se presionó ninguna tecla
        }

        // Cambiar el frame según la dirección
        this.setFrame(newDirection);
        this.direction = newDirection;

        // Verificar si la celda destino es transitable
        if (this.scene.isWalkable(targetX, targetY)) {
            this.moveTo(targetX, targetY);
        } else {
            console.log("❌ Celda bloqueada!");
        }
    }

    moveTo(targetX, targetY) {
        this.moving = true;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 150, // velocidad del movimiento
            onComplete: () => {
                this.moving = false;

                // Verificar tipo de celda al llegar
                const cellType = this.scene.getCellType(this.x, this.y);
                const gridX = Math.floor(this.x / 32);
                const gridY = Math.floor(this.y / 32);
                console.log(`Llegada a [${gridX}, ${gridY}], Tipo: ${cellType}`);

                if (cellType === 2) {
                    console.log("🏥 Entraste al hospital!");
                    this.scene.scene.start('Hospital', { party: this.pokemonParty, returnX: this.x, returnY: this.y + 32 });
                } else if (cellType === 3) {
                    console.log("💪 Entraste al gimnasio!");
                    this.scene.scene.start("Gimnasio");
                }
            },
        });
    }
}
