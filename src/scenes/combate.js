export default class Combate extends Phaser.Scene {
    constructor() {
        super('Combate');
    }

    init(data) {
        console.log("Combate: init", data);
        if (!data || !data.playerParty || !data.enemyPokemon) {
            console.error("Combate: Faltan datos necesarios!", data);
            return;
        }
        this.playerParty = data.playerParty;
        this.enemyPokemon = data.enemyPokemon;
        this.currentPokemon = this.playerParty[0];
        console.log("Combate: Datos cargados. Jugador:", this.currentPokemon, "Enemigo:", this.enemyPokemon);
    }

    preload() {
        console.log("Combate: preload");
        // Cargar fondo
        this.load.image("fondo_combate", "assets/battle/combate.png");

        // Configuración de dimensiones y ajustes visuales para cada Pokemon
        this.SPRITE_CONFIG = {
            "charizard": {
                frameWidth: 381, frameHeight: 346,
                scale: 0.8, yOffsetPlayer: 0, yOffsetEnemy: 0
            },
            "samurott": {
                frameWidth: 336, frameHeight: 338,
                scale: 0.7, yOffsetPlayer: 20, yOffsetEnemy: 20
            },
            "serperior": {
                frameWidth: 393, frameHeight: 403,
                scale: 0.65, yOffsetPlayer: 10, yOffsetEnemy: 10
            },
            "cinderace": {
                frameWidth: 235, frameHeight: 435,
                scale: 0.6, yOffsetPlayer: 30, yOffsetEnemy: 30
            },
            "typhlosion": {
                frameWidth: 517, frameHeight: 511,
                scale: 0.5, yOffsetPlayer: 50, yOffsetEnemy: 50
            },
            "blastoise": {
                frameWidth: 200, frameHeight: 200,
                scale: 1.1, yOffsetPlayer: 0, yOffsetEnemy: 0
            },
            "feraligatr": {
                frameWidth: 325, frameHeight: 237,
                scale: 0.9, yOffsetPlayer: 0, yOffsetEnemy: 0
            },
            "sceptile": {
                frameWidth: 228, frameHeight: 239,
                scale: 1.0, yOffsetPlayer: 0, yOffsetEnemy: 0
            },
            "meganium": {
                frameWidth: 168, frameHeight: 174,
                scale: 1.3, yOffsetPlayer: 0, yOffsetEnemy: 0
            }
        };

        // Cargar sprites frontales y traseros usando las dimensiones configuradas
        Object.keys(this.SPRITE_CONFIG).forEach(nombre => {
            const config = this.SPRITE_CONFIG[nombre];
            // Frontal
            this.load.spritesheet(nombre, `assets/pokevones/${nombre}.png`, { frameWidth: config.frameWidth, frameHeight: config.frameHeight });
            // Trasero
            this.load.spritesheet(`${nombre}ES`, `assets/pokevones/${nombre}ES.png`, { frameWidth: config.frameWidth, frameHeight: config.frameHeight });
        });

        // Cargar otros si es necesario (legacy)
        this.load.image("squirtle", "assets/pokevones/squirtle.png");
    }

    create() {
        console.log("Combate: create");
        try {
            // Fondo - Ajustado a 800x600
            this.add.image(0, 0, 'fondo_combate').setOrigin(0).setDisplaySize(800, 600);

            // Enemy Sprite - Posición ajustada (Frontal)
            if (!this.enemyPokemon) throw new Error("No hay enemigo definido");

            // Usamos el sprite definido en pokevon.js y quitamos .png si existe
            let enemyKey = this.enemyPokemon.sprite.replace('.png', '');
            console.log("Combate: Creando sprite enemigo con key:", enemyKey);

            // Configuración por defecto
            let enemyScale = 0.8;
            let enemyY = 220;
            const config = this.SPRITE_CONFIG[enemyKey];

            if (config) {
                enemyScale = config.scale;
                if (config.yOffsetEnemy) enemyY += config.yOffsetEnemy;
            }

            this.enemySprite = this.add.sprite(600, enemyY, enemyKey).setScale(enemyScale);
            if (config) {
                this.enemySprite.setFrame(0);
            }

            // Player Sprite - Posición ajustada (Trasero / Espalda)
            if (!this.currentPokemon) throw new Error("No hay pokemon actual definido");

            let playerKey = this.currentPokemon.sprite.replace('.png', '');
            let backKey = playerKey + "ES";

            // Verificar si la textura existe, si no usar la normal
            // Nota: Para spritesheets, textures.exists funciona igual
            if (!this.textures.exists(backKey)) {
                console.warn(`Sprite trasero ${backKey} no encontrado, usando frontal.`);
                backKey = playerKey;
            }

            console.log("Combate: Creando sprite jugador con key:", backKey);

            let playerScale = 0.8;
            let playerY = 420;
            const pConfig = this.SPRITE_CONFIG[playerKey]; // Usamos la config del pokemon base

            if (pConfig) {
                playerScale = pConfig.scale;
                if (pConfig.yOffsetPlayer) playerY += pConfig.yOffsetPlayer;
            }

            this.playerSprite = this.add.sprite(220, playerY, backKey).setScale(playerScale);
            if (pConfig) {
                this.playerSprite.setFrame(0);
            }

            // UI Panel Fondo (Parte inferior completa) con Depth alto
            this.add.rectangle(0, 450, 800, 150, 0x2c3e50).setOrigin(0).setAlpha(0.9).setDepth(10);
            this.add.rectangle(0, 450, 800, 5, 0xffffff).setOrigin(0).setDepth(10);

            // Botón Fullscreen (Icono cuadrado en la esquina superior derecha del panel UI)
            const btnFullscreen = this.add.text(790, 460, '⛶', { fontSize: '30px', fill: '#ffffff' })
                .setOrigin(1, 0)
                .setDepth(30)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    if (this.scale.isFullscreen) {
                        this.scale.stopFullscreen();
                    } else {
                        this.scale.startFullscreen();
                    }
                });

            // Ajustar orientación: El que esté más arriba se invierte
            this.verificarOrientacion();

            // Barras de Vida e Info
            this.crearInterfazCombate();

            // Menu Container
            this.crearMenuPrincipal();

            // Log de batalla (Texto abajo a la izquierda)
            this.logText = this.add.text(30, 470, `¡Un ${this.enemyPokemon.nombre} salvaje apareció!`, {
                fontSize: '24px',
                fill: '#ffffff',
                wordWrap: { width: 450 }
            }).setDepth(20);

            console.log("Combate: create finalizado correctamente");
        } catch (error) {
            console.error("ERROR CRÍTICO EN COMBATE CREATE:", error);
            this.add.text(100, 100, "ERROR EN COMBATE:\n" + error.message, { fill: '#ff0000', fontSize: '24px' });
        }
    }

    crearInterfazCombate() {
        // --- Interfaz Enemigo (Arriba Izquierda) ---
        this.enemyHUD = this.add.container(50, 50);
        this.enemyHUD.setDepth(15);

        // Base
        this.enemyHUD.add(this.add.rectangle(0, 0, 350, 100, 0x000000, 0.6).setOrigin(0));
        // Nombre y Nivel
        this.enemyNameText = this.add.text(20, 15, `${this.enemyPokemon.nombre} Lv.${this.enemyPokemon.nivel}`, { fontSize: '24px', fill: '#fff' });
        this.enemyHUD.add(this.enemyNameText);
        // Barra Vida Fondo
        this.enemyHUD.add(this.add.rectangle(20, 55, 310, 25, 0x555555).setOrigin(0));
        // Barra Vida Actual
        this.enemyHPBar = this.add.rectangle(20, 55, 310, 25, 0x00ff00).setOrigin(0);
        this.enemyHUD.add(this.enemyHPBar);

        // --- Interfaz Jugador (Encima del menú, lado derecho) ---
        this.playerHUD = this.add.container(420, 330);
        this.playerHUD.setDepth(15);

        // Base
        this.playerHUD.add(this.add.rectangle(0, 0, 350, 100, 0x000000, 0.6).setOrigin(0));
        // Nombre y Nivel
        this.playerNameText = this.add.text(20, 15, `${this.currentPokemon.nombre} Lv.${this.currentPokemon.nivel}`, { fontSize: '24px', fill: '#fff' });
        this.playerHUD.add(this.playerNameText);
        // Barra Vida Fondo
        this.playerHUD.add(this.add.rectangle(20, 55, 310, 25, 0x555555).setOrigin(0));
        // Barra Vida Actual
        this.playerHPBar = this.add.rectangle(20, 55, 310, 25, 0x00ff00).setOrigin(0);
        this.playerHUD.add(this.playerHPBar);
        // Texto HP Numérico
        this.playerHPText = this.add.text(330, 85, `${this.currentPokemon.vida}/${this.currentPokemon.vidaMax}`, { fontSize: '20px', fill: '#fff' }).setOrigin(1, 0);
        this.playerHUD.add(this.playerHPText);

        this.actualizarBarrasVida();
    }

    actualizarBarrasVida() {
        // Actualizar Enemigo
        const enemyPerfil = this.enemyPokemon.vida / this.enemyPokemon.vidaMax;
        this.enemyHPBar.width = 310 * Math.max(0, enemyPerfil);
        this.enemyHPBar.fillColor = this.getColorVida(enemyPerfil);

        // Actualizar Jugador
        const playerPerfil = this.currentPokemon.vida / this.currentPokemon.vidaMax;
        this.playerHPBar.width = 310 * Math.max(0, playerPerfil);
        this.playerHPBar.fillColor = this.getColorVida(playerPerfil);
        this.playerHPText.setText(`${Math.max(0, this.currentPokemon.vida)}/${this.currentPokemon.vidaMax}`);

        // Actualizar Nombres
        this.playerNameText.setText(`${this.currentPokemon.nombre} Lv.${this.currentPokemon.nivel}`);
        this.enemyNameText.setText(`${this.enemyPokemon.nombre} Lv.${this.enemyPokemon.nivel}`);
    }

    getColorVida(porcentaje) {
        if (porcentaje > 0.5) return 0x00ff00; // Verde
        if (porcentaje > 0.2) return 0xffff00; // Amarillo
        return 0xff0000; // Rojo
    }

    crearMenuPrincipal() {
        if (this.menuGroup) this.menuGroup.destroy();
        // Usar Container en lugar de Group para mejor manejo
        this.menuGroup = this.add.container(0, 0);
        this.menuGroup.setDepth(20); // Asegurar que esté encima

        const xBase = 480;
        const yBase = 470;
        const spacingX = 150;
        const spacingY = 55;

        this.crearBoton(this.menuGroup, xBase, yBase, 'Luchar', 0xffffff, () => this.mostrarMovimientos());
        this.crearBoton(this.menuGroup, xBase + spacingX, yBase, 'Cambiar', 0xffffff, () => this.cambiarPokemon());
        this.crearBoton(this.menuGroup, xBase, yBase + spacingY, 'Mochila', 0xffffff, () => this.usarObjeto());
        this.crearBoton(this.menuGroup, xBase + spacingX, yBase + spacingY, 'Huir', 0xffffff, () => this.huir());
    }

    crearBoton(container, x, y, texto, color, callback) {
        const btnBg = this.add.rectangle(x, y, 140, 45, color)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback)
            .on('pointerover', () => btnBg.setFillStyle(0xdddddd))
            .on('pointerout', () => btnBg.setFillStyle(color));

        const btnText = this.add.text(x + 70, y + 22, texto, { fontSize: '20px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);

        container.add(btnBg);
        container.add(btnText);
    }

    mostrarMovimientos() {
        this.menuGroup.setVisible(false);

        if (this.moveGroup) this.moveGroup.destroy();
        this.moveGroup = this.add.container(0, 0);
        this.moveGroup.setDepth(20);

        let x = 480;
        let y = 470;

        this.currentPokemon.movimientos.forEach((mov, index) => {
            // Fondo botón ataque
            const btnBg = this.add.rectangle(x, y, 140, 45, 0xffffff)
                .setOrigin(0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.turnoJugador(mov);
                    this.moveGroup.destroy();
                    this.menuGroup.setVisible(true);
                });

            const btnText = this.add.text(x + 70, y + 15, mov.nombre, { fontSize: '18px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);
            const tipoText = this.add.text(x + 70, y + 35, mov.tipo.toUpperCase(), { fontSize: '12px', fill: '#555' }).setOrigin(0.5);

            this.moveGroup.add(btnBg);
            this.moveGroup.add(btnText);
            this.moveGroup.add(tipoText);

            if (index === 1) {
                x = 480;
                y += 55;
            } else {
                x += 150;
            }
        });

        // Botón Volver
        const btnBgVolver = this.add.rectangle(780, 580, 80, 30, 0x000000, 0).setOrigin(1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.moveGroup.destroy();
                this.menuGroup.setVisible(true);
                this.logText.setText("Selecciona una acción.");
            });

        const btnVolver = this.add.text(780, 580, 'Atrás', { fontSize: '18px', fill: '#ff5555', fontStyle: 'bold' })
            .setOrigin(1);

        this.moveGroup.add(btnBgVolver);
        this.moveGroup.add(btnVolver);

        this.logText.setText("Selecciona un ataque.");
    }

    turnoJugador(movimiento) {
        this.menuGroup.setVisible(false);
        if (this.moveGroup) this.moveGroup.setVisible(false);

        // Atacar
        const resultado = this.currentPokemon.atacar(this.enemyPokemon, movimiento);
        this.logText.setText(`${this.currentPokemon.nombre} usa ${movimiento.nombre}!`);

        // Animación simple (parpadeo enemigo)
        this.tweens.add({
            targets: this.enemySprite,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.actualizarUIEnemigo();
                // Simplificado el mensaje de critico/eficacia por ahora
                // Calculamos porcentaje de daño para descripción
                const percent = (resultado.dañoInfligido / this.enemyPokemon.vidaMax) * 100;
                if (percent > 50) this.logText.setText("¡Es muy eficaz!");
                else this.logText.setText(`¡ ${this.enemyPokemon.nombre} recibe daño!`);

                if (this.enemyPokemon.debilitado) {
                    this.time.delayedCall(1000, () => {
                        this.logText.setText(`¡${this.enemyPokemon.nombre} se debilitó! ¡Ganaste!`);
                        this.time.delayedCall(2000, () => this.salirCombate(true));
                    });
                } else {
                    this.time.delayedCall(1500, () => this.turnoEnemigo());
                }
            }
        });
    }

    turnoEnemigo() {
        const moves = this.enemyPokemon.movimientos;
        const mov = moves[Math.floor(Math.random() * moves.length)];

        this.logText.setText(`${this.enemyPokemon.nombre} usa ${mov.nombre}!`);

        const resultado = this.enemyPokemon.atacar(this.currentPokemon, mov);

        this.tweens.add({
            targets: this.playerSprite,
            x: this.playerSprite.x - 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.actualizarUIJugador();

                if (this.currentPokemon.debilitado) {
                    this.time.delayedCall(1000, () => {
                        this.logText.setText(`¡${this.currentPokemon.nombre} se debilitó!`);
                        const quedanVivos = this.playerParty.some(p => !p.debilitado);
                        if (quedanVivos) {
                            this.time.delayedCall(2000, () => this.cambiarPokemon(true));
                        } else {
                            this.time.delayedCall(2000, () => this.salirCombate(false));
                        }
                    });
                } else {
                    this.menuGroup.setVisible(true);
                    this.logText.setText(`¿Qué hará ${this.currentPokemon.nombre}?`);
                }
            }
        });
    }

    actualizarUIEnemigo() {
        this.actualizarBarrasVida();
    }

    actualizarUIJugador() {
        this.actualizarBarrasVida();
        this.playerSprite.setTexture(this.currentPokemon.sprite);
    }

    verificarOrientacion() {
        // Encontrar cual está más arriba (menor Y)
        if (this.enemySprite.y < this.playerSprite.y) {
            this.enemySprite.setFlipX(true);
            this.playerSprite.setFlipX(false);
        } else {
            this.enemySprite.setFlipX(false);
            this.playerSprite.setFlipX(true);
        }
    }

    cambiarPokemon(forzado = false) {
        let nuevoIndex = this.playerParty.indexOf(this.currentPokemon) + 1;
        if (nuevoIndex >= this.playerParty.length) nuevoIndex = 0;
        let found = false;

        for (let i = 0; i < this.playerParty.length; i++) {
            let p = this.playerParty[(nuevoIndex + i) % this.playerParty.length];
            if (!p.debilitado && p !== this.currentPokemon) {
                this.currentPokemon = p;
                found = true;
                break;
            }
        }

        if (found) {
            this.actualizarUIJugador();
            this.logText.setText(`¡Adelante ${this.currentPokemon.nombre}!`);

            if (!forzado) {
                if (this.menuGroup) this.menuGroup.setVisible(false);
                this.time.delayedCall(1000, () => this.turnoEnemigo());
            } else {
                if (this.menuGroup) this.menuGroup.setVisible(true);
                this.logText.setText(`¿Qué hará ${this.currentPokemon.nombre}?`);
            }
        } else {
            this.logText.setText("¡No te quedan más Pokevones!");
            if (!forzado && this.menuGroup) this.menuGroup.setVisible(true);
        }
    }

    usarObjeto() {
        if (this.menuGroup) this.menuGroup.setVisible(false);
        this.logText.setText("¡Lanzaste una Pokeball!");

        const chance = (1 - (this.enemyPokemon.vida / this.enemyPokemon.vidaMax)) * 0.8 + 0.1;

        this.time.delayedCall(1000, () => {
            if (Math.random() < chance) {
                this.logText.setText(`¡${this.enemyPokemon.nombre} atrapado!`);
                this.playerParty.push(this.enemyPokemon);
                this.time.delayedCall(2000, () => this.salirCombate(true));
            } else {
                this.logText.setText(`¡Se escapó!`);
                this.time.delayedCall(1000, () => this.turnoEnemigo());
            }
        });
    }

    huir() {
        if (this.menuGroup) this.menuGroup.setVisible(false);
        this.logText.setText("¡Escapaste sin problemas!");
        this.time.delayedCall(1000, () => this.salirCombate(false));
    }

    salirCombate(victoria) {
        this.scene.stop('Combate');
        const pueblo = this.scene.get('Pueblo');
        if (pueblo) {
            this.scene.resume('Pueblo');
            pueblo.events.emit('resume');
        } else {
            this.scene.start('Pueblo');
        }
    }
}