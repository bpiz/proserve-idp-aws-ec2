# Enterprise EC2 Instance Component

A simplified, enterprise-ready AWS EC2 instance component that provides company-approved configurations, security best practices, and cost optimization out of the box.

## 🚀 **Quick Start (5 Minutes)**

### **Level 1: "Just Deploy" - Minimal Configuration**

```typescript
import { EnterpriseEc2Instance } from "@proserve/aws-ec2";

const instance = new EnterpriseEc2Instance("my-server", {
  name: "my-server",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "my-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "my-key", // Must exist in AWS already
});
```

**That's it!** You now have a production-ready EC2 instance with:

- ✅ Latest Amazon Linux 2023 AMI
- ✅ t3.medium instance (2 vCPU, 4 GB RAM)
- ✅ Enhanced monitoring and daily backup
- ✅ Termination protection enabled
- ✅ Enterprise security defaults

## 📚 **Progressive Complexity Levels**

### **Level 1: "Just Deploy" (6 parameters)**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  name: "my-server",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "my-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "my-key",
});
```

### **Level 2: "Team Ready" (Add business context)**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  name: "my-server",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "my-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "my-key",
  // Add team context
  team: "web-team",
  environment: "production",
  application: "company-website",
  costCenter: "WEB-001",
});
```

### **Level 3: "Common Use Cases" (Different workload types)**

```typescript
// Web server
const webServer = new EnterpriseEc2Instance("web-server", {
  name: "web-server",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "web-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "web-key",
  team: "web-team",
  application: "company-website",
  costCenter: "WEB-001",
});

// Development instance
const devInstance = new EnterpriseEc2Instance("dev-instance", {
  name: "dev-instance",
  operatingSystem: "ubuntu-22-04",
  workload: "development",
  project: "dev-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "dev-key",
  team: "dev-team",
  application: "mobile-backend",
  costCenter: "DEV-001",
});

// Database server
const database = new EnterpriseEc2Instance("database", {
  name: "database",
  operatingSystem: "rhel-9",
  workload: "database",
  project: "database-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "db-key",
  team: "data-team",
  application: "customer-database",
  costCenter: "DATA-001",
  additionalVolumes: [
    {
      name: "database",
      size: 500,
      type: "gp3",
      encrypted: true,
      mountPoint: "/var/lib/mysql",
    },
  ],
});
```

### **Level 4: "Advanced Features" (Custom configuration)**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  name: "my-server",
  operatingSystem: "amazon-linux-2023",
  workload: "high-performance",
  project: "my-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "my-key",
  team: "performance-team",
  application: "ml-pipeline",
  costCenter: "ML-001",
  // Advanced features
  additionalVolumes: [
    {
      name: "data",
      size: 1000,
      type: "gp3",
      encrypted: true,
      mountPoint: "/data",
    },
  ],
  userData: `#!/bin/bash
yum update -y
yum install -y docker`,
  // Override workload defaults
  backupStrategy: "critical",
  monitoringLevel: "enterprise",
  enableTerminationProtection: true,
});
```

## 🔑 **Key Pair & Connection Methods**

### **Key Pairs Are Optional**

- **Key pairs are NOT required** for any instance type
- **Teams can choose** their preferred connection method
- **Multiple connection options** available for enterprise environments

### **Connection Methods Available**

#### **1. SSH Key Pairs (Traditional)**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  // ... other config
  keyPairName: "my-team-key", // Must exist in AWS
});
```

#### **2. AWS Systems Manager (SSM) - Recommended**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  // ... other config
  // No keyPairName needed - use SSM instead
});

// Connect via SSM:
// aws ssm start-session --target <instance-id>
```

#### **3. VPN/Direct Connect**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  // ... other config
  accessType: "private-only", // Only accessible via VPC
});
```

#### **4. Bastion Hosts**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  // ... other config
  accessType: "private-only", // Access via jump server
});
```

#### **5. Load Balancer Health Checks**

```typescript
const instance = new EnterpriseEc2Instance("my-server", {
  // ... other config
  // For web applications - no direct access needed
});
```

### **Key Pair Setup (If Using SSH)**

If you choose to use SSH key pairs:

```bash
# Create key pair via AWS CLI
aws ec2 create-key-pair --key-name my-team-key --query 'KeyMaterial' --output text > my-team-key.pem

# Set proper permissions
chmod 400 my-team-key.pem

# Use in component
keyPairName: "my-team-key"
```

### **SSM Setup (Recommended)**

For secure, keyless access:

```bash
# Install Session Manager plugin
# https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

# Connect to instance
aws ssm start-session --target <instance-id>
```

## 🎯 **Workload Types (Simplified Configuration)**

Instead of complex instance sizing, use business-focused workload types:

| Workload           | Instance Type | CPU    | Memory | Use Case              | Monitoring | Backup   |
| ------------------ | ------------- | ------ | ------ | --------------------- | ---------- | -------- |
| `development`      | t3.micro      | 2 vCPU | 1 GB   | Development, testing  | Basic      | None     |
| `web-server`       | t3.medium     | 2 vCPU | 4 GB   | Web hosting           | Detailed   | Daily    |
| `application`      | t3.large      | 2 vCPU | 8 GB   | Application servers   | Detailed   | Weekly   |
| `database`         | r6i.large     | 2 vCPU | 16 GB  | Database servers      | Enhanced   | Daily    |
| `high-performance` | c6i.xlarge    | 4 vCPU | 8 GB   | ML, compute-intensive | Enterprise | Critical |
| `testing`          | t3.micro      | 2 vCPU | 1 GB   | Testing, staging      | Basic      | None     |
| `production`       | m6i.large     | 2 vCPU | 8 GB   | Production workloads  | Enterprise | Daily    |

## 🖥️ **Operating Systems**

| OS                    | Description                | Default Volume Size | SSH User      |
| --------------------- | -------------------------- | ------------------- | ------------- |
| `amazon-linux-2023`   | Amazon Linux 2023          | 8 GB                | ec2-user      |
| `amazon-linux-2`      | Amazon Linux 2             | 8 GB                | ec2-user      |
| `ubuntu-22-04`        | Ubuntu 22.04 LTS           | 10 GB               | ubuntu        |
| `ubuntu-20-04`        | Ubuntu 20.04 LTS           | 10 GB               | ubuntu        |
| `rhel-9`              | Red Hat Enterprise Linux 9 | 10 GB               | ec2-user      |
| `rhel-8`              | Red Hat Enterprise Linux 8 | 10 GB               | ec2-user      |
| `centos-7`            | CentOS 7                   | 8 GB                | centos        |
| `windows-server-2022` | Windows Server 2022        | 30 GB               | Administrator |
| `windows-server-2019` | Windows Server 2019        | 30 GB               | Administrator |

## 🔧 **Configuration Options**

### **Required Parameters (6 total)**

- `name`: Instance name for resource naming and tagging
- `operatingSystem`: Predefined OS selection
- `workload`: Workload type (development, web-server, database, etc.)
- `project`: Project name for cost allocation
- `subnetId`: Subnet where instance will be launched
- `securityGroupIds`: Security groups to attach

### **Optional Parameters**

- `keyPairName`: SSH key pair (optional - teams can use SSM, VPN, bastion hosts, etc.)
- `team`: Team responsible for the instance
- `environment`: Environment (auto-configured based on workload)
- `application`: Application name
- `costCenter`: Cost center for financial tracking
- `accessType`: Network access type
- `rootVolumeSize`: Root volume size in GB
- `additionalVolumes`: Additional EBS volumes
- `userData`: Custom initialization script
- `iamInstanceProfile`: IAM role for permissions

### **Advanced Options (Override workload defaults)**

- `backupStrategy`: Custom backup strategy
- `monitoringLevel`: Custom monitoring level
- `enableTerminationProtection`: Custom termination protection

## 🏢 **Enterprise Features**

### **Security & Compliance**

- **Encryption**: All EBS volumes encrypted by default
- **IAM Integration**: Support for instance profiles and roles
- **Security Groups**: Proper network segmentation
- **Compliance Tags**: Enterprise tagging for audit and compliance

### **Monitoring & Alerting**

- **CloudWatch Integration**: Automatic metric collection
- **Custom Dashboard**: Pre-built monitoring dashboard
- **Alerts**: CPU, status check, and custom metric alarms
- **Logging**: Comprehensive logging and audit trails

### **Backup & Recovery**

- **Automated Backup**: Configurable backup strategies
- **Maintenance Windows**: Scheduled backup windows
- **Retention Policies**: Configurable backup retention
- **Recovery Procedures**: Documented recovery processes

### **Cost Management**

- **Cost Allocation**: Team, project, and cost center tagging
- **Resource Optimization**: Right-sized instances and volumes
- **Budget Tracking**: Clear cost allocation for finance teams

## 📖 **Examples by Use Case**

### **Web Server (Production)**

```typescript
const webServer = new EnterpriseEc2Instance("web-server", {
  name: "company-website",
  operatingSystem: "amazon-linux-2023",
  workload: "web-server",
  project: "company-website",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "web-key",
  team: "web-team",
  application: "company-website",
  costCenter: "WEB-001",
});
```

### **Development Instance**

```typescript
const devInstance = new EnterpriseEc2Instance("dev-instance", {
  name: "dev-server",
  operatingSystem: "ubuntu-22-04",
  workload: "development",
  project: "mobile-app",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "dev-key",
  team: "dev-team",
  application: "mobile-backend",
  costCenter: "DEV-001",
});
```

### **Database Server**

```typescript
const dbServer = new EnterpriseEc2Instance("db-server", {
  name: "customer-db",
  operatingSystem: "rhel-9",
  workload: "database",
  project: "customer-portal",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "db-key",
  team: "data-team",
  application: "customer-database",
  costCenter: "DATA-001",
  additionalVolumes: [
    {
      name: "database",
      size: 500,
      type: "gp3",
      encrypted: true,
      mountPoint: "/var/lib/mysql",
    },
  ],
});
```

### **High-Performance Computing**

```typescript
const mlInstance = new EnterpriseEc2Instance("ml-pipeline", {
  name: "ml-pipeline",
  operatingSystem: "amazon-linux-2023",
  workload: "high-performance",
  project: "ml-project",
  subnetId: "subnet-123",
  securityGroupIds: ["sg-123"],
  keyPairName: "ml-key",
  team: "ml-team",
  application: "ml-pipeline",
  costCenter: "ML-001",
  additionalVolumes: [
    {
      name: "data",
      size: 1000,
      type: "gp3",
      encrypted: true,
      mountPoint: "/data",
    },
  ],
  userData: `#!/bin/bash
yum update -y
yum install -y docker python3-pip`,
});
```

## 🎓 **Onboarding Path**

### **Week 1: Basic Deployment**

1. Use Level 1 configuration
2. Deploy your first instance
3. Understand the outputs and monitoring

### **Week 2: Team Integration**

1. Add team and project context
2. Try different workload types
3. Understand workload benefits

### **Week 3: Advanced Features**

1. Customize monitoring and backup
2. Add additional volumes
3. Use custom user data scripts

### **Week 4: Production Deployment**

1. Deploy production instances
2. Configure advanced security
3. Set up monitoring and alerting

## 🏆 **Best Practices**

1. **Start Simple**: Use Level 1 configuration to get started
2. **Add Context**: Include team, project, and cost center information
3. **Right-Size**: Let workload types choose optimal instance sizes
4. **Monitor**: Use built-in CloudWatch monitoring and alerts
5. **Backup**: Choose appropriate backup strategy for data criticality
6. **Key Pairs**: Ensure key pairs exist before deployment

## 🔒 **Compliance & Governance**

This component is designed to meet enterprise compliance requirements:

- **SOC 2**: Security controls and monitoring
- **PCI DSS**: Data encryption and access controls
- **HIPAA**: Secure data handling and audit trails
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy controls

## 🆘 **Support & Troubleshooting**

### **Common Issues**

1. **Missing Key Pair**: Linux instances require a key pair
2. **Invalid Subnet**: Ensure subnet ID is in correct format
3. **Security Groups**: At least one security group is required

### **Getting Help**

- Check the examples in this README
- Review the progressive complexity levels
- Start with Level 1 and add complexity as needed
- Contact the infrastructure team for advanced configuration

## 🚀 **Migration from Old Component**

If you're using the old EC2 component:

1. **Replace imports**: Update to new component
2. **Simplify configuration**: Use workload types instead of size/family/purpose
3. **Add business context**: Include team, project, and cost center
4. **Ensure key pairs exist**: Create key pairs before deployment

The new component maintains all enterprise features while making deployment much simpler and faster.

## 📋 **Usage in IDP Templates**

This component is designed to be used within IDP templates:

```typescript
// In your IDP template (separate Pulumi program)
import { EnterpriseEc2Instance } from "@proserve/aws-ec2";

export = async () => {
  const webServer = new EnterpriseEc2Instance("web-server", {
    name: "web-server",
    operatingSystem: "amazon-linux-2023",
    workload: "web-server",
    project: "web-project",
    subnetId: "subnet-123",
    securityGroupIds: ["sg-123"],
    keyPairName: "web-team-key", // Must exist in AWS
  });

  return {
    instanceId: webServer.instanceId,
    publicIp: webServer.publicIp,
    sshConnection: webServer.sshConnectionString,
  };
};
```
