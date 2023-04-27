import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma, PrismaClient } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    const regex = /Unique constraint failed on the fields: \(`(.*)`\)/;
    const matches = regex.exec(message);
    let field: string = '';
    if (matches) {
      field = matches[1];
    }
    let status: number;
    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: `The provided value for the field is too long for the field's type. field: ${field}`,
        });
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `The article title is already exists.`,
        });
        break;
      case 'P2025':
        status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message,
        });
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }
}
