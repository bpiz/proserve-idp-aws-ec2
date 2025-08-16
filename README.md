# AWS EC2 Component

Enterprise-ready AWS EC2 instance component with security best practices.

## Features

- **Instance Management**: Create and manage EC2 instances with best practices
- **Security Groups**: Integrated security group management with least privilege access
- **IAM Roles**: Proper IAM role assignment for instance permissions
- **Monitoring**: CloudWatch monitoring and logging enabled by default
- **Backup**: Automated backup and snapshot management
- **Enterprise Tagging**: Comprehensive tagging for cost allocation and compliance
- **Input Validation**: Robust input validation with clear error messages
- **CrossGuard Ready**: Designed for Pulumi CrossGuard policy compliance

## Installation

```bash
npm install @proserve/aws-ec2
```

## Usage

### Basic Example

```typescript
import * as pulumi from "@pulumi/pulumi";
import { Ec2Instance } from "@proserve/aws-ec2";

const instance = new Ec2Instance("my-instance", {
  instanceType: "t3.micro",
  amiId: "ami-12345678",
  subnetId: "subnet-12345678",
  keyName: "my-key-pair",
  environment: "dev",
  project: "my-project",
  tags: {
    Owner: "platform-team",
    CostCenter: "platform",
  },
});

export const instanceId = instance.instanceId;
export const privateIpAddress = instance.privateIpAddress;
export const publicIpAddress = instance.publicIpAddress;
```

### Advanced Example

```typescript
import * as pulumi from "@pulumi/pulumi";
import { Ec2Instance } from "@proserve/aws-ec2";

const instance = new Ec2Instance("production-instance", {
  instanceType: "t3.medium",
  amiId: "ami-87654321",
  subnetId: "subnet-87654321",
  keyName: "production-key-pair",
  environment: "production",
  project: "enterprise-platform",
  enableMonitoring: true,
  enableDetailedMonitoring: true,
  enableTerminationProtection: true,
  enableBackup: true,
  backupRetentionDays: 30,
  securityGroupIds: ["sg-12345678", "sg-87654321"],
  iamRoleName: "EC2InstanceRole",
  userData: `#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd`,
  tags: {
    Owner: "platform-team",
    CostCenter: "platform",
    Compliance: "pci-dss",
    Backup: "daily",
    Monitoring: "enabled",
  },
});
```

## Configuration

### Required Parameters

- `instanceType`: The EC2 instance type (e.g., "t3.micro", "t3.medium")
- `amiId`: The AMI ID to use for the instance
- `subnetId`: The subnet ID where the instance will be launched
- `keyName`: The name of the key pair for SSH access
- `environment`: Environment name (e.g., "dev", "staging", "prod")
- `project`: Project name for tagging

### Optional Parameters

- `enableMonitoring`: Whether to enable basic CloudWatch monitoring (default: true)
- `enableDetailedMonitoring`: Whether to enable detailed CloudWatch monitoring (default: false)
- `enableTerminationProtection`: Whether to enable termination protection (default: false)
- `enableBackup`: Whether to enable automated backup (default: true)
- `backupRetentionDays`: Retention period for backups in days (default: 7)
- `securityGroupIds`: Array of security group IDs to attach
- `iamRoleName`: IAM role name to attach to the instance
- `userData`: User data script to run on instance launch
- `tags`: Additional tags to apply to the instance

## Outputs

- `instanceId`: The ID of the created EC2 instance
- `instanceType`: The instance type
- `privateIpAddress`: The private IP address of the instance
- `publicIpAddress`: The public IP address of the instance (if applicable)
- `availabilityZone`: The availability zone where the instance is located
- `securityGroupIds`: Array of attached security group IDs

## Security Features

- **Least Privilege Access**: Security groups configured with minimal required access
- **IAM Role Integration**: Proper IAM role assignment for instance permissions
- **Encryption**: EBS volumes encrypted by default
- **Monitoring**: Comprehensive CloudWatch monitoring and alerting
- **Backup**: Automated backup and disaster recovery

## Best Practices

- Use specific security groups with minimal required access
- Enable CloudWatch monitoring for production instances
- Use IAM roles instead of hardcoded credentials
- Implement proper tagging for cost allocation
- Enable termination protection for critical instances
- Use user data scripts for consistent instance configuration

## Dependencies

- AWS VPC component for networking infrastructure
- AWS IAM component for role management
- AWS Security Groups component for access control

## Support

For issues and questions, please contact the ProServe Platform Team.
