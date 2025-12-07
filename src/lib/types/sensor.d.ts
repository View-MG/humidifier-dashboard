export interface SensorData {
  env: {
    temperature: number;
    humidity: number;
  };

  water: {
    percent: number;
    raw: number;
  };

  tilt: {
    state: number;
    state_text: string;
  };
}

export interface SensorLogFilter {
  timestamp?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export {};
