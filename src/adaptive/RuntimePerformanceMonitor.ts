import * as THREE from 'three';

export class RuntimePerformanceMonitor {
    private renderer: THREE.WebGLRenderer;
    private frameTimes: number[] = [];
    private maxWindowSize: number;
    private lastTime: number = 0;

    constructor(renderer: THREE.WebGLRenderer, maxWindowSize: number = 60) {
        this.renderer = renderer;
        this.maxWindowSize = maxWindowSize;
        this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    }

    public recordFrame(): void {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        // Skip outliers (e.g., when tab is backgrounded or first frame)
        if (delta > 0 && delta < 500) {
            this.frameTimes.push(delta);
            if (this.frameTimes.length > this.maxWindowSize) {
                this.frameTimes.shift();
            }
        }
    }

    public getAverageFrameTime(): number {
        if (this.frameTimes.length === 0) return 16.67;
        const sum = this.frameTimes.reduce((acc, val) => acc + val, 0);
        return sum / this.frameTimes.length;
    }

    public getFPS(): number {
        const avg = this.getAverageFrameTime();
        return avg > 0 ? Math.round(1000 / avg) : 0;
    }

    public getRendererStats() {
        return {
            drawCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };
    }

    public reset(): void {
        this.frameTimes = [];
        this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    }
}
