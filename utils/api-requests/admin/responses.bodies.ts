// heartbeat
const heartbeatBody = {
  version: '0.0.1',
};
const heartbeatBodyStage = {
  version: '0.5.0',
};

export function getResponseBody(name: string) {
  switch (name) {
    case 'heartbeat': {
      return heartbeatBody;
    }
    case 'heartbeat_stage': {
      return heartbeatBodyStage;
    }
    default: {
      throw new Error(`${name} body not found`);
    }
  }
}
