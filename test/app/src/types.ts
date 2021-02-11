
// https://github.com/microsoft/TypeScript/issues/36217
export interface FormDataEvent extends Event {
  readonly formData: FormData;
}

export interface FormDataEventInit extends EventInit {
  formData: FormData;
}

export declare const FormDataEvent: {
  prototype: FormDataEvent;
  new(type: string, eventInitDict?: FormDataEventInit): FormDataEvent;
};
