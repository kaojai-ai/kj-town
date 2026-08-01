import { QualityTier, QUALITY_PRESETS } from './types';
import { DeviceProfiler } from './DeviceProfiler';
import { RuntimePerformanceMonitor } from './RuntimePerformanceMonitor';

export class AdaptiveQualityController {
    private currentTier: QualityTier;
    private profiler: DeviceProfiler;
    private monitor: RuntimePerformanceMonitor;
    
    private downgradeStreak: number = 0;
    private upgradeStreak: number = 0;

    private readonly DOWNGRADE_THRESHOLD_MS = 20.0; // > 20ms (under 50 FPS)
    private readonly UPGRADE_THRESHOLD_MS = 14.0; // < 14ms (above ~71 FPS)
    
    private readonly DOWNGRADE_STREAK_LIMIT = 3; // Fast decay
    private readonly UPGRADE_STREAK_LIMIT = 180; // Slow recovery (~3 seconds at 60fps)

    constructor(
        profiler: DeviceProfiler,
        monitor: RuntimePerformanceMonitor
    ) {
        this.profiler = profiler;
        this.monitor = monitor;
        this.currentTier = this.profiler.getGpuInfo().suggestedTier;
    }

    public getTier(): QualityTier {
        return this.currentTier;
    }

    public setTier(tier: QualityTier): void {
        if (this.currentTier !== tier) {
            this.currentTier = tier;
            this.downgradeStreak = 0;
            this.upgradeStreak = 0;
            this.monitor.reset();
        }
    }

    public update(): boolean {
        this.monitor.recordFrame();
        
        const avgFrameTime = this.monitor.getAverageFrameTime();
        const stats = this.monitor.getRendererStats();
        const activePreset = QUALITY_PRESETS[this.currentTier];

        // Check if we exceed current tier limits
        const isFrameTimeBad = avgFrameTime > this.DOWNGRADE_THRESHOLD_MS;
        const isBudgetExceeded = 
            stats.drawCalls > activePreset.maxDrawCalls ||
            stats.triangles > activePreset.maxTriangles;

        let tierChanged = false;

        if (isFrameTimeBad || isBudgetExceeded) {
            this.downgradeStreak++;
            this.upgradeStreak = 0;

            if (this.downgradeStreak >= this.DOWNGRADE_STREAK_LIMIT) {
                tierChanged = this.downgrade();
            }
        } else {
            this.downgradeStreak = 0;
            
            // Check if we can upgrade
            if (this.currentTier !== 'HIGH') {
                const nextTier: QualityTier = this.currentTier === 'LOW' ? 'MID' : 'HIGH';
                const nextPreset = QUALITY_PRESETS[nextTier];
                
                const isUnderNextTierBudget = 
                    stats.drawCalls < nextPreset.maxDrawCalls &&
                    stats.triangles < nextPreset.maxTriangles;
                const isFrameTimeGood = avgFrameTime < this.UPGRADE_THRESHOLD_MS;

                if (isFrameTimeGood && isUnderNextTierBudget) {
                    this.upgradeStreak++;
                    if (this.upgradeStreak >= this.UPGRADE_STREAK_LIMIT) {
                        tierChanged = this.upgrade();
                    }
                } else {
                    this.upgradeStreak = 0;
                }
            } else {
                this.upgradeStreak = 0;
            }
        }

        return tierChanged;
    }

    private downgrade(): boolean {
        this.downgradeStreak = 0;
        if (this.currentTier === 'HIGH') {
            this.currentTier = 'MID';
            this.monitor.reset();
            return true;
        } else if (this.currentTier === 'MID') {
            this.currentTier = 'LOW';
            this.monitor.reset();
            return true;
        }
        return false;
    }

    private upgrade(): boolean {
        this.upgradeStreak = 0;
        if (this.currentTier === 'LOW') {
            this.currentTier = 'MID';
            this.monitor.reset();
            return true;
        } else if (this.currentTier === 'MID') {
            this.currentTier = 'HIGH';
            this.monitor.reset();
            return true;
        }
        return false;
    }

    public getDebugInfo() {
        return {
            currentTier: this.currentTier,
            fps: this.monitor.getFPS(),
            frameMs: parseFloat(this.monitor.getAverageFrameTime().toFixed(1)),
            downgradeStreak: this.downgradeStreak,
            upgradeStreak: this.upgradeStreak,
            stats: this.monitor.getRendererStats()
        };
    }
}
