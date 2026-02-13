import Phaser from "phaser";

export default class Victoria extends Phaser.Scene {
    constructor() {
        super({ key: "Victoria" });
    }

    create() {
        console.log("CREATE VICTORIA");

        // Fondo oscuro
        this.cameras.main.setBackgroundColor('#000000');

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Mensaje del líder de gimnasio
        const mensajeLider = this.add.text(centerX, centerY - 80,
            '🏆 ¡FELICIDADES! 🏆',
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Comentario del líder
        const comentario = this.add.text(centerX, centerY + 10,
            '"Eres digno de ser líder de gimnasio.\n¡Has demostrado tu valía como entrenador!"',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5);

        // Firma del líder
        const firma = this.add.text(centerX, centerY + 100,
            '- Líder de Gimnasio',
            {
                fontSize: '22px',
                fontFamily: 'Arial',
                color: '#aaaaaa'
            }
        ).setOrigin(0.5);

        // Texto de FIN DEL JUEGO
        const finTexto = this.add.text(centerX, centerY + 180,
            '¡FIN DEL JUEGO!',
            {
                fontSize: '36px',
                fontFamily: 'Arial',
                color: '#ff4444',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Animación de parpadeo en el texto de fin
        this.tweens.add({
            targets: finTexto,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Botón de reiniciar
        const restartButton = this.add.text(centerX, centerY + 250,
            'VOLVER A JUGAR',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#2ecc71',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartButton.on('pointerover', () => restartButton.setStyle({ backgroundColor: '#27ae60' }));
        restartButton.on('pointerout', () => restartButton.setStyle({ backgroundColor: '#2ecc71' }));
        restartButton.on('pointerdown', () => this.restartGame());

        // También con Enter o Espacio
        this.input.keyboard.on('keydown-ENTER', () => this.restartGame());
        this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
    }

    restartGame() {
        console.log("Reiniciando juego desde Victoria...");

        this.registry.destroy();
        this.registry.list = {};

        this.scene.stop('Victoria');
        this.scene.stop('Combate');
        this.scene.stop('Gimnasio');
        this.scene.stop('Pueblo');

        this.scene.start('Pueblo');
    }
}
