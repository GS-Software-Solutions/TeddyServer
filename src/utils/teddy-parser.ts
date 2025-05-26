import { CheckMessagesResponse, TeddyMessage, TeddyUser, DialogNote } from '../models/api-models'
import { SiteInfos, Message, UserInfo, UserNotes, PageType } from '../models/site-infos'

/**
 * Converts a TeddyUser object to a UserInfo object
 */
export function convertTeddyUserToUserInfo(user: TeddyUser): UserInfo {
    const gender: 'male' | 'female' = user.gender === 1 ? 'male' : 'female'

    const profilePicUrl = user.image_primary?.name || ''

    // These are just config values not avaliable on website
    //let relationshipStatus = "";
    //let lookingFor = "";
    //let music = "";
    //let movies = "";
    //let smoking = "";
    //let bodyType = "";
    //let eyeColor = "";
    //let hairColor = "";
    //let tattoo = false;
    //let housing = "";
    //
    //// Process config values
    //user.config.forEach(config => {
    //  if (config.name === "Beziehung") {
    //    relationshipStatus = config.config_values.map(value => value.name).join(", ");
    //  } else if (config.name === "Ich Suche") {
    //    lookingFor = config.config_values.map(value => value.name).join(", ");
    //  } else if (config.name === "Musik") {
    //    music = config.config_values.map(value => value.name).join(", ");
    //  } else if (config.name === "Filme & Serien") {
    //    movies = config.config_values.map(value => value.name).join(", ");
    //  } else if (config.name === "Rauchen") {
    //    smoking = config.config_values[0]?.name || "";
    //  } else if (config.name === "Körper") {
    //    bodyType = config.config_values[0]?.name || "";
    //  } else if (config.name === "Augenfarbe") {
    //    eyeColor = config.config_values[0]?.name || "";
    //  } else if (config.name === "Haarfarbe") {
    //    hairColor = config.config_values[0]?.name || "";
    //  } else if (config.name === "Tattoo") {
    //    tattoo = config.config_values[0]?.name?.includes("Ja") || false;
    //  } else if (config.name === "Lebe") {
    //    housing = config.config_values[0]?.name || "";
    //  }
    //});

    return {
        name: user.name,
        gender,
        city: user.coordinates?.city,
        postalCode: user.coordinates?.postcode?.toString(),
        country: user.coordinates?.country as 'DE' | 'CH' | 'AT',
        birthDate: {
            age: user.age
        },
        hasProfilePic: !!profilePicUrl,
        hasPictures: user.image_profile.length > 0,
        profileText: user.usertext?.usertext || ''
    }
}

export function extractUserNotes(
    notes: DialogNote[],
    userType: 0 | 1,
    user?: TeddyUser
): UserNotes {
    // Filter notes for the specific user type (0 = customer, 1 = moderator)
    const userNotes = notes.filter(note => note.type === userType)

    const result: UserNotes = {
        rawText: userNotes.map(note => `${note.topic}: ${note.note}`).join('\n')
    }

    // Initialize all fields as undefined (matching TypeScript interface)
    result.name = undefined
    result.age = undefined
    result.relationshipStatus = undefined
    result.city = undefined
    result.postalCode = undefined
    result.country = undefined
    result.occupation = undefined
    result.lookingFor = undefined
    result.hobbies = undefined
    result.children = undefined
    result.family = undefined
    result.siblings = undefined
    result.preferences = undefined
    result.taboos = undefined
    result.pets = undefined
    result.zodiac = undefined
    result.birthdate = undefined
    result.miscellaneous = undefined
    result.height = undefined
    result.eyeColor = undefined
    result.hasTattoo = undefined
    result.piercings = undefined
    result.music = undefined
    result.movies = undefined
    result.food = undefined
    result.drinks = undefined
    result.smoking = undefined
    result.oldNotes = undefined
    result.workingHours = undefined
    result.loveLife = undefined
    result.phone = undefined

    // Process specific note types from dialog notes
    userNotes.forEach(note => {
        const topic = note.topic.toLowerCase()

        // Handle exact matches first
        if (topic === 'default_name') {
            result.name = note.note
        } else if (topic === 'default_job' || topic === 'beruf') {
            result.occupation = note.note
        } else if (topic === 'default_status') {
            result.relationshipStatus = note.note
        } else if (topic === 'default_place' || topic === 'ort') {
            result.city = note.note
        } else if (topic === 'default_hobbys' || topic === 'hobbies') {
            result.hobbies = note.note
        } else if (topic === 'default_sexpreferences' || topic === 'sexvorlieben') {
            result.preferences = note.note
        } else if (topic === 'default_sextaboos' || topic === 'sex_tabuu') {
            result.taboos = note.note
        } else if (topic === 'default_siblings' || topic === 'geschwister') {
            result.siblings = note.note
        } else if (topic === 'default_children' || topic === 'kinder') {
            result.children = note.note
        } else if (topic === 'default_pets' || topic === 'tiere') {
            result.pets = note.note
        } else if (topic === 'default_zodiac' || topic === 'sternzeichen') {
            result.zodiac = note.note
        } else if (topic === 'default_height' || topic === 'groesse' || topic === 'größe') {
            result.height = note.note
        } else if (topic === 'default_eyecolor' || topic === 'augenfarbe') {
            result.eyeColor = note.note
        } else if (topic === 'default_tattoos' || topic === 'tattoos') {
            result.hasTattoo = note.note
        } else if (topic === 'default_piercings' || topic === 'piercings') {
            result.piercings = note.note
        } else if (topic === 'default_music' || topic === 'musik') {
            result.music = note.note
        } else if (topic === 'default_movies' || topic === 'filme') {
            result.movies = note.note
        } else if (topic === 'default_food' || topic === 'essen') {
            result.food = note.note
        } else if (topic === 'default_drinks' || topic === 'trinken') {
            result.drinks = note.note
        } else if (topic === 'default_smoking' || topic === 'rauchen') {
            result.smoking = note.note
        } else if (topic === 'default_lookingfor' || topic === 'suche') {
            result.lookingFor = note.note
        } else if (topic === 'default_age' || topic === 'alter') {
            result.age = note.note
        } else if (topic === 'default_birthdate' || topic === 'geburtsdatum') {
            result.birthdate = note.note
        } else if (topic === 'default_family' || topic === 'familie') {
            result.family = note.note
        } else if (topic === 'default_phone' || topic === 'telefon') {
            result.phone = note.note
        } else if (topic === 'default_workinghours' || topic === 'arbeitszeiten') {
            result.workingHours = note.note
        } else if (topic === 'default_lovelife' || topic === 'liebesleben') {
            result.loveLife = note.note
        } else if (topic === 'default_oldnotes' || topic === 'alte_notizen') {
            result.oldNotes = note.note
            if (result.miscellaneous) {
                result.miscellaneous += `\n${note.topic}: ${note.note}`
            } else {
                result.miscellaneous = `${note.topic}: ${note.note}`
            }
        }
    })

    return result
}

export function convertTeddyMessagesToMessages(
    messages: TeddyMessage[],
    currentUserId: number,
    writerUserId: number
): Message[] {
    return messages.map(msg => {
        const isSent = msg.from_id === writerUserId
        const isReceived = msg.from_id === currentUserId

        let type: 'sent' | 'received' | 'system' = 'system'
        if (isSent) {
            type = 'sent'
        } else if (isReceived) {
            type = 'received'
        }

        return {
            text: msg.message,
            type,
            messageType: 'text', // Check on based of user Id and writer Id as well as  check based on message  type as well
            timestamp: new Date(msg.created_at)
        }
    })
}

export function convertTeddyResponseToSiteInfos(response: CheckMessagesResponse): SiteInfos {
    if (!response.dialog || !response.user || !response.writer) {
        throw new Error('Missing required data in response')
    }

    // Convert messages
    const messages = convertTeddyMessagesToMessages(
        response.dialog.messages,
        response.user.id,
        response.writer.id
    )

    const customerInfo = convertTeddyUserToUserInfo(response.user)
    const moderatorInfo = convertTeddyUserToUserInfo(response.writer)

    const customerNotes = extractUserNotes(response.dialogInformations || [], 0)
    const moderatorNotes = extractUserNotes(response.dialogInformations || [], 1)

    const customerProfilePic = response.user.image_primary?.name || undefined
    const moderatorProfilePic = response.writer.image_primary?.name || undefined
    const customerGallery = response.user.image_profile.map(img => img.name)
    const moderatorGallery = response.writer.image_profile.map(img => img.name)

    return {
        origin: 'teddy' as PageType,
        messages,
        html: '',
        metaData: {
            moderatorInfo,
            customerInfo,
            moderatorNotes: moderatorNotes,
            customerNotes: customerNotes,
            sessionStart: new Date(response.dialog.created_at),
            minLength: response.minCharCount,
            customerProfilePic,
            moderatorProfilePic,
            customerGallery,
            moderatorGallery
        }
    }
}
