export class FpsStats {
  private beginTime: number;
  private prevTime: number;
  private frames: number;

  constructor() {
    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;
  }

  begin() {
    this.beginTime = (performance || Date).now();
  }

  end() {
    this.frames++;
    const time = (performance || Date).now();

    if (time >= this.prevTime + 100) {
      this.frames = (this.frames * 100) / (time - this.prevTime);

      this.prevTime = time;
      const result = this.frames * 10;
      this.frames = 0;
      return result;
    }

    return -1;
  }

  reset() {
    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;
  }
}
