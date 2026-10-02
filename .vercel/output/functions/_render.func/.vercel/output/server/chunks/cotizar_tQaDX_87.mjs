import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
//#region src/lib/supabase.ts
var supabaseUrl = "https://hjuawsyqgrascremrwwc.supabase.co";
var supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdWF3c3lxZ3Jhc2NyZW1yd3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg5MzU4NiwiZXhwIjoyMTA2NDY5NTg2fQ.hjcu1k_7j782tXamj-1QjoDIO40swr70IFzglcUMzpo";
var isSupabaseConfigured = Boolean(supabaseKey);
function getSupabase() {
	if (!isSupabaseConfigured) throw new Error("Supabase no está configurado. Agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env");
	return createClient(supabaseUrl, supabaseKey);
}
//#endregion
//#region src/pages/api/cotizar.ts
var cotizar_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var QuoteItemSchema = z.object({
	producto: z.string().min(1, "Nombre del producto requerido"),
	categoria: z.string().optional(),
	cantidad: z.number().int().min(1, "Cantidad mínima: 1"),
	talla: z.string().optional()
});
var QuoteSchema = z.object({
	empresa: z.string().min(1, "El nombre de la empresa es obligatorio"),
	rut: z.string().optional(),
	nombre: z.string().min(1, "El nombre de contacto es obligatorio"),
	telefono: z.string().optional(),
	correo: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
	personalizacion: z.enum([
		"Sin logo",
		"Bordado",
		"Estampado",
		"Aún no lo sé"
	]).default("Sin logo"),
	plazo: z.string().optional(),
	mensaje: z.string().optional(),
	honeypot: z.string().max(0, "Bot detectado"),
	items: z.array(QuoteItemSchema).min(1, "Agrega al menos un producto")
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const result = QuoteSchema.safeParse(body);
		if (!result.success) {
			const errors = result.error.issues.map((i) => i.message);
			return new Response(JSON.stringify({
				success: false,
				errors
			}), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		const data = result.data;
		if (data.honeypot) return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		if (!isSupabaseConfigured) {
			console.log("[DEMO] Cotización recibida:", JSON.stringify(data, null, 2));
			return new Response(JSON.stringify({
				success: true,
				demo: true
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const supabase = getSupabase();
		const { data: quote, error: quoteError } = await supabase.from("quotes").insert({
			empresa: data.empresa,
			rut: data.rut || null,
			nombre: data.nombre,
			telefono: data.telefono || null,
			correo: data.correo || null,
			personalizacion: data.personalizacion,
			plazo: data.plazo || null,
			mensaje: data.mensaje || null
		}).select("id").single();
		if (quoteError || !quote) {
			console.error("Error al crear cotización:", quoteError);
			return new Response(JSON.stringify({
				success: false,
				errors: ["Error interno al guardar la cotización. Intenta de nuevo."]
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
		const items = data.items.map((item) => ({
			quote_id: quote.id,
			producto: item.producto,
			categoria: item.categoria || null,
			cantidad: item.cantidad,
			talla: item.talla || null
		}));
		const { error: itemsError } = await supabase.from("quote_items").insert(items);
		if (itemsError) console.error("Error al insertar ítems:", itemsError);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Error en /api/cotizar:", err);
		return new Response(JSON.stringify({
			success: false,
			errors: ["Error interno del servidor. Intenta de nuevo."]
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/cotizar@_@ts
var page = () => cotizar_exports;
//#endregion
export { page };
