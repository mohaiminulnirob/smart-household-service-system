import { skeletonCard, emptyState } from "../../components/skeletonCard.js";
import { workerCard } from "../../components/workerCard.js";
import { apiFetch } from "../../utils/api-client.js";
import { requireAuth } from "../../utils/auth.js";
import { toast } from "../../utils/toast.js";

requireAuth("user");

const searchBtn = document.getElementById("searchBtn");
const category = document.getElementById("serviceCategory");
const output = document.getElementById("workerList");

searchBtn.addEventListener("click", async () => {
    const service = category.value;

    if (!service) {
        toast.error("Please select a category");
        return;
    }

    output.innerHTML = "";
    output.appendChild(skeletonCard('worker', 3));

    try {
        const workers = await apiFetch(`/workers/nearby?service=${service}`);

        output.innerHTML = "";

        workers.forEach(w => {
            output.appendChild(workerCard(w));
        });

        if (workers.length === 0) {
            output.appendChild(emptyState('worker'));
        }
    } catch (err) {
        toast.error("Failed to fetch workers");
        console.error(err);
    }
});
