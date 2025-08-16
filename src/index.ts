import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { EbsVolumeArgs, Ec2InstanceArgs, RootBlockDeviceArgs } from "./types";

/**
 * Enterprise-ready AWS EC2 instance component with security best practices
 *
 * This component creates a secure EC2 instance with:
 * - Proper IAM roles and security groups
 * - Encrypted EBS volumes
 * - Detailed monitoring and logging
 * - Termination protection for production
 * - Comprehensive tagging for cost allocation
 * - CrossGuard compliance ready
 */
export class Ec2Instance extends pulumi.ComponentResource {
  public readonly instanceId: pulumi.Output<string>;
  public readonly publicIp: pulumi.Output<string | undefined>;
  public readonly privateIp: pulumi.Output<string>;
  public readonly publicDns: pulumi.Output<string | undefined>;
  public readonly privateDns: pulumi.Output<string>;
  public readonly availabilityZone: pulumi.Output<string>;
  public readonly arn: pulumi.Output<string>;
  public readonly state: pulumi.Output<string>;
  public readonly ebsVolumeIds: pulumi.Output<string[]>;

  constructor(
    name: string,
    args: Ec2InstanceArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("proserve:aws:Ec2Instance", name, args, opts);

    // Validate inputs
    this.validateArgs(args);

    // Create base tags
    const baseTags = {
      Name: args.name,
      Environment: args.environment,
      Project: args.project,
      ManagedBy: "pulumi",
      ...args.tags,
    };

    // Create root block device configuration
    const rootBlockDevice = this.createRootBlockDevice(
      args.rootBlockDevice,
      baseTags,
    );

    // Create the EC2 instance
    const instanceArgs: any = {
      instanceType: args.instanceType,
      ami: args.amiId,
      subnetId: args.subnetId,
      vpcSecurityGroupIds: args.securityGroupIds,
      rootBlockDevice: rootBlockDevice,
      monitoring: args.enableDetailedMonitoring !== false,
      sourceDestCheck: args.enableSourceDestCheck !== false,
      disableApiTermination: args.enableTerminationProtection || false,
      tenancy: args.tenancy || "default",
      associatePublicIpAddress: args.associatePublicIpAddress || false,
      tags: baseTags,
    };

    if (args.keyPairName) {
      instanceArgs.keyName = args.keyPairName;
    }
    if (args.iamInstanceProfile) {
      instanceArgs.iamInstanceProfile = args.iamInstanceProfile;
    }
    if (args.availabilityZone) {
      instanceArgs.availabilityZone = args.availabilityZone;
    }
    if (args.userData) {
      instanceArgs.userData = args.userData;
    }
    if (args.placementGroup) {
      instanceArgs.placementGroup = args.placementGroup;
    }

    const instance = new aws.ec2.Instance(`${name}-instance`, instanceArgs, {
      parent: this,
    });

    // Create additional EBS volumes if specified
    const ebsVolumes: aws.ebs.Volume[] = [];
    if (args.ebsVolumes) {
      args.ebsVolumes.forEach((volumeArgs, index) => {
        const volumeArgsForVolume: any = {
          availabilityZone: volumeArgs.availabilityZone,
          size: volumeArgs.size,
          type: volumeArgs.type || "gp3",
          encrypted: volumeArgs.encrypted !== false,
          tags: {
            Name: `${args.name}-${volumeArgs.name}`,
            Environment: args.environment,
            Project: args.project,
            ManagedBy: "pulumi",
            ...volumeArgs.tags,
          },
        };

        if (volumeArgs.kmsKeyId) {
          volumeArgsForVolume.kmsKeyId = volumeArgs.kmsKeyId;
        }
        if (volumeArgs.iops) {
          volumeArgsForVolume.iops = volumeArgs.iops;
        }
        if (volumeArgs.throughput) {
          volumeArgsForVolume.throughput = volumeArgs.throughput;
        }

        const volume = new aws.ebs.Volume(
          `${name}-volume-${volumeArgs.name}`,
          volumeArgsForVolume,
          { parent: this },
        );

        // Attach the volume to the instance
        new aws.ec2.VolumeAttachment(
          `${name}-attachment-${volumeArgs.name}`,
          {
            deviceName: `/dev/sd${String.fromCharCode(98 + index)}`, // /dev/sdb, /dev/sdc, etc.
            volumeId: volume.id,
            instanceId: instance.id,
          },
          { parent: this },
        );

        ebsVolumes.push(volume);
      });
    }

    // Create CloudWatch alarms for monitoring
    this.createCloudWatchAlarms(name, instance, args);

    // Set outputs
    this.instanceId = instance.id;
    this.publicIp = instance.publicIp;
    this.privateIp = instance.privateIp;
    this.publicDns = instance.publicDns;
    this.privateDns = instance.privateDns;
    this.availabilityZone = instance.availabilityZone;
    this.arn = instance.arn;
    this.state = instance.instanceState;
    this.ebsVolumeIds = pulumi.all(ebsVolumes.map((v) => v.id));

    this.registerOutputs({
      instanceId: this.instanceId,
      publicIp: this.publicIp,
      privateIp: this.privateIp,
      publicDns: this.publicDns,
      privateDns: this.privateDns,
      availabilityZone: this.availabilityZone,
      arn: this.arn,
      state: this.state,
      ebsVolumeIds: this.ebsVolumeIds,
    });
  }

  /**
   * Creates root block device configuration
   */
  private createRootBlockDevice(
    rootBlockDeviceArgs?: RootBlockDeviceArgs,
    tags?: Record<string, string>,
  ) {
    const defaultConfig = {
      volumeSize: 8,
      volumeType: "gp3" as const,
      deleteOnTermination: true,
      encrypted: true,
    };

    const config = { ...defaultConfig, ...rootBlockDeviceArgs };

    const result: any = {
      volumeSize: config.volumeSize,
      volumeType: config.volumeType,
      deleteOnTermination: config.deleteOnTermination,
      encrypted: config.encrypted,
    };

    if (config.kmsKeyId) {
      result.kmsKeyId = config.kmsKeyId;
    }
    if (config.iops) {
      result.iops = config.iops;
    }
    if (config.throughput) {
      result.throughput = config.throughput;
    }
    if (tags) {
      result.tags = tags;
    }

    return result;
  }

  /**
   * Creates CloudWatch alarms for monitoring
   */
  private createCloudWatchAlarms(
    name: string,
    instance: aws.ec2.Instance,
    args: Ec2InstanceArgs,
  ) {
    // CPU utilization alarm
    new aws.cloudwatch.MetricAlarm(
      `${name}-cpu-alarm`,
      {
        name: `${name}-cpu-utilization`,
        comparisonOperator: "GreaterThanThreshold",
        evaluationPeriods: 2,
        metricName: "CPUUtilization",
        namespace: "AWS/EC2",
        period: 300, // 5 minutes
        statistic: "Average",
        threshold: 80,
        alarmDescription: "CPU utilization is too high",
        dimensions: {
          InstanceId: instance.id,
        },
        tags: {
          Name: `${name}-cpu-alarm`,
          Environment: args.environment,
          Project: args.project,
          ManagedBy: "pulumi",
        },
      },
      { parent: this },
    );

    // Memory utilization alarm (if detailed monitoring is enabled)
    if (args.enableDetailedMonitoring !== false) {
      new aws.cloudwatch.MetricAlarm(
        `${name}-memory-alarm`,
        {
          name: `${name}-memory-utilization`,
          comparisonOperator: "GreaterThanThreshold",
          evaluationPeriods: 2,
          metricName: "MemoryUtilization",
          namespace: "System/Linux",
          period: 300,
          statistic: "Average",
          threshold: 85,
          alarmDescription: "Memory utilization is too high",
          dimensions: {
            InstanceId: instance.id,
          },
          tags: {
            Name: `${name}-memory-alarm`,
            Environment: args.environment,
            Project: args.project,
            ManagedBy: "pulumi",
          },
        },
        { parent: this },
      );
    }

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
        dimensions: {
          InstanceId: instance.id,
        },
        tags: {
          Name: `${name}-status-alarm`,
          Environment: args.environment,
          Project: args.project,
          ManagedBy: "pulumi",
        },
      },
      { parent: this },
    );
  }

  /**
   * Validates the input arguments
   */
  private validateArgs(args: Ec2InstanceArgs): void {
    if (!args.name) {
      throw new Error("name is required");
    }

    if (!args.instanceType) {
      throw new Error("instanceType is required");
    }

    if (!args.amiId) {
      throw new Error("amiId is required");
    }

    if (!args.subnetId) {
      throw new Error("subnetId is required");
    }

    if (!args.securityGroupIds || args.securityGroupIds.length === 0) {
      throw new Error("securityGroupIds must be provided and non-empty");
    }

    if (!args.environment) {
      throw new Error("environment is required");
    }

    if (!args.project) {
      throw new Error("project is required");
    }

    // Validate instance type format
    this.validateInstanceType(args.instanceType);

    // Validate AMI ID format
    this.validateAmiId(args.amiId);

    // Validate subnet ID format
    this.validateSubnetId(args.subnetId);

    // Validate security group IDs
    args.securityGroupIds.forEach((sgId, index) => {
      this.validateSecurityGroupId(sgId, index);
    });

    // Validate EBS volumes if present
    if (args.ebsVolumes) {
      args.ebsVolumes.forEach((volume, index) => {
        this.validateEbsVolume(volume, index);
      });
    }
  }

  /**
   * Validates instance type format
   */
  private validateInstanceType(instanceType: string): void {
    const instanceTypeRegex =
      /^[a-z0-9]+\.(nano|micro|small|medium|large|xlarge|2xlarge|4xlarge|8xlarge|16xlarge|32xlarge|metal)$/i;
    if (!instanceTypeRegex.test(instanceType)) {
      throw new Error(`Invalid instance type: ${instanceType}`);
    }
  }

  /**
   * Validates AMI ID format
   */
  private validateAmiId(amiId: string): void {
    const amiIdRegex = /^ami-[a-f0-9]{8,17}$/i;
    if (!amiIdRegex.test(amiId)) {
      throw new Error(
        `Invalid AMI ID format: ${amiId}. Expected format: ami-xxxxxxxx or ami-xxxxxxxxxxxxxxxxx`,
      );
    }
  }

  /**
   * Validates subnet ID format
   */
  private validateSubnetId(subnetId: string): void {
    const subnetIdRegex = /^subnet-[a-f0-9]{8,17}$/i;
    if (!subnetIdRegex.test(subnetId)) {
      throw new Error(
        `Invalid subnet ID format: ${subnetId}. Expected format: subnet-xxxxxxxx or subnet-xxxxxxxxxxxxxxxxx`,
      );
    }
  }

  /**
   * Validates security group ID format
   */
  private validateSecurityGroupId(sgId: string, index: number): void {
    const sgIdRegex = /^sg-[a-f0-9]{8,17}$/i;
    if (!sgIdRegex.test(sgId)) {
      throw new Error(
        `Invalid security group ID format at index ${index}: ${sgId}. Expected format: sg-xxxxxxxx or sg-xxxxxxxxxxxxxxxxx`,
      );
    }
  }

  /**
   * Validates EBS volume configuration
   */
  private validateEbsVolume(volume: EbsVolumeArgs, index: number): void {
    if (!volume.name) {
      throw new Error(`EBS volume name is required at index ${index}`);
    }

    if (!volume.size || volume.size < 1 || volume.size > 16384) {
      throw new Error(
        `EBS volume size must be between 1 and 16384 GB at index ${index}`,
      );
    }

    if (!volume.availabilityZone) {
      throw new Error(
        `EBS volume availability zone is required at index ${index}`,
      );
    }

    const validTypes = ["standard", "gp2", "gp3", "io1", "io2"];
    if (volume.type && !validTypes.includes(volume.type)) {
      throw new Error(
        `Invalid EBS volume type at index ${index}: ${volume.type}. Valid types: ${validTypes.join(", ")}`,
      );
    }

    if (volume.iops && (volume.iops < 100 || volume.iops > 64000)) {
      throw new Error(
        `EBS volume IOPS must be between 100 and 64000 at index ${index}`,
      );
    }

    if (
      volume.throughput &&
      (volume.throughput < 125 || volume.throughput > 1000)
    ) {
      throw new Error(
        `EBS volume throughput must be between 125 and 1000 MiB/s at index ${index}`,
      );
    }
  }
}
