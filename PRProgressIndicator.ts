import {createOrUpdateProgressIndicators} from "./api/utils";

(async () => {
    await createOrUpdateProgressIndicators();
    process.exit(1)
})();