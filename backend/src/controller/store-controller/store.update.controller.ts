import { Request, Response } from "express";
import z from "zod";
import { Pretty_Error } from "../../config/error";
import { StoreModel } from "../../models/store.model";
import { GlobalIdParamsZodSchema } from "../product-controller/updateProduct-controller";
const zodUpdateStoreSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
});

export const storeUpdateController = async (req: Request, res: Response) => {
  const params = GlobalIdParamsZodSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "invalid params" });
  }
  const body = await zodUpdateStoreSchema.safeParseAsync(req.body);
  if (!body.success) {
    return res.status(400).json({ error: Pretty_Error(body.error) });
  }

  await StoreModel.findByIdAndUpdate(
    params.data.id,
    {
      name: body.data.name,
      location: body.data.location,
    },

    { new: true } ///updated data will be returned  );
  );

  return res.status(200).json({ message: "succes to update  store" });
};
