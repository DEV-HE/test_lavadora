require('dotenv').config()
const { createProvider, createBot, createFlow } = require('@bot-whatsapp/bot')
// Importa el módulo para la interfaz de portal web para QR.
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
// const TelegramProvider = require('./telegram.provider')
const MockAdapter = require('@bot-whatsapp/database/mock');
const defaultFlow = require('./flows/default.flow');
const payFlow = require('./flows/pay.flow');

// const TELEGRAM_TOKEN = proczess.env.TELEGRAM_TOKEN || null;

/**
 * Es la funcion encargada de levantar el ChatBOT
 */
const main = async () => {

    const adapterDB = new MockAdapter()
    const adapterProvider = createProvider(BaileysProvider)
    const adapterFlow = createFlow([defaultFlow, payFlow])

    createBot(
        {
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        }
    )
    // Activa el portal web para QR, utilizado en procesos de autenticación inicial o vinculación.
    QRPortalWeb();
}

main()
