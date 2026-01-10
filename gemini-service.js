import { GoogleGenerativeAI } from "@google/generative-ai";

// Traemos tu llave de Gemini desde el .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analizarEquipo(datosEquipo) {
    const prompt = `Actúa como un experto en ingeniería biomédica. 
    Analiza el siguiente equipo médico y dame un resumen corto de su estado y si requiere mantenimiento urgente:
    Equipo: ${datosEquipo.nombre}
    Marca: ${datosEquipo.marca}
    Estado reportado: ${datosEquipo.estado}
    Descripción: ${datosEquipo.descripcion}`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error con Gemini:", error);
        return "No se pudo generar el resumen en este momento.";
    }
}

// Lo hacemos accesible globalmente
window.analizarEquipo = analizarEquipo;