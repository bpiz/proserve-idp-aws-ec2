import * as aws from "@pulumi/aws";
import { AdditionalVolumeArgs } from "../types";

/**
 * Creates additional EBS volumes for an EC2 instance
 */
export function createAdditionalVolumes(
  name: string,
  config: any,
  instance: aws.ec2.Instance,
  tags: Record<string, string>
): aws.ebs.Volume[] {
  const volumes: aws.ebs.Volume[] = [];

  if (config.additionalVolumes) {
    config.additionalVolumes.forEach(
      (volumeArgs: AdditionalVolumeArgs, index: number) => {
        const volume = new aws.ebs.Volume(
          `${name}-volume-${volumeArgs.name}`,
          {
            availabilityZone: instance.availabilityZone,
            size: volumeArgs.size,
            type: volumeArgs.type || "gp3",
            encrypted: volumeArgs.encrypted !== false,
            kmsKeyId: volumeArgs.kmsKeyId,
            iops: volumeArgs.iops,
            throughput: volumeArgs.throughput,
            tags: {
              ...tags,
              Name: `${config.name}-${volumeArgs.name}`,
              MountPoint: volumeArgs.mountPoint || "",
              VolumeType: "additional",
            },
          },
          { parent: instance }
        );

        // Attach the volume
        new aws.ec2.VolumeAttachment(
          `${name}-attachment-${volumeArgs.name}`,
          {
            deviceName: `/dev/sd${String.fromCharCode(98 + index)}`,
            volumeId: volume.id,
            instanceId: instance.id,
          },
          { parent: instance }
        );

        volumes.push(volume);
      }
    );
  }

  return volumes;
}

/**
 * Creates root block device configuration
 */
export function createRootBlockDevice(
  config: any,
  osConfig: any,
  workloadConfig: any,
  tags: Record<string, string>
): aws.types.input.ec2.InstanceRootBlockDevice {
  const volumeSize =
    config.rootVolumeSize ||
    workloadConfig.rootVolumeSize ||
    osConfig.defaultRootVolumeSize;

  return {
    volumeSize: volumeSize,
    volumeType: "gp3",
    deleteOnTermination: true,
    encrypted: true,
    tags: tags,
  };
}
