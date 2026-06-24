import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Request, Response } from 'express';

type NestHandler = (req: Request, res: Response) => Promise<unknown>;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const module = await import('../dist/main.js');
  const nestHandler = module.default as NestHandler;
  return nestHandler(req, res);
}
