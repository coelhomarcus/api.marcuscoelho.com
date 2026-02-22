import { Request, Response } from "express";
import { createContactSchema } from "./contact.validation";
import { createContact } from "./contact.service";

export async function handleCreateContact(req: Request, res: Response) {
  const parsed = createContactSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const contact = await createContact(parsed.data);

  res.status(201).json({ message: "Contato enviado com sucesso", contact });
}
