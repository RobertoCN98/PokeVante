import Phaser from "phaser";

export default class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: "GameOver" });
    }

    preload() {
        console.log("PRELOAD GAMEOVER");
        this.load.image("gameoverImage", "assets/map/gameover.png");
    }

    create() {
        console.log("CREATE GAMEOVER");

        // Añadir la imagen de game over centrada
        const gameoverImg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "gameoverImage"
        );

        // Escalar la imagen para que quepa en la pantalla si es muy grande
        const scaleX = this.cameras.main.width / gameoverImg.width;
        const scaleY = this.cameras.main.height / gameoverImg.height;
        const scale = Math.min(scaleX, scaleY, 1); // No hacer más grande, solo más pequeño si es necesario
        gameoverImg.setScale(scale);

        // Crear botón de reinicio
        const restartButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            "REINICIAR JUEGO",
            {
                fontSize: "32px",
                fontFamily: "Arial",
                color: "#ffffff",
                backgroundColor: "#ff0000",
                padding: { x: 20, y: 10 },
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Evento de click en el botón
        restartButton.on("pointerdown", () => {
            this.restartGame();
        });

        // También permitir reiniciar con Enter o Espacio
        this.input.keyboard.on("keydown-ENTER", () => {
            this.restartGame();
        });

        this.input.keyboard.on("keydown-SPACE", () => {
            this.restartGame();
        });
    }

    restartGame() {
        console.log("Reiniciando juego...");

        // Limpiar todo el registry (borrar progreso)
        this.registry.destroy();
        this.registry.list = {};

        // Detener todas las escenas
        this.scene.stop("GameOver");
        this.scene.stop("Combate");
        this.scene.stop("Gimnasio");
        this.scene.stop("Pueblo");

        // Reiniciar desde Pueblo
        this.scene.start("Pueblo");
    }
}