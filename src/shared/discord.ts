import { env } from "../config/env";
import { CreateContactInput } from "../modules/contact/contact.validation";

export async function sendDiscordNotification(data: CreateContactInput) {
  const embed = {
    title: "Novo contato recebido",
    color: 0x5865f2,
    fields: [
      { name: "Nome", value: data.name, inline: true },
      { name: "Email", value: data.email, inline: true },
      { name: "Mensagem", value: data.message },
    ],
    timestamp: new Date().toISOString(),
  };

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
