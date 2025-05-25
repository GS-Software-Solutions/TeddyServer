export interface TeddyMessage {
  id: number;
  dialog_id: number;
  from_id: number;
  to_id: number;
  type: number;
  attachment_id: number;
  message: string;
  read: number;
  created_at: string;
  updated_at: string;
}

export interface DialogNote {
  id: number;
  user_id: number;
  website_id: number;
  dialog_id: number;
  type: number;
  topic: string;
  note: string;
  created_at: string | null;
  updated_at: string;
}

export interface UserConfigValue {
  id: number;
  config_id: number;
  name: string;
}

export interface UserConfig {
  id: number;
  name: string;
  type: number;
  position: number;
  important: number;
  searchable: number;
  min: number;
  max: number;
  icon: string;
  config_values: UserConfigValue[];
}

export interface UserCoins {
  id: number;
  user_id: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface UserImage {
  id: number;
  user_id: number;
  verified: number;
  primary: number;
  name: string;
}

export interface UserCoordinates {
  id: number;
  postcode: number;
  city: string;
  country: string;
  priority: number;
  distance?: number;
}

export interface UserText {
  id: number;
  usertext: string;
  verified: number;
}

export interface UserInformation {
  id: number;
  user_id: number;
  type: number;
  information: string;
  created_at: string;
  updated_at: string;
}

export interface TeddyUser {
  id: number;
  name: string;
  gender: number;
  preference: number;
  provider_email_verified: string | null;
  has_payed?: number;
  config: UserConfig[];
  age: number;
  coins?: UserCoins;
  image_primary: UserImage;
  image_profile: UserImage[];
  image_private: UserImage[];
  image_special?: UserImage[];
  coordinates: UserCoordinates;
  baduser?: any;
  usertext?: UserText;
  information?: UserInformation;
  notes: DialogNote[];
}

export interface TeddyDialog {
  id: number;
  from_id: number;
  to_id: number;
  message_count: number;
  blocked: number;
  created_at: string;
  updated_at: string;
  messages: TeddyMessage[];
  notes: DialogNote[];
}

export interface TeddyWebsite {
  id: number;
  fqdn: string;
  foldername: string;
  rule: string | null;
}

export interface TeddyGiftCategory {
  id: number;
  name: string;
  image: string;
  description: string;
  active: number;
  gifts: TeddyGift[];
}

export interface TeddyGift {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  filename: string;
}

export interface CheckMessagesResponse {
  status: boolean;
  error?: string;
  randomFact?: string;
  messages?: any[];
  dialog?: TeddyDialog;
  user?: TeddyUser;
  writer?: TeddyUser;
  dialogInformations?: DialogNote[];
  website?: TeddyWebsite;
  templates?: any[];
  favorites?: any[];
  statistic?: any;
  messagePrice?: number;
  gifts?: TeddyGiftCategory[];
  minCharCount?: number;
  logoutTime?: number;
}

export interface StartSearchResponse {
  status: boolean;
}

export interface LogoutResponse {
  status: boolean;
}

export interface LoginResponse {
  token: string;
  status: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

