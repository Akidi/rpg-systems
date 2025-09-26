// CUID Generator Class for browser environments
// Based on the original CUID spec but simplified

class CuidGenerator {
	private static readonly BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';
	private counter = 0;
	private fingerprint: string;

	constructor() {
		this.fingerprint = this.generateFingerprint();
	}

	// Get a random base36 string of specified length
	private randomBlock(length: number): string {
		let result = '';
		for (let i = 0; i < length; i++) {
			result += CuidGenerator.BASE36[Math.floor(Math.random() * 36)];
		}
		return result;
	}

	// Convert number to base36 with padding
	private toBase36(num: number, length: number): string {
		return num.toString(36).padStart(length, '0').slice(-length);
	}

	// Get timestamp block
	private timestampBlock(): string {
		return this.toBase36(Date.now(), 8);
	}

	// Get counter block (increments with each call)
	private counterBlock(): string {
		this.counter = (this.counter + 1) % 1679616; // 36^4 to keep it 4 chars
		return this.toBase36(this.counter, 4);
	}

	// Generate fingerprint once during construction
	private generateFingerprint(): string {
		// Simple browser fingerprint using available APIs
		const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
		const screen =
			typeof window !== 'undefined' && window.screen
				? `${window.screen.width}x${window.screen.height}`
				: '';

		// Create a simple hash of available identifiers
		let hash = 0;
		const str = userAgent + screen + (typeof process !== 'undefined' ? process.pid : '');

		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}

		return this.toBase36(Math.abs(hash), 4);
	}

	// Get fingerprint block (cached)
	private fingerprintBlock(): string {
		return this.fingerprint;
	}

	// Generate a full CUID
	generate(): string {
		return (
			'c' +
			this.timestampBlock() +
			this.counterBlock() +
			this.fingerprintBlock() +
			this.randomBlock(4)
		);
	}

	// Generate a slug (shorter version)
	generateSlug(): string {
		return (
			this.timestampBlock().slice(-2) +
			this.counterBlock().slice(-2) +
			this.fingerprintBlock().slice(-2) +
			this.randomBlock(2)
		);
	}

	// Static validation methods
	static isCuid(str: string): boolean {
		if (typeof str !== 'string') return false;
		if (str.length !== 21) return false;
		if (str[0] !== 'c') return false;

		// Check if rest is valid base36
		const rest = str.slice(1);
		return /^[0-9a-z]+$/.test(rest);
	}

	static isSlug(str: string): boolean {
		if (typeof str !== 'string') return false;
		if (str.length !== 8) return false;
		return /^[0-9a-z]+$/.test(str);
	}

	// Reset counter (useful for testing)
	resetCounter(): void {
		this.counter = 0;
	}

	// Get current counter value (useful for debugging)
	getCounter(): number {
		return this.counter;
	}

	// Get fingerprint (useful for debugging)
	getFingerprint(): string {
		return this.fingerprint;
	}
}

// Export singleton instance and convenience functions
export const cuidGenerator = new CuidGenerator();

// Convenience functions that use the singleton
export const cuid = (): string => cuidGenerator.generate();
export const slug = (): string => cuidGenerator.generateSlug();
export const isCuid = (str: string): boolean => CuidGenerator.isCuid(str);
export const isSlug = (str: string): boolean => CuidGenerator.isSlug(str);

// Export the class for custom instances if needed
export { CuidGenerator };
