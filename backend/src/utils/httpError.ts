export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function unauthorized(message = "Credenciales inválidas"): HttpError {
  return new HttpError(401, message);
}

export function notFound(message = "Recurso no encontrado"): HttpError {
  return new HttpError(404, message);
}

export function conflict(message = "Conflicto"): HttpError {
  return new HttpError(409, message);
}

export function badRequest(message = "Solicitud inválida"): HttpError {
  return new HttpError(400, message);
}
