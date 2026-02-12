class Casa extends Phaser.Scene {
    constructor() {
        super('Casa');
    }

    preload() {
        this.load.image('mapaCasa', 'assets/map/casa.png');
        this.load.spritesheet('jugador', 'assets/sprites/jugador.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.add.image(0, 0, 'mapaCasa').setOrigin(0);

        this.playerParty = this.registry.get('playerParty') || [];
        const lastPos = this.registry.get('lastPos') || { x: 64, y: 64 };

        this.jugador = this.physics.add.sprite(lastPos.x, lastPos.y, 'jugador');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.tileSize = 32;
    }

    update() {
        let speed = 2;
        if (this.cursors.left.isDown) this.jugador.x -= speed;
        if (this.cursors.right.isDown) this.jugador.x += speed;
        if (this.cursors.up.isDown) this.jugador.y -= speed;
        if (this.cursors.down.isDown) this.jugador.y += speed;

        // Tile de salida a Pueblo (por ejemplo tile 10)
        const tile = this.getTileNumber(this.jugador.x, this.jugador.y);
        if (tile === 10) {
            this.registry.set('playerParty', this.playerParty);
            this.registry.set('lastScene', 'Casa');
            this.registry.set('lastPos', { x: this.jugador.x, y: this.jugador.y });
            this.scene.start('Pueblo');
        }
    }

    getTileNumber(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        return row * 10 + col;
    }
}
