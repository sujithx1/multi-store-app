import z from "zod";

export const PaginationSchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),

    search: z.string().optional(),


    filter: z.string().optional(),
  })
  .transform((d) => {
    return {
      ...d,
      offcet: (d.page - 1) * d.limit,
    };
  });
