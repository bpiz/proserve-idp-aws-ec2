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

  const validTypes = ["standard", "gp2", "gp3", "io1", "io2"];
  if (volume.type && !validTypes.includes(volume.type)) {
    throw new Error(
      `Invalid additional volume type at index ${index}: ${volume.type}. Valid types: ${validTypes.join(", ")}`
    );
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

  if (!config.workload) {
    throw new Error("workload is required");
  }

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
