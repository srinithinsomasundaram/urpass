export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: string;
  name: string;
  slug: "free" | "starter" | "pro";
  price_monthly: number;
  price_yearly: number;
  max_events: number;
  max_attendees: number;
  features: string[];
  is_active: boolean;
  created_at: string;
};

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  provider: string;
  provider_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
};

export type EventStatus = "draft" | "active" | "completed" | "cancelled";

export type Event = {
  id: string;
  organizer_id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  logo_url: string | null;
  banner_url: string | null;
  attendee_limit: number;
  status: EventStatus;
  application_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type PassStatus = "not_generated" | "generated" | "checked_in";

export type Attendee = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  pass_type: string;
  application_status: ApplicationStatus;
  pass_status: PassStatus;
  created_at: string;
  updated_at: string;
};

export type Pass = {
  id: string;
  event_id: string;
  attendee_id: string;
  pass_type: string;
  pass_token: string;
  status: PassStatus;
  generated_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  attendee?: Attendee;
  event?: Event;
};

export type CheckIn = {
  id: string;
  pass_id: string;
  event_id: string;
  attendee_id: string;
  checked_in_at: string;
  checked_in_by: string;
  created_at: string;
};

export type DashboardStats = {
  totalEvents: number;
  activeEvents: number;
  totalPasses: number;
  totalCheckedIn: number;
};

export type EventStats = {
  totalApplications: number;
  approved: number;
  passesGenerated: number;
  checkedIn: number;
  pending: number;
  rejected: number;
};
