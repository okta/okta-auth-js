export interface FieldError {
  errorSummary: string;
  reason?: string;
  location?: string;
  locationType?: string;
  domain?: string;
}

export interface APIError {
  errorSummary: string;
  errorCode?: string;
  errorLink?: string;
  errorId?: string;
  errorCauses?: Array<FieldError>;
}
