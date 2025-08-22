import * as aws from "@pulumi/aws";
import { MonitoringLevel } from "../types";

/**
 * Creates CloudWatch monitoring resources for an EC2 instance
 */
export function createMonitoringResources(
  name: string,
  instance: aws.ec2.Instance,
  config: any,
  monitoringLevel: MonitoringLevel
): void {
  // CPU utilization alarm
  new aws.cloudwatch.MetricAlarm(
    `${name}-cpu-alarm`,
    {
      name: `${name}-cpu-utilization`,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 2,
      metricName: "CPUUtilization",
      namespace: "AWS/EC2",
      period: 300,
      statistic: "Average",
      threshold: 80,
      alarmDescription: "CPU utilization is too high",
      dimensions: { InstanceId: instance.id },
      tags: config.tags || {},
    },
    { parent: instance }
  );

  // Status check alarm
  new aws.cloudwatch.MetricAlarm(
    `${name}-status-alarm`,
    {
      name: `${name}-status-check`,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 2,
      metricName: "StatusCheckFailed",
      namespace: "AWS/EC2",
      period: 60,
      statistic: "Maximum",
      threshold: 0,
      alarmDescription: "Instance status check failed",
      dimensions: { InstanceId: instance.id },
      tags: config.tags || {},
    },
    { parent: instance }
  );
}

/**
 * Creates CloudWatch dashboard for an EC2 instance
 */
export function createCloudWatchDashboard(
  name: string,
  instance: aws.ec2.Instance,
  config: any
): aws.cloudwatch.Dashboard {
  return new aws.cloudwatch.Dashboard(
    `${name}-dashboard`,
    {
      dashboardName: `${name}-monitoring`,
      dashboardBody: JSON.stringify({
        widgets: [
          {
            type: "metric",
            properties: {
              metrics: [
                ["AWS/EC2", "CPUUtilization", "InstanceId", instance.id],
              ],
              period: 300,
              stat: "Average",
              region: "us-east-1",
              title: "CPU Utilization",
            },
            x: 0,
            y: 0,
            width: 12,
            height: 6,
          },
          {
            type: "metric",
            properties: {
              metrics: [["AWS/EC2", "NetworkIn", "InstanceId", instance.id]],
              period: 300,
              stat: "Average",
              region: "us-east-1",
              title: "Network In",
            },
            x: 12,
            y: 0,
            width: 12,
            height: 6,
          },
        ],
      }),
    },
    { parent: instance }
  );
}
