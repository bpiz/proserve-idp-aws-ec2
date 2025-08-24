import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Ec2Args, Ec2Config } from "./types";

/**
 * Enterprise-ready AWS EC2 instance component with security best practices
 *
 * This component creates EC2 instances with:
 * - Smart defaults based on workload and environment
 * - Enterprise security defaults (encryption, monitoring)
 * - Proper tagging for cost allocation
 * - CrossGuard compliance ready
 * - Simplified interface for platform engineers
 * - Enterprise security: NO public IP addresses (private network only)
 */
export class Ec2 extends pulumi.ComponentResource {
  public readonly instanceId: pulumi.Output<string>;
  public readonly privateIp: pulumi.Output<string>;
  public readonly privateDns: pulumi.Output<string>;
  public readonly availabilityZone: pulumi.Output<string>;
  public readonly arn: pulumi.Output<string>;
  public readonly state: pulumi.Output<string>;
  public readonly rootVolumeId: pulumi.Output<string>;

  constructor(
    name: string,
    args: Ec2Args,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("proserve:aws:Ec2", name, args, opts);

    // Validate inputs
    this.validateArgs(args);

    // Set defaults
    const config = this.setDefaults(args);

    // Get OS configuration
    const osConfig = this.getOsConfig(config.operatingSystem);

    // Get workload configuration
    const workloadConfig = this.getWorkloadConfig(config.workload);

    // Create enterprise tags
    const tags = this.createEnterpriseTags(config);

    // Create root block device
    const rootBlockDevice = this.createRootBlockDevice(
      config,
      osConfig,
      workloadConfig
    );

    // Create EC2 instance
    const instance = new aws.ec2.Instance(
      `${name}-instance`,
      {
        ami: osConfig.amiId,
        instanceType: config.instanceType || workloadConfig.instanceType,
        subnetId: config.subnetId,
        vpcSecurityGroupIds: config.securityGroupIds,
        keyName: config.keyPairName,
        iamInstanceProfile: config.iamInstanceProfile,
        userData: config.userData,
        monitoring: config.enableDetailedMonitoring !== false,
        disableApiTermination: config.enableTerminationProtection !== false,
        rootBlockDevice: rootBlockDevice,
        associatePublicIpAddress: false,
        sourceDestCheck: true,
        tags: {
          Name: `${name}-instance`,
          Environment: config.environment,
          Project: config.project,
          Team: config.team,
          Application: config.application,
          CostCenter: config.costCenter,
          Workload: config.workload,
          OperatingSystem: config.operatingSystem,
          ManagedBy: "pulumi",
          ...config.tags,
        },
      },
      { parent: this }
    );

    // Create CloudWatch dashboard for monitoring
    if (config.enableDetailedMonitoring !== false) {
      this.createCloudWatchDashboard(name, instance.id, tags);
    }

    // Set outputs
    this.instanceId = instance.id;
    this.privateIp = instance.privateIp;
    this.privateDns = instance.privateDns;
    this.availabilityZone = instance.availabilityZone;
    this.arn = instance.arn;
    this.state = instance.instanceState;
    this.rootVolumeId = instance.rootBlockDevice.apply(
      (device) => device?.volumeId || ""
    );

    this.registerOutputs({
      instanceId: this.instanceId,
      privateIp: this.privateIp,
      privateDns: this.privateDns,
      availabilityZone: this.availabilityZone,
      arn: this.arn,
      state: this.state,
      rootVolumeId: this.rootVolumeId,
    });
  }

  private validateArgs(args: Ec2Args): void {
    if (!args.name || args.name.trim() === "") {
      throw new Error("Instance name is required");
    }
    if (!args.operatingSystem || args.operatingSystem.trim() === "") {
      throw new Error("Operating system is required");
    }
    if (!args.workload || args.workload.trim() === "") {
      throw new Error("Workload type is required");
    }
    if (!args.project || args.project.trim() === "") {
      throw new Error("Project name is required");
    }
    if (!args.subnetId || args.subnetId.trim() === "") {
      throw new Error("Subnet ID is required");
    }
    if (!args.securityGroupIds || args.securityGroupIds.length === 0) {
      throw new Error("At least one security group ID is required");
    }
  }

  private setDefaults(args: Ec2Args): Ec2Config {
    return {
      ...args,
      environment:
        args.environment || this.getDefaultEnvironment(args.workload),
      team: args.team || "infrastructure",
      application: args.application || "general",
      costCenter: args.costCenter || "IT-001",
      instanceType:
        args.instanceType || this.getDefaultInstanceType(args.workload),
      rootVolumeSize:
        args.rootVolumeSize ||
        this.getDefaultRootVolumeSize(args.operatingSystem, args.workload),
      rootVolumeType:
        args.rootVolumeType || this.getDefaultRootVolumeType(args.workload),
      enableDetailedMonitoring:
        args.enableDetailedMonitoring !== undefined
          ? args.enableDetailedMonitoring
          : this.getDefaultMonitoring(args.workload),
      enableTerminationProtection:
        args.enableTerminationProtection !== undefined
          ? args.enableTerminationProtection
          : this.getDefaultTerminationProtection(args.workload),
      tags: args.tags || {},
    };
  }

  private getDefaultEnvironment(workload: string): string {
    const productionWorkloads = ["production", "database", "high-performance"];
    return productionWorkloads.includes(workload)
      ? "production"
      : "development";
  }

  private getDefaultInstanceType(workload: string): string {
    const workloadMap: Record<string, string> = {
      development: "t3.micro",
      testing: "t3.small",
      "web-server": "t3.small",
      application: "t3.medium",
      database: "m5.large",
      "high-performance": "c5.xlarge",
      production: "m5.large",
    };
    return workloadMap[workload] || "t3.micro";
  }

  private getDefaultRootVolumeSize(os: string, workload: string): number {
    const baseSize = os.includes("windows") ? 50 : 20;
    const workloadMultiplier =
      workload === "database" || workload === "high-performance" ? 2 : 1;
    return baseSize * workloadMultiplier;
  }

  private getDefaultRootVolumeType(workload: string): string {
    return workload === "high-performance" ? "io2" : "gp3";
  }

  private getDefaultMonitoring(workload: string): boolean {
    const productionWorkloads = ["production", "database", "high-performance"];
    return productionWorkloads.includes(workload);
  }

  private getDefaultTerminationProtection(workload: string): boolean {
    const productionWorkloads = ["production", "database", "high-performance"];
    return productionWorkloads.includes(workload);
  }

  private getOsConfig(os: string): {
    amiId: string;
    sshUser: string;
    rdpUser?: string;
  } {
    const osConfigs: Record<
      string,
      { amiId: string; sshUser: string; rdpUser?: string }
    > = {
      "amazon-linux-2023": {
        amiId: "ami-0c02fb55956c7d316",
        sshUser: "ec2-user",
      },
      "amazon-linux-2": { amiId: "ami-0c02fb55956c7d316", sshUser: "ec2-user" },
      "ubuntu-22-04": { amiId: "ami-0c02fb55956c7d316", sshUser: "ubuntu" },
      "ubuntu-20-04": { amiId: "ami-0c02fb55956c7d316", sshUser: "ubuntu" },
      "rhel-9": { amiId: "ami-0c02fb55956c7d316", sshUser: "ec2-user" },
      "rhel-8": { amiId: "ami-0c02fb55956c7d316", sshUser: "ec2-user" },
      "centos-7": { amiId: "ami-0c02fb55956c7d316", sshUser: "centos" },
      "windows-server-2022": {
        amiId: "ami-0c02fb55956c7d316",
        sshUser: "Administrator",
        rdpUser: "Administrator",
      },
      "windows-server-2019": {
        amiId: "ami-0c02fb55956c7d316",
        sshUser: "Administrator",
        rdpUser: "Administrator",
      },
    };

    const config = osConfigs[os];
    if (!config) {
      throw new Error(`Unsupported operating system: ${os}`);
    }

    return config;
  }

  private getWorkloadConfig(workload: string): { instanceType: string } {
    const workloadConfigs: Record<string, { instanceType: string }> = {
      development: { instanceType: "t3.micro" },
      testing: { instanceType: "t3.small" },
      "web-server": { instanceType: "t3.small" },
      application: { instanceType: "t3.medium" },
      database: { instanceType: "m5.large" },
      "high-performance": { instanceType: "c5.xlarge" },
      production: { instanceType: "m5.large" },
    };

    const config = workloadConfigs[workload];
    if (!config) {
      throw new Error(`Unsupported workload type: ${workload}`);
    }

    return config;
  }

  private createEnterpriseTags(config: Ec2Config): Record<string, string> {
    return {
      Name: `${config.name}-instance`,
      Environment: config.environment,
      Project: config.project,
      Team: config.team,
      Application: config.application,
      CostCenter: config.costCenter,
      Workload: config.workload,
      OperatingSystem: config.operatingSystem,
      ManagedBy: "pulumi",
      ...config.tags,
    };
  }

  private createRootBlockDevice(
    config: Ec2Config,
    osConfig: { amiId: string; sshUser: string; rdpUser?: string },
    workloadConfig: { instanceType: string }
  ): any {
    return {
      volumeSize: config.rootVolumeSize,
      volumeType: config.rootVolumeType,
      encrypted: true,
      deleteOnTermination: true,
      tags: {
        Name: `${config.name}-root-volume`,
        Environment: config.environment,
        Project: config.project,
        ManagedBy: "pulumi",
      },
    };
  }

  private createCloudWatchDashboard(
    name: string,
    instanceId: pulumi.Output<string>,
    tags: Record<string, string>
  ): void {
    new aws.cloudwatch.Dashboard(
      `${name}-dashboard`,
      {
        dashboardName: `${name}-ec2-dashboard`,
        dashboardBody: pulumi.interpolate`{
          "widgets": [
            {
              "type": "metric",
              "x": 0,
              "y": 0,
              "width": 12,
              "height": 6,
              "properties": {
                "metrics": [
                  ["AWS/EC2", "CPUUtilization", "InstanceId", "${instanceId}"],
                  [".", "NetworkIn", ".", "."],
                  [".", "NetworkOut", ".", "."]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-west-2",
                "title": "EC2 Instance Metrics"
              }
            }
          ]
        }`,
      },
      { parent: this }
    );
  }
}
