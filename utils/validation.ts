import {
  ACCESS_TYPES,
  BACKUP_STRATEGIES,
  ENVIRONMENTS,
  MONITORING_LEVELS,
  OPERATING_SYSTEMS,
  VOLUME_TYPES,
  WORKLOAD_TYPES,
} from "../constants";

/**
 * Validates operating system value
 */
export function validateOperatingSystem(os: string): void {
  const validValues = Object.values(OPERATING_SYSTEMS);
  if (!validValues.includes(os)) {
    throw new Error(
      `Invalid operatingSystem: "${os}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates workload type value
 */
export function validateWorkloadType(workload: string): void {
  const validValues = Object.values(WORKLOAD_TYPES);
  if (!validValues.includes(workload)) {
    throw new Error(
      `Invalid workload: "${workload}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates environment value
 */
export function validateEnvironment(env: string): void {
  const validValues = Object.values(ENVIRONMENTS);
  if (!validValues.includes(env)) {
    throw new Error(
      `Invalid environment: "${env}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates access type value
 */
export function validateAccessType(accessType: string): void {
  const validValues = Object.values(ACCESS_TYPES);
  if (!validValues.includes(accessType)) {
    throw new Error(
      `Invalid accessType: "${accessType}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates backup strategy value
 */
export function validateBackupStrategy(strategy: string): void {
  const validValues = Object.values(BACKUP_STRATEGIES);
  if (!validValues.includes(strategy)) {
    throw new Error(
      `Invalid backupStrategy: "${strategy}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates monitoring level value
 */
export function validateMonitoringLevel(level: string): void {
  const validValues = Object.values(MONITORING_LEVELS);
  if (!validValues.includes(level)) {
    throw new Error(
      `Invalid monitoringLevel: "${level}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates volume type value
 */
export function validateVolumeType(type: string): void {
  const validValues = Object.values(VOLUME_TYPES);
  if (!validValues.includes(type)) {
    throw new Error(
      `Invalid volume type: "${type}". Valid values: ${validValues.join(", ")}`
    );
  }
}

/**
 * Validates subnet ID format
 */
export function validateSubnetId(subnetId: string): void {
  const subnetIdRegex = /^subnet-[a-f0-9]{8,17}$/i;
  if (!subnetIdRegex.test(subnetId)) {
    throw new Error(
      `Invalid subnet ID format: ${subnetId}. Expected format: subnet-xxxxxxxx or subnet-xxxxxxxxxxxxxxxxx`
    );
  }
}

/**
 * Validates security group ID format
 */
export function validateSecurityGroupId(sgId: string, index: number): void {
  const sgIdRegex = /^sg-[a-f0-9]{8,17}$/i;
  if (!sgIdRegex.test(sgId)) {
    throw new Error(
      `Invalid security group ID format at index ${index}: ${sgId}. Expected format: sg-xxxxxxxx or sg-xxxxxxxxxxxxxxxxx`
    );
  }
}

/**
 * Validates additional volume configuration
 */
export function validateAdditionalVolume(volume: any, index: number): void {
  if (!volume.name) {
    throw new Error(`Additional volume name is required at index ${index}`);
  }

  if (!volume.size || volume.size < 1 || volume.size > 16384) {
    throw new Error(
      `Additional volume size must be between 1 and 16384 GB at index ${index}`
    );
  }

  if (volume.type) {
    validateVolumeType(volume.type);
  }

  if (volume.iops && (volume.iops < 100 || volume.iops > 64000)) {
    throw new Error(
      `Additional volume IOPS must be between 100 and 64000 at index ${index}`
    );
  }

  if (
    volume.throughput &&
    (volume.throughput < 125 || volume.throughput > 1000)
  ) {
    throw new Error(
      `Additional volume throughput must be between 125 and 1000 MiB/s at index ${index}`
    );
  }
}

/**
 * Validates all input arguments
 */
export function validateArgs(config: any): void {
  if (!config.name) {
    throw new Error("name is required");
  }

  if (!config.operatingSystem) {
    throw new Error("operatingSystem is required");
  }
  validateOperatingSystem(config.operatingSystem);

  if (!config.workload) {
    throw new Error("workload is required");
  }
  validateWorkloadType(config.workload);

  if (!config.subnetId) {
    throw new Error("subnetId is required");
  }

  if (!config.securityGroupIds || config.securityGroupIds.length === 0) {
    throw new Error("securityGroupIds must be provided and non-empty");
  }

  if (!config.project) {
    throw new Error("project is required");
  }

  // Validate subnet ID format
  validateSubnetId(config.subnetId);

  // Validate security group IDs
  config.securityGroupIds.forEach((sgId: string, index: number) => {
    validateSecurityGroupId(sgId, index);
  });

  // Validate optional fields if provided
  if (config.environment) {
    validateEnvironment(config.environment);
  }

  if (config.accessType) {
    validateAccessType(config.accessType);
  }

  if (config.backupStrategy) {
    validateBackupStrategy(config.backupStrategy);
  }

  if (config.monitoringLevel) {
    validateMonitoringLevel(config.monitoringLevel);
  }

  // Validate key pair for Linux instances (optional - teams can use SSM, VPN, etc.)
  if (config.operatingSystem.includes("linux") && !config.keyPairName) {
    // Key pair is optional - teams can use SSM, VPN, bastion hosts, etc.
    console.warn(
      `Warning: No key pair provided for Linux instance '${config.name}'. Consider using AWS Systems Manager (SSM) for secure access.`
    );
  }

  // Validate additional volumes
  if (config.additionalVolumes) {
    config.additionalVolumes.forEach((volume: any, index: number) => {
      validateAdditionalVolume(volume, index);
    });
  }
}
