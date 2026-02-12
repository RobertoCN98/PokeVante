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
        this.setOrigin(0.5, 1); // Centrado horizontal, pie abajo
        this.setDepth(100); // Asegurar que se dibuja sobre el mapa

        // Variable para controles móviles
        this.mobileInput = null;
    }

    // Método para manejar input desde botones móviles
    handleMobileInput(direction) {
        if (this.moving) return;
        this.mobileInput = direction;
    }

    update() {
        if (this.moving) return;

        let targetX = this.x;
        let targetY = this.y;
        let newDirection = this.direction;
        let inputDetected = false;

        // Detectar input móvil primero
        if (this.mobileInput) {
            inputDetected = true;
            if (this.mobileInput === 'left') {
                targetX -= this.cellSize;
                newDirection = 3;
            } else if (this.mobileInput === 'right') {
                targetX += this.cellSize;
                newDirection = 1;
            } else if (this.mobileInput === 'up') {
                targetY -= this.cellSize;
                newDirection = 2;
            } else if (this.mobileInput === 'down') {
                targetY += this.cellSize;
                newDirection = 0;
            } else if (this.mobileInput === 'action') {
                // Botón E - por ahora no hace nada
                console.log("Botón de acción presionado");
            }
            this.mobileInput = null; // Resetear input móvil
        } 
        // Si no hay input móvil, detectar teclas
        else if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
            inputDetected = true;
            targetX -= this.cellSize;
            newDirection = 3; // izquierda
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
            inputDetected = true;
            targetX += this.cellSize;
            newDirection = 1; // derecha
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            inputDetected = true;
            targetY -= this.cellSize;
            newDirection = 2; // arriba
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
            inputDetected = true;
            targetY += this.cellSize;
            newDirection = 0; // abajo
        }

        if (!inputDetected) {
            return; // No se presionó ninguna tecla ni botón
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
                
                if (cellType === 2) {
                    console.log("🏥 Entraste al hospital!");
                } else if (cellType === 3) {
                    console.log("💪 Entraste al gimnasio!");
                } else if (cellType === 4 && this.scene.checkEncounter) {
                    // TILE_GRASS (4) triggers encounter check
                    console.log("🌿 En la hierba alta...");
                    this.scene.checkEncounter();
                } else if (cellType === 5 && this.scene.enterGym) {
                    // TILE_GYM_ENTRANCE (5) - Entrada al gimnasio
                    console.log("🏛️ Entrada al gimnasio detectada!");
                    this.scene.enterGym();
                } else if (cellType === 6 && this.scene.exitGym) {
                    // TILE_EXIT (6) - Salida del gimnasio
                    console.log("🚪 Salida del gimnasio detectada!");
                    this.scene.exitGym();
                }
            },
        });
    }
}