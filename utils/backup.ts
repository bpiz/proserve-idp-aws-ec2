import * as aws from "@pulumi/aws";
import { BackupStrategy } from "../types";

/**
 * Creates backup resources for an EC2 instance
 */
export function createBackupResources(
  name: string,
  instance: aws.ec2.Instance,
  config: any,
  backupStrategy: BackupStrategy
): void {
  if (backupStrategy === "none") {
    return;
  }

  // Create backup schedule based on strategy
  const schedule =
    backupStrategy === "daily" ? "cron(0 5 ? * * *)" : "cron(0 5 ? * SUN *)";

  new aws.ssm.MaintenanceWindow(
    `${name}-backup-window`,
    {
      name: `${name}-backup-maintenance`,
      schedule: schedule,
      duration: 2,
      cutoff: 1,
      scheduleTimezone: "America/New_York",
      tags: config.tags || {},
    },
    { parent: instance }
  );
}
