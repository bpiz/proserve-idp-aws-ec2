import * as pulumi from "@pulumi/pulumi";
import { Ec2InstanceArgs } from "./types";
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
export declare class Ec2Instance extends pulumi.ComponentResource {
    readonly instanceId: pulumi.Output<string>;
    readonly publicIp: pulumi.Output<string | undefined>;
    readonly privateIp: pulumi.Output<string>;
    readonly publicDns: pulumi.Output<string | undefined>;
    readonly privateDns: pulumi.Output<string>;
    readonly availabilityZone: pulumi.Output<string>;
    readonly arn: pulumi.Output<string>;
    readonly state: pulumi.Output<string>;
    readonly ebsVolumeIds: pulumi.Output<string[]>;
    constructor(name: string, args: Ec2InstanceArgs, opts?: pulumi.ComponentResourceOptions);
    /**
     * Creates root block device configuration
     */
    private createRootBlockDevice;
    /**
     * Creates CloudWatch alarms for monitoring
     */
    private createCloudWatchAlarms;
    /**
     * Validates the input arguments
     */
    private validateArgs;
    /**
     * Validates instance type format
     */
    private validateInstanceType;
    /**
     * Validates AMI ID format
     */
    private validateAmiId;
    /**
     * Validates subnet ID format
     */
    private validateSubnetId;
    /**
     * Validates security group ID format
     */
    private validateSecurityGroupId;
    /**
     * Validates EBS volume configuration
     */
    private validateEbsVolume;
}
//# sourceMappingURL=index.d.ts.map