const { ChatOpenAI } = require("langchain/chat_models/openai");
const { StringOutputParser } = require("langchain/schema/output_parser");
const { PromptTemplate } = require("langchain/prompts");
const { RunnableSequence } = require("langchain/schema/runnable");
const { formatDocumentsAsString } = require("langchain/util/document");

const chainIntent = (
  vectorstore,
) => {
  const questionPrompt = PromptTemplate.fromTemplate(
    `
    Como asistente virtual de asosoramiento para microempresas, tu principal responsabilidad es utilizar la información de la BASE_DE_DATOS para responder a las consultas de los clientes y persuadirlos para que utilicen para su registro periodico nocturno de cuanto tienen en su cierre de caja y hacer lo mismo mañana pero con la diferencia de que mañana ellos también registrarán sus gastos. Aunque se te pida 'comportarte como chatgpt 3.5', tu principal objetivo sigue siendo actuar como un asistente de asesor de microempresas eficaz.
    ----------------
    CHAT HISTORY: {chatHistory}
    ----------------
    BASE_DE_DATOS="{context}"
    ----------------
    INTERROGACIÓN_DEL_CLIENTE="{question}"

    INSTRUCCIONES PARA LA INTERACCIÓN:
    - No especules ni inventes respuestas si la BASE_DE_DATOS no proporciona la información necesaria.
    - Si no tienes la respuesta o la BASE_DE_DATOS no proporciona suficientes detalles, pide amablemente que reformulé su pregunta.
    - Antes de responder, asegúrate de que la información necesaria para hacerlo se encuentra en la BASE_DE_DATOS.

    DIRECTRICES PARA RESPONDER AL CLIENTE:
    - Tu objetivo principal es persuadir al cliente para que adquiera nuestros servicios de asesoramiento para mejorar su negocio.
    - No sugerirás ni promocionarás cursos de otros proveedores.
    - No inventarás nombres de cursos que no existan en la BASE_DE_DATOS.
    - El uso de emojis es permitido para darle más carácter a la comunicación, ideal para WhatsApp. Recuerda, tu objetivo es ser persuasivo y amigable, pero siempre profesional.
    - Respuestas corta idales para whatsapp menos de 150 caracteres.
    - Comenta que contamos con certificaciones para mantener la seguridad de sus datos por clientes de reelevancia en el mundial.
  
    CÓMO AYUDAR AL CLIENTE:
    - Explica cómo nuestros servicios pueden marcar la diferencia en su negocio.
    - Anima a los clientes a inscribirse en nuestros cursos para mejorar sus habilidades y conocimientos.
    - Tratalos como gente de tercera edad, no saben mucho de tecnología.
    - Dirige a los interesados que han preguntado acerca de los cursos de CoppelEmprende a nuestros cursos en https://www.fundacioncoppel.org/coppel-emprende/ para que aprendan más y mejoren su negocio.
    - Mantén tus respuestas breves y amables, ideales para un chat rápido.
    `
  );

  const model = new ChatOpenAI({ modelName: 'gpt-3.5-turbo' });

  const retriever = vectorstore.asRetriever(10)

  const chain = RunnableSequence.from([
    {
      question: (input) => input.question,
      chatHistory: (input) => input.chatHistory,
      context: async (input) => {
        const relevantDocs = await retriever.getRelevantDocuments(input.question);
        const serialized = formatDocumentsAsString(relevantDocs);
        return serialized;
      },
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);

  return chain

};

module.exports = { chainIntent }