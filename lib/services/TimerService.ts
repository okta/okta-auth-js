import timerWorker from '../workers/TimerWorker.emptyWorker';

/* global BUNDLER */

export interface TimerWorkerOutMessage {
  action: 'timeoutCallback' | 'init',
  timerId?: number,
}
export interface TimerWorkerInMessage {
  action: 'setTimeout' | 'clearTimeout',
  timerId: number,
  timeout?: number,
}

export class TimerService {
  private timerWorker?: Worker;
  private timersHandlers: Record<number, Function>;
  private timerId: number;
  private timerWorkerReady: boolean;

  constructor() {
    this.timersHandlers = {};
    this.timerId = 0;
    this.timerWorkerReady = false;

    // @ts-ignore
    if (BUNDLER === 'webpack') {
      // webpack build (umd/cdn)
      const TimerWorker = timerWorker as any;
      this.timerWorker = new TimerWorker() as Worker;
    } else {
      if (!timerWorker?.workerSrc) {
        // babel build (cjs), for node - use fallback
      } else {
        // rollup build (esm)
        this.timerWorker = new Worker(this.getWorkerURL());
      }
    }

    this.timerWorker?.addEventListener('message', this.handleWorkerEvent.bind(this));
  }

  private getWorkerURL(): string {
    const workerBlob = new Blob([timerWorker.workerSrc], { type: 'text/javascript' });
    return URL.createObjectURL(workerBlob);
  }

  private handleWorkerEvent(ev: MessageEvent<TimerWorkerOutMessage>) {
    const data = ev.data;
    switch(data.action) {
      case 'timeoutCallback':
        this.handleTimeoutCallback(data);
        break;
      case 'init':
        this.timerWorkerReady = true;
        break;
      default:
        break;
    }
  }

  private handleTimeoutCallback(data: TimerWorkerOutMessage) {
    const { timerId } = data;
    const handler = this.timersHandlers[timerId!];
    if (handler) {
      handler();
    }
  }

  setTimeout(handler: Function, timeout: number) {
    if (this.timerWorker && this.timerWorkerReady) {
      const timerId = this.timerId++;
      this.timersHandlers[timerId] = handler.bind(this);
      this.timerWorker?.postMessage({
        action: 'setTimeout',
        timeout,
        timerId: timerId,
      } as TimerWorkerInMessage);
      return timerId;
    } else {
      return setTimeout(handler, timeout);
    }
  }

  clearTimeout(timerId: number) {
    if (this.timerWorker && this.timerWorkerReady) {
      this.timerWorker?.postMessage({
        action: 'clearTimeout',
        timerId: timerId,
      } as TimerWorkerInMessage);
      delete this.timersHandlers[this.timerId];
    } else {
      return clearTimeout(timerId);
    }
  }
}
