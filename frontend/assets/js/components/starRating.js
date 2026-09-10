export function starRating(rating) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "4px";

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = i <= rating ? "⭐" : "☆";
        star.style.fontSize = "1.2rem";
        div.appendChild(star);
    }

    return div;
}
