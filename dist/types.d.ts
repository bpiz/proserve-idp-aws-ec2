import * as pulumi from "@pulumi/pulumi";
/**
 * Input arguments for the EC2 instance component
 */
export interface Ec2InstanceArgs {
    /**
     * The name of the EC2 instance
     */
    name: string;
    /**
     * The instance type (e.g., "t3.micro", "m5.large")
     */
    instanceType: string;
    /**
     * The AMI ID to use for the instance
     */
    amiId: string;
    /**
     * The subnet ID where the instance will be launched
     */
    subnetId: string;
    /**
     * The security group IDs to attach to the instance
     */
    securityGroupIds: string[];
    /**
     * The key pair name for SSH access (optional)
     */
    keyPairName?: string;
    /**
     * The IAM instance profile name or ARN
     */
    iamInstanceProfile?: string;
    /**
     * Environment name (e.g., "dev", "staging", "prod")
     */
    environment: string;
    /**
     * Project name
     */
    project: string;
    /**
     * The availability zone for the instance
     */
    availabilityZone?: string;
    /**
     * The root block device configuration
     */
    rootBlockDevice?: RootBlockDeviceArgs;
    /**
     * Additional EBS volumes to attach
     */
    ebsVolumes?: EbsVolumeArgs[];
    /**
     * User data script to run on instance startup
     */
    userData?: string;
    /**
     * Whether to enable detailed monitoring
     * Default: true
     */
    enableDetailedMonitoring?: boolean;
    /**
     * Whether to enable source/destination check
     * Default: true
     */
    enableSourceDestCheck?: boolean;
    /**
     * Whether to enable termination protection
     * Default: false
     */
    enableTerminationProtection?: boolean;
    /**
     * The tenancy of the instance
     * Default: "default"
     * Valid values: "default", "dedicated", "host"
     */
    tenancy?: string;
    /**
     * Whether to associate a public IP address
     * Default: false
     */
    associatePublicIpAddress?: boolean;
    /**
     * The placement group name (optional)
     */
    placementGroup?: string;
    /**
     * Additional tags to apply to the instance
     */
    tags?: Record<string, string>;
}
/**
 * Root block device configuration
 */
export interface RootBlockDeviceArgs {
    /**
     * The size of the root volume in GB
     * Default: 8
     */
    volumeSize?: number;
    /**
     * The type of the root volume
     * Default: "gp3"
     * Valid values: "standard", "gp2", "gp3", "io1", "io2"
     */
    volumeType?: string;
    /**
     * Whether to delete the volume on instance termination
     * Default: true
     */
    deleteOnTermination?: boolean;
    /**
     * Whether to encrypt the root volume
     * Default: true
     */
    encrypted?: boolean;
    /**
     * The KMS key ID for encryption (optional)
     */
    kmsKeyId?: string;
    /**
     * The IOPS for the volume (for io1/io2 types)
     */
    iops?: number;
    /**
     * The throughput for the volume in MiB/s (for gp3)
     */
    throughput?: number;
}
/**
 * EBS volume configuration
 */
export interface EbsVolumeArgs {
    /**
     * The name of the volume
     */
    name: string;
    /**
     * The size of the volume in GB
     */
    size: number;
    /**
     * The type of the volume
     * Default: "gp3"
     * Valid values: "standard", "gp2", "gp3", "io1", "io2"
     */
    type?: string;
    /**
     * The availability zone for the volume
     */
    availabilityZone: string;
    /**
     * Whether to encrypt the volume
     * Default: true
     */
    encrypted?: boolean;
    /**
     * The KMS key ID for encryption (optional)
     */
    kmsKeyId?: string;
    /**
     * The IOPS for the volume (for io1/io2 types)
     */
    iops?: number;
    /**
     * The throughput for the volume in MiB/s (for gp3)
     */
    throughput?: number;
    /**
     * Additional tags for the volume
     */
    tags?: Record<string, string>;
}
/**
 * Output values from the EC2 instance component
 */
export interface Ec2InstanceResult {
    /**
     * The ID of the created EC2 instance
     */
    instanceId: pulumi.Output<string>;
    /**
     * The public IP address of the instance (if applicable)
     */
    publicIp: pulumi.Output<string | undefined>;
    /**
     * The private IP address of the instance
     */
    privateIp: pulumi.Output<string>;
    /**
     * The public DNS name of the instance (if applicable)
     */
    publicDns: pulumi.Output<string | undefined>;
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
     * The state of the instance
     */
    state: pulumi.Output<string>;
    /**
     * The IDs of attached EBS volumes
     */
    ebsVolumeIds: pulumi.Output<string[]>;
}
//# sourceMappingURL=types.d.ts.map