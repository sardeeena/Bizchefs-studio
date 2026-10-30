export type UserRole = 'superadmin' | 'admin' | 'tech' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  clientId?: string; // If owner, the client organization they belong to
  assignedClientIds?: string[]; // If admin or tech, the client workspaces they are assigned to
  title?: string;
  createdAt?: string;
}

export type ClientTier = 'growth' | 'enterprise' | 'starter';
export type ClientStatus = 'active' | 'suspended' | 'onboarding';

export interface Client {
  id: string;
  name: string;
  slug: string;
  tier: ClientTier;
  status: ClientStatus;
  contactEmail: string;
  contactPhone: string;
  websiteCount: number;
  domainCount: number;
  activeCarePlan: string; // e.g. "Monthly Website Care — Enterprise Tier ($300/mo)"
  createdAt: string;
}

export type WebsiteStatus = 'healthy' | 'degraded' | 'maintenance' | 'offline';
export type HostingProviderType = 'hostinger' | 'custom_vps' | 'vercel' | 'github_pages';
export type HostingType = 'cloud_startup' | 'business_shared' | 'vps_kvm2' | 'dedicated';
export type FrameworkType = 'Next.js 15' | 'React 19' | 'PHP 8.3' | 'Static HTML' | 'Node.js Express';

export interface Website {
  id: string;
  clientId: string;
  name: string;
  domain: string;
  stagingDomain?: string;
  repositoryUrl: string;
  branch: string;
  framework: FrameworkType;
  hostingProvider: HostingProviderType;
  hostingType: HostingType;
  hostingerPlanName?: string;
  hostingerDomainId?: string;
  status: WebsiteStatus;
  sslActive: boolean;
  sslIssuer?: string;
  sslExpiresAt?: string;
  phpVersion?: string;
  nodeVersion?: string;
  ipAddress: string;
  uptimePercentage: number;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainRecord {
  id: string;
  clientId: string;
  domain: string;
  registrar: string;
  status: 'active' | 'expiring_soon' | 'transferring' | 'expired';
  autoRenew: boolean;
  expiresAt: string;
  dnsRecordsCount: number;
  sslActive: boolean;
  nameservers: string[];
  attachedWebsiteId?: string;
}

export interface HostingService {
  id: string;
  clientId: string;
  provider: HostingProviderType;
  planName: string;
  serverIp: string;
  datacenterLocation: string; // e.g., "Frankfurt, Germany (eu-central)"
  memoryMb: number;
  diskGb: number;
  diskUsedGb: number;
  bandwidthGb: number;
  bandwidthUsedGb: number;
  cpuCores: number;
  status: 'active' | 'warning' | 'suspended';
  renewalDate: string;
  monthlyCostUsd: number;
  autoRenew: boolean;
  apiConnected: boolean;
  orderId?: string;
}

export type DeploymentStatus = 'success' | 'building' | 'failed' | 'queued';
export type DeploymentEnvironment = 'production' | 'staging';

export interface Deployment {
  id: string;
  websiteId: string;
  clientId: string;
  commitHash: string;
  commitMessage: string;
  authorName: string;
  status: DeploymentStatus;
  durationSeconds: number;
  deployedAt: string;
  environment: DeploymentEnvironment;
  rollbackAvailable: boolean;
  buildLogs?: string[];
}

export interface TopPageAnalytics {
  path: string;
  title: string;
  views: number;
  uniqueUsers: number;
  avgDurationSeconds: number;
}

export interface TrafficSourceAnalytics {
  source: string;
  users: number;
  percentage: number;
}

export interface SearchQueryAnalytics {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface DailyTrafficPoint {
  date: string;
  visitors: number;
  pageViews: number;
  clicks: number;
  impressions: number;
}

export interface AnalyticsProperty {
  id: string;
  websiteId: string;
  clientId: string;
  gaPropertyId?: string;
  gscSiteUrl?: string;
  connected: boolean;
  isMockData: boolean;
  monthlyUsers: number;
  usersGrowthPct: number;
  monthlySessions: number;
  monthlyPageviews: number;
  bounceRatePct: number;
  avgSessionDurationSeconds: number;
  searchClicks: number;
  searchImpressions: number;
  ctrPct: number;
  avgSearchPosition: number;
  dailyTraffic: DailyTrafficPoint[];
  topPages: TopPageAnalytics[];
  acquisitionSources: TrafficSourceAnalytics[];
  searchQueries: SearchQueryAnalytics[];
}

export interface SupportTicket {
  id: string;
  clientId: string;
  websiteId?: string;
  subject: string;
  category: 'hosting' | 'bug' | 'feature' | 'billing' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_client' | 'resolved';
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface AuditLog {
  id: string;
  clientId?: string;
  userId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  clientId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface TaskItem {
  id: string;
  projectId?: string;
  clientId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  dueDate: string;
  progressPercent: number;
  serviceCategory: string;
}

export interface VirtualFileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  modifiedAt?: string;
  content?: string;
  readOnly?: boolean;
  children?: VirtualFileNode[];
}
