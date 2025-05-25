import { CheckMessagesResponse, TeddyMessage, TeddyUser, DialogNote } from '../models/api-models';
import { SiteInfos, Message, UserInfo, UserNotes, PageType } from '../models/site-infos';

/**
 * Converts a TeddyUser object to a UserInfo object
 */
export function convertTeddyUserToUserInfo(user: TeddyUser): UserInfo {
  // Determine gender
  const gender: "male" | "female" = user.gender === 1 ? "male" : "female";
  
  // Get profile picture URL if available
  const profilePicUrl = user.image_primary?.name || "";
  
  // Extract user information from config
  let relationshipStatus = "";
  let lookingFor = "";
  let music = "";
  let movies = "";
  let smoking = "";
  let bodyType = "";
  let eyeColor = "";
  let hairColor = "";
  let tattoo = false;
  let housing = "";
  
  // Process config values
  user.config.forEach(config => {
    if (config.name === "Beziehung") {
      relationshipStatus = config.config_values.map(value => value.name).join(", ");
    } else if (config.name === "Ich Suche") {
      lookingFor = config.config_values.map(value => value.name).join(", ");
    } else if (config.name === "Musik") {
      music = config.config_values.map(value => value.name).join(", ");
    } else if (config.name === "Filme & Serien") {
      movies = config.config_values.map(value => value.name).join(", ");
    } else if (config.name === "Rauchen") {
      smoking = config.config_values[0]?.name || "";
    } else if (config.name === "Körper") {
      bodyType = config.config_values[0]?.name || "";
    } else if (config.name === "Augenfarbe") {
      eyeColor = config.config_values[0]?.name || "";
    } else if (config.name === "Haarfarbe") {
      hairColor = config.config_values[0]?.name || "";
    } else if (config.name === "Tattoo") {
      tattoo = config.config_values[0]?.name?.includes("Ja") || false;
    } else if (config.name === "Lebe") {
      housing = config.config_values[0]?.name || "";
    }
  });
  
  return {
    name: user.name,
    gender,
    city: user.coordinates?.city,
    postalCode: user.coordinates?.postcode?.toString(),
    country: user.coordinates?.country as "DE" | "CH" | "AT",
    birthDate: {
      age: user.age
    },
    music,
    movies,
    relationshipStatus,
    lookingFor,
    hasProfilePic: !!profilePicUrl,
    hasPictures: user.image_profile.length > 0,
    profileText: user.usertext?.usertext || "",
    physicalDescription: bodyType,
    eyeColor,
    bodyType,
    smoking,
    hasTattoo: tattoo,
    housing,
    hairColor
  };
}

/**
 * Extract notes from dialog information
 */
export function extractUserNotes(notes: DialogNote[], userType: 0 | 1): UserNotes {
  // Filter notes for the specific user type (0 = customer, 1 = moderator)
  const userNotes = notes.filter(note => note.type === userType);
  
  const result: UserNotes = {
    rawText: userNotes.map(note => `${note.topic}: ${note.note}`).join("\n")
  };
  
  // Process specific note types
  userNotes.forEach(note => {
    switch (note.topic) {
      case "default_name":
        result.name = note.note;
        break;
      case "default_status":
        result.relationshipStatus = note.note;
        break;
      case "default_siblings":
        result.siblings = note.note;
        break;
      // Add more mappings as needed
    }
  });
  
  return result;
}

/**
 * Convert TeddyMessages to our Message format
 */
export function convertTeddyMessagesToMessages(
  messages: TeddyMessage[],
  currentUserId: number,
  writerUserId: number
): Message[] {
  return messages.map(msg => {
    const isSent = msg.from_id === currentUserId;
    const isReceived = msg.from_id === writerUserId;
    
    let type: "sent" | "received" | "system" = "system";
    if (isSent) {
      type = "sent";
    } else if (isReceived) {
      type = "received";
    }
    
    return {
      text: msg.message,
      type,
      messageType: "text", // Assuming all messages are text
      timestamp: new Date(msg.created_at)
    };
  });
}

/**
 * Main function to convert a CheckMessagesResponse to a SiteInfos object
 */
export function convertTeddyResponseToSiteInfos(response: CheckMessagesResponse): SiteInfos {
  // Ensure all required data is present
  if (!response.dialog || !response.user || !response.writer) {
    throw new Error("Missing required data in response");
  }
  
  // Convert messages
  const messages = convertTeddyMessagesToMessages(
    response.dialog.messages,
    response.user.id,
    response.writer.id
  );
  
  // Convert user info
  const customerInfo = convertTeddyUserToUserInfo(response.user);
  const moderatorInfo = convertTeddyUserToUserInfo(response.writer);
  
  // Extract notes
  const customerNotes = extractUserNotes(response.dialogInformations || [], 0);
  const moderatorNotes = extractUserNotes(response.dialogInformations || [], 1);
  
  // Get profile pictures and galleries
  const customerProfilePic = response.user.image_primary?.name || undefined;
  const moderatorProfilePic = response.writer.image_primary?.name || undefined;
  const customerGallery = response.user.image_profile.map(img => img.name);
  const moderatorGallery = response.writer.image_profile.map(img => img.name);
  
  // Create SiteInfos object
  return {
    origin: "teddy" as PageType,
    messages,
    accountId: response.user.id.toString(),
    html: "", // Not applicable for Teddy API
    metaData: {
      moderatorInfo,
      customerInfo,
      moderatorId: response.writer.id.toString(),
      customerId: response.user.id.toString(),
      moderatorNotes: moderatorNotes.rawText,
      customerNotes: customerNotes.rawText,
      sessionStart: new Date(response.dialog.created_at),
      chatId: response.dialog.id.toString(),
      minLength: response.minCharCount,
      customerProfilePic,
      moderatorProfilePic,
      customerGallery,
      moderatorGallery
    }
  };
} 