// Page rendering module - loaded asynchronously only when needed
import { storage } from "./libs.ts";

const LS_DEFAULT_BANG = storage.get("defaultBang") || "kagi";

const createTemplate = ({
	bangs,
	customBangs,
}: {
	LS_DEFAULT_BANG: string;
	bangs: Record<string, any>;
	customBangs: Record<string, any>;
}) => `
	<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
		<header style="position: absolute; top: 1rem; width: 100%;">
			<div style="display: flex; justify-content: flex-end; padding: 0 1rem;">
				<button class="settings-button">
					<img src="/gear.svg" alt="Settings" class="settings" />
				</button>
			</div>
		</header>
		<div class="content-container">
			<h1 id="cutie">┐( ˘_˘ )┌</h1>
			<p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
			<div class="url-container">
				<input
					type="text"
					class="url-input"
					value="https://unduck.link?q=%s"
					readonly
				/>
				<button class="copy-button">
					<img src="/clipboard.svg" alt="Copy" />
				</button>
			</div>
		</div>
		<div class="modal" id="settings-modal">
			<div class="modal-content">
					<button class="close-modal">&times;</button>
					<h2>Settings</h2>
					<div class="settings-section">
					    <h3>Bangs</h3>
							<label for="default-bang" id="bang-description">Default Bang: ${
								bangs[LS_DEFAULT_BANG]?.s || "Unknown bang"
							}</label>
							<div class="bang-select-container">
									<input type="text" id="default-bang" class="bang-select" value="${LS_DEFAULT_BANG}">
							</div>
							<p class="help-text">The best way to add new bangs is by submitting them on <a href="https://duckduckgo.com/newbang" target="_blank">DuckDuckGo</a> but you can also add them below</p>
							<div style="margin-top: 16px;">
								<h4>Add Custom Bang</h4>
								<div class="custom-bang-inputs">
									<input type="text" placeholder="Bang name" id="bang-name" class="bang-name">
									<input type="text" placeholder="Shortcut (e.g. !ddg)" id="bang-shortcut" class="bang-shortcut">
									<input type="text" placeholder="Search URL with {{{s}}}" id="bang-search-url" class="bang-search-url">
									<input type="text" placeholder="Base domain" id="bang-base-url" class="bang-base-url">
									<div style="text-align: right;">
										<button class="add-bang">Add Bang</button>
									</div>
								</div>
								${
									Object.keys(customBangs).length > 0
										? `
  								<h4>Your Custom Bangs</h4>
  								<div class="custom-bangs-list">
  								${Object.entries(customBangs)
										.map(
											([shortcut, bang]) => `
  									<div class="custom-bang-item">
   									<table class="custom-bang-info">
   											<tr>
  												<td class="custom-bang-name">${bang.t}</td>
  												<td class="custom-bang-shortcut"><code>!${shortcut}</code></td>
  												<td class="custom-bang-base">${bang.d}</td>
   											</tr>
   									</table>
  										<div class="custom-bang-url">${bang.u}</div>
  										<button class="remove-bang" data-shortcut="${shortcut}">Remove</button>
  									</div>
  								`
										)
										.join("")}
  								</div>
								`
										: ""
								}
							</div>
					</div>
				</div>
			</div>
		</div>
	</div>
`;
function injectStyles() {
	// Only inject styles if they haven't been injected already
	if (document.querySelector("#dynamic-styles")) return;

	const style = document.createElement("style");
	style.id = "dynamic-styles";
	style.textContent = `
		:root {
			--text-color: #1a1a1a;
			--text-color-secondary: #666;
			--text-color-hover: #333;
			--bg-color: #fff;
			--bg-color-secondary: #f5f5f5;
			--bg-color-hover: #f0f0f0;
			--bg-color-active: #e5e5e5;
			--bg-color-danger: #e9808a;
			--border-color: #ddd;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--text-color: #e0e0e0;
				--text-color-secondary: #999;
				--text-color-hover: #fff;
				--bg-color: #121212;
				--bg-color-secondary: #1e1e1e;
				--bg-color-hover: #2a2a2a;
				--bg-color-active: #333;
				--bg-color-danger: #f15f6d;
				--border-color: #444;
			}
		}
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: system-ui, sans-serif;
			line-height: 1.5;
			color: var(--text-color);
			background-color: var(--bg-color);
		}
		input {
			padding: 8px 12px;
			border: 1px solid var(--border-color);
			border-radius: 4px;
			width: 100%;
			background: var(--bg-color-secondary);
			color: var(--text-color);
			font: inherit;
		}
		button {
			font: inherit;
			border: none;
			background: none;
			cursor: pointer;
			color: var(--text-color-secondary);
		}
		button:hover {
			background: var(--bg-color-hover);
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			padding: 2rem;
			text-align: center;
		}
		h1 {
			margin-bottom: 1rem;
			font-size: 2rem;
		}
		p {
			margin-bottom: 2rem;
			color: var(--text-color-secondary);
		}
		.url-container {
			display: flex;
			gap: 0.5rem;
			margin-bottom: 2rem;
		}
		.url-input {
			flex: 1;
		}
		.copy-button {
			padding: 8px;
			border: 1px solid var(--border-color);
			border-radius: 4px;
			background: var(--bg-color-secondary);
		}
		.copy-button:hover {
			background: var(--bg-color-hover);
		}
		.copy-button img {
			width: 16px;
			height: 16px;
		}
		.settings-container {
			position: fixed;
			top: 1rem;
			right: 1rem;
		}
		.settings-button {
			padding: 8px;
			border: 1px solid var(--border-color);
			border-radius: 4px;
			background: var(--bg-color-secondary);
			font-size: 1.2rem;
		}
		.settings-button:hover {
			background: var(--bg-color-hover);
		}
		.modal {
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 1000;
		}
		.modal-content {
			position: relative;
			background-color: var(--bg-color);
			border: 1px solid var(--border-color);
			margin: 5% auto;
			padding: 20px;
			border-radius: 8px;
			width: 80%;
			max-width: 500px;
			max-height: 80vh;
			overflow-y: auto;
		}
		.close-modal {
			position: absolute;
			top: 10px;
			right: 15px;
			font-size: 28px;
			font-weight: bold;
			cursor: pointer;
			color: var(--text-color-secondary);
		}
		.close-modal:hover {
			color: var(--text-color);
		}
		.settings-section {
			margin-top: 20px;
		}
		.settings-section h3 {
			margin-bottom: 15px;
			color: var(--text-color);
		}
		.bang-select-container {
			margin: 10px 0;
		}
		.bang-select {
			width: 100%;
			padding: 8px;
			border: 1px solid var(--border-color);
			border-radius: 4px;
			background: var(--bg-color-secondary);
			color: var(--text-color);
		}
		.help-text {
			font-size: 14px;
			color: var(--text-color-secondary);
			margin: 10px 0;
		}
		.custom-bang-inputs {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		.custom-bang-inputs input {
			padding: 8px;
			border: 1px solid var(--border-color);
			border-radius: 4px;
			background: var(--bg-color-secondary);
			color: var(--text-color);
		}
		.add-bang {
			padding: 8px 16px;
			background: var(--bg-color-secondary);
			border: 1px solid var(--border-color);
			border-radius: 4px;
			color: var(--text-color);
			cursor: pointer;
		}
		.add-bang:hover {
			background: var(--bg-color-hover);
		}
		.custom-bangs-list {
			margin-top: 15px;
		}
		.custom-bang-item {
			border: 1px solid var(--border-color);
			border-radius: 4px;
			padding: 10px;
			margin-bottom: 10px;
			background: var(--bg-color-secondary);
		}
		.custom-bang-info {
			width: 100%;
			border-collapse: collapse;
		}
		.custom-bang-name {
			font-weight: bold;
			color: var(--text-color);
		}
		.custom-bang-shortcut {
			font-family: monospace;
			background: var(--bg-color);
			padding: 2px 4px;
			border-radius: 2px;
		}
		.custom-bang-base {
			color: var(--text-color-secondary);
			font-size: 12px;
		}
		.custom-bang-url {
			font-family: monospace;
			font-size: 12px;
			color: var(--text-color-secondary);
			margin: 5px 0;
			word-break: break-all;
		}
		.remove-bang {
			background: var(--bg-color-danger);
			color: white;
			border: none;
			padding: 4px 8px;
			border-radius: 3px;
			cursor: pointer;
			font-size: 12px;
		}
		.remove-bang:hover {
			opacity: 0.8;
		}
		.flash-white {
			background-color: #fff !important;
			transition: background-color 0.3s ease;
		}
		.flash-red {
			background-color: var(--bg-color-danger) !important;
			transition: background-color 0.3s ease;
		}
		.shake {
			animation: shake 0.3s ease-in-out;
		}
		@keyframes shake {
			0%, 100% { transform: translateX(0); }
			25% { transform: translateX(-5px); }
			75% { transform: translateX(5px); }
		}
		.rotate {
			animation: rotate 0.375s ease-in-out;
		}
		@keyframes rotate {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	`;
	document.head.appendChild(style);
}

// Filter out invalid custom bangs
const filterValidCustomBangs = (
	customBangs: Record<string, any>
): Record<string, any> => {
	const filtered: Record<string, any> = {};

	for (const [shortcut, bang] of Object.entries(customBangs)) {
		// Check if bang has all required properties and they're not undefined/null/empty
		if (
			bang &&
			typeof bang === "object" &&
			bang.t &&
			typeof bang.t === "string" &&
			bang.t.trim() !== "" &&
			bang.s &&
			typeof bang.s === "string" &&
			bang.s.trim() !== "" &&
			bang.u &&
			typeof bang.u === "string" &&
			bang.u.trim() !== "" &&
			bang.d &&
			typeof bang.d === "string" &&
			bang.d.trim() !== ""
		) {
			filtered[shortcut] = bang;
		}
	}

	return filtered;
};

export async function renderDefaultPage() {
	// Inject styles only when rendering the default page
	injectStyles();

	const app = document.querySelector<HTMLDivElement>("#app");
	if (!app) throw new Error("App element not found");

	// Load bangs for settings
	const { bangs } = await import("./bangs/hashbang.ts");
	const rawCustomBangs: Record<string, any> =
		(storage.get("customBangs") as unknown as Record<string, any>) || {};

	// Filter out invalid custom bangs
	const customBangs = filterValidCustomBangs(rawCustomBangs);

	// If filtering removed any bangs, save the cleaned version back to storage
	if (Object.keys(customBangs).length !== Object.keys(rawCustomBangs).length) {
		storage.set("customBangs", JSON.stringify(customBangs));
	}

	// Update the template with the loaded bangs
	app.innerHTML = createTemplate({
		LS_DEFAULT_BANG,
		bangs,
		customBangs,
	});

	// Re-query elements after template update
	const elements = {
		app,
		copyInput: app.querySelector<HTMLInputElement>(".url-input"),
		copyButton: app.querySelector<HTMLButtonElement>(".copy-button"),
		copyIcon: app.querySelector<HTMLImageElement>(".copy-button img"),
		urlInput: app.querySelector<HTMLInputElement>(".url-input"),
		settingsButton: app.querySelector<HTMLButtonElement>(".settings-button"),
		modal: app.querySelector<HTMLDivElement>("#settings-modal"),
		closeModal: app.querySelector<HTMLButtonElement>(".close-modal"),
		defaultBangSelect: app.querySelector<HTMLInputElement>("#default-bang"),
		description: app.querySelector<HTMLLabelElement>("#bang-description"),
		bangName: app.querySelector<HTMLInputElement>(".bang-name"),
		bangShortcut: app.querySelector<HTMLInputElement>(".bang-shortcut"),
		bangSearchUrl: app.querySelector<HTMLInputElement>(".bang-search-url"),
		bangBaseUrl: app.querySelector<HTMLInputElement>(".bang-base-url"),
		addBang: app.querySelector<HTMLButtonElement>(".add-bang"),
		removeBangs: app.querySelectorAll<HTMLButtonElement>(".remove-bang"),
	} as const;

	// Validate all elements exist
	const validatedElements = Object.fromEntries(
		Object.entries(elements).map(([key, element]) => {
			if (!element) throw new Error(`Element not found: ${key}`);
			return [key, element];
		})
	) as typeof elements;

	// Update description when default bang changes
	const updateDescription = (bangName: string) => {
		const bang = bangs[bangName] || customBangs[bangName];
		if (validatedElements.description) {
			validatedElements.description.textContent = bang?.d || "Unknown bang";
		}
	};

	// Set initial description
	updateDescription(LS_DEFAULT_BANG);

	// Set initial URL value
	if (validatedElements.urlInput) {
		validatedElements.urlInput.value = `${window.location.protocol}//${window.location.host}?q=%s`;
	}

	// Event listeners
	validatedElements.copyButton?.addEventListener("click", async () => {
		await navigator.clipboard.writeText(
			validatedElements.urlInput?.value || ""
		);
		if (validatedElements.copyIcon)
			validatedElements.copyIcon.src = "/clipboard-check.svg";
		validatedElements.copyInput?.classList.add("flash-white");

		setTimeout(() => {
			validatedElements.copyInput?.classList.remove("flash-white");
			if (validatedElements.copyIcon)
				validatedElements.copyIcon.src = "/clipboard.svg";
		}, 375);
	});

	validatedElements.settingsButton?.addEventListener("click", () => {
		validatedElements.settingsButton?.classList.add("rotate");
		if (validatedElements.modal)
			validatedElements.modal.style.display = "block";
	});

	validatedElements.closeModal?.addEventListener("click", () => {
		validatedElements.closeModal?.dispatchEvent(new Event("closed"));
	});

	window.addEventListener("click", (event) => {
		if (event.target === validatedElements.modal) {
			if (validatedElements.closeModal)
				validatedElements.closeModal.dispatchEvent(new Event("closed"));
		}
	});

	validatedElements.closeModal?.addEventListener("closed", () => {
		if (validatedElements.modal) validatedElements.modal.style.display = "none";
	});

	validatedElements.defaultBangSelect?.addEventListener("change", (event) => {
		const newDefaultBang = (event.target as HTMLInputElement).value.replace(
			/^!+/,
			""
		);
		const bang = bangs[newDefaultBang] || customBangs[newDefaultBang];

		if (!bang) {
			if (validatedElements.defaultBangSelect)
				validatedElements.defaultBangSelect.value = LS_DEFAULT_BANG;
			validatedElements.defaultBangSelect?.classList.add("shake", "flash-red");
			setTimeout(() => {
				if (validatedElements.defaultBangSelect)
					validatedElements.defaultBangSelect.classList.remove(
						"shake",
						"flash-red"
					);
			}, 300);
			return;
		}
		storage.set("defaultBang", newDefaultBang);
		if (validatedElements.description)
			validatedElements.description.innerText = "Default Bang: " + bang.s;
	});

	validatedElements.addBang?.addEventListener("click", () => {
		const name = validatedElements.bangName?.value.trim();
		const shortcut = validatedElements.bangShortcut?.value
			.trim()
			.replace(/^!+/, "");
		const searchUrl = validatedElements.bangSearchUrl?.value.trim();
		const baseUrl = validatedElements.bangBaseUrl?.value.trim();

		if (!name || !searchUrl || !baseUrl || !shortcut) return;

		customBangs[shortcut] = {
			t: name,
			s: shortcut,
			u: searchUrl,
			d: baseUrl,
			r: 0,
		};

		// Filter and save only valid custom bangs
		const filteredCustomBangs = filterValidCustomBangs(customBangs);
		storage.set("customBangs", JSON.stringify(filteredCustomBangs));

		setTimeout(() => {
			window.location.reload();
		}, 375);
	});

	validatedElements.removeBangs.forEach((button) => {
		button.addEventListener("click", (event) => {
			const shortcut = (event.target as HTMLButtonElement).dataset
				.shortcut as string;
			delete customBangs[shortcut];

			// Filter and save only valid custom bangs
			const filteredCustomBangs = filterValidCustomBangs(customBangs);
			storage.set("customBangs", JSON.stringify(filteredCustomBangs));

			setTimeout(() => {
				window.location.reload();
			}, 375);
		});
	});

	// Focus input on load
	validatedElements.urlInput?.focus();
}
