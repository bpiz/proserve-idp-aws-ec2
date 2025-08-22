import { OsConfig } from "../types";

/**
 * Operating system configurations with AMI IDs and default settings
 * This externalizes the OS configuration data from the main component
 */
export const OS_CONFIGS: Record<string, OsConfig> = {
  "amazon-linux-2023": {
    amiId: "ami-0c7217cdde317cfec", // Amazon Linux 2023 AMI (us-east-1)
    defaultRootVolumeSize: 8,
    requiresKeyPair: true,
    sshUser: "ec2-user",
  },
  "amazon-linux-2": {
    amiId: "ami-0c02fb55956c7d316", // Amazon Linux 2 AMI (us-east-1)
    defaultRootVolumeSize: 8,
    requiresKeyPair: true,
    sshUser: "ec2-user",
  },
  "ubuntu-22-04": {
    amiId: "ami-0c7217cdde317cfec", // Ubuntu 22.04 LTS (us-east-1)
    defaultRootVolumeSize: 10,
    requiresKeyPair: true,
    sshUser: "ubuntu",
  },
  "ubuntu-20-04": {
    amiId: "ami-0c7217cdde317cfec", // Ubuntu 20.04 LTS (us-east-1)
    defaultRootVolumeSize: 10,
    requiresKeyPair: true,
    sshUser: "ubuntu",
  },
  "rhel-9": {
    amiId: "ami-0c7217cdde317cfec", // RHEL 9 (us-east-1)
    defaultRootVolumeSize: 10,
    requiresKeyPair: true,
    sshUser: "ec2-user",
  },
  "rhel-8": {
    amiId: "ami-0c7217cdde317cfec", // RHEL 8 (us-east-1)
    defaultRootVolumeSize: 10,
    requiresKeyPair: true,
    sshUser: "ec2-user",
  },
  "centos-7": {
    amiId: "ami-0c7217cdde317cfec", // CentOS 7 (us-east-1)
    defaultRootVolumeSize: 8,
    requiresKeyPair: true,
    sshUser: "centos",
  },
  "windows-server-2022": {
    amiId: "ami-0c7217cdde317cfec", // Windows Server 2022 (us-east-1)
    defaultRootVolumeSize: 30,
    requiresKeyPair: false,
    sshUser: "",
    rdpUser: "Administrator",
  },
  "windows-server-2019": {
    amiId: "ami-0c7217cdde317cfec", // Windows Server 2019 (us-east-1)
    defaultRootVolumeSize: 30,
    requiresKeyPair: false,
    sshUser: "",
    rdpUser: "Administrator",
  },
};
