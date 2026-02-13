export default class Pokevon {
    constructor(config) {
        // Información básica
        this.nombre = config.nombre;
        this.tipo = config.tipo; // "fuego", "agua", "planta"
        this.nivel = config.nivel || 5;
        this.sprite = config.sprite; // nombre del sprite para mostrar en batalla

        // Estadísticas base (se ajustan según nivel)
        this.vidaBase = config.vidaBase || 20;
        this.ataqueBase = config.ataqueBase || 10;
        this.defensaBase = config.defensaBase || 8;
        this.velocidadBase = config.velocidadBase || 12;

        // Calcular estadísticas actuales
        this.actualizarEstadisticas();
        this.vida = this.vidaMax; // Empezar con vida completa

        // Movimientos que puede aprender (4 movimientos predefinidos)
        this.movimientosDisponibles = config.movimientosDisponibles || [];

        // Movimientos actuales (máximo 4, aprende según nivel)
        this.movimientos = [];
        this.cargarMovimientosIniciales();

        // Estado
        this.debilitado = false; // true cuando vida = 0
        this.experiencia = 0;
        this.expParaSiguienteNivel = this.calcularExpNecesaria();

        // Propietario
        this.esDelJugador = config.esDelJugador || false;
    }

    // Actualizar estadísticas según nivel
    actualizarEstadisticas() {
        this.vidaMax = Math.floor(this.vidaBase + (this.nivel * 5));
        this.ataque = Math.floor(this.ataqueBase + (this.nivel * 2));
        this.defensa = Math.floor(this.defensaBase + (this.nivel * 2));
        this.velocidad = Math.floor(this.velocidadBase + (this.nivel * 1.5));
    }

    // Calcular experiencia necesaria para siguiente nivel
    calcularExpNecesaria() {
        return this.nivel * 50;
    }

    // Cargar movimientos según el nivel inicial
    cargarMovimientosIniciales() {
        for (const movData of this.movimientosDisponibles) {
            if (this.nivel >= movData.nivelAprendizaje && this.movimientos.length < 4) {
                this.movimientos.push(movData.movimiento);
            }
        }
    }

    // Atacar a otro Pokevon
    atacar(objetivo, movimiento) {
        console.log(`${this.nombre} usa ${movimiento.nombre}!`);

        // Calcular daño: potencia del movimiento + ataque del pokevon
        let daño = movimiento.potencia + this.ataque;

        // El objetivo recibe el daño
        const resultado = objetivo.recibirDaño(daño);

        return {
            dañoInfligido: resultado.dañoRecibido,
            objetivoDebilitado: resultado.debilitado
        };
    }

    // Recibir daño
    recibirDaño(daño) {
        // El daño se reduce por la defensa
        let dañoFinal = daño - this.defensa;

        // Mínimo 1 de daño
        if (dañoFinal < 1) {
            dañoFinal = 1;
        }

        // Restar vida
        this.vida -= dañoFinal;

        console.log(`${this.nombre} recibe ${dañoFinal} de daño! (Vida: ${this.vida}/${this.vidaMax})`);

        // Verificar si se debilitó
        if (this.vida <= 0) {
            this.vida = 0;
            this.debilitado = true;
            console.log(`${this.nombre} se debilitó!`);
        }

        return {
            dañoRecibido: dañoFinal,
            debilitado: this.debilitado
        };
    }

    // Curar vida (poción)
    curar(cantidad) {
        if (this.debilitado) {
            console.log(`${this.nombre} está debilitado y no puede curarse con pociones!`);
            return false;
        }

        const vidaAnterior = this.vida;
        this.vida += cantidad;

        if (this.vida > this.vidaMax) {
            this.vida = this.vidaMax;
        }

        const vidaCurada = this.vida - vidaAnterior;
        console.log(`${this.nombre} recuperó ${vidaCurada} de vida! (Vida: ${this.vida}/${this.vidaMax})`);
        return true;
    }

    // Revivir (en hospital)
    revivir(porcentajeVida = 100) {
        this.debilitado = false;
        this.vida = Math.floor((this.vidaMax * porcentajeVida) / 100);
        console.log(`${this.nombre} fue revivido! (Vida: ${this.vida}/${this.vidaMax})`);
        return true;
    }

    // Curación completa (hospital)
    curacionCompleta() {
        this.vida = this.vidaMax;
        this.debilitado = false;
        console.log(`${this.nombre} está completamente curado!`);
    }

    // Ganar experiencia
    ganarExperiencia(cantidad) {
        if (this.debilitado) return;

        console.log(`${this.nombre} ganó ${cantidad} puntos de experiencia!`);
        this.experiencia += cantidad;

        // Verificar si sube de nivel
        while (this.experiencia >= this.expParaSiguienteNivel) {
            this.subirNivel();
        }
    }

    // Subir de nivel
    subirNivel() {
        this.nivel++;
        this.experiencia -= this.expParaSiguienteNivel;
        this.expParaSiguienteNivel = this.calcularExpNecesaria();

        // Guardar vida actual como porcentaje
        const porcentajeVida = this.vida / this.vidaMax;

        // Recalcular estadísticas
        this.actualizarEstadisticas();

        // Restaurar vida proporcionalmente
        this.vida = Math.floor(this.vidaMax * porcentajeVida);

        console.log(`¡${this.nombre} subió al nivel ${this.nivel}!`);
        console.log(`Vida: ${this.vidaMax} | Ataque: ${this.ataque} | Defensa: ${this.defensa} | Velocidad: ${this.velocidad}`);

        // Verificar si aprende nuevo movimiento
        this.verificarNuevoMovimiento();
    }

    // Verificar si debe aprender nuevo movimiento al subir de nivel
    verificarNuevoMovimiento() {
        for (const movData of this.movimientosDisponibles) {
            // Si alcanzó el nivel para aprender y no lo tiene ya
            if (this.nivel === movData.nivelAprendizaje) {
                const yaLoTiene = this.movimientos.some(m => m.nombre === movData.movimiento.nombre);

                if (!yaLoTiene) {
                    if (this.movimientos.length < 4) {
                        // Aprender automáticamente si tiene espacio
                        this.movimientos.push(movData.movimiento);
                        console.log(`¡${this.nombre} aprendió ${movData.movimiento.nombre}!`);
                    } else {
                        // Si tiene 4 movimientos, debería preguntarle al jugador cuál olvidar
                        console.log(`${this.nombre} quiere aprender ${movData.movimiento.nombre}, pero ya conoce 4 movimientos!`);
                        // Aquí se podría activar un menú para elegir qué movimiento reemplazar
                        return movData.movimiento;
                    }
                }
            }
        }
        return null;
    }

    // Reemplazar movimiento (cuando ya tiene 4)
    reemplazarMovimiento(index, nuevoMovimiento) {
        if (index >= 0 && index < this.movimientos.length) {
            const movimientoOlvidado = this.movimientos[index];
            this.movimientos[index] = nuevoMovimiento;
            console.log(`${this.nombre} olvidó ${movimientoOlvidado.nombre} y aprendió ${nuevoMovimiento.nombre}!`);
            return true;
        }
        return false;
    }

    // Obtener info del Pokevon
    getInfo() {
        return {
            nombre: this.nombre,
            tipo: this.tipo,
            nivel: this.nivel,
            vida: this.vida,
            vidaMax: this.vidaMax,
            ataque: this.ataque,
            defensa: this.defensa,
            velocidad: this.velocidad,
            debilitado: this.debilitado,
            experiencia: this.experiencia,
            expParaSiguienteNivel: this.expParaSiguienteNivel,
            movimientos: this.movimientos
        };
    }
}

// Definición de movimientos por tipo
export const MOVIMIENTOS = {
    // Movimientos de tipo AGUA
    pistolaAgua: {
        nombre: "Pistola Agua",
        tipo: "agua",
        potencia: 15,
        descripcion: "Dispara un chorro de agua al objetivo"
    },
    burbujas: {
        nombre: "Burbujas",
        tipo: "agua",
        potencia: 10,
        descripcion: "Lanza burbujas al oponente"
    },
    hidroPulso: {
        nombre: "Hidro Pulso",
        tipo: "agua",
        potencia: 25,
        descripcion: "Ataca con un potente chorro de agua"
    },
    hidrobomba: {
        nombre: "Hidrobomba",
        tipo: "agua",
        potencia: 35,
        descripcion: "Lanza un gran chorro de agua"
    },

    // Movimientos de tipo FUEGO
    ascuas: {
        nombre: "Ascuas",
        tipo: "fuego",
        potencia: 15,
        descripcion: "Lanza llamas pequeñas al objetivo"
    },
    colmilloIgneo: {
        nombre: "Colmillo Ígneo",
        tipo: "fuego",
        potencia: 20,
        descripcion: "Muerde con colmillos envueltos en fuego"
    },
    lanzallamas: {
        nombre: "Lanzallamas",
        tipo: "fuego",
        potencia: 30,
        descripcion: "Lanza un chorro de fuego intenso"
    },
    llamarada: {
        nombre: "Llamarada",
        tipo: "fuego",
        potencia: 40,
        descripcion: "Envuelve al objetivo en llamas intensas"
    },

    // Movimientos de tipo PLANTA
    latiguCepa: {
        nombre: "Látigo Cepa",
        tipo: "planta",
        potencia: 15,
        descripcion: "Golpea con lianas o ramas"
    },
    hojaAfilada: {
        nombre: "Hoja Afilada",
        tipo: "planta",
        potencia: 20,
        descripcion: "Lanza hojas afiladas como navajas"
    },
    rayoSolar: {
        nombre: "Rayo Solar",
        tipo: "planta",
        potencia: 35,
        descripcion: "Absorbe luz y dispara un rayo poderoso"
    },
    plantaFeroz: {
        nombre: "Planta Feroz",
        tipo: "planta",
        potencia: 40,
        descripcion: "Golpea con plantas gigantes"
    },

    // Movimientos NORMALES (todos pueden aprenderlos)
    placaje: {
        nombre: "Placaje",
        tipo: "normal",
        potencia: 12,
        descripcion: "Embiste al objetivo con todo el cuerpo"
    },
    arañazo: {
        nombre: "Arañazo",
        tipo: "normal",
        potencia: 10,
        descripcion: "Araña con garras afiladas"
    }
};

// Pokevones de ejemplo predefinidos
export const POKEVONES_INICIALES = {


    // 🔥 FUEGO
    charizard: {
        nombre: "Charizard",
        tipo: "fuego",
        sprite: "charizard",
        vidaBase: 78,
        ataqueBase: 109,
        defensaBase: 85,
        velocidadBase: 100,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.arañazo, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.ascuas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.colmilloIgneo, nivelAprendizaje: 8 },
            { movimiento: MOVIMIENTOS.lanzallamas, nivelAprendizaje: 15 }
        ]
    },

    cinderace: {
        nombre: "Cinderace",
        tipo: "fuego",
        sprite: "cinderace",
        vidaBase: 80,
        ataqueBase: 116,
        defensaBase: 75,
        velocidadBase: 119,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.arañazo, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.ascuas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.colmilloIgneo, nivelAprendizaje: 8 },
            { movimiento: MOVIMIENTOS.lanzallamas, nivelAprendizaje: 15 }
        ]
    },

    typhlosion: {
        nombre: "Typhlosion",
        tipo: "fuego",
        sprite: "typhlosion",
        vidaBase: 78,
        ataqueBase: 109,
        defensaBase: 85,
        velocidadBase: 100,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.arañazo, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.ascuas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.colmilloIgneo, nivelAprendizaje: 8 },
            { movimiento: MOVIMIENTOS.lanzallamas, nivelAprendizaje: 15 }
        ]
    },

    // 💧 AGUA
    blastoise: {
        nombre: "Blastoise",
        tipo: "agua",
        sprite: "blastoise",
        vidaBase: 79,
        ataqueBase: 85,
        defensaBase: 105,
        velocidadBase: 78,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.burbujas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.pistolaAgua, nivelAprendizaje: 7 },
            { movimiento: MOVIMIENTOS.hidroPulso, nivelAprendizaje: 13 }
        ]
    },

    feraligatr: {
        nombre: "Feraligatr",
        tipo: "agua",
        sprite: "feraligatr",
        vidaBase: 85,
        ataqueBase: 105,
        defensaBase: 100,
        velocidadBase: 78,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.burbujas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.pistolaAgua, nivelAprendizaje: 7 },
            { movimiento: MOVIMIENTOS.hidroPulso, nivelAprendizaje: 13 }
        ]
    },

    samurott: {
        nombre: "Samurott",
        tipo: "agua",
        sprite: "samurott",
        vidaBase: 95,
        ataqueBase: 108,
        defensaBase: 85,
        velocidadBase: 70,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.burbujas, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.pistolaAgua, nivelAprendizaje: 7 },
            { movimiento: MOVIMIENTOS.hidroPulso, nivelAprendizaje: 13 }
        ]
    },

    // 🌿 PLANTA
    meganium: {
        nombre: "Meganium",
        tipo: "planta",
        sprite: "meganium",
        vidaBase: 80,
        ataqueBase: 83,
        defensaBase: 100,
        velocidadBase: 80,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.latigoCepa, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.hojaAfilada, nivelAprendizaje: 9 },
            { movimiento: MOVIMIENTOS.rayoSolar, nivelAprendizaje: 16 }
        ]
    },

    sceptile: {
        nombre: "Sceptile",
        tipo: "planta",
        sprite: "sceptile",
        vidaBase: 70,
        ataqueBase: 105,
        defensaBase: 85,
        velocidadBase: 120,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.latigoCepa, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.hojaAfilada, nivelAprendizaje: 9 },
            { movimiento: MOVIMIENTOS.rayoSolar, nivelAprendizaje: 16 }
        ]
    },

    serperior: {
        nombre: "Serperior",
        tipo: "planta",
        sprite: "serperior",
        vidaBase: 75,
        ataqueBase: 75,
        defensaBase: 95,
        velocidadBase: 113,
        movimientosDisponibles: [
            { movimiento: MOVIMIENTOS.placaje, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.latigoCepa, nivelAprendizaje: 1 },
            { movimiento: MOVIMIENTOS.hojaAfilada, nivelAprendizaje: 9 },
            { movimiento: MOVIMIENTOS.rayoSolar, nivelAprendizaje: 16 }
        ]
    }

};