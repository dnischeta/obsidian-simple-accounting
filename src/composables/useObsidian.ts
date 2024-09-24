import { inject } from 'vue';
import { OBSIDIAN_INJECTION_KEY } from '../consts';

export const useObsidian = () => {
    const injection = inject(OBSIDIAN_INJECTION_KEY);
    if (!injection) {
        throw new Error('Obsidian app is not provided');
    }

    return injection.obsidianApp;
}
