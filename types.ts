import * as pulumi from "@pulumi/pulumi";

/**
 * Enterprise EC2 Instance Operating System Options
 */
export type OperatingSystem =
  | "amazon-linux-2023"
  | "amazon-linux-2"
  | "ubuntu-22-04"
  | "ubuntu-20-04"
  | "rhel-9"
  | "rhel-8"
  | "centos-7"
  | "windows-server-2022"
  | "windows-server-2019";

/**
 * Simplified Workload Types (combines size, family, and purpose)
 */
export type WorkloadType =
  | "development" // t3.micro, basic monitoring, no backup
  | "web-server" // t3.medium, enhanced monitoring, daily backup
  | "application" // t3.large, detailed monitoring, weekly backup
  | "database" // r6i.large, enhanced monitoring, daily backup
  | "high-performance" // c6i.xlarge, enterprise monitoring, critical backup
  | "testing" // t3.micro, basic monitoring, no backup
  | "production"; // m6i.large, enterprise monitoring, daily backup;

/**
 * Enterprise EC2 Instance Environment
 */
export type Environment =
  | "development"
  | "staging"
  | "production"
  | "disaster-recovery"
  | "testing";

/**
 * Enterprise EC2 Instance Access Type
 */
export type AccessType =
  | "private-only" // No public IP, internal access only
  | "bastion-access" // Private with bastion host access
  | "public-access" // Public IP for external access
  | "load-balancer"; // Behind load balancer

/**
 * Enterprise EC2 Instance Backup Strategy
 */
export type BackupStrategy =
  | "none" // No backup
  | "daily" // Daily backup
  | "weekly" // Weekly backup
  | "critical"; // Critical data backup

/**
 * Enterprise EC2 Instance Monitoring Level
 */
export type MonitoringLevel =
  | "basic" // Basic CloudWatch monitoring
  | "detailed" // Detailed monitoring (1-minute intervals)
  | "enhanced" // Enhanced monitoring with custom metrics
  | "enterprise"; // Enterprise monitoring with logging

/**
 * Simplified Enterprise EC2 Instance Arguments
 */
export interface EnterpriseEc2Args {
  /**
   * Instance name (used for resource naming and tagging)
   */
  readonly name: string;

  /**
   * Operating system to use
   */
  readonly operatingSystem: OperatingSystem;

  /**
   * Workload type (determines instance size, monitoring, backup, etc.)
   */
  readonly workload: WorkloadType;

  /**
   * Project name for cost allocation
   */
  readonly project: string;

  /**
   * Subnet ID where instance will be launched
   */
  readonly subnetId: string;

  /**
   * Security group IDs to attach
   */
  readonly securityGroupIds: string[];

  /**
   * SSH key pair name (optional - teams can use SSM, VPN, bastion hosts, etc.)
   */
  readonly keyPairName?: string;

  /**
   * Environment for resource configuration (auto-configures monitoring, backup, etc.)
   * Default: Based on workload type
   */
  environment?: Environment;

  /**
   * Team or department responsible for the instance
   * Default: "infrastructure"
   */
  team?: string;

  /**
   * Application name this instance supports
   * Default: "general"
   */
  application?: string;

  /**
   * Cost center for financial tracking
   * Default: "IT-001"
   */
  costCenter?: string;

  /**
   * Access type for the instance
   * Default: "private-only"
   */
  accessType?: AccessType;

  /**
   * Root volume size in GB
   * Default: Based on OS and workload
   */
  rootVolumeSize?: number;

  /**
   * Additional EBS volumes
   */
  additionalVolumes?: AdditionalVolumeArgs[];

  /**
   * User data script for instance initialization
   */
  userData?: string;

  /**
   * IAM instance profile for permissions
   */
  iamInstanceProfile?: string;

  /**
   * Additional tags for the instance
   */
  tags?: Record<string, string>;

  // Advanced options (optional - for power users)
  /**
   * Custom backup strategy (overrides workload defaults)
   */
  backupStrategy?: BackupStrategy;

  /**
   * Custom monitoring level (overrides workload defaults)
   */
  monitoringLevel?: MonitoringLevel;

  /**
   * Whether to enable termination protection
   * Default: Based on workload and environment
   */
  enableTerminationProtection?: boolean;
}

/**
 * Additional EBS volume configuration
 */
export interface AdditionalVolumeArgs {
  /**
   * Volume name
   */
  name: string;

  /**
   * Volume size in GB
   */
  size: number;

  /**
   * Volume type
   * Default: "gp3"
   */
  type?: "standard" | "gp2" | "gp3" | "io1" | "io2";

  /**
   * Whether to encrypt the volume
   * Default: true
   */
  encrypted?: boolean;

  /**
   * KMS key ID for encryption
   */
  kmsKeyId?: string;

  /**
   * IOPS for io1/io2 volumes
   */
  iops?: number;

  /**
   * Throughput for gp3 volumes (MiB/s)
   */
  throughput?: number;

  /**
   * Mount point (e.g., "/data", "/logs")
   */
  mountPoint?: string;
}

/**
 * Enterprise EC2 Instance Result
 */
export interface EnterpriseEc2Result {
  /**
   * Instance ID
   */
  instanceId: pulumi.Output<string>;

  /**
   * Public IP address (if applicable)
   */
  publicIp: pulumi.Output<string | undefined>;

  /**
   * Private IP address
   */
  privateIp: pulumi.Output<string>;

  /**
   * Public DNS name (if applicable)
   */
  publicDns: pulumi.Output<string | undefined>;

  /**
   * Private DNS name
   */
  privateDns: pulumi.Output<string>;

  /**
   * Availability zone
   */
  availabilityZone: pulumi.Output<string>;

  /**
   * Instance ARN
   */
  arn: pulumi.Output<string>;

  /**
   * Instance state
   */
  state: pulumi.Output<string>;

  /**
   * Root volume ID
   */
  rootVolumeId: pulumi.Output<string>;

  /**
   * Additional volume IDs
   */
  additionalVolumeIds: pulumi.Output<string[]>;

  /**
   * SSH connection string (for Linux instances)
   */
  sshConnectionString?: pulumi.Output<string>;

  /**
   * RDP connection string (for Windows instances)
   */
  rdpConnectionString?: pulumi.Output<string>;

  /**
   * CloudWatch dashboard URL
   */
  cloudWatchDashboardUrl: pulumi.Output<string>;
}

/**
 * OS-specific configuration
 */
export interface OsConfig {
  readonly amiId: string;
  readonly defaultRootVolumeSize: number;
  readonly userDataTemplate?: string;
  readonly requiresKeyPair: boolean;
  readonly sshUser: string;
  readonly rdpUser?: string;
}

/**
 * Workload configuration (combines instance type and settings)
 */
export interface WorkloadConfig {
  readonly instanceType: string;
  readonly vcpus: number;
  readonly memoryGiB: number;
  readonly networkPerformance: string;
  readonly monitoringLevel: MonitoringLevel;
  readonly backupStrategy: BackupStrategy;
  readonly terminationProtection: boolean;
  readonly rootVolumeSize: number;
}
