import type { CheckpointWriter } from '@snapshot-labs/checkpoint';

export async function handleFunction({
  block,
  tx,
  rawEvent,
  mysql
}: Parameters<CheckpointWriter>[0]) {
  
}
