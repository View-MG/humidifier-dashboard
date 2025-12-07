declare interface SensorData {
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
