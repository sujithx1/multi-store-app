import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { StoreModel } from "../../models/store.model";

const zodCreateStoreSchema = z.object({
  name: z.string("name is required").min(3),
  location: z.string("address is required").min(3),
});

export const storeCreateController = async (req: Request, res: Response) => {
  const body = await zodCreateStoreSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  const { name, location } = body.data;

  const storeExists = await StoreModel.findOne({ name, location });
  if (storeExists) {
    return res
      .status(400)
      .json({ error: "Store already exists in This Location" });
  }

  const store = await StoreModel.create({
    name,
    location,
  });

  return res.status(201).json({ message: "success", store });
};
