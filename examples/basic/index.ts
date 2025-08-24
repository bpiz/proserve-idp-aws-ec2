import * as pulumi from "@pulumi/pulumi";
import { Ec2 } from "../../dist/index";

// Get configuration values
const config = new pulumi.Config();
const subnetId = config.require("subnetId");
const securityGroupIds = config.requireObject<string[]>("securityGroupIds");

// Create EC2 instance
const instance = new Ec2("my-instance", {
  name: "my-instance",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "my-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  environment: "development",
  team: "platform",
  application: "web-app",
  costCenter: "IT-001",
  enableDetailedMonitoring: true,
  enableTerminationProtection: false,
  tags: {
    Owner: "platform-team",
    Purpose: "web-server",
  },
});

// Export outputs
export const instanceId = instance.instanceId;
export const privateIp = instance.privateIp;
export const privateDns = instance.privateDns;
export const availabilityZone = instance.availabilityZone;
export const rootVolumeId = instance.rootVolumeId;
