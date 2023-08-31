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
  private timersHandlers: Record<number, () => void>;
  private timerId: number;

  constructor() {
    this.timersHandlers = {};
    this.timerId = 0;

    if (typeof Worker !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
  }

  private getWorkerURL(): string {
    const workerBlob = new Blob([timerWorker.workerSrc], { type: 'text/javascript' });
    // eslint-disable-next-line compat/compat
    return URL.createObjectURL(workerBlob);
  }

  private handleWorkerEvent(ev: MessageEvent<TimerWorkerOutMessage>) {
    const data = ev.data;
    switch(data.action) {
      case 'timeoutCallback':
        this.handleTimeoutCallback(data);
        break;
      case 'init':
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

  setTimeout(handler: () => void, timeout: number) {
    if (this.timerWorker) {
      const timerId = this.timerId++;
      this.timersHandlers[timerId] = handler.bind(this);
      this.timerWorker?.postMessage({
        action: 'setTimeout',
        timeout,
        timerId: timerId,
      } as TimerWorkerInMessage);
      return timerId;
    } else {
      // fallback
      return setTimeout(handler, timeout);
    }
  }

  clearTimeout(timerId: number) {
    if (this.timerWorker) {
      this.timerWorker?.postMessage({
        action: 'clearTimeout',
        timerId: timerId,
      } as TimerWorkerInMessage);
      delete this.timersHandlers[this.timerId];
    } else {
      // fallback
      return clearTimeout(timerId);
    }
  }
}
