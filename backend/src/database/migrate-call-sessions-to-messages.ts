import 'reflect-metadata';
import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { DataSource, In } from 'typeorm';
import { buildCallMessagePreview } from '../calls/call-message.util';
import { CallSession } from '../calls/entities/call-session.entity';
import { Message } from '../chats/entities/message.entity';
import { entities } from './entities';

const backendEnvPath = [
  join(process.cwd(), 'backend', '.env'),
  join(process.cwd(), '.env'),
  join(__dirname, '../../.env'),
].find((path) => existsSync(path));

if (backendEnvPath) {
  config({ path: backendEnvPath });
}

const FINAL_STATUSES = ['ended', 'missed', 'declined'] as const;

function resolveDurationSeconds(call: CallSession): number | null {
  if (call.durationSeconds != null) {
    return call.durationSeconds;
  }

  if (call.answeredAt && call.endedAt) {
    return Math.max(
      0,
      Math.floor(
        (call.endedAt.getTime() - call.answeredAt.getTime()) / 1000,
      ),
    );
  }

  return null;
}

function resolveEndedAt(call: CallSession): Date {
  return call.endedAt ?? call.updatedAt ?? call.createdAt;
}

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const dryRun = process.argv.includes('--dry-run');

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: false,
  });

  await dataSource.initialize();

  const callRepo = dataSource.getRepository(CallSession);
  const messageRepo = dataSource.getRepository(Message);

  const calls = await callRepo.find({
    order: { createdAt: 'ASC' },
  });

  const finalizedCalls = calls.filter((call) =>
    FINAL_STATUSES.includes(call.status as (typeof FINAL_STATUSES)[number]),
  );

  const existingMessages = await messageRepo.find({
    where: {
      callSessionId: In(finalizedCalls.map((call) => call.id)),
    },
    select: { callSessionId: true },
  });

  const migratedSessionIds = new Set(
    existingMessages
      .map((message) => message.callSessionId)
      .filter((id): id is string => Boolean(id)),
  );

  let inserted = 0;
  let skippedExisting = 0;
  let skippedIncomplete = calls.length - finalizedCalls.length;

  for (const call of finalizedCalls) {
    if (migratedSessionIds.has(call.id)) {
      skippedExisting += 1;
      continue;
    }

    const status = call.status;
    const durationSeconds = resolveDurationSeconds(call);
    const endedAt = resolveEndedAt(call);
    const preview = buildCallMessagePreview(call.mode, status, durationSeconds);

    if (dryRun) {
      console.log(
        `[dry-run] would insert call ${call.id} (${status}) in chat ${call.conversationId}`,
      );
      inserted += 1;
      continue;
    }

    await messageRepo.save(
      messageRepo.create({
        conversationId: call.conversationId,
        senderId: call.initiatorId,
        text: preview,
        messageType: 'call',
        callSessionId: call.id,
        callMode: call.mode,
        callStatus: status,
        callDurationSeconds: durationSeconds,
        callEndedAt: endedAt,
        createdAt: call.createdAt,
      }),
    );

    inserted += 1;
  }

  console.log(
    dryRun ? 'Dry run complete.' : 'Migration complete.',
  );
  console.log(`Total call_sessions: ${calls.length}`);
  console.log(`Finalized calls considered: ${finalizedCalls.length}`);
  console.log(`Skipped (already in messages): ${skippedExisting}`);
  console.log(`Skipped (ringing/ongoing): ${skippedIncomplete}`);
  console.log(`${dryRun ? 'Would insert' : 'Inserted'}: ${inserted}`);

  await dataSource.destroy();
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
