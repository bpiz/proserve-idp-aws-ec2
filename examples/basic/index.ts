import * as pulumi from "@pulumi/pulumi";
import { EnterpriseEc2Instance } from "../../index";

// Get configuration values
const config = new pulumi.Config();
const subnetId = config.require("subnetId");
const securityGroupIds = config.requireObject<string[]>("securityGroupIds");
const keyPairName = config.require("keyPairName");

// ============================================================================
// LEVEL 1: "Just Deploy" - Minimal configuration
// ============================================================================
const simpleInstance = new EnterpriseEc2Instance("simple-instance", {
  name: "simple-instance",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "simple-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  // No keyPairName - will use SSM for access
});

// ============================================================================
// LEVEL 2: "Team Ready" - Add business context
// ============================================================================
const teamInstance = new EnterpriseEc2Instance("team-instance", {
  name: "team-instance",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "team-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  keyPairName: keyPairName, // Using traditional SSH key pair
  // Add team context
  team: "web-team",
  environment: "production",
  application: "company-website",
  costCenter: "WEB-001",
});

// ============================================================================
// LEVEL 3: "Common Use Cases" - Different workload types
// ============================================================================
const webServer = new EnterpriseEc2Instance("web-server", {
  name: "web-server",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "web-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  // No keyPairName - access via load balancer health checks
  team: "web-team",
  application: "company-website",
  costCenter: "WEB-001",
});

const devInstance = new EnterpriseEc2Instance("dev-instance", {
  name: "dev-instance",
  operatingSystem: "ubuntu-22-04",
  workload: "development",
  project: "dev-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  keyPairName: keyPairName, // Dev team prefers SSH key pairs
  team: "dev-team",
  application: "mobile-backend",
  costCenter: "DEV-001",
});

const databaseInstance = new EnterpriseEc2Instance("database-instance", {
  name: "database-instance",
  operatingSystem: "rhel-9",
  workload: "database",
  project: "database-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  // No keyPairName - access via VPN/Direct Connect only
  team: "data-team",
  application: "customer-database",
  costCenter: "DATA-001",
  accessType: "private-only", // Only accessible via corporate network
  additionalVolumes: [
    {
      name: "database",
      size: 500,
      type: "gp3",
      encrypted: true,
      mountPoint: "/var/lib/mysql",
    },
  ],
});

// ============================================================================
// LEVEL 4: "Advanced Features" - Custom configuration
// ============================================================================
const advancedInstance = new EnterpriseEc2Instance("advanced-instance", {
  name: "advanced-instance",
  operatingSystem: "amazon-linux-2023",
  workload: "high-performance",
  project: "advanced-project",
  subnetId: subnetId,
  securityGroupIds: securityGroupIds,
  // No keyPairName - will use SSM for secure access
  team: "performance-team",
  application: "ml-pipeline",
  costCenter: "ML-001",
  accessType: "load-balancer",
  rootVolumeSize: 100,
  additionalVolumes: [
    {
      name: "data",
      size: 1000,
      type: "gp3",
      encrypted: true,
      mountPoint: "/data",
    },
    {
      name: "logs",
      size: 200,
      type: "gp3",
      encrypted: true,
      mountPoint: "/logs",
    },
  ],
  userData: `#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker`,
  // Override workload defaults
  backupStrategy: "critical",
  monitoringLevel: "enterprise",
  enableTerminationProtection: true,
});

// Export the instance details
export const simpleInstanceId = simpleInstance.instanceId;
export const teamInstanceId = teamInstance.instanceId;
export const webServerId = webServer.instanceId;
export const devInstanceId = devInstance.instanceId;
export const databaseInstanceId = databaseInstance.instanceId;
export const advancedInstanceId = advancedInstance.instanceId;

// Export connection strings
export const simpleSshConnection = simpleInstance.sshConnectionString;
export const webServerSshConnection = webServer.sshConnectionString;
export const devSshConnection = devInstance.sshConnectionString;
export const databaseSshConnection = databaseInstance.sshConnectionString;

// Export monitoring URLs
export const simpleDashboard = simpleInstance.cloudWatchDashboardUrl;
export const webServerDashboard = webServer.cloudWatchDashboardUrl;
export const devDashboard = devInstance.cloudWatchDashboardUrl;
export const databaseDashboard = databaseInstance.cloudWatchDashboardUrl;
