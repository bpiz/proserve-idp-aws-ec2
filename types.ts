import * as pulumi from "@pulumi/pulumi";

/**
 * Input arguments for the EC2 component
 */
export interface Ec2Args {
  /**
   * Instance name (used for resource naming and tagging)
   */
  name: string;

  /**
   * Operating system to use
   * Valid values: "amazon-linux-2023", "amazon-linux-2", "ubuntu-22-04", "ubuntu-20-04",
   * "rhel-9", "rhel-8", "centos-7", "windows-server-2022", "windows-server-2019"
   */
  operatingSystem: string;

  /**
   * Workload type (determines instance size, monitoring, backup, etc.)
   * Valid values: "development", "web-server", "application", "database", "high-performance",
   * "testing", "production"
   */
  workload: string;

  /**
   * Project name for cost allocation
   */
  project: string;

  /**
   * Subnet ID where instance will be launched
   */
  subnetId: string;

  /**
   * Security group IDs to attach
   */
  securityGroupIds: string[];

  /**
   * SSH key pair name (optional - teams can use SSM, VPN, bastion hosts, etc.)
   */
  keyPairName?: string;

  /**
   * Environment for resource configuration (auto-configures monitoring, backup, etc.)
   * Default: Based on workload type
   */
  environment?: string;

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
   * Instance type (optional - auto-selected based on workload if not specified)
   * Examples: "t3.micro", "t3.small", "m5.large", "c5.xlarge"
   */
  instanceType?: string;

  /**
   * Root volume size in GB
   * Default: Based on OS and workload
   */
  rootVolumeSize?: number;

  /**
   * Root volume type
   * Default: "gp3" for most workloads, "io2" for high-performance
   */
  rootVolumeType?: string;

  /**
   * Whether to enable detailed monitoring
   * Default: true for production workloads
   */
  enableDetailedMonitoring?: boolean;

  /**
   * Whether to enable termination protection
   * Default: true for production workloads
   */
  enableTerminationProtection?: boolean;

  /**
   * IAM instance profile ARN (optional)
   */
  iamInstanceProfile?: string;

  /**
   * User data script (optional)
   */
  userData?: string;

  /**
   * Additional tags to apply to all resources
   */
  tags?: Record<string, string>;
}

/**
 * Internal configuration type with all defaults applied
 */
export interface Ec2Config
  extends Omit<Ec2Args, "keyPairName" | "iamInstanceProfile" | "userData"> {
  keyPairName?: string;
  iamInstanceProfile?: string;
  userData?: string;
  environment: string;
  team: string;
  application: string;
  costCenter: string;
  instanceType: string;
  rootVolumeSize: number;
  rootVolumeType: string;
  enableDetailedMonitoring: boolean;
  enableTerminationProtection: boolean;
  tags: Record<string, string>;
}

/**
 * Output values from the EC2 component
 */
export interface Ec2Result {
  /**
   * The ID of the created EC2 instance
   */
  instanceId: pulumi.Output<string>;

  /**
   * The private IP address of the instance
   */
  privateIp: pulumi.Output<string>;

  /**
   * The private DNS name of the instance
   */
  privateDns: pulumi.Output<string>;

  /**
   * The availability zone of the instance
   */
  availabilityZone: pulumi.Output<string>;

  /**
   * The ARN of the instance
   */
  arn: pulumi.Output<string>;

  /**
   * The current state of the instance
   */
  state: pulumi.Output<string>;

  /**
   * The ID of the root volume
   */
  rootVolumeId: pulumi.Output<string>;
}
