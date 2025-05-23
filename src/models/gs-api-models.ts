import { UserNotes } from "./site-infos";

export interface GSApiResponse {
    resText: string;
    promptType: string;
    alert: string;
    summary: { user: UserNotes, assistant: UserNotes }
}