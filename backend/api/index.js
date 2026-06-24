import 'reflect-metadata';
import 'dayjs';

export default async function handler(req, res) {
  const mod = await import('../dist/main.js');
  const nestHandler = mod.default?.default ?? mod.default;
  return nestHandler(req, res);
}
