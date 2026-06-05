import * as THREE from 'three';
import { QualityTier } from './types';

export class DeviceProfiler {
    private renderer: string = 'Unknown';
    private vendor: string = 'Unknown';
    private isIntegratedOrMobile: boolean = false;
    private suggestedTier: QualityTier = 'MID';

    constructor(gl?: WebGLRenderingContext | WebGL2RenderingContext) {
        this.profile(gl);
    }

    private profile(gl?: WebGLRenderingContext | WebGL2RenderingContext): void {
        let activeGl = gl;

        // If no context is passed, try to create a temporary canvas to profile
        if (!activeGl && typeof document !== 'undefined') {
            try {
                const canvas = document.createElement('canvas');
                activeGl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
            } catch (e) {
                console.warn('Failed to create temporary WebGL context for profiling');
            }
        }

        if (!activeGl) {
            return;
        }

        this.renderer = activeGl.getParameter(activeGl.RENDERER) || 'Unknown';
        this.vendor = activeGl.getParameter(activeGl.VENDOR) || 'Unknown';

        const debugInfo = activeGl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const unmaskedRenderer = activeGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const unmaskedVendor = activeGl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            if (unmaskedRenderer) this.renderer = unmaskedRenderer;
            if (unmaskedVendor) this.vendor = unmaskedVendor;
        }

        const rendererUpper = this.renderer.toUpperCase();
        const vendorUpper = this.vendor.toUpperCase();

        // Check for common integrated/low-power/fallback GPUs
        const hasIntel = rendererUpper.includes('INTEL') || vendorUpper.includes('INTEL');
        const hasAMDIntegrated = rendererUpper.includes('RADEON(TM) GRAPHICS') || (rendererUpper.includes('AMD') && rendererUpper.includes('VEGA'));
        const hasAppleIntegrated = rendererUpper.includes('APPLE') && !rendererUpper.includes('PRO') && !rendererUpper.includes('MAX') && !rendererUpper.includes('ULTRA');
        const hasMobile = /ANDROID|IPHONE|IPAD|IPOD|MOBILE/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
        const hasSoftwareRenderer = rendererUpper.includes('SWIFTSHADER') || rendererUpper.includes('SOFTWARE') || rendererUpper.includes('BASIC RENDER');

        this.isIntegratedOrMobile = hasIntel || hasAMDIntegrated || hasAppleIntegrated || hasMobile || hasSoftwareRenderer;

        if (hasSoftwareRenderer || (hasMobile && !rendererUpper.includes('PRO'))) {
            this.suggestedTier = 'LOW';
        } else if (this.isIntegratedOrMobile) {
            this.suggestedTier = 'MID';
        } else {
            this.suggestedTier = 'HIGH';
        }
    }

    public getGpuInfo() {
        return {
            renderer: this.renderer,
            vendor: this.vendor,
            isIntegratedOrMobile: this.isIntegratedOrMobile,
            suggestedTier: this.suggestedTier
        };
    }
}
