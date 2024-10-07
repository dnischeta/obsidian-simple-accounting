import { inject } from 'vue';
import { OBSIDIAN_INJECTION_KEY } from '../consts';

export function useSettings() {
    const { settings } = inject(OBSIDIAN_INJECTION_KEY)!;
    
    return {
        settings,
    };
}