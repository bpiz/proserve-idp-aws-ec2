import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { OS_CONFIGS, WORKLOAD_CONFIGS, WORKLOAD_ENVIRONMENTS } from "./data";
import {
  AdditionalVolumeArgs,
  BackupStrategy,
  EnterpriseEc2Args,
  Environment,
  MonitoringLevel,
  OsConfig,
  WorkloadConfig,
} from "./types";
import {
  createAdditionalVolumes,
  createBackupResources,
  createCloudWatchDashboard,
  createMonitoringResources,
  createRootBlockDevice,
  validateArgs,
} from "./utils";

/**
 * Internal configuration type with all defaults applied
 */
type EnterpriseEc2Config = Required<
  Omit<
    EnterpriseEc2Args,
    | "keyPairName"
    | "iamInstanceProfile"
    | "userData"
    | "additionalVolumes"
    | "tags"
    | "backupStrategy"
    | "monitoringLevel"
    | "enableTerminationProtection"
  >
> & {
  keyPairName?: string;
  iamInstanceProfile?: string;
  userData?: string;
  additionalVolumes?: AdditionalVolumeArgs[];
  tags?: Record<string, string>;
  backupStrategy?: BackupStrategy;
  monitoringLevel?: MonitoringLevel;
  enableTerminationProtection?: boolean;
};

/**
 * Enterprise-ready AWS EC2 instance component
 *
 * This component provides a simplified, enterprise-focused way to deploy EC2 instances
 * with company-approved configurations, security best practices, and cost optimization.
 *
 * Features:
 * - Predefined OS configurations with latest AMIs
 * - Simplified workload types (development, web-server, database, etc.)
 * - Enterprise security defaults (encryption, monitoring, backup)
 * - Smart defaults based on workload and environment
 * - Developer-friendly interface
 * - Progressive complexity for advanced users
 */
export class EnterpriseEc2Instance extends pulumi.ComponentResource {
  public readonly instanceId: pulumi.Output<string>;
  public readonly publicIp: pulumi.Output<string | undefined>;
  public readonly privateIp: pulumi.Output<string>;
  public readonly publicDns: pulumi.Output<string | undefined>;
  public readonly privateDns: pulumi.Output<string>;
  public readonly availabilityZone: pulumi.Output<string>;
  public readonly arn: pulumi.Output<string>;
  public readonly state: pulumi.Output<string>;
  public readonly rootVolumeId: pulumi.Output<string>;
  public readonly additionalVolumeIds: pulumi.Output<string[]>;
  public readonly sshConnectionString?: pulumi.Output<string>;
  public readonly rdpConnectionString?: pulumi.Output<string>;
  public readonly cloudWatchDashboardUrl: pulumi.Output<string>;

  constructor(
    name: string,
    args: EnterpriseEc2Args,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("proserve:aws:EnterpriseEc2Instance", name, args, opts);

    // Set defaults and validate inputs
    const config = this.setDefaults(args);
    validateArgs(config);

    // Get OS and workload configurations
    const osConfig = OS_CONFIGS[config.operatingSystem];
    const workloadConfig = WORKLOAD_CONFIGS[config.workload];

    // Create enterprise tags
    const tags = this.createEnterpriseTags(config);

    // Create root block device
    const rootBlockDevice = createRootBlockDevice(
      config,
      osConfig,
      workloadConfig,
      tags
    );

    // Create instance arguments
    const instanceArgs = this.createInstanceArgs(
      config,
      osConfig,
      workloadConfig,
      rootBlockDevice
    );

    // Create the EC2 instance
    const instance = new aws.ec2.Instance(`${name}-instance`, instanceArgs, {
      parent: this,
    });

    // Create additional EBS volumes
    const additionalVolumes = createAdditionalVolumes(
      name,
      config,
      instance,
      tags
    );

    // Create CloudWatch dashboard
    const dashboard = createCloudWatchDashboard(name, instance, config);

    // Create monitoring and backup resources
    createMonitoringResources(
      name,
      instance,
      config,
      workloadConfig.monitoringLevel
    );
    createBackupResources(
      name,
      instance,
      config,
      workloadConfig.backupStrategy
    );

    // Set outputs
    this.instanceId = instance.id;
    this.publicIp = instance.publicIp;
    this.privateIp = instance.privateIp;
    this.publicDns = instance.publicDns;
    this.privateDns = instance.privateDns;
    this.availabilityZone = instance.availabilityZone;
    this.arn = instance.arn;
    this.state = instance.instanceState;
    this.rootVolumeId = instance.rootBlockDevice.apply(
      (device) => device?.volumeId || ""
    );
    this.additionalVolumeIds = pulumi.all(additionalVolumes.map((v) => v.id));

    // Create connection strings (key pair is optional)
    if (osConfig.requiresKeyPair && config.keyPairName) {
      this.sshConnectionString = pulumi.interpolate`ssh -i ~/.ssh/${config.keyPairName} ${osConfig.sshUser}@${instance.publicIp || instance.privateIp}`;
    } else if (osConfig.requiresKeyPair) {
      // No key pair provided - suggest alternative connection methods
      this.sshConnectionString = pulumi.interpolate`# No SSH key pair configured for ${config.name}
# Alternative connection methods:
# 1. AWS Systems Manager (SSM): aws ssm start-session --target ${instance.id}
# 2. VPN/Direct Connect: Access via corporate network
# 3. Bastion host: Use jump server for access
# 4. Load balancer: For web applications`;
    }

    if (config.operatingSystem.includes("windows")) {
      this.rdpConnectionString = pulumi.interpolate`mstsc /v:${instance.publicIp || instance.privateIp}`;
    }

    this.cloudWatchDashboardUrl = dashboard.dashboardArn;

    this.registerOutputs({
      instanceId: this.instanceId,
      publicIp: this.publicIp,
      privateIp: this.privateIp,
      publicDns: this.publicDns,
      privateDns: this.privateDns,
      availabilityZone: this.availabilityZone,
      arn: this.arn,
      state: this.state,
      rootVolumeId: this.rootVolumeId,
      additionalVolumeIds: this.additionalVolumeIds,
      sshConnectionString: this.sshConnectionString,
      rdpConnectionString: this.rdpConnectionString,
      cloudWatchDashboardUrl: this.cloudWatchDashboardUrl,
    });
  }

  /**
   * Sets enterprise defaults based on workload and environment
   */
  private setDefaults(args: EnterpriseEc2Args): EnterpriseEc2Config {
    return {
      ...args,
      environment: (args.environment ||
        WORKLOAD_ENVIRONMENTS[args.workload]) as Environment,
      accessType: args.accessType || "private-only",
      rootVolumeSize: args.rootVolumeSize || 20,
      team: args.team || "infrastructure",
      application: args.application || "general",
      costCenter: args.costCenter || "IT-001",
    };
  }

  /**
   * Creates enterprise-standard tags
   */
  private createEnterpriseTags(
    config: EnterpriseEc2Config
  ): Record<string, string> {
    return {
      Name: config.name,
      Environment: config.environment,
      Project: config.project,
      Team: config.team,
      Application: config.application,
      CostCenter: config.costCenter,
      Workload: config.workload,
      ManagedBy: "pulumi",
      Compliance: "enterprise",
      ...config.tags,
    };
  }

  /**
   * Creates instance arguments
   */
  private createInstanceArgs(
    config: EnterpriseEc2Config,
    osConfig: OsConfig,
    workloadConfig: WorkloadConfig,
    rootBlockDevice: aws.types.input.ec2.InstanceRootBlockDevice
  ): aws.ec2.InstanceArgs {
    const args: aws.ec2.InstanceArgs = {
      instanceType: workloadConfig.instanceType,
      ami: osConfig.amiId,
      subnetId: config.subnetId,
      vpcSecurityGroupIds: config.securityGroupIds,
      rootBlockDevice: rootBlockDevice,
      monitoring:
        workloadConfig.monitoringLevel === "detailed" ||
        workloadConfig.monitoringLevel === "enhanced" ||
        workloadConfig.monitoringLevel === "enterprise",
      sourceDestCheck: true,
      disableApiTermination:
        config.enableTerminationProtection ??
        workloadConfig.terminationProtection,
      tenancy: "default",
      associatePublicIpAddress: config.accessType === "public-access",
      tags: this.createEnterpriseTags(config),
    };

    if (config.keyPairName && osConfig.requiresKeyPair) {
      args.keyName = config.keyPairName;
    }

    if (config.iamInstanceProfile) {
      args.iamInstanceProfile = config.iamInstanceProfile;
    }

    if (config.userData) {
      args.userData = config.userData;
    }

    return args;
  }
}
