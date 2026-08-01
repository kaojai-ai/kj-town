import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DeviceProfiler } from './DeviceProfiler';
import { RuntimePerformanceMonitor } from './RuntimePerformanceMonitor';
import { AdaptiveQualityController } from './AdaptiveQualityController';
import { QUALITY_PRESETS, QualityTier } from './types';

describe('Adaptive Quality System', () => {
    describe('DeviceProfiler', () => {
        it('returns a valid suggested tier', () => {
            const profiler = new DeviceProfiler();
            const gpuInfo = profiler.getGpuInfo();
            assert.ok(['LOW', 'MID', 'HIGH'].includes(gpuInfo.suggestedTier));
        });

        it('identifies mobile user agents', () => {
            const isMobileUA = (ua: string) => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            assert.equal(isMobileUA('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'), true);
            assert.equal(isMobileUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), false);
        });
    });

    describe('RuntimePerformanceMonitor', () => {
        it('calculates average frame times and stats', () => {
            const mockRenderer = {
                info: {
                    render: { calls: 0, triangles: 0 },
                    memory: { geometries: 0, textures: 0 }
                }
            } as any;
            const monitor = new RuntimePerformanceMonitor(mockRenderer);

            // Simulate high performance
            for (let i = 0; i < 60; i++) {
                monitor.recordFrame();
            }
            assert.ok(monitor.getFPS() > 0);
            assert.ok(monitor.getAverageFrameTime() > 0);
            
            const stats = monitor.getRendererStats();
            assert.equal(stats.drawCalls, 0);
            assert.equal(stats.triangles, 0);
        });
    });

    describe('AdaptiveQualityController', () => {
        it('respects initial tier and performs state management', () => {
            const mockProfiler = {
                getGpuInfo: () => ({ suggestedTier: 'MID' as QualityTier, gpuVendor: 'Mock', gpuRenderer: 'Mock' })
            } as any;
            
            const mockMonitor = {
                reset: () => {},
                recordFrame: () => {},
                getAverageFrameTime: () => 16.67,
                getRendererStats: () => ({ drawCalls: 10, triangles: 100 }),
                getFPS: () => 60
            } as any;

            const controller = new AdaptiveQualityController(mockProfiler, mockMonitor);

            assert.equal(controller.getTier(), 'MID');

            // Force MID to LOW
            controller.setTier('LOW');
            assert.equal(controller.getTier(), 'LOW');
        });

        it('scales down quality under poor performance', () => {
            const mockProfiler = {
                getGpuInfo: () => ({ suggestedTier: 'HIGH' as QualityTier, gpuVendor: 'Mock', gpuRenderer: 'Mock' })
            } as any;
            
            let frameTime = 25.0; // poor performance (> 20ms)
            const mockMonitor = {
                reset: () => {},
                recordFrame: () => {},
                getAverageFrameTime: () => frameTime,
                getRendererStats: () => ({ drawCalls: 10, triangles: 100 }),
                getFPS: () => 40
            } as any;

            const controller = new AdaptiveQualityController(mockProfiler, mockMonitor);
            assert.equal(controller.getTier(), 'HIGH');

            // Update multiple times to exceed downgrade streak limit (3)
            let updated = false;
            for (let i = 0; i < 5; i++) {
                updated = controller.update() || updated;
            }

            assert.equal(updated, true);
            assert.equal(controller.getTier(), 'MID');
        });

        it('scales up quality under good performance and low load', () => {
            const mockProfiler = {
                getGpuInfo: () => ({ suggestedTier: 'LOW' as QualityTier, gpuVendor: 'Mock', gpuRenderer: 'Mock' })
            } as any;
            
            const mockMonitor = {
                reset: () => {},
                recordFrame: () => {},
                getAverageFrameTime: () => 10.0, // excellent performance (< 14ms)
                getRendererStats: () => ({ drawCalls: 10, triangles: 100 }), // way below MID/HIGH thresholds
                getFPS: () => 100
            } as any;

            const controller = new AdaptiveQualityController(mockProfiler, mockMonitor);
            assert.equal(controller.getTier(), 'LOW');

            // Update multiple times to exceed upgrade streak limit (180)
            let updated = false;
            for (let i = 0; i < 200; i++) {
                updated = controller.update() || updated;
            }

            assert.equal(updated, true);
            assert.equal(controller.getTier(), 'MID');
        });
    });
});
