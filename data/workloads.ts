import { WorkloadConfig } from "../types";

/**
 * Workload configurations for different use cases
 * This externalizes the configuration data from the main component
 */
export const WORKLOAD_CONFIGS: Record<string, WorkloadConfig> = {
  development: {
    instanceType: "t3.micro",
    vcpus: 2,
    memoryGiB: 1,
    networkPerformance: "Low to Moderate",
    monitoringLevel: "basic",
    backupStrategy: "none",
    terminationProtection: false,
    rootVolumeSize: 8,
  },
  "web-server": {
    instanceType: "t3.medium",
    vcpus: 2,
    memoryGiB: 4,
    networkPerformance: "Low to Moderate",
    monitoringLevel: "detailed",
    backupStrategy: "daily",
    terminationProtection: true,
    rootVolumeSize: 20,
  },
  application: {
    instanceType: "t3.large",
    vcpus: 2,
    memoryGiB: 8,
    networkPerformance: "Low to Moderate",
    monitoringLevel: "detailed",
    backupStrategy: "weekly",
    terminationProtection: true,
    rootVolumeSize: 30,
  },
  database: {
    instanceType: "r6i.large",
    vcpus: 2,
    memoryGiB: 16,
    networkPerformance: "Up to 12.5 Gbps",
    monitoringLevel: "enhanced",
    backupStrategy: "daily",
    terminationProtection: true,
    rootVolumeSize: 50,
  },
  "high-performance": {
    instanceType: "c6i.xlarge",
    vcpus: 4,
    memoryGiB: 8,
    networkPerformance: "Up to 12.5 Gbps",
    monitoringLevel: "enterprise",
    backupStrategy: "critical",
    terminationProtection: true,
    rootVolumeSize: 100,
  },
  testing: {
    instanceType: "t3.micro",
    vcpus: 2,
    memoryGiB: 1,
    networkPerformance: "Low to Moderate",
    monitoringLevel: "basic",
    backupStrategy: "none",
    terminationProtection: false,
    rootVolumeSize: 8,
  },
  production: {
    instanceType: "m6i.large",
    vcpus: 2,
    memoryGiB: 8,
    networkPerformance: "Up to 12.5 Gbps",
    monitoringLevel: "enterprise",
    backupStrategy: "daily",
    terminationProtection: true,
    rootVolumeSize: 40,
  },
};

/**
 * Default environment mapping for workloads
 */
export const WORKLOAD_ENVIRONMENTS: Record<string, string> = {
  development: "development",
  testing: "testing",
  "web-server": "production",
  application: "production",
  database: "production",
  "high-performance": "production",
  production: "production",
};
