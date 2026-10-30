export interface HostingerCapabilities {
  supportsNodeJs: boolean;
  supportsGitDeployment: boolean;
  supportsSftp: boolean;
  supportsSiteListing: boolean;
  supportsMetrics: boolean;
  supportsDnsSync: boolean;
  supportsVpsReboot: boolean;
  supportsDirectWebFileEditing: boolean;
  supportsCachePurge: boolean;
  notes: string[];
}

export function getHostingerCapabilities(planType: string = 'cloud'): HostingerCapabilities {
  const isVps = planType.toLowerCase().includes('vps');

  if (isVps) {
    return {
      supportsNodeJs: true,
      supportsGitDeployment: true,
      supportsSftp: true,
      supportsSiteListing: false,
      supportsMetrics: true,
      supportsDnsSync: false,
      supportsVpsReboot: true,
      supportsDirectWebFileEditing: false,
      supportsCachePurge: false,
      notes: [
        'VPS instances provide root SSH access and complete container/process isolation.',
        'File editing and deployments must occur via SSH, SFTP, or automated Git webhooks.',
      ],
    };
  }

  return {
    supportsNodeJs: true,
    supportsGitDeployment: true,
    supportsSftp: true,
    supportsSiteListing: true,
    supportsMetrics: false,
    supportsDnsSync: false,
    supportsVpsReboot: false,
    supportsDirectWebFileEditing: false,
    supportsCachePurge: true, // Edge cache purging via CDN / hPanel
    notes: [
      'Cloud and Business hosting plans provide managed Node.js / PHP runtime environments.',
      'Official Hostinger REST API provides account-level website and subscription management.',
      'DNS zones and Edge CDN cache purging are managed directly via Hostinger hPanel.',
      'Production code deployments are delivered via automated Git webhooks rather than raw HTTP file editing.',
    ],
  };
}
