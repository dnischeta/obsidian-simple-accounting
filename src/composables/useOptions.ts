import { TFile } from "obsidian";
import { useObsidian } from "./useObsidian";
import { onMounted, ref } from "vue";

export const useOptions = () => {
    const categories = ref<string[]>([])
    const sources = ref<string[]>([])

    const obsidianApp = useObsidian();

    onMounted(async () => {
        const categoriesFile = obsidianApp.vault.getFileByPath('Категории.md');
        const sourcesFile = obsidianApp.vault.getFileByPath('Источники.md');
        
        // TODO (d.nishcheta): handle properly
        if (!categoriesFile || !sourcesFile) {
          throw new Error('No categories or sources file');
        }

        [categories.value, sources.value] = await Promise.all([
            readListFromFile(categoriesFile),
            readListFromFile(sourcesFile)
        ])
    });


    async function readListFromFile(file: TFile): Promise<string[]> {
        return (await obsidianApp.vault.read(file)).split('\n');
    }

    return { categories, sources };
}