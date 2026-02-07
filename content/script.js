const SITE_FOOTNOTE_TAGNAME = "site-footnote";

class SiteFootnote extends HTMLElement {
	static footnoteCounter = 0;

	constructor() {
		super();

		this.footnoteNumber = ++SiteFootnote.footnoteCounter;
	}

	connectedCallback() {
		if (this.innerHTML.trim()) {
			this.processContent();
		} else {
			// Watch for content changes
			const observer = new MutationObserver(() => {
				if (this.innerHTML.trim()) {
					observer.disconnect();
					this.processContent();
				}
			});
			observer.observe(this, { childList: true, subtree: true });
		}
	}

	processContent() {
		const contentContainer =
			document.getElementById("post-body") ??
			document.getElementsByTagName("main").item(0);
		if (!contentContainer) {
			throw new Error(
				`${SITE_FOOTNOTE_TAGNAME}: Content container to append footnotes to not found`
			);
		}

		const footnoteContainer = document.getElementById("footnotes");
		if (!footnoteContainer || !this.footnoteContainer) {
			this.footnoteContainer = this.initContainer(
				contentContainer,
				footnoteContainer
			);
		}
		const content = this.innerHTML.trim();

		if (!content) {
			console.warn(
				`${SITE_FOOTNOTE_TAGNAME}: Empty footnote content, skipping`
			);
			this.remove();
			return;
		}

		this.addFootnote(content);
		this.addFootnoteRef();
	}

	addFootnoteRef() {
		const a = document.createElement("a");

		a.classList.add("footnote-reference");
		a.href = `#footnote-${this.footnoteNumber}`;
		a.id = `footnote-reference-${this.footnoteNumber}`;
		a.innerText = this.footnoteNumber;

		const sup = document.createElement("sup");
		sup.appendChild(a);

		const prev = this.previousSibling;
		if (prev?.nodeType === Node.ELEMENT_NODE && prev.tagName !== "SUP") {
			prev.appendChild(sup);
			this.remove();
		} else {
			this.replaceWith(sup);
		}
	}

	addFootnote(content) {
		const li = document.createElement("li");
		const p = document.createElement("p");
		const a = document.createElement("a");

		li.id = `footnote-${this.footnoteNumber}`;
		p.innerHTML = content;
		a.classList.add("footnote-backlink");
		a.href = `#footnote-reference-${this.footnoteNumber}`;
		a.innerText = "↩";

		li.appendChild(p);
		p.appendChild(a);

		const ol = this.footnoteContainer.getElementsByTagName("ol").item(0);
		if (!ol) {
			throw new Error(
				`${SITE_FOOTNOTE_TAGNAME}: Footnote list not found`
			);
		}

		ol.appendChild(li);
	}

	initContainer(contentContainer, footnoteContainer) {
		if (!footnoteContainer) {
			footnoteContainer = document.createElement("div");
			footnoteContainer.id = "footnotes";
			footnoteContainer.appendChild(document.createElement("ol"));

			const hr = document.createElement("hr");

			contentContainer.appendChild(hr);
			contentContainer.appendChild(footnoteContainer);
		}

		return footnoteContainer;
	}
}

customElements.define(SITE_FOOTNOTE_TAGNAME, SiteFootnote);
