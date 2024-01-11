export interface Group {
  id: string;
  name: string;
  isExpanded: boolean;
}

export interface DataInterface {
  groups: Group[];
  schemaVersion: number;
  appOrigin: string;
  appVersionCode: number;
  appVersionName: string;
  services: OtpItemInterface[];
}
export interface OtpItemInterface {
  secret: string;
  icon: {
    selected: string;
    label: {
      text: string;
      backgroundColor: string;
    };
    iconCollection: {
      id: string;
    };
  };
  otp: {
    source: string;
    account?: string;
    digits: number;
    period: number;
    tokenType: string;
    counter: number;
    algorithm: string;
  };
  groupId?: string;
  serviceTypeID?: string;
  name: string;
}

export interface ListItemInterface {
  name: string;
  account?: string;
  otp: string;
}
