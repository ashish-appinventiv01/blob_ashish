import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/messages";

class SecretMiddleware {
  private stripSecrets(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.stripSecrets(item));
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "password" || key === "stack") {
        continue;
      }
      cleaned[key] = this.stripSecrets(nested);
    }
    return cleaned;
  }

  hide = (_req: Request, res: Response, next: NextFunction): void => {
    const sendJson = res.json.bind(res);

    res.json = (body) => {
      try {
        const plain = JSON.parse(JSON.stringify(body ?? null)) as unknown;
        return sendJson(this.stripSecrets(plain));
      } catch (error) {
        console.error(error);
        res.status(500);
        return sendJson({ success: false, message: MESSAGES.internal });
      }
    };

    next();
  };
}

export const secretMiddleware = new SecretMiddleware();
