export interface IMassMessagePayload {
  departments?: string[];
  employees?: string[];
  subject: string;
  message: string;
  isDraft?: boolean;
}

export interface IMassMessageLog {
  id: string;
  dateTime: string;
  message: string;
  recipients: string;
  status: 'Send' | 'Draft';
  read: string;
}
