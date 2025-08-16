import { Ec2Instance } from "../../src";

// Create a basic EC2 instance
const ec2 = new Ec2Instance("example-ec2", {
  name: "example-ec2",
  instanceType: "t3.micro",
  amiId: "ami-0c55b159cbfafe1f0",
  subnetId: "subnet-0123456789abcdef0",
  securityGroupIds: ["sg-0123456789abcdef0"],
  environment: "dev",
  project: "example-project",
});

// Export the EC2 instance ID
export const ec2Id = ec2.instanceId;
export const publicIp = ec2.publicIp;
export const privateIp = ec2.privateIp;
export const publicDns = ec2.publicDns;
export const privateDns = ec2.privateDns;
export const availabilityZone = ec2.availabilityZone;
export const arn = ec2.arn;
export const state = ec2.state;
export const ebsVolumeIds = ec2.ebsVolumeIds;
