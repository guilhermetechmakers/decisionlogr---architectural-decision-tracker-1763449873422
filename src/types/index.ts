// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  companyId: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  billingPlan: string;
  retentionPolicy: number;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  timezone: string;
  defaultRequiredByOffset: number;
  createdAt: string;
  updatedAt: string;
}

// Decision types
export type DecisionStatus = 'pending' | 'waiting_for_client' | 'decided' | 'overdue';

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  area?: string;
  description?: string;
  requiredBy: string;
  status: DecisionStatus;
  assigneeId?: string;
  visibilitySettings: {
    expiresAt?: string;
    passcode?: string;
    allowComments: boolean;
  };
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDecisionInput {
  projectId: string;
  title: string;
  area?: string;
  description?: string;
  requiredBy: string;
  assigneeId?: string;
  visibilitySettings?: {
    expiresAt?: string;
    passcode?: string;
    allowComments: boolean;
  };
  options: CreateOptionInput[];
}

export interface UpdateDecisionInput {
  title?: string;
  area?: string;
  description?: string;
  requiredBy?: string;
  status?: DecisionStatus;
  assigneeId?: string;
  visibilitySettings?: {
    expiresAt?: string;
    passcode?: string;
    allowComments: boolean;
  };
  archived?: boolean;
}

// Option types
export interface Option {
  id: string;
  decisionId: string;
  title: string;
  specs: Record<string, unknown>;
  costDeltaNumeric?: number;
  imageRefs: string[];
  prosConsText?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateOptionInput {
  title: string;
  specs: Record<string, unknown>;
  costDeltaNumeric?: number;
  imageRefs?: string[];
  prosConsText?: string;
  isDefault?: boolean;
}

// Activity types
export interface Activity {
  id: string;
  decisionId: string;
  actorId?: string;
  actorMeta?: {
    email?: string;
    linkTokenId?: string;
    name?: string;
  };
  actionType: string;
  payload: Record<string, unknown>;
  createdAt: string;
  hashSignature?: string;
}

// Comment types
export interface Comment {
  id: string;
  decisionId: string;
  authorId?: string;
  authorMeta?: {
    email?: string;
    linkTokenId?: string;
    name?: string;
  };
  body: string;
  attachments: string[];
  createdAt: string;
}

// Share token types
export interface ShareToken {
  id: string;
  decisionId: string;
  token: string;
  expiresAt?: string;
  passcodeHash?: string;
  allowedActions: string[];
  revoked: boolean;
  createdAt: string;
}

// Attachment types
export interface Attachment {
  id: string;
  decisionId?: string;
  commentId?: string;
  url: string;
  mime: string;
  width?: number;
  height?: number;
  size: number;
  storageKey: string;
  createdAt: string;
}
