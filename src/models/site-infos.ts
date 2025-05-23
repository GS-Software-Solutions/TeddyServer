
export type PageType = "wifu";

export type Message = {
  text: string;
  type: "received" | "sent" | "system";
  messageType: "image" | "text";
  timestamp?: Date;
  imageSrc?: string;
};

export interface UserInfo {
  name?: string;
  gender: "male" | "female";
  username?: string;
  city?: string;
  postalCode?: string;
  country?: "DE" | "CH" | "AT";
  occupation?: string;
  education?: string;
  birthDate: {
    age?: number;
    date?: Date;
  };
  hobbies?: string;
  music?: string;
  movies?: string;
  books?: string;
  sports?: string;
  activities?: string;
  relationshipStatus?: string;
  lookingFor?: string;
  hasProfilePic?: boolean;
  hasPictures?: boolean;
  profileText?: string;
  rawText?: string;
  physicalDescription?: string;
  eyeColor?: string;
  height?: string;
  bodyType?: string;
  smoking?: string;
  hasTattoo?: boolean;
  housing?: string;
  hasCar?: boolean;
  personality?: string;
  hairColor?: string;
  children?: string;
  speaks?: string;
  zodiac?: string;
}

export interface UserNotes {
  rawText?: string;
  name?: string;
  age?: string;
  relationshipStatus?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  occupation?: string;
  lookingFor?: string;
  hobbies?: string;
  children?: string;
  family?: string;
  siblings?: string;
  preferences?: string;
  taboos?: string;
  pets?: string;
  zodiac?: string;
  birthdate?: string;
  miscellaneous?: string;
  height?: string;
  eyeColor?: string;
  hasTattoo?: string;
  piercings?: string;
  music?: string;
  movies?: string;
  food?: string;
  drinks?: string;
  smoking?: string;
  oldNotes?: string;
  workingHours?: string;
  loveLife?: string;
  phone?: string;
}

export interface Update {
  date?: Date;
  description: string;
  moderatorId?: string;
}

export interface SiteInfos {
  origin: PageType;
  messages: Message[];
  accountId?: string;
  html: string;
  metaData: {
    moderatorInfo: UserInfo;
    customerInfo: UserInfo;
    moderatorId?: string;
    customerId?: string;
    moderatorNotes?: string;
    customerNotes?: string;
    moderatorUpdates?: Update[];
    customerUpdates?: Update[];
    sessionStart?: Date;
    appSessionService?: string;
    ins?: number;
    outs?: number;
    type?: string;
    importantNotes?: string;
    alertBoxMessages?: string[];
    chatId?: string;
    minLength?: number;
    // all of these are urls
    customerProfilePic?: string;
    moderatorProfilePic?: string;
    customerGallery?: string[];
    moderatorGallery?: string[];
    assets?: string[];
  };
}
