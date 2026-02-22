import { db } from "../../config/database";
import { contacts } from "./contact.schema";
import { CreateContactInput } from "./contact.validation";
import { sendDiscordNotification } from "../../shared/discord";

export async function createContact(data: CreateContactInput) {
  const [contact] = await db.insert(contacts).values(data).returning();

  sendDiscordNotification(data).catch(console.error);

  return contact;
}
