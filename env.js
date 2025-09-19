import { z, ZodError } from "zod";

const portSchema = z.coerce.number().min(1).max(65535).int();

let PORT;
try {
  PORT = portSchema.parse(process.env.PORT); // .env se direct
} catch (error) {
  if (error instanceof ZodError) {
    console.error("❌ Invalid PORT:", error.issues[0].message);
    process.exit(1); // agar galat hai toh app band ho jaye
  } else {
    console.error(error);
    process.exit(1);
  }
}

export { PORT };
