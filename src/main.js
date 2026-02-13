import Phaser from "phaser";
import Pueblo from "./scenes/pueblo.js";
import Hospital from "./scenes/hospital.js";
import Gimnasio from "./scenes/gimnasio.js";
import GameOver from "./scenes/gameover.js";
import Combate from "./scenes/combate.js";
import Victoria from "./scenes/victoria.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
    scene: [Pueblo, Gimnasio, Hospital, Combate, GameOver, Victoria],
};

const game = new Phaser.Game(config);
