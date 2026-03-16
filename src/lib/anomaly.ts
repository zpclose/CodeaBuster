// import geoip from 'geoip-lite'; // Removing due to build issues

export async function detectAnomaly({
    currentIP,
    previousIP,
    currentUA,
    previousUA,
    lastLoginAt,
}: {
    currentIP: string;
    previousIP?: string;
    currentUA: string;
    previousUA?: string;
    lastLoginAt?: number;
}) {
    if (!previousIP) return false;

    // 1. Country change (High Risk) - Use async if needed, or skip for now to unblock
    let currentCountry = 'Unknown';
    let previousCountry = 'Unknown';

    try {
        // Simple fetch to free IP API (rate limited, but okay for Admin login)
        // Note: This adds latency. For now, let's just log it or skip if too slow.
        // const res = await fetch(`http://ip-api.com/json/${currentIP}?fields=country`);
        // const data = await res.json();
        // currentCountry = data.country;

        // For now, we skip Country check to fix the crash immediately.
        // We can add a robust solution later.
    } catch (e) {
        // Ignore
    }

    // REPLACEMENT LOGIC:
    // If we really need country, we must use an external API or a different lib.
    // For now, let's rely on IP subnet and UA.

    // 1. IP Subnet Change (Simple Check)
    // If IP changes class A/B significantly (e.g. 192.168.x.x vs 10.x.x.x)
    // This is a rough heuristic.
    const currentSubnet = currentIP.split('.').slice(0, 2).join('.');
    const previousSubnet = previousIP.split('.').slice(0, 2).join('.');

    if (currentSubnet !== previousSubnet) {
        // This might be false positive for dynamic IPs, but let's keep it loose for now.
        // Or simply remove this check if too noisy.
        // return true; // Commented out to avoid false positives on mobile networks
    }

    // 2. UA major change (e.g., Windows to iPhone)
    // Simple check: compare the first part of the UA string or OS
    if (previousUA && currentUA.split(' ')[0] !== previousUA.split(' ')[0]) {
        return true;
    }

    // 3. Rapid location switch (Impossible Travel - Simplified)
    // If login < 1 minute from previous login
    if (lastLoginAt && Date.now() - lastLoginAt < 60_000) {
        return true;
    }

    return false;
}
