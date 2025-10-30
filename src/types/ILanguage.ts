export interface ISysLanguage {
  code: string;
  is_active: boolean;
  label: string;
  desc: string;
}

export interface ISysTranslationsDict {
  lg_code: string;
  lg_key: string;
  dict_value: string;
}
