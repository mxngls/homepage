const SITE_TOC_TAGNAME = "site-toc";
const SITE_TOC_MIN_HEADINGS = 5;
const SITE_TOC_MIN_DEPTH = 1;

class SiteToc extends HTMLElement {
    connectedCallback() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.processContent(), {
                once: true,
            });
        } else {
            this.processContent();
        }
    }

    processContent() {
        const container =
            document.getElementById("post-body") ?? document.getElementsByTagName("main").item(0);

        if (!container) {
            this.remove();
            return;
        }

        const headings = container.querySelectorAll("h2, h3, h4, h5");
        if (headings.length < SITE_TOC_MIN_HEADINGS) {
            this.remove();
            return;
        }

        const levels = new Set();
        for (const h of headings) {
            levels.add(h.tagName);
        }

        if (levels.size < SITE_TOC_MIN_DEPTH) {
            this.remove();
            return;
        }

        this.buildToc(headings);
    }

    buildToc(headings) {
        const nav = document.createElement("nav");
        const ol = document.createElement("ol");

        nav.id = "toc";
        nav.appendChild(ol);

        let stack = [ol];

        for (const h of headings) {
            const level = parseInt(h.tagName[1], 10) - 2; // Starting from h2

            // Generate artifical references if necessary
            if (!h.id) {
                h.id = h.textContent
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
            }

            // Go deeper: create nested <ol>s
            while (stack.length - 1 < level) {
                const nested = document.createElement("ol");
                const parent = stack[stack.length - 1];
                const lastLi = parent.lastElementChild;

                if (lastLi) {
                    lastLi.appendChild(nested);
                } else {
                    parent.appendChild(nested);
                }

                stack.push(nested);
            }

            // Go shallower: pop back up
            while (stack.length - 1 > level) {
                stack.pop();
            }

            const li = document.createElement("li");
            const a = document.createElement("a");

            a.href = `#${h.id}`;
            a.textContent = h.textContent;

            li.appendChild(a);
            stack[stack.length - 1].appendChild(li);
        }

        this.replaceWith(nav);
    }
}

customElements.define(SITE_TOC_TAGNAME, SiteToc);
