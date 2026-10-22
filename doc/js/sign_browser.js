(() => {
    "use strict";

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
    const elements = {
        filterGroups: $("#filterGroups"),
        quickSearch: $("#quickSearch"),
        results: $("#results"),
        resultCount: $("#resultCount"),
        status: $("#status"),
        sortField: $("#sortField"),
        sortDirection: $("#sortDirection"),
        viewMode: $("#viewMode"),
        pageSize: $("#pageSize"),
        pageIndicator: $("#pageIndicator"),
        previousPage: $("#previousPage"),
        nextPage: $("#nextPage"),
        firstPage: $("#firstPage"),
        lastPage: $("#lastPage"),
        pageJump: $("#pageJump"),
        goToPage: $("#goToPage"),
        dialog: $("#helpDialog"),
        dialogTitle: $("#dialogTitle"),
        dialogContent: $("#dialogContent"),
        localData: $("#localData"),
        loadError: $("#loadError"),
        localFiles: $("#localFiles")
    };

    const groupTitles = {
        HKU_HKSLLEX_ID: "Entry",
        recording: "Recording",
        videoFile: "Video",
        ASLLEX2: "ASL-LEX-2 mapping",
        translation: "Language & translation",
        source: "Source",
        variant: "Variant",
        lexicalCategory: "Lexical category",
        cuhkcslds_HandshapeFont: "Handshape",
        arto: "ARTO",
        morphemeCount: "Morpheme count",
        demonstrator: "Demonstrator",
        etymology: "Etymology",
        iconicity: "Iconicity ratings"
    };
    const i18n = window.HKSLI18n;
    const t = (text, values) => i18n.translate(text, values);
    const fieldPresentation = field => i18n.translateSchemaField(field.path, field.title, field.description);
    const preferenceStorageKey = "hksl-sign-browser-preferences";
    const state = {
        data: [],
        fields: [],
        fieldByPath: new Map(),
        quickIndex: new WeakMap(),
        page: 1,
        pageSize: 12,
        sortPath: "HKU_HKSLLEX_ID.id",
        sortDescending: false,
        viewMode: "details",
        glyphs: [],
        glyphsPromise: null,
        locale: i18n.getLocale(),
        statusMessage: null,
        loadErrorMessage: null,
        preferenceStorageError: null
    };

    const make = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    };

    function setStatus(message, values = {}) {
        state.statusMessage = { message, values };
        elements.status.removeAttribute("data-i18n");
        elements.status.textContent = t(message, values);
    }

    function setLoadError(message, values = {}) {
        state.loadErrorMessage = { message, values };
        if (elements.loadError) elements.loadError.textContent = t(message, values);
    }

    function readPreferences() {
        try {
            const saved = JSON.parse(localStorage.getItem(preferenceStorageKey) || "null");
            return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : null;
        } catch (error) {
            console.error("Could not restore saved search preferences.", error);
            state.preferenceStorageError = error;
            return null;
        }
    }

    function savePreferences() {
        const root = $(".root-group", elements.filterGroups);
        if (!state.fields.length || !root) return;
        const preferences = {
            locale: i18n.getLocale(),
            quickSearch: elements.quickSearch.value,
            filterGroup: snapshotGroup(root),
            sortPath: elements.sortField.value,
            sortDescending: state.sortDescending,
            viewMode: elements.viewMode.value,
            pageSize: state.pageSize
        };
        try {
            localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
            if (state.preferenceStorageError) {
                state.preferenceStorageError = null;
                setStatus("Loaded {count} entries. Filter fields are generated from the data schema.", {
                    count: state.data.length.toLocaleString()
                });
            }
        } catch (error) {
            console.error("Could not save search preferences.", error);
            if (!state.preferenceStorageError) {
                state.preferenceStorageError = error;
                setStatus("Search preferences could not be saved: {error}", { error: error.message });
            }
        }
    }

    function getType(schemaNode) {
        return schemaNode.type || (schemaNode.enum ? "enum" : schemaNode.items?.type === "integer" || schemaNode.items?.type === "number" ? "number" : "string");
    }

    function schemaFields(schema) {
        const fields = [];
        const visit = (node, prefix = "", titleParts = []) => {
            Object.entries(node.properties || {}).forEach(([key, child]) => {
                const path = prefix ? `${prefix}.${key}` : key;
                const title = child.title || key;
                const nextTitles = [...titleParts, title];
                if (child.properties) {
                    visit(child, path, nextTitles);
                    return;
                }
                if (child.items?.properties) {
                    visit(child.items, `${path}[]`, nextTitles);
                    return;
                }
                fields.push({
                    path,
                    title: titleParts.length ? `${titleParts.join(" / ")} / ${title}` : title,
                    description: child.description || "",
                    type: getType(child),
                    enum: child.enum || [],
                    deprecated: Boolean(child.deprecated),
                    group: groupTitles[prefix.split(".")[0] || key] || "Other data"
                });
            });
        };
        visit(schema.items);
        return fields.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
    }

    function pathValues(object, path) {
        const segments = path.split(".");
        let values = [object];
        for (const segment of segments) {
            const isArray = segment.endsWith("[]");
            const key = isArray ? segment.slice(0, -2) : segment;
            values = values.flatMap(value => {
                if (value === null || value === undefined) return [];
                const next = value[key];
                if (next === null || next === undefined) return [];
                return isArray ? (Array.isArray(next) ? next : []) : [next];
            });
        }
        return values;
    }

    function scalarValues(value) {
        if (Array.isArray(value)) return value.flatMap(scalarValues);
        if (value && typeof value === "object") return [JSON.stringify(value)];
        return value === null || value === undefined ? [] : [String(value)];
    }

    function hasValue(value) {
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value)) return value.some(hasValue);
        if (typeof value === "object") return Object.values(value).some(hasValue);
        return true;
    }

    function buildFieldOptions(select, selectedPath = "") {
        select.replaceChildren();
        const placeholder = make("option", "", t("Choose a property…"));
        placeholder.value = "";
        select.append(placeholder);
        const groups = new Map();
        state.fields.forEach(field => {
            const presentation = fieldPresentation(field);
            if (!groups.has(field.group)) {
                const optionGroup = document.createElement("optgroup");
                optionGroup.label = t(field.group);
                groups.set(field.group, optionGroup);
                select.append(optionGroup);
            }
            const option = make("option", "", `${presentation.title}${field.deprecated ? ` (${t("deprecated")})` : ""}`);
            option.value = field.path;
            if (presentation.description) option.title = presentation.description;
            groups.get(field.group).append(option);
        });
        select.value = selectedPath;
    }

    function addGroup(container, { root = false, operator = "AND" } = {}) {
        const group = make("div", `filter-group${root ? " root-group" : " nested"}`);
        group.dataset.operator = operator;

        const heading = make("div", "group-heading");
        const label = make("label", "", t(root ? "Match clauses" : "Nested group"));
        heading.append(label);
        if (!root) {
            const selector = document.createElement("select");
            selector.setAttribute("aria-label", t("Combine filters in this group"));
            [["AND", "ALL (AND)"], ["OR", "ANY (OR)"]].forEach(([value, text]) => {
                const option = make("option", "", t(text));
                option.value = value;
                selector.append(option);
            });
            selector.value = operator;
            selector.addEventListener("change", () => {
                group.dataset.operator = selector.value;
                runSearch();
            });
            heading.append(selector);
        }

        if (!root) {
            const remove = make("button", "remove-group");
            remove.type = "button";
            remove.title = t("Remove group");
            remove.setAttribute("aria-label", t("Remove group"));
            remove.append(make("span", "material-symbols-outlined", "delete"));
            remove.addEventListener("click", () => {
                group.remove();
                runSearch();
            });
            heading.append(remove);
        }

        const children = make("div", "group-children");
        const actions = make("div", "group-actions");
        const addRuleButton = make("button", "rule-remove");
        addRuleButton.type = "button";
        addRuleButton.title = t("Add filter");
        addRuleButton.setAttribute("aria-label", t("Add filter"));
        addRuleButton.append(make("span", "material-symbols-outlined", "add"));
        addRuleButton.addEventListener("click", () => addRule(children));
        const addNestedButton = make("button", "rule-remove");
        addNestedButton.type = "button";
        addNestedButton.title = t("Add nested group");
        addNestedButton.setAttribute("aria-label", t("Add nested group"));
        addNestedButton.append(make("span", "material-symbols-outlined", "account_tree"));
        addNestedButton.addEventListener("click", () => addGroup(children));
        actions.append(addRuleButton, addNestedButton);
        group.append(heading, children, actions);
        container.append(group);
        return group;
    }

    function operatorOptions(field) {
        if (field.type === "number" || field.type === "integer") {
            return [["equals", "equals"], ["notEquals", "does not equal"], ["gt", "greater than"], ["gte", "at least"], ["lt", "less than"], ["lte", "at most"], ["empty", "is empty"], ["notEmpty", "is not empty"]];
        }
        if (field.enum.length) {
            return [["equals", "is"], ["notEquals", "is not"], ["empty", "is empty"], ["notEmpty", "is not empty"]];
        }
        return [["contains", "contains"], ["notContains", "does not contain"], ["equals", "equals"], ["notEquals", "does not equal"], ["wildcard", "wildcard match"], ["starts", "starts with"], ["empty", "is empty"], ["notEmpty", "is not empty"]];
    }

    function createValueControl(field, operator, value = "") {
        if (operator === "empty" || operator === "notEmpty") {
            const spacer = make("span", "rule-value-spacer", "");
            spacer.dataset.value = "";
            return spacer;
        }
        if (field.enum.length) {
            const select = document.createElement("select");
            select.className = "rule-value";
            select.setAttribute("aria-label", t("Filter value"));
            const any = make("option", "", t("Choose value…"));
            any.value = "";
            select.append(any);
            field.enum.forEach(enumValue => {
                const option = make("option", "", enumValue);
                option.value = enumValue;
                select.append(option);
            });
            select.value = value;
            return select;
        }
        const input = document.createElement("input");
        input.className = "rule-value";
        input.type = field.type === "integer" || field.type === "number" ? "number" : "text";
        if (input.type === "number") input.step = field.type === "integer" ? "1" : "any";
        input.placeholder = operator === "wildcard" ? t("Use * or ? wildcards") : t("Enter value…");
        input.value = value;
        input.setAttribute("aria-label", t("Filter value"));
        if (field.path === "cuhkcslds_HandshapeFont.CodepointNotation") input.placeholder = t("e.g. 63;0,126;126 or wildcard");
        if (field.path === "arto.stringNotation") input.placeholder = t("e.g. Ar,T or wildcard");
        return input;
    }

    function updateRuleValue(rule) {
        const field = state.fieldByPath.get($("[data-field]", rule).value);
        const operator = $(".rule-operator", rule).value;
        const currentValue = $(".rule-value", rule)?.value ?? rule.dataset.initialValue ?? "";
        rule.dataset.initialValue = "";
        const previous = $(".rule-value, .rule-value-spacer", rule);
        const next = field ? createValueControl(field, operator, currentValue) : make("span", "rule-value-spacer", "");
        previous?.replaceWith(next);
        const specialRow = $(".special-rule", rule);
        const handshape = field?.path === "cuhkcslds_HandshapeFont.CodepointNotation";
        const arto = field?.path === "arto.stringNotation";
        specialRow.replaceChildren();
        specialRow.classList.toggle("visible", handshape || arto);
        if (handshape) {
            const button = make("button", "button button-quiet");
            button.type = "button";
            button.setAttribute("aria-expanded", "false");
            button.append(make("span", "material-symbols-outlined", "gesture"), document.createTextNode(` ${t("Select handshape codepoints")}`));
            const valueInput = $(".rule-value", rule);
            button.disabled = !valueInput;
            const panel = make("div", "special-picker-panel");
            panel.hidden = true;
            button.addEventListener("click", () => {
                panel.hidden = !panel.hidden;
                button.setAttribute("aria-expanded", String(!panel.hidden));
                if (!panel.hidden && !panel.dataset.initialized) {
                    panel.dataset.initialized = "true";
                    showHandshapePicker(panel, valueInput);
                }
            });
            specialRow.append(button, panel);
        } else if (arto) {
            const button = make("button", "button button-quiet");
            button.type = "button";
            button.setAttribute("aria-expanded", "false");
            button.append(make("span", "material-symbols-outlined", "category"), document.createTextNode(` ${t("Select ARTO codes")}`));
            const valueInput = $(".rule-value", rule);
            button.disabled = !valueInput;
            const panel = make("div", "special-picker-panel");
            panel.hidden = true;
            button.addEventListener("click", () => {
                panel.hidden = !panel.hidden;
                button.setAttribute("aria-expanded", String(!panel.hidden));
                if (!panel.hidden && !panel.dataset.initialized) {
                    panel.dataset.initialized = "true";
                    showArtoPicker(panel, valueInput);
                }
            });
            specialRow.append(button, panel);
        }
    }

    function addRule(container, initial = {}) {
        const rule = make("div", "filter-rule");
        const fieldSelect = document.createElement("select");
        fieldSelect.dataset.field = "";
        fieldSelect.setAttribute("aria-label", t("Searchable property"));
        buildFieldOptions(fieldSelect, initial.path || "");

        const operatorSelect = document.createElement("select");
        operatorSelect.className = "rule-operator";
        operatorSelect.setAttribute("aria-label", t("Filter operator"));

        const help = make("button", "field-help");
        help.type = "button";
        help.title = t("Choose a property to read its description");
        help.setAttribute("aria-label", t("Show property description"));
        help.append(make("span", "material-symbols-outlined", "help"));
        help.addEventListener("click", () => {
            const field = state.fieldByPath.get(fieldSelect.value);
            if (!field) return;
            showDescriptionToast(field);
        });

        const remove = make("button", "rule-remove");
        remove.type = "button";
        remove.title = t("Remove filter");
        remove.setAttribute("aria-label", t("Remove filter"));
        remove.append(make("span", "material-symbols-outlined", "delete"));
        remove.addEventListener("click", () => {
            rule.remove();
            runSearch();
        });

        const value = make("span", "rule-value-spacer", "");
        const special = make("div", "special-rule");
        rule.append(fieldSelect, operatorSelect, value, help, remove, special);

        const refreshOperators = () => {
            const field = state.fieldByPath.get(fieldSelect.value);
            operatorSelect.replaceChildren();
            if (!field) {
                const option = make("option", "", t("Choose property first"));
                option.value = "";
                operatorSelect.append(option);
                updateRuleValue(rule);
                return;
            }
            operatorOptions(field).forEach(([operator, label]) => {
                const option = make("option", "", t(label));
                option.value = operator;
                operatorSelect.append(option);
            });
            operatorSelect.value = initial.operator && operatorOptions(field).some(([op]) => op === initial.operator) ? initial.operator : operatorSelect.options[0].value;
            rule.dataset.initialValue = initial.value || "";
            updateRuleValue(rule);
        };
        fieldSelect.addEventListener("change", () => {
            initial.operator = "";
            initial.value = "";
            refreshOperators();
            runSearch();
        });
        operatorSelect.addEventListener("change", () => {
            updateRuleValue(rule);
            runSearch();
        });
        rule.addEventListener("input", event => {
            if (event.target.classList.contains("rule-value")) runSearch();
        });
        rule.addEventListener("change", event => {
            if (event.target.classList.contains("rule-value")) runSearch();
        });
        container.append(rule);
        refreshOperators();
        return rule;
    }

    function readGroup(group) {
        const childContainer = $(".group-children", group);
        const children = Array.from(childContainer.children).map(child => {
            if (child.classList.contains("filter-group")) return readGroup(child);
            const field = state.fieldByPath.get($("[data-field]", child).value);
            const operator = $(".rule-operator", child).value;
            const valueControl = $(".rule-value", child);
            return {
                kind: "rule",
                field,
                operator,
                value: valueControl ? valueControl.value : ""
            };
        }).filter(child => child.kind === "group" ? child.children.length : child.field && (child.operator === "empty" || child.operator === "notEmpty" || child.value.trim() !== ""));
        return { kind: "group", operator: group.dataset.operator || "AND", children };
    }

    function restoreGroup(container, savedGroup, root = false) {
        const group = addGroup(container, { root, operator: savedGroup.operator });
        const children = $(".group-children", group);
        savedGroup.children.forEach(child => {
            if (child.kind === "group") restoreGroup(children, child);
            else addRule(children, {
                path: child.path || child.field?.path || "",
                operator: child.operator,
                value: child.value
            });
        });
        if (root && !savedGroup.children.length) addRule(children);
        return group;
    }

    function normalizeSavedGroup(group, depth = 0) {
        if (!group || typeof group !== "object" || !Array.isArray(group.children) || depth > 20) return null;
        const children = [];
        group.children.forEach(child => {
            if (child?.kind === "group") {
                const nested = normalizeSavedGroup(child, depth + 1);
                if (nested) children.push(nested);
                return;
            }
            if (child?.kind !== "rule") return;
            const path = typeof child.path === "string" && state.fieldByPath.has(child.path) ? child.path : "";
            const field = state.fieldByPath.get(path);
            const operator = field && operatorOptions(field).some(([value]) => value === child.operator) ? child.operator : "";
            children.push({
                kind: "rule",
                path,
                operator,
                value: typeof child.value === "string" ? child.value : ""
            });
        });
        return {
            kind: "group",
            operator: depth === 0 ? "AND" : group.operator === "OR" ? "OR" : "AND",
            children
        };
    }

    function snapshotGroup(group) {
        return {
            kind: "group",
            operator: group.dataset.operator || "AND",
            children: Array.from($(".group-children", group).children).map(child => {
                if (child.classList.contains("filter-group")) return snapshotGroup(child);
                return {
                    kind: "rule",
                    path: $("[data-field]", child).value,
                    operator: $(".rule-operator", child).value,
                    value: $(".rule-value", child)?.value || ""
                };
            })
        };
    }

    function rebuildFilterControls() {
        const currentRoot = $(".root-group", elements.filterGroups);
        const savedGroup = currentRoot ? snapshotGroup(currentRoot) : { kind: "group", operator: "AND", children: [] };
        elements.filterGroups.replaceChildren();
        restoreGroup(elements.filterGroups, savedGroup, true);
    }

    function escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function compareValue(actual, operator, expected) {
        const actualValues = scalarValues(actual);
        if (operator === "empty") return actualValues.length === 0 || actualValues.every(value => value.trim() === "");
        if (operator === "notEmpty") return actualValues.some(value => value.trim() !== "");
        if (!actualValues.length) return false;
        if (["gt", "gte", "lt", "lte"].includes(operator)) {
            const threshold = Number(expected);
            if (!Number.isFinite(threshold)) return false;
            return actualValues.some(value => {
                if (value.trim() === "") return false;
                const number = Number(value);
                if (!Number.isFinite(number)) return false;
                if (operator === "gt") return number > threshold;
                if (operator === "gte") return number >= threshold;
                if (operator === "lt") return number < threshold;
                return number <= threshold;
            });
        }
        const needle = String(expected).toLocaleLowerCase();
        if (operator === "wildcard") {
            const pattern = escapeRegex(String(expected)).replace(/\\\*/g, ".*").replace(/\\\?/g, ".");
            const regex = new RegExp(`^${pattern}$`, "i");
            return actualValues.some(value => regex.test(value));
        }
        if (operator === "starts") return actualValues.some(value => value.toLocaleLowerCase().startsWith(needle));
        if (operator === "equals") return actualValues.some(value => value.toLocaleLowerCase() === needle);
        if (operator === "notEquals") return actualValues.every(value => value.toLocaleLowerCase() !== needle);
        if (operator === "notContains") return actualValues.every(value => !value.toLocaleLowerCase().includes(needle));
        return actualValues.some(value => value.toLocaleLowerCase().includes(needle));
    }

    function matchesGroup(entry, group) {
        if (!group.children.length) return true;
        const outcomes = group.children.map(child => {
            if (child.kind === "group") return matchesGroup(entry, child);
            const actualValues = pathValues(entry, child.field.path);
            if (child.operator === "empty") return !actualValues.some(hasValue);
            if (child.operator === "notEmpty") return actualValues.some(hasValue);
            return actualValues.some(actual => compareValue(actual, child.operator, child.value));
        });
        return group.operator === "OR" ? outcomes.some(Boolean) : outcomes.every(Boolean);
    }

    function searchableText(entry) {
        let text = state.quickIndex.get(entry);
        if (!text) {
            text = JSON.stringify(entry).toLocaleLowerCase();
            state.quickIndex.set(entry, text);
        }
        return text;
    }

    function runSearch() {
        if (!state.data.length) return;
        const tokens = elements.quickSearch.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const group = readGroup($(".root-group", elements.filterGroups));
        const matches = state.data.filter(entry => {
            if (tokens.some(token => !searchableText(entry).includes(token))) return false;
            return matchesGroup(entry, group);
        });
        const sortField = state.fieldByPath.get(elements.sortField.value);
        matches.sort((a, b) => {
            const first = pathValues(a, sortField?.path || state.sortPath).find(hasValue);
            const second = pathValues(b, sortField?.path || state.sortPath).find(hasValue);
            const firstNumber = Number(first);
            const secondNumber = Number(second);
            let comparison;
            if (first !== undefined && second !== undefined && first !== "" && second !== "" && Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) comparison = firstNumber - secondNumber;
            else comparison = String(first ?? "").localeCompare(String(second ?? ""), undefined, { numeric: true, sensitivity: "base" });
            return state.sortDescending ? -comparison : comparison;
        });
        state.viewMode = elements.viewMode?.value || "mode";
        state.page = Math.min(state.page, Math.max(1, Math.ceil(matches.length / state.pageSize)));
        renderResults(matches);
        const countKey = matches.length === 1 ? "{count} sign found" : "{count} signs found";
        elements.resultCount.textContent = t(countKey, { count: matches.length.toLocaleString() });
        savePreferences();
    }

    function activeFilterFields(group) {
        const fields = new Map();
        const visit = node => {
            node.children.forEach(child => {
                if (child.kind === "group") visit(child);
                else if (child.field && !fields.has(child.field.path) && fields.size < 5) fields.set(child.field.path, child.field);
            });
        };
        visit(group);
        return Array.from(fields.values());
    }

    function isPropertyVisible(entry, field, filteredFields) {
        if (filteredFields.some(filteredField => filteredField.path === field.path)) return true;
        if (["translation.EN-GB.primary", "translation.ZH-HK.primary", "translation.ZH-Yue.primary"].includes(field.path)) return true;
        if (["HKU_HKSLLEX_ID.id", "HKU_HKSLLEX_ID.status"].includes(field.path)) return true;

        const root = field.path.split(".")[0].replace(/\[\]$/, "");
        return root !== "videoFile" && root !== "translation" && pathValues(entry, field.path).some(hasValue);
    }

    function addMetadataItem(list, field, value) {
        const item = make("div", "metadata-item");
        const presentation = fieldPresentation(field);
        const term = make("dt", "", presentation.title);
        if (presentation.description) term.title = presentation.description;
        const definition = make("dd", "", displayValue(value));
        item.append(term, definition);
        list.append(item);
    }

    function displayValue(value) {
        if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(", ");
        if (value && typeof value === "object") return JSON.stringify(value);
        return String(value);
    }

    function addTranslationSection(entry, body) {
        const primary = [
            ["EN-GB", t("English")],
            ["ZH-HK", t("Written Chinese")],
            ["ZH-Yue", t("Cantonese")]
        ];
        const grid = make("div", "translation-grid");
        primary.forEach(([language, label]) => {
            const cell = make("div", "translation-cell");
            const heading = make("span", "", label);
            const value = make("strong", "", pathValues(entry, `translation.${language}.primary`).find(hasValue) || "—");
            cell.append(heading, value);
            grid.append(cell);
        });
        body.append(grid);
    }

    function filename(value) {
        return String(value || "").split(/[\\/]/).pop();
    }

    function addDownloadLink(container, label, path) {
        if (!path) return;
        const anchor = make("a", "", label);
        anchor.href = path;
        anchor.download = "";
        anchor.target = "_blank";
        anchor.rel = "noopener";
        container.append(anchor);
    }

    function createSignCard(entry) {
        const card = make("article", "sign-card");
        const id = pathValues(entry, "HKU_HKSLLEX_ID.id")[0] || t("Sign");
        const englishTranslation = pathValues(entry, "translation.EN-GB.primary")[0];
        const secondaryTranslation = pathValues(entry, "translation.ZH-Yue.primary")[0] || pathValues(entry, "translation.ZH-HK.primary")[0];
        const english = englishTranslation || "";
        const header = make("div", "sign-card-header");
        const titleBlock = make("div");
        const title = [english, secondaryTranslation].filter(Boolean).join(" / ") || id;
        titleBlock.append(make("h3", "", title));
        titleBlock.append(make("p", "", id));
        const status = pathValues(entry, "HKU_HKSLLEX_ID.status")[0];
        if (status) header.append(titleBlock, Object.assign(make("span", `entry-status ${status}`, status.replaceAll("_", " "))));
        else header.append(titleBlock);

        const media = make("div", "sign-media");
        const webp = filename(pathValues(entry, "videoFile.nameGIF")[0]);
        if (webp) {
            const image = make("img", "sign-video");
            image.src = `video/webp/${encodeURIComponent(webp)}`;
            image.alt = t("Sign video for {title}", { title });
            image.loading = "lazy";
            image.addEventListener("error", () => {
                const fallback = make("div", "video-fallback", t("WebP video is unavailable for this entry."));
                image.replaceWith(fallback);
            }, { once: true });
            media.append(image);
        } else {
            media.append(make("div", "video-fallback", t("No WebP video is listed for this entry.")));
        }

        const body = make("div", "sign-card-body");
        addTranslationSection(entry, body);
        const filteredFields = activeFilterFields(readGroup($(".root-group", elements.filterGroups)));
        if (filteredFields.length) {
            const filteredSection = make("section", "filtered-properties");
            filteredSection.append(make("h4", "", t("Active filters")));
            const filteredList = make("dl", "metadata-list");
            filteredFields.forEach(field => {
                const values = pathValues(entry, field.path).filter(hasValue);
                addMetadataItem(filteredList, field, values.length ? values : t("Empty"));
            });
            filteredSection.append(filteredList);
            body.append(filteredSection);
        }
        const sortField = state.fieldByPath.get(elements.sortField.value);
        if (sortField && !isPropertyVisible(entry, sortField, filteredFields)) {
            const sortSection = make("section", "filtered-properties sort-property");
            sortSection.append(make("h4", "", t("Sorted by")));
            const sortList = make("dl", "metadata-list");
            const values = pathValues(entry, sortField.path).filter(hasValue);
            addMetadataItem(sortList, sortField, values.length ? values : t("Empty"));
            sortSection.append(sortList);
            body.append(sortSection);
        }
        const metadataGroups = make("div", "metadata-groups");
        const roots = [...new Set(state.fields.map(field => field.path.split(".")[0].replace(/\[\]$/, "")))];
        roots.forEach(root => {
            if (root === "videoFile" || root === "translation") return;
            const groupFields = state.fields.filter(field => field.path.split(".")[0].replace(/\[\]$/, "") === root);
            const populated = groupFields.map(field => ({ field, value: pathValues(entry, field.path).filter(hasValue) })).filter(item => item.value.length);
            if (!populated.length) return;
            const section = make("section", "metadata-group");
            section.append(make("h4", "", t(groupTitles[root] || root)));
            const list = make("dl", "metadata-list");
            populated.forEach(({ field, value }) => addMetadataItem(list, field, value.length === 1 ? value[0] : value));
            section.append(list);
            metadataGroups.append(section);
        });

        const allDetails = make("details", "all-properties");
        allDetails.append(make("summary", "", t("Sign properties")));
        const allGroups = make("div", "metadata-groups");
        const translationFields = state.fields.filter(field => field.path.startsWith("translation."));
        const translationSection = make("section", "metadata-group");
        translationSection.append(make("h4", "", t("Language & translation")));
        const translationList = make("dl", "metadata-list");
        translationFields.forEach(field => {
            const values = pathValues(entry, field.path).filter(hasValue);
            if (values.length) addMetadataItem(translationList, field, values.length === 1 ? values[0] : values);
        });
        translationSection.append(translationList);
        allGroups.append(translationSection);
        allGroups.append(metadataGroups.cloneNode(true));
        allDetails.append(allGroups);
        body.append(allDetails);

        const downloads = make("div", "video-downloads");
        downloads.append(make("span", "", t("Download:")));
        const mp4 = filename(pathValues(entry, "videoFile.nameOSF")[0]) || filename(pathValues(entry, "videoFile.name")[0]);
        const mp4Folder = pathValues(entry, "videoFile.nameOSF")[0] ? "video/small" : "video";
        addDownloadLink(downloads, "MP4", mp4 ? `${mp4Folder}/${encodeURIComponent(mp4)}` : "");
        addDownloadLink(downloads, "WebP", webp ? `video/webp/${encodeURIComponent(webp)}` : "");
        (pathValues(entry, "videoFile.supplementary[].fileName") || []).forEach((name, index) => {
            addDownloadLink(downloads, t("Supplementary {index}", { index: index + 1 }), `video/small/${encodeURIComponent(filename(name))}`);
        });
        body.append(downloads);
        card.append(header, media, body);
        return card;
    }

    function createDetailsTable(entries) {
        const table = make("table", "details-table");
        const head = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Video", "Sign", "Properties & downloads"].forEach(label => headerRow.append(make("th", "", t(label))));
        head.append(headerRow);
        table.append(head);
        const body = document.createElement("tbody");
        entries.forEach(entry => {
            const card = createSignCard(entry);
            const row = document.createElement("tr");
            const videoCell = document.createElement("td");
            videoCell.append($(".sign-media", card));
            const signCell = document.createElement("td");
            signCell.append($(".sign-card-header", card));
            const propertiesCell = document.createElement("td");
            propertiesCell.append($(".sign-card-body", card));
            row.append(videoCell, signCell, propertiesCell);
            body.append(row);
        });
        table.append(body);
        return table;
    }

    function renderResults(matches) {
        elements.results.replaceChildren();
        elements.results.className = "results-grid";
        const start = (state.page - 1) * state.pageSize;
        const pageEntries = matches.slice(start, start + state.pageSize);
        if (!pageEntries.length) {
            elements.results.append(make("div", "empty-state", t("No signs match these search criteria. Try changing a filter or broadening the search.")));
        } else if (state.viewMode === "details") {
            elements.results.classList.add("results-details");
            elements.results.append(createDetailsTable(pageEntries));
        } else {
            if (["very-small", "small", "medium", "large"].includes(state.viewMode)) {
                elements.results.classList.add("thumbnail-view", `thumbnail-${state.viewMode}`);
            }
            pageEntries.forEach(entry => elements.results.append(createSignCard(entry)));
        }
        const pageCount = Math.max(1, Math.ceil(matches.length / state.pageSize));
        elements.pageIndicator.textContent = t("Page {page} of {pages}", { page: state.page, pages: pageCount });
        elements.pageJump.max = String(pageCount);
        elements.pageJump.value = String(state.page);
        elements.firstPage.disabled = state.page <= 1;
        elements.previousPage.disabled = state.page <= 1;
        elements.nextPage.disabled = state.page >= pageCount;
        elements.lastPage.disabled = state.page >= pageCount;
    }

    function appendNotation(input, text, separator) {
        if (!input) return;
        const current = input.value.trim();
        input.value = current ? `${current}${separator}${text}` : text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    }

    function parseCsv(text) {
        const rows = [];
        let row = [];
        let cell = "";
        let quoted = false;
        const source = text.replace(/^\uFEFF/, "");
        for (let index = 0; index < source.length; index += 1) {
            const character = source[index];
            if (character === '"' && quoted && source[index + 1] === '"') {
                cell += '"';
                index += 1;
            } else if (character === '"') {
                quoted = !quoted;
            } else if (character === "," && !quoted) {
                row.push(cell);
                cell = "";
            } else if ((character === "\n" || character === "\r") && !quoted) {
                if (character === "\r" && source[index + 1] === "\n") index += 1;
                row.push(cell);
                rows.push(row);
                row = [];
                cell = "";
            } else {
                cell += character;
            }
        }
        if (cell || row.length) {
            row.push(cell);
            rows.push(row);
        }
        const headers = rows.shift() || [];
        return rows.filter(values => values.length >= headers.length).map(values => Object.fromEntries(headers.map((header, index) => [header.trim(), (values[index] || "").trim()])));
    }

    async function loadGlyphs() {
        if (state.glyphs.length) return state.glyphs;
        if (!state.glyphsPromise) {
            state.glyphsPromise = fetch("doc/cuhkcslds_handshapes/HKSLLEX_index_CSLDS_handshapes.csv")
                .then(response => {
                    if (!response.ok) throw new Error(`Could not load the handshape index (${response.status}).`);
                    return response.text();
                })
                .then(text => {
                    state.glyphs = parseCsv(text).filter(item => /^\d+$/.test(item["codepoint.dec"] || ""));
                    return state.glyphs;
                });
        }
        return state.glyphsPromise;
    }

    function renderGlyphs(grid, input, filter = "") {
        grid.replaceChildren();
        const query = filter.toLocaleLowerCase();
        const visible = state.glyphs.filter(item => `${item["codepoint.dec"]} ${item["codepoint.hex"]} ${item["codepoint.alias"]} ${item.remarks}`.toLocaleLowerCase().includes(query));
        visible.forEach(item => {
            const codepoint = Number(item["codepoint.dec"]);
            const button = make("button", "glyph-option");
            button.type = "button";
            button.title = String(codepoint);
            button.setAttribute("aria-label", t("Select decimal codepoint {codepoint}", { codepoint }));
            const image = make("img");
            image.src = `doc/cuhkcslds_handshapes/${String(codepoint).padStart(3, "0")}_glyph.png`;
            image.alt = "";
            image.loading = "lazy";
            button.append(image, make("strong", "", String(codepoint)));
            button.addEventListener("click", () => {
                appendNotation(input, String(codepoint), ";");
            });
            grid.append(button);
        });
        if (!visible.length) grid.append(make("p", "description-note", t("No handshapes match this search.")));
    }

    async function showHandshapePicker(panel, input) {
        panel.replaceChildren();
        const intro = make("p", "description-note", t("Each glyph represents a decimal codepoint. Select one to add it to the filter, or type the notation directly (for example, 63;0,126;126)."));
        const controls = make("div", "glyph-picker-controls");
        const search = make("input", "glyph-search");
        search.type = "search";
        search.placeholder = t("Search glyphs by decimal codepoint, alias, or description…");
        search.setAttribute("aria-label", t("Search handshape glyphs"));
        const grid = make("div", "glyph-grid");
        grid.setAttribute("role", "group");
        grid.setAttribute("aria-label", t("Handshape glyph choices"));
        controls.append(search, grid);
        panel.append(intro, controls);
        try {
            await loadGlyphs();
            renderGlyphs(grid, input);
            search.addEventListener("input", () => renderGlyphs(grid, input, search.value));
        } catch (error) {
            const failure = make("p", "description-note", t("The glyph index could not be loaded: {error} Enter decimal codepoints in the filter field instead.", { error: error.message }));
            controls.prepend(failure);
        }
    }

    function appendArtoCode(input, code) {
        const current = input.value.trimEnd();
        const separator = current && !current.endsWith(",") ? "," : "";
        input.value = `${current}${separator}${code}`;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    }

    function appendNextMorpheme(input) {
        const current = input.value.trimEnd();
        if (!current || current.endsWith(",")) return;
        input.value = `${current},`;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    }

    function showArtoPicker(panel, input) {
        panel.replaceChildren();
        const intro = make("p", "description-note", t("The dominant and other-hand selections combine into one morpheme."));
        const columns = make("div", "arto-picker-columns");
        const selected = { dominant: "", other: "" };
        const categories = [
            ["A", "Acting"],
            ["R", "Representing"],
            ["T", "Tracing"],
            ["O", "Orthography"],
            ["N", "None"]
        ];
        const makeColumn = (hand, className, codes) => {
            const column = make("section", className);
            column.append(make("h4", "special-picker-heading", t(hand === "dominant" ? "Dominant hand" : "Other hand")));
            const codeList = make("div", "arto-code-list");
            codes.forEach(([code, name]) => {
                const button = make("button", "arto-code-option");
                button.type = "button";
                button.setAttribute("aria-pressed", "false");
                button.setAttribute("aria-label", t("Select ARTO category {name} for {hand}", {
                    name: t(name),
                    hand: t(hand === "dominant" ? "Dominant hand" : "Other hand")
                }));
                button.append(make("span", "code-symbol", code), make("span", "", t(name)));
                button.addEventListener("click", () => {
                    selected[hand] = selected[hand] === code ? "" : code;
                    button.setAttribute("aria-pressed", String(selected[hand] === code));
                    updateSelection();
                });
                codeList.append(button);
            });
            column.append(codeList);
            return column;
        };
        const otherColumn = makeColumn("other", "arto-other-column", categories.map(([code, name]) => [code.toLowerCase(), name]));
        const dominantColumn = makeColumn("dominant", "arto-dominant-column", categories);
        columns.append(otherColumn, dominantColumn);

        const tools = make("div", "arto-picker-tools");
        const handednessLabel = make("label", "handedness-toggle");
        const handedness = document.createElement("input");
        handedness.type = "checkbox";
        handedness.addEventListener("change", () => columns.classList.toggle("left-handed", handedness.checked));
        handednessLabel.append(handedness, document.createTextNode(` ${t("Left-handed layout")}`));

        const addCode = make("button", "button button-secondary", t("Add selected code"));
        addCode.type = "button";
        addCode.disabled = true;
        addCode.addEventListener("click", () => {
            const code = `${selected.dominant}${selected.other}`;
            if (!code) return;
            appendArtoCode(input, code);
            selected.dominant = "";
            selected.other = "";
            $$(".arto-code-option", columns).forEach(button => button.setAttribute("aria-pressed", "false"));
            updateSelection();
        });

        const nextMorpheme = make("button", "button button-quiet", t("Next morpheme"));
        nextMorpheme.type = "button";
        nextMorpheme.disabled = !input.value.trim();
        nextMorpheme.addEventListener("click", () => appendNextMorpheme(input));
        const emptyMorpheme = make("button", "button button-quiet", t("Insert empty morpheme (0)"));
        emptyMorpheme.type = "button";
        emptyMorpheme.addEventListener("click", () => appendArtoCode(input, "0"));
        const clearSelection = make("button", "button button-quiet", t("Clear selection"));
        clearSelection.type = "button";
        clearSelection.addEventListener("click", () => {
            selected.dominant = "";
            selected.other = "";
            $$(".arto-code-option", columns).forEach(button => button.setAttribute("aria-pressed", "false"));
            updateSelection();
        });
        const preview = make("span", "description-note");
        tools.append(handednessLabel, addCode, nextMorpheme, emptyMorpheme, clearSelection, preview);
        panel.append(intro, columns, tools);

        const updateSelection = () => {
            addCode.disabled = !selected.dominant && !selected.other;
            nextMorpheme.disabled = !input.value.trim();
            preview.textContent = selected.dominant || selected.other
                ? `${selected.dominant || "—"} + ${selected.other || "—"}`
                : t("Select at least one hand code.");
        };
        input.addEventListener("input", () => {
            nextMorpheme.disabled = !input.value.trim();
        });
        updateSelection();
    }

    function showGuideDialog(title, contents) {
        if (elements.dialog.open) elements.dialog.close();
        elements.dialog.classList.remove("toast-dialog");
        elements.dialogTitle.textContent = t(title);
        elements.dialogContent.replaceChildren(...contents);
        elements.dialog.showModal();
    }

    function showHandshapeGuide() {
        const introduction = make("p");
        const centreLink = make("a", "", t("Centre for Sign Linguistics and Deaf Studies, CUHK"));
        centreLink.href = "https://cslds.org/v5/online-resources/";
        centreLink.target = "_blank";
        centreLink.rel = "noopener";
        introduction.replaceChildren(
            document.createTextNode(t("This database uses a modified version of the Handshape font, developed by the ")),
            centreLink,
            document.createTextNode(t(", to encode handshapes."))
        );
        const contents = [
            {
                title: "Handshape font and codepoints",
                paragraphs: [
                    "Originally designed as a typesetting tool, the font's encoding scheme has been adapted into a comprehensive handshape library. Each distinct handshape is represented by a unique integer: its base-10 codepoint in the font.",
                    "For example, the handshape for the number zero uses codepoint 65 (0x41), which maps to the character A in the font.",
                    "The database initially used the font's symbols or codepoint aliases, but switched to codepoints to avoid filename and coding-compatibility issues.",
                    "The library adds 17 handshapes to the original font, including 3 control codepoints for this notation. The handshape folder contains the complete codepoint set, glyph images, and CSV data.",
                    "A single codepoint represents one handshape; multiple codepoints are therefore needed to describe a sign."
                ]
            },
            {
                title: "Handshape codepoint notation",
                paragraphs: ["The notation describes the handshapes used in each syllable and morpheme."],
                subsections: [
                    {
                        title: "Codepoints in pairs of two",
                        paragraphs: ["An entry consists of codepoint pairs separated by a semicolon (;). The first codepoint represents the dominant hand; the second represents the non-dominant hand."],
                        example: ["49;1", "Handshape codepoints for SKIN."]
                    }
                ]
            },
            {
                title: "Control handshape codepoints",
                paragraphs: ["These special codepoints represent a property rather than a handshape."],
                subsections: [
                    {
                        title: "The nil codepoint (0)",
                        paragraphs: ["The nil codepoint marks the absence of a handshape, usually because that hand is not used in the sign."],
                        example: ["67;0", "Handshape codepoints for EIGHT, a single-handed sign."]
                    },
                    {
                        title: "The imitative codepoint (1)",
                        paragraphs: ["This codepoint abbreviates emblematic verb signs whose handshape imitates the referent's movement, so an exact handshape is not required. It is unused and deprecated."]
                    },
                    {
                        title: "The symmetry codepoint (2)",
                        paragraphs: [
                            "A symmetric sign has left and right hands that are exact mirror images in all phonological aspects, including handshape and movement.",
                            "Read codepoint notation together with ARTO notation. When both are available, a symmetric sign uses the same handshape codepoint for both hands, while ARTO codes only the dominant hand."
                        ],
                        example: ["44;44\nR", "Handshape codepoints and ARTO coding for CITY."]
                    },
                    {
                        title: "Asymmetric signs",
                        paragraphs: ["For an asymmetric sign, ARTO codes both hands even when both hands share the same ARTO category."],
                        example: ["84;84\nRr", "Handshape codepoints and ARTO coding for SURGERY."]
                    },
                    {
                        title: "Symmetry when ARTO data is unavailable",
                        paragraphs: ["If ARTO iconic-strategy data is unavailable, codepoint notation identifies a symmetric sign by marking the non-dominant hand with 2."],
                        example: ["130;2", "Handshape codepoints for CROWN."]
                    }
                ]
            },
            {
                title: "Transitions across morphemes",
                paragraphs: ["A sign may contain multiple morphemes. Separate codepoint pairs across morphemes with a full stop (.)."],
                example: ["76;76.58;76", "Handshape codepoints for FILM."]
            },
            {
                title: "Transitions across syllables",
                paragraphs: [
                    "A syllable may be a single path movement, an internal movement such as opening or closing the hand, or both at once (Sandier, 2008). Mark a syllable boundary with a comma (,).",
                    "In the example, one internal movement and one path movement combine to convey the sign's meaning; they are analysed as syllables, not morphemes."
                ],
                example: ["63;63,126;126", "Handshape codepoints for EGG BEATER."]
            },
            {
                title: "Transitions within a syllable",
                paragraphs: ["An internal movement may also change handshape. Append each additional handshape after the preceding handshape."],
                example: ["65;65;63;63", "Handshape codepoints for GREEDY."]
            },
            {
                title: "Validation pattern",
                paragraphs: ["Use this regular expression to validate a codepoint-notation entry:"],
                example: ["/^(\\d+(?:[;,.]\\d+)+)$/", ""]
            },
            {
                title: "Reference",
                paragraphs: ["Sandier, W. (2008). The syllable in sign language: Considering the other natural language modality."]
            }
        ];
        const content = make("div", "handshape-guide");
        content.append(introduction);
        contents.forEach(sectionData => {
            const section = make("section", "guide-section");
            section.append(make("h3", "", t(sectionData.title)));
            sectionData.paragraphs.forEach(text => section.append(make("p", "", t(text))));
            const appendExample = exampleData => {
                const example = make("figure", "notation-example");
                example.append(make("pre", "", exampleData[0]));
                if (exampleData[1]) example.append(make("figcaption", "", t(exampleData[1])));
                section.append(example);
            };
            const appendDetails = details => {
                if (details.title) section.append(make("h4", "", t(details.title)));
                details.paragraphs?.forEach(text => section.append(make("p", "", t(text))));
                if (details.example) appendExample(details.example);
                details.subsections?.forEach(appendDetails);
            };
            sectionData.subsections?.forEach(appendDetails);
            if (sectionData.example) appendExample(sectionData.example);
            content.append(section);
        });
        const links = make("div", "dialog-links");
        const list = make("a", "", t("Open complete handshape list (PDF)"));
        list.href = "doc/cuhkcslds_handshapes/HKSLLEX_index_CSLDS_handshapes%20-%20List.pdf";
        list.target = "_blank";
        list.rel = "noopener";
        links.append(list);
        showGuideDialog("CUHK CSLDS handshape notation", [content, links]);
    }

    function showArtoGuide() {
        const intro = make("p", "", t("ARTO is submorphemic: each morpheme may use one code per hand. Uppercase letters represent the dominant hand; lowercase letters represent the other hand. Morphemes are separated by commas; use 0 for an empty placeholder."));
        const categories = make("div", "arto-categories");
        [
            ["A", "Acting", "The hand depicts human motion or handling."],
            ["R", "Representing", "The hand embodies an object as a whole."],
            ["T", "Tracing", "The hand traces the referent's outline."],
            ["O", "Orthography", "The hand embodies or traces a writing symbol."],
            ["N", "None", "No iconic strategy applies."]
        ].forEach(([symbol, name, description]) => {
            const item = make("div", "arto-category");
            item.append(make("strong", "", symbol), document.createTextNode(`${t(name)}: ${t(description)}`));
            categories.append(item);
        });
        const links = make("div", "dialog-links");
        const docLink = make("a", "", t("Read full ARTO notation description"));
        docLink.href = "doc/arto_notations.html";
        docLink.target = "_blank";
        docLink.rel = "noopener";
        links.append(docLink);
        showGuideDialog("ARTO iconic strategy notation", [intro, categories, links]);
    }

    function showDescriptionToast(field) {
        if (elements.dialog.open) elements.dialog.close();
        elements.dialog.classList.add("toast-dialog");
        const presentation = fieldPresentation(field);
        elements.dialogTitle.textContent = presentation.title;
        elements.dialogContent.replaceChildren(make("p", "", presentation.description || t("No description is defined for this property.")));
        elements.dialog.show();
    }

    function refreshSortOptions() {
        const selectedPath = elements.sortField.value || state.sortPath;
        elements.sortField.replaceChildren();
        state.fields.forEach(field => {
            const option = make("option", "", fieldPresentation(field).title);
            option.value = field.path;
            elements.sortField.append(option);
        });
        elements.sortField.value = state.fieldByPath.has(selectedPath) ? selectedPath : state.fields[0]?.path || "";
    }

    async function loadDataAndSchema(data, schema) {
        const preferences = readPreferences();
        if (!state.fields.length && (preferences?.locale === "en-gb" || preferences?.locale === "zh-hk") && preferences.locale !== i18n.getLocale()) {
            i18n.setLocale(preferences.locale);
        }
        state.data = data;
        state.fields = schemaFields(schema);
        state.fieldByPath = new Map(state.fields.map(field => [field.path, field]));
        state.quickIndex = new WeakMap();
        elements.filterGroups.replaceChildren();
        const savedGroup = normalizeSavedGroup(preferences?.filterGroup);
        restoreGroup(elements.filterGroups, savedGroup || {
            kind: "group",
            operator: "AND",
            children: []
        }, true);

        refreshSortOptions();
        elements.quickSearch.value = typeof preferences?.quickSearch === "string" ? preferences.quickSearch : "";
        if (preferences?.sortPath && state.fieldByPath.has(preferences.sortPath)) {
            elements.sortField.value = preferences.sortPath;
        }
        state.sortDescending = Boolean(preferences?.sortDescending);
        $(".material-symbols-outlined", elements.sortDirection).textContent = state.sortDescending ? "arrow_downward" : "arrow_upward";
        const viewModes = Array.from(elements.viewMode.options, option => option.value);
        elements.viewMode.value = viewModes.includes(preferences?.viewMode) ? preferences.viewMode : "details";
        const pageSizes = Array.from(elements.pageSize.options, option => Number(option.value));
        state.pageSize = pageSizes.includes(Number(preferences?.pageSize)) ? Number(preferences.pageSize) : 12;
        elements.pageSize.value = String(state.pageSize);
        setStatus("Loaded {count} entries. Filter fields are generated from the data schema.", {
            count: state.data.length.toLocaleString()
        });
        state.page = 1;
        runSearch();
    }

    async function loadFromNetwork() {
        const [dataResponse, schemaResponse] = await Promise.all([
            fetch("data.json"),
            fetch("doc/data.schema.json")
        ]);
        if (!dataResponse.ok) throw new Error(t("Could not load data.json ({status}).", { status: dataResponse.status }));
        if (!schemaResponse.ok) throw new Error(t("Could not load doc/data.schema.json ({status}).", { status: schemaResponse.status }));
        const [data, schema] = await Promise.all([dataResponse.json(), schemaResponse.json()]);
        if (!Array.isArray(data) || !schema.items?.properties) throw new Error(t("The data or schema file has an unexpected structure."));
        await loadDataAndSchema(data, schema);
    }

    function localFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(JSON.parse(String(reader.result)));
                } catch (error) {
                    reject(new Error(t("{file} is not valid JSON: {error}", { file: file.name, error: error.message })));
                }
            };
            reader.onerror = () => reject(reader.error || new Error(t("Could not read {file}.", { file: file.name })));
            reader.readAsText(file);
        });
    }

    elements.localFiles?.addEventListener("change", async () => {
        const files = Array.from(elements.localFiles.files || []);
        const dataFile = files.find(file => file.name.toLowerCase() === "data.json");
        const schemaFile = files.find(file => file.name.toLowerCase() === "data.schema.json");
        if (!dataFile || !schemaFile) {
            setLoadError("Select both data.json and data.schema.json.");
            return;
        }
        try {
            const [data, schema] = await Promise.all([localFileContent(dataFile), localFileContent(schemaFile)]);
            if (!Array.isArray(data) || !schema.items?.properties) throw new Error(t("The selected JSON files have an unexpected structure."));
            await loadDataAndSchema(data, schema);
            elements.localData.hidden = true;
        } catch (error) {
            setLoadError("Could not load the selected files: {error}", { error: error.message });
        }
    });

    $("#searchButton").addEventListener("click", () => {
        state.page = 1;
        runSearch();
    });
    elements.quickSearch.addEventListener("input", savePreferences);
    elements.quickSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            state.page = 1;
            runSearch();
        }
    });
    $("#clearFilters").addEventListener("click", () => {
        const root = $(".root-group", elements.filterGroups);
        $(".group-children", root).replaceChildren();
        addRule($(".group-children", root));
        root.dataset.operator = "AND";
        elements.quickSearch.value = "";
        state.page = 1;
        runSearch();
    });
    const resetSortButton = $("#resetSort") || $("#resetFiltersAndSort");
    if (!resetSortButton) console.error("The sort reset button was not found.");
    resetSortButton?.addEventListener("click", () => {
        elements.sortField.value = state.fieldByPath.has(state.sortPath) ? state.sortPath : state.fields[0]?.path || "";
        state.sortDescending = false;
        $(".material-symbols-outlined", elements.sortDirection).textContent = "arrow_upward";
        const directionKey = "Sort descending";
        elements.sortDirection.dataset.i18nAria = directionKey;
        elements.sortDirection.dataset.i18nTitle = directionKey;
        elements.sortDirection.setAttribute("aria-label", t(directionKey));
        elements.sortDirection.title = t(directionKey);
        state.page = 1;
        runSearch();
    });
    elements.filterGroups.addEventListener("click", savePreferences);
    elements.filterGroups.addEventListener("change", event => {
        if (event.target.matches(".group-heading select")) runSearch();
    });
    elements.sortField.addEventListener("change", () => {
        state.page = 1;
        runSearch();
    });
    elements.sortDirection.addEventListener("click", () => {
        state.sortDescending = !state.sortDescending;
        $(".material-symbols-outlined", elements.sortDirection).textContent = state.sortDescending ? "arrow_downward" : "arrow_upward";
        const directionKey = state.sortDescending ? "Sort ascending" : "Sort descending";
        elements.sortDirection.dataset.i18nAria = directionKey;
        elements.sortDirection.dataset.i18nTitle = directionKey;
        elements.sortDirection.setAttribute("aria-label", t(directionKey));
        elements.sortDirection.title = t(directionKey);
        runSearch();
    });
    elements.viewMode?.addEventListener("change", () => {
        state.page = 1;
        runSearch();
    });
    elements.pageSize.addEventListener("change", () => {
        state.pageSize = Number(elements.pageSize.value);
        state.page = 1;
        runSearch();
    });
    elements.previousPage.addEventListener("click", () => {
        state.page = Math.max(1, state.page - 1);
        runSearch();
        elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.firstPage.addEventListener("click", () => {
        state.page = 1;
        runSearch();
        elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.nextPage.addEventListener("click", () => {
        state.page += 1;
        runSearch();
        elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.lastPage.addEventListener("click", () => {
        state.page = Number(elements.pageJump.max) || 1;
        runSearch();
        elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const jumpToPage = () => {
        const requestedPage = Number(elements.pageJump.value);
        if (!Number.isInteger(requestedPage)) {
            elements.pageJump.value = String(state.page);
            return;
        }
        state.page = Math.max(1, Math.min(requestedPage, Number(elements.pageJump.max) || 1));
        runSearch();
        elements.results.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    elements.goToPage.addEventListener("click", jumpToPage);
    elements.pageJump.addEventListener("keydown", event => {
        if (event.key === "Enter") jumpToPage();
    });
    $$(".text-button[data-help]").forEach(button => {
        button.addEventListener("click", () => {
            if (button.dataset.help === "handshapes") {
                showHandshapeGuide();
            } else {
                showArtoGuide();
            }
        });
    });
    $("#closeDialog").addEventListener("click", () => elements.dialog.close());
    elements.dialog.addEventListener("click", event => {
        if (event.target === elements.dialog && !elements.dialog.classList.contains("toast-dialog")) elements.dialog.close();
    });
    elements.dialog.addEventListener("close", () => {
        if (!elements.dialog.open) elements.dialog.classList.remove("toast-dialog");
    });
    document.addEventListener("hksl-locale-change", () => {
        state.locale = i18n.getLocale();
        if (state.statusMessage) elements.status.textContent = t(state.statusMessage.message, state.statusMessage.values);
        if (state.loadErrorMessage && elements.loadError) {
            elements.loadError.textContent = t(state.loadErrorMessage.message, state.loadErrorMessage.values);
        }
        if (!state.fields.length) return;
        rebuildFilterControls();
        refreshSortOptions();
        runSearch();
    });

    loadFromNetwork().catch(error => {
        if (elements.localData) elements.localData.hidden = false;
        if (elements.loadError) {
            setStatus("Sign data could not be loaded.");
            setLoadError("{error} Use a local web server, or select both JSON files below.", { error: error.message });
        } else {
            setStatus("Sign data could not be loaded: {error} Open this page through GitHub Pages or a local web server.", { error: error.message });
        }
    });
})();
