export interface Reddit {
  kind?: string;
  data: RedditData;
}

export interface RedditData {
  after: string | null;
  dist?: number;
  modhash?: string;
  geo_filter?: string;
  children: Child[];
  before: string | null;
}

export interface Child {
  kind?: Kind;
  data: ChildData;
}

export interface ChildData {
  approved_at_utc?: null;
  subreddit?: string;
  selftext?: string;
  author_fullname?: string;
  saved?: boolean;
  mod_reason_title?: null;
  gilded?: number;
  clicked?: boolean;
  title: string;
  link_flair_richtext?: any[];
  subreddit_name_prefixed?: string;
  hidden?: boolean;
  pwls?: number;
  link_flair_css_class?: null | string;
  downs?: number;
  thumbnail_height?: number | null;
  top_awarded_type?: null;
  hide_score?: boolean;
  name?: string;
  quarantine?: boolean;
  link_flair_text_color?: FlairTextColor;
  upvote_ratio?: number;
  author_flair_background_color?: null;
  subreddit_type?: SubredditType;
  ups?: number;
  total_awards_received?: number;
  media_embed?: MediaEmbed;
  thumbnail_width?: number | null;
  author_flair_template_id?: null | string;
  is_original_content?: boolean;
  user_reports?: any[];
  secure_media?: Media | null;
  is_reddit_media_domain?: boolean;
  is_meta?: boolean;
  category?: null;
  secure_media_embed?: MediaEmbed;
  link_flair_text?: null | string;
  can_mod_post?: boolean;
  score?: number;
  approved_by?: null;
  is_created_from_ads_ui?: boolean;
  author_premium?: boolean;
  thumbnail: string;
  edited?: boolean;
  author_flair_css_class?: null;
  author_flair_richtext?: any[];
  gildings?: Gildings;
  content_categories?: null;
  is_self?: boolean;
  mod_note?: null;
  created?: number;
  link_flair_type?: FlairType;
  wls?: number;
  removed_by_category?: null;
  banned_by?: null;
  author_flair_type?: FlairType;
  domain: string;
  allow_live_comments?: boolean;
  selftext_html?: null | string;
  likes?: null;
  suggested_sort?: null;
  banned_at_utc?: null;
  view_count?: null;
  archived?: boolean;
  no_follow?: boolean;
  is_crosspostable?: boolean;
  pinned?: boolean;
  over_18?: boolean;
  all_awardings?: AllAwarding[];
  awarders?: any[];
  media_only?: boolean;
  link_flair_template_id?: string;
  can_gild?: boolean;
  spoiler?: boolean;
  locked?: boolean;
  author_flair_text?: null | string;
  treatment_tags?: any[];
  visited?: boolean;
  removed_by?: null;
  num_reports?: null;
  distinguished?: null;
  subreddit_id?: string;
  author_is_blocked?: boolean;
  mod_reason_by?: null;
  removal_reason?: null;
  link_flair_background_color?: string;
  id?: string;
  is_robot_indexable?: boolean;
  report_reasons?: null;
  author?: string;
  discussion_type?: null;
  num_comments?: number;
  send_replies?: boolean;
  whitelist_status?: WhitelistStatus;
  contest_mode?: boolean;
  mod_reports?: any[];
  author_patreon_flair?: boolean;
  author_flair_text_color?: FlairTextColor | null;
  permalink: string;
  parent_whitelist_status?: WhitelistStatus;
  stickied?: boolean;
  url: string;
  subreddit_subscribers?: number;
  created_utc?: number;
  num_crossposts?: number;
  media?: Media | null;
  is_video: boolean;
  post_hint?: string;
  url_overridden_by_dest?: string;
  preview?: Preview;
  is_gallery?: boolean;
  media_metadata?: { [key: string]: MediaMetadatum };
  gallery_data?: GalleryData;
  poll_data?: PollData;
}

export interface AllAwarding {
  giver_coin_reward?: null;
  subreddit_id?: null;
  is_new?: boolean;
  days_of_drip_extension?: null;
  coin_price?: number;
  id?: string;
  penny_donate?: null;
  award_sub_type?: string;
  coin_reward?: number;
  icon_url?: string;
  days_of_premium?: null;
  tiers_by_required_awardings?: null;
  resized_icons?: ResizedIcon[];
  icon_width?: number;
  static_icon_width?: number;
  start_date?: null;
  is_enabled?: boolean;
  awardings_required_to_grant_benefits?: null;
  description?: string;
  end_date?: null;
  sticky_duration_seconds?: null;
  subreddit_coin_reward?: number;
  count?: number;
  static_icon_height?: number;
  name?: string;
  resized_static_icons?: ResizedIcon[];
  icon_format?: null;
  icon_height?: number;
  penny_price?: null;
  award_type?: string;
  static_icon_url?: string;
}

export interface ResizedIcon {
  url?: string;
  width?: number;
  height?: number;
}

export enum FlairTextColor {
  Dark = 'dark',
  Light = 'light',
}

export enum FlairType {
  Text = 'text',
}

export interface GalleryData {
  items?: Item[];
}

export interface Item {
  caption?: string;
  media_id?: string;
  id?: number;
}

export interface Gildings {
  gid_1?: number;
}

export interface Media {
  type?: string;
  oembed?: Oembed;
}

export interface Oembed {
  provider_url?: string;
  description?: string;
  title?: string;
  type?: string;
  thumbnail_width?: number;
  height?: number;
  width?: number;
  html?: string;
  version?: string;
  provider_name?: string;
  thumbnail_url?: string;
  thumbnail_height?: number;
  author_name?: string;
  author_url?: string;
}

export interface MediaEmbed {
  content?: string;
  width?: number;
  scrolling?: boolean;
  height?: number;
  media_domain_url?: string;
}

export interface MediaMetadatum {
  status?: string;
  e?: string;
  m?: string;
  p?: S[];
  s?: S;
  id?: string;
}

export interface S {
  y?: number;
  x?: number;
  u?: string;
}

export enum WhitelistStatus {
  AllAds = 'all_ads',
}

export interface PollData {
  prediction_status?: null;
  total_stake_amount?: null;
  voting_end_timestamp?: number;
  options?: Option[];
  vote_updates_remained?: null;
  is_prediction?: boolean;
  resolved_option_id?: null;
  user_won_amount?: null;
  user_selection?: null;
  total_vote_count?: number;
  tournament_id?: null;
}

export interface Option {
  text?: string;
  id?: string;
}

export interface Preview {
  images?: Image[];
  enabled?: boolean;
}

export interface Image {
  source?: ResizedIcon;
  resolutions?: ResizedIcon[];
  variants?: Variants;
  id?: string;
}

export interface Variants {}

export enum SubredditType {
  Public = 'public',
}

export enum Kind {
  T3 = 't3',
}
