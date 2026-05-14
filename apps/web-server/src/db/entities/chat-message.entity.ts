import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { UnifiedMessage } from '@agent-flow/core/messages';

@Entity({ name: 'chat_message' })
@Index('idx_chat_message_session_sequence', ['sessionId', 'sequence'], { unique: true })
export class ChatMessageEntity {
  @PrimaryColumn({ name: 'message_id', type: 'varchar', length: 128 })
  messageId!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ type: 'integer' })
  sequence!: number;

  @Column({ type: 'varchar', length: 32 })
  role!: UnifiedMessage['role'];

  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'jsonb' })
  payload!: UnifiedMessage;
}
