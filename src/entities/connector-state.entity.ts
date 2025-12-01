import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

import { Field } from "../shared/model";
import { ConnectorEntity } from "./connector.entity";
import { BaseEntity } from "./entity";

export class ConnectorMetrics {
  totalCalls: number;
  failedCalls: number;
  avgLatencyMs?: number;
  lastUsageAt?: Date;
}

export class ConnectorThrottleStatus {
  isThrottled: boolean;
  resetAt?: Date;
  remainingRequests?: number;
}

export enum ConnectorStateStatus {
  HEALTHY = "HEALTHY",
  WARNING = "WARNING",
  ERROR = "ERROR",
  OFFLINE = "OFFLINE",
}

@Entity("connector_states")
export class ConnectorStateEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true, description: "The unique identifier for the connector state" })
  @Column({ type: "uuid", name: "connector_id" })
  connectorId: string;
  
  @Field({ type: "string", required: true, description: "The unique identifier for the connector state" })
  @Column({ type: "timestamptz", name: "last_heartbeat_at" })
  lastHeartbeatAt?: Date;

  @Field({ type: "string", required: true, description: "The unique identifier for the connector state" })
  @Column({ type: "timestamptz", name: "last_sync_at" })
  lastSyncAt?: Date;

  @Field({ type: "enum", enum: ConnectorStateStatus, required: true, description: "The status of the connector state" })
  @Column({ type: "enum", enum: ConnectorStateStatus, default: ConnectorStateStatus.OFFLINE })
  status: ConnectorStateStatus;

  @Field({ type: "number", required: true, description: "The error count of the connector state" })
  @Column({ type: "int", default: 0, name: "error_count" })
  errorCount: number;

  @Field({ type: "string", nullable: false, description: "The last error message of the connector state" })
  @Column({ type: "text", nullable: true, name: "last_error_message" })
  lastErrorMessage: string | null;

  @Field({ type: "string", nullable: true, description: "The last error details of the connector state" })
  @Column({ type: "json", nullable: true, name: "last_error_details" })
  lastErrorDetails?: any;

  @Field({ type: "class", class: () => ConnectorThrottleStatus, nullable: true })
  @Column({ type: "jsonb", nullable: true, name: "throttle_status" })
  throttleStatus?: ConnectorThrottleStatus;

  @Field({ type: "class", class: () => ConnectorMetrics, nullable: true })
  @Column({ type: "jsonb", nullable: true, name: "metrics" })
  metrics?: ConnectorMetrics;

  @Field({ type: "string", nullable: true, description: "The sync cursor of the connector state" })
  @Column({ type: "text", nullable: true })
  syncCursor?: string;

  @Field({ type: "class", class: () => ConnectorEntity, required: false })
  @OneToOne(() => ConnectorEntity, (c) => c.connectorState)
  @JoinColumn({ name: "connector_id" })
  connector?: ConnectorEntity;

  constructor(data: Partial<ConnectorStateEntity>) {
    super(data);
    Object.assign(this, data);
  }
}
