# AWS EC2 Component

Enterprise-ready AWS EC2 instance component with security best practices.

## Overview

This component creates EC2 instances with:

- Smart defaults based on workload and environment
- Enterprise security defaults (encryption, monitoring)
- **Enterprise security: NO public IP addresses (private network only)**
- Proper tagging for cost allocation
- CrossGuard compliance ready
- Simplified interface for platform engineers

## Features

- **Smart Defaults**: Automatically selects appropriate instance types, volumes, and settings based on workload
- **Enterprise Security**: Encryption at rest, proper monitoring, and security group integration
- **Private Network Only**: **NO public IP addresses for enterprise security**
- **Cost Optimization**: Appropriate instance sizing and volume types for different workloads
- **Simplified Interface**: Easy-to-use configuration with sensible defaults
- **Monitoring Ready**: CloudWatch dashboard creation and detailed monitoring options

## Enterprise Security

This component enforces enterprise security best practices:

- **NO Public IP Addresses**: All instances are private-network-only
- **Private Subnet Deployment**: Instances must be deployed in private subnets
- **Security Group Integration**: Proper network segmentation via security groups
- **Encrypted Storage**: All EBS volumes encrypted by default
- **Access Control**: Access via VPN, Direct Connect, Systems Manager (SSM), or bastion hosts

## Usage

### Basic Example

```typescript
import { Ec2 } from "aws-ec2";

const instance = new Ec2("my-instance", {
  name: "my-instance",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "my-project",
  subnetId: "subnet-12345", // Must be a private subnet
  securityGroupIds: ["sg-12345"],
});
```

### Advanced Example

```typescript
const instance = new Ec2("production-instance", {
  name: "production-instance",
  operatingSystem: "rhel-9",
  workload: "database",
  project: "customer-database",
  subnetId: "subnet-12345", // Must be a private subnet
  securityGroupIds: ["sg-12345"],
  environment: "production",
  team: "data-team",
  application: "customer-database",
  costCenter: "DATA-001",
  instanceType: "m5.xlarge",
  rootVolumeSize: 100,
  rootVolumeType: "io2",
  enableDetailedMonitoring: true,
  enableTerminationProtection: true,
  tags: {
    Owner: "data-team",
    Purpose: "database-server",
  },
});
```

## Configuration

### Required Parameters

- `name`: Instance name (used for resource naming and tagging)
- `operatingSystem`: Operating system to use
- `workload`: Workload type (determines instance size, monitoring, backup, etc.)
- `project`: Project name for cost allocation
- `subnetId`: **Private subnet ID** where instance will be launched (NO public subnets)
- `securityGroupIds`: Security group IDs to attach

### Optional Parameters

- `keyPairName`: SSH key pair name (optional - teams can use SSM, VPN, bastion hosts, etc.)
- `environment`: Environment for resource configuration (auto-configures monitoring, backup, etc.)
- `team`: Team or department responsible for the instance (default: "infrastructure")
- `application`: Application name this instance supports (default: "general")
- `costCenter`: Cost center for financial tracking (default: "IT-001")
- `instanceType`: Instance type (auto-selected based on workload if not specified)
- `rootVolumeSize`: Root volume size in GB (auto-selected based on OS and workload)
- `rootVolumeType`: Root volume type (default: "gp3" for most workloads, "io2" for high-performance)
- `enableDetailedMonitoring`: Whether to enable detailed monitoring (default: true for production workloads)
- `enableTerminationProtection`: Whether to enable termination protection (default: true for production workloads)
- `iamInstanceProfile`: IAM instance profile ARN (optional)
- `userData`: User data script (optional)
- `tags`: Additional tags to apply to all resources

## Operating Systems

Supported operating systems:

- `amazon-linux-2023`
- `amazon-linux-2`
- `ubuntu-22-04`
- `ubuntu-20-04`
- `rhel-9`
- `rhel-8`
- `centos-7`
- `windows-server-2022`
- `windows-server-2019`

## Workload Types

Supported workload types with automatic configuration:

- `development`: t3.micro, basic monitoring, no termination protection
- `testing`: t3.small, basic monitoring, no termination protection
- `web-server`: t3.small, basic monitoring, no termination protection
- `application`: t3.medium, basic monitoring, no termination protection
- `database`: m5.large, detailed monitoring, termination protection
- `high-performance`: c5.xlarge, detailed monitoring, termination protection
- `production`: m5.large, detailed monitoring, termination protection

## Outputs

- `instanceId`: The ID of the created EC2 instance
- `privateIp`: The private IP address of the instance
- `privateDns`: The private DNS name of the instance
- `availabilityZone`: The availability zone of the instance
- `arn`: The ARN of the instance
- `state`: The current state of the instance
- `rootVolumeId`: The ID of the root volume

**Note**: No public IP addresses are provided for enterprise security.

## Security Features

- **Encryption**: All EBS volumes are encrypted by default
- **Private Network Only**: **NO public IP addresses - enterprise security enforced**
- **Security Groups**: Integration with existing security groups
- **IAM Integration**: Support for IAM instance profiles
- **Monitoring**: CloudWatch dashboard creation and detailed monitoring
- **Termination Protection**: Automatic protection for production workloads

## Access Methods

Since instances are private-network-only, access is provided through enterprise-approved methods:

1. **AWS Systems Manager (SSM)**: `aws ssm start-session --target <instance-id>`
2. **VPN Connection**: Access via corporate VPN
3. **Direct Connect**: Access via corporate network
4. **Bastion Hosts**: Jump server access
5. **Load Balancer**: For web applications (no direct instance access)

## Cost Optimization

- **Smart Instance Selection**: Automatically selects appropriate instance types
- **Volume Optimization**: Uses gp3 for most workloads, io2 for high-performance
- **Auto-shutdown**: Can be configured for development environments
- **Cost Tagging**: Proper tagging for cost allocation and tracking

## Examples

See the `examples/basic/` directory for a complete working example.

## Dependencies

- `@pulumi/pulumi` ^3.0.0
- `@pulumi/aws` ^6.0.0

## Building

```bash
npm install
npm run build
```

## License

This component is part of the ProServe IDP platform.
