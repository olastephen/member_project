export interface Contact {
    id: string;
    name: string;
    marital_status: string;
    gender: string;
    age_group: string;
    date: string;
    invited_by: string;
    first_time_visitor: boolean;
    returning_visitor: boolean;
    new_to_area: boolean;
    visitation: {
        day_of_visit: string;
        time_of_visit: string;
    };
    communication_tool: {
        telephone_call: boolean;
        sms_whatsapp: boolean;
    };
    emails: { email: string; label?: string }[];
    phoneNumbers: { phoneNumber: string; label?: string; country?: string }[];
    job: {
        title: string;
        company: string;
    };
    birthday: string;
    address: string;
    notes: string;
    tags: string[];
    avatar: string;
}
