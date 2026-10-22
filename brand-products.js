const productsPerPage = 24;

document.querySelectorAll("[data-product-catalog]").forEach((catalog) => {
    const filters = catalog.querySelector("[data-product-filters]");
    const search = catalog.querySelector("[data-product-search]");
    const status = catalog.querySelector("[data-product-status]");
    const grid = catalog.querySelector("[id$='-product-grid']");
    const emptyState = catalog.querySelector("[data-product-empty]");
    const pagination = catalog.querySelector("[data-product-pagination]");
    const pageStatus = catalog.querySelector("[data-page-status]");
    const template = catalog.querySelector("[data-product-template]");
    const previousButton = catalog.querySelector("[data-page='previous']");
    const nextButton = catalog.querySelector("[data-page='next']");

    if (!filters || !search || !status || !grid || !emptyState || !pagination || !pageStatus || !template || !previousButton || !nextButton) {
        throw new Error("商品目錄缺少必要的頁面元件。");
    }

    let products = [];
    let categoriesById = new Map();
    let selectedCategory = "all";
    let currentPage = 1;

    const render = () => {
        const query = search.value.trim().toLocaleLowerCase("zh-TW");
        const matchingProducts = products.filter((product) => {
            const category = categoriesById.get(product.category);
            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
            const searchableText = `${product.name} ${product.description} ${category.name} ${product.imageAlt}`.toLocaleLowerCase("zh-TW");
            return matchesCategory && searchableText.includes(query);
        });
        const pageCount = Math.max(1, Math.ceil(matchingProducts.length / productsPerPage));
        currentPage = Math.min(currentPage, pageCount);

        const startIndex = (currentPage - 1) * productsPerPage;
        const visibleProducts = matchingProducts.slice(startIndex, startIndex + productsPerPage);
        const cards = visibleProducts.map((product) => {
            const card = template.content.firstElementChild.cloneNode(true);
            const category = categoriesById.get(product.category);
            const image = card.querySelector("img");
            image.src = product.image;
            image.alt = product.imageAlt;
            card.querySelector("[data-product-category]").textContent = category.name;
            card.querySelector("[data-product-name]").textContent = product.name;
            card.querySelector("[data-product-description]").textContent = product.description;
            return card;
        });

        grid.replaceChildren(...cards);
        emptyState.classList.toggle("hidden", matchingProducts.length > 0);
        status.textContent = `共 ${matchingProducts.length} 項商品`;
        pagination.hidden = matchingProducts.length <= productsPerPage;
        pageStatus.textContent = `第 ${currentPage} / ${pageCount} 頁`;
        previousButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === pageCount;
    };

    filters.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-filter]");
        if (!button || !filters.contains(button)) return;

        selectedCategory = button.dataset.filter;
        currentPage = 1;
        filters.querySelectorAll("button[data-filter]").forEach((filter) => {
            filter.setAttribute("aria-pressed", String(filter === button));
        });
        render();
    });

    search.addEventListener("input", () => {
        currentPage = 1;
        render();
    });

    previousButton.addEventListener("click", () => {
        currentPage -= 1;
        render();
    });

    nextButton.addEventListener("click", () => {
        currentPage += 1;
        render();
    });

    const loadProducts = async () => {
        try {
            const response = await fetch(catalog.dataset.productSource);
            if (!response.ok) {
                throw new Error(`商品資料載入失敗：HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
                throw new Error("商品資料格式錯誤，需包含 categories 與 products 陣列。");
            }

            categoriesById = new Map();
            data.categories.forEach((category) => {
                if (typeof category.id !== "string" || typeof category.name !== "string" || categoriesById.has(category.id)) {
                    throw new Error("商品分類資料格式錯誤或分類 ID 重複。");
                }
                categoriesById.set(category.id, category);
            });

            products = data.products.map((product) => {
                if (
                    typeof product.category !== "string"
                    || !categoriesById.has(product.category)
                    || typeof product.name !== "string"
                    || typeof product.description !== "string"
                    || typeof product.image !== "string"
                    || typeof product.imageAlt !== "string"
                ) {
                    throw new Error("商品資料格式錯誤，請確認商品欄位及分類 ID。");
                }
                return product;
            });

            const allButton = document.createElement("button");
            allButton.type = "button";
            allButton.className = "brand-filter";
            allButton.dataset.filter = "all";
            allButton.setAttribute("aria-pressed", "true");
            allButton.textContent = "全部";
            filters.replaceChildren(allButton);

            categoriesById.forEach((category, id) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "brand-filter";
                button.dataset.filter = id;
                button.setAttribute("aria-pressed", "false");
                button.textContent = category.name;
                filters.append(button);
            });

            render();
        } catch (error) {
            console.error(error);
            status.textContent = "商品資料載入失敗，請稍後再試或聯絡我們。";
        }
    };

    loadProducts();
});
