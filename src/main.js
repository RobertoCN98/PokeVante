import Phaser from "phaser";
import Pueblo from "./scenes/pueblo.js";
import Combate from "./scenes/combate.js";

const config = {
    type: Phaser.AUTO,
    width: 800,  // ancho del canvas
    height: 600, // alto del canvas
    parent: "game", // id del div donde se incrusta el canvas
    scale: {
        mode: Phaser.Scale.FIT, // Ajustar al tamaño de la ventana
        autoCenter: Phaser.Scale.CENTER_BOTH // Centrar horizontal y verticalmente
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scene: [Pueblo, Combate],
};

const game = new Phaser.Game(config);
