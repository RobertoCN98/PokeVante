import Phaser from "phaser";
import Pueblo from "./scenes/pueblo.js";

import Gimnasio from "./scenes/gimnasio.js";

const config = {
    type: Phaser.AUTO,
    width: 640,  // ancho del canvas
    height: 480, // alto del canvas
    parent: "game", // id del div donde se incrusta el canvas
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
    scene: [Pueblo, Gimnasio], // agregamos la escena inicial y el gimnasio
};

const game = new Phaser.Game(config);
