// /// <reference no-default-lib="true"/>
// /// <reference lib="webworker" />
// declare var self: DedicatedWorkerGlobalScope;
import type { TimerWorkerInMessage, TimerWorkerOutMessage } from '../services/TimerService';

const timerIdToTimeout = {};

function handleSetTimeout(data: TimerWorkerInMessage) {
  const { timerId, timeout } = data;
  const timeoutId = setTimeout(() => {
    self.postMessage({
      action: 'timeoutCallback',
      timerId,
    } as TimerWorkerOutMessage);
    delete timerIdToTimeout[timerId];
  }, timeout);
  timerIdToTimeout[timerId] = timeoutId;
}

function handleClearTimeout(data: TimerWorkerInMessage) {
  const { timerId } = data;
  const timeoutId = timerIdToTimeout[timerId];
  if (timeoutId) {
    clearTimeout(timeoutId);
    delete timerIdToTimeout[timerId];
  }
}

self.addEventListener('message', function(ev: MessageEvent<TimerWorkerInMessage>) {
  const data = ev.data;
  switch (data.action) {
    case 'setTimeout':
      handleSetTimeout.call(this, data);
      break;
    case 'clearTimeout':
      handleClearTimeout.call(this, data);
      break;
    default:
      break;
  }
});

self.postMessage({
  action: 'init',
} as TimerWorkerOutMessage);
