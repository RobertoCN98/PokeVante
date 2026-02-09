import Phaser from "phaser";
import Pueblo from "./scenes/pueblo.js";
// token: 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
const config = {
    type: Phaser.AUTO,
    width: 640,  // ancho del canvas
    height: 480, // alto del canvas
    parent: "game", // id del div donde se incrusta el canvas
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scene: [Pueblo], // agregamos la escena inicial
};

const game = new Phaser.Game(config);
