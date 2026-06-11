const ROLE_KEY = "sklad:role";
const ACTIVE_INVOICE_KEY = "sklad:active-invoice";

const state = {
  role: null,
  invoiceType: "in",
  activeInvoiceId: null,
  selectedInvoiceId: null,
  scanner: null,
  scannerRunning: false,
  lastScanCode: "",
  lastScanAt: 0,
};

const elements = {
  roleScreen: document.querySelector("#role-screen"),
  app: document.querySelector("#app"),
  modeLabel: document.querySelector("#mode-label"),
  syncStatus: document.querySelector("#sync-status"),
  switchRole: document.querySelector("#switch-role"),
  phoneLayout: document.querySelector("#phone-layout"),
  pcLayout: document.querySelector("#pc-layout"),
  phoneModeHint: document.querySelector("#phone-mode-hint"),
  manualScanForm: document.querySelector("#manual-scan-form"),
  manualCode: document.querySelector("#manual-code"),
  newPhoneInvoice: document.querySelector("#new-phone-invoice"),
  activeInvoiceMeta: document.querySelector("#active-invoice-meta"),
  phoneLines: document.querySelector("#phone-lines"),
  phoneInvoices: document.querySelector("#phone-invoices"),
  statsGrid: document.querySelector("#stats-grid"),
  dashboardPending: document.querySelector("#dashboard-pending"),
  pcInvoiceList: document.querySelector("#pc-invoice-list"),
  invoiceDetail: document.querySelector("#invoice-detail"),
  invoiceDetailTitle: document.querySelector("#invoice-detail-title"),
  invoiceDetailBadge: document.querySelector("#invoice-detail-badge"),
  invoiceDetailMeta: document.querySelector("#invoice-detail-meta"),
  outboundFields: document.querySelector("#outbound-fields"),
  fieldOrder: document.querySelector("#field-order"),
  fieldClient: document.querySelector("#field-client"),
  invoiceDetailLines: document.querySelector("#invoice-detail-lines"),
  deleteInvoice: document.querySelector("#delete-invoice"),
  confirmInvoice: document.querySelector("#confirm-invoice"),
  invoiceErrors: document.querySelector("#invoice-errors"),
  stockSearch: document.querySelector("#stock-search"),
  stockList: document.querySelector("#stock-list"),
  unitList: document.querySelector("#unit-list"),
  catalogSearch: document.querySelector("#catalog-search"),
  catalogList: document.querySelector("#catalog-list"),
  productForm: document.querySelector("#product-form"),
  productId: document.querySelector("#product-id"),
  productType: document.querySelector("#product-type"),
  productModel: document.querySelector("#product-model"),
  productColor: document.querySelector("#product-color"),
  productName: document.querySelector("#product-name"),
  productCategory: document.querySelector("#product-category"),
  productReset: document.querySelector("#product-reset"),
  rulesForm: document.querySelector("#rules-form"),
  ruleSeparator: document.querySelector("#rule-separator"),
  ruleTypes: document.querySelector("#rule-types"),
  ruleColors: document.querySelector("#rule-colors"),
  rulePreviewCode: document.querySelector("#rule-preview-code"),
  rulePreviewResult: document.querySelector("#rule-preview-result"),
  historyList: document.querySelector("#history-list"),
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function invoiceTypeLabel(type) {
  return type === "in" ? "Приёмка" : "Отгрузка";
}

function invoiceStatusLabel(status) {
  if (status === "pending") {
    return "ожидает";
  }
  if (status === "confirmed") {
    return "подтверждена";
  }
  return "удалена";
}

function ensureActiveInvoice() {
  const savedId = sessionStorage.getItem(`${ACTIVE_INVOICE_KEY}:${state.invoiceType}`);
  const pending = SkladStore.pendingInvoices().filter((invoice) => invoice.type === state.invoiceType);
  let invoice = pending.find((item) => item.id === savedId);

  if (!invoice) {
    invoice = SkladStore.createInvoice(state.invoiceType, "phone");
  }

  state.activeInvoiceId = invoice.id;
  sessionStorage.setItem(`${ACTIVE_INVOICE_KEY}:${state.invoiceType}`, invoice.id);
  return invoice;
}

function syncAfterChange() {
  if (SkladCloudSync.isEnabled()) {
    SkladCloudSync.pushLocal();
  }
  render();
}

function handleScan(rawCode) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) {
    return;
  }

  const now = Date.now();
  if (code === state.lastScanCode && now - state.lastScanAt < 1800) {
    return;
  }

  state.lastScanCode = code;
  state.lastScanAt = now;

  const invoice = ensureActiveInvoice();
  const line = SkladStore.addLineToInvoice(invoice.id, code);

  if (!line) {
    window.navigator.vibrate?.(80);
    return;
  }

  window.navigator.vibrate?.(30);
  syncAfterChange();
}

function showScannerFallback(reason) {
  const box = document.querySelector("#scanner");
  if (!box) {
    return;
  }

  box.innerHTML = `
    <div class="scanner-fallback">
      <p><strong>Камера недоступна</strong></p>
      <p class="muted small">${reason}</p>
      <p class="muted small">Пока используйте поле <strong>«Код вручную»</strong> ниже — это нормально.</p>
    </div>
  `;
}

async function startScanner() {
  if (state.role !== "phone" || state.scannerRunning || typeof Html5Qrcode === "undefined") {
    return;
  }

  const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.());

  if (!window.isSecureContext && !isNativeApp) {
    showScannerFallback(
      "По адресу http://192.168… браузер блокирует камеру. Установите APK или https://, либо ввод вручную.",
    );
    return;
  }

  const scanner = new Html5Qrcode("scanner");
  state.scanner = scanner;

  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 8, qrbox: { width: 250, height: 180 } },
      (decoded) => handleScan(decoded),
      () => {},
    );
    state.scannerRunning = true;
  } catch (error) {
    console.warn("Scanner unavailable", error);
    showScannerFallback(
      "Разрешите доступ к камере в настройках Chrome или введите код вручную.",
    );
  }
}

async function stopScanner() {
  if (!state.scanner || !state.scannerRunning) {
    return;
  }

  try {
    await state.scanner.stop();
    await state.scanner.clear();
  } catch {
    // ignore
  }

  state.scannerRunning = false;
  state.scanner = null;
}

function renderPhoneLines(invoice) {
  elements.phoneLines.innerHTML = "";

  if (!invoice?.lines.length) {
    elements.phoneLines.innerHTML = '<li class="muted small">Пока нет позиций — отсканируйте этикетку.</li>';
    return;
  }

  invoice.lines.forEach((line) => {
    const item = document.createElement("li");
    item.className = "line-item";
    item.innerHTML = `<strong>${line.title}</strong><span class="muted small">${line.labelCode}</span>`;
    elements.phoneLines.appendChild(item);
  });
}

function renderInvoiceList(target, invoices, { compact = false, onClick } = {}) {
  target.innerHTML = "";

  if (!invoices.length) {
    target.innerHTML = '<li class="muted small">Нет накладных.</li>';
    return;
  }

  invoices.forEach((invoice) => {
    const template = document.querySelector("#invoice-item-template");
    const node = template.content.firstElementChild.cloneNode(true);
    const button = node.querySelector(".invoice-button");
    const title = `${invoiceTypeLabel(invoice.type)} · ${invoice.lines.length} поз.`;
    node.querySelector(".invoice-title").textContent = title;
    node.querySelector(".invoice-meta").textContent = `${invoiceStatusLabel(invoice.status)} · ${formatDate(invoice.updatedAt)}`;

    if (invoice.id === state.selectedInvoiceId || invoice.id === state.activeInvoiceId) {
      button.classList.add("active");
    }

    if (!compact && onClick) {
      button.addEventListener("click", () => onClick(invoice.id));
    }

    target.appendChild(node);
  });
}

function renderPhone() {
  const invoice = ensureActiveInvoice();
  elements.activeInvoiceMeta.textContent = `${invoiceTypeLabel(invoice.type)} · ${invoice.lines.length} позиций · ждёт ПК`;
  renderPhoneLines(invoice);

  const myInvoices = SkladStore.read()
    .invoices.filter((item) => item.status === "pending")
    .slice(0, 8);
  renderInvoiceList(elements.phoneInvoices, myInvoices, { compact: true });

  elements.phoneModeHint.textContent =
    state.invoiceType === "in"
      ? "Сканируйте упаковки при поступлении. Подтверждение — на ПК."
      : "Сканируйте перед отгрузкой. На ПК укажут заказ и клиента, затем подтвердят.";

  const httpsHint = document.querySelector("#camera-https-hint");
  if (httpsHint) {
    httpsHint.classList.toggle("hidden", window.isSecureContext);
  }
}

function renderDashboard() {
  const db = SkladStore.read();
  const pending = SkladStore.pendingInvoices();
  const stockCount = SkladStore.listUnitsOnStock().length;

  elements.statsGrid.innerHTML = `
    <div class="stat-card"><span class="muted">На складе</span><strong>${stockCount}</strong></div>
    <div class="stat-card"><span class="muted">Ждут ПК</span><strong>${pending.length}</strong></div>
    <div class="stat-card"><span class="muted">Справочник</span><strong>${db.products.length}</strong></div>
    <div class="stat-card"><span class="muted">Движений</span><strong>${db.movements.length}</strong></div>
  `;

  renderInvoiceList(elements.dashboardPending, pending.slice(0, 5), {
    onClick: (invoiceId) => {
      state.selectedInvoiceId = invoiceId;
      setPcView("invoices");
      renderInvoiceDetail();
    },
  });
}

function renderInvoiceDetail() {
  const invoice = state.selectedInvoiceId ? SkladStore.getInvoice(state.selectedInvoiceId) : null;

  if (!invoice || invoice.status !== "pending") {
    elements.invoiceDetail.classList.add("hidden");
    return;
  }

  elements.invoiceDetail.classList.remove("hidden");
  elements.invoiceDetailTitle.textContent = invoiceTypeLabel(invoice.type);
  elements.invoiceDetailBadge.textContent = invoiceStatusLabel(invoice.status);
  elements.invoiceDetailMeta.textContent = `Создана ${formatDate(invoice.createdAt)} · ${invoice.lines.length} позиций`;

  const isOutbound = invoice.type === "out";
  elements.outboundFields.classList.toggle("hidden", !isOutbound);
  elements.fieldOrder.value = invoice.orderNumber || "";
  elements.fieldClient.value = invoice.client || "";

  elements.invoiceDetailLines.innerHTML = "";
  invoice.lines.forEach((line) => {
    const item = document.createElement("li");
    item.className = "line-item";
    item.innerHTML = `
      <strong>${line.title}</strong>
      <span class="muted small">${line.labelCode}</span>
      <div class="line-actions">
        <button type="button" class="ghost-button" data-remove-line="${line.id}">Убрать из накладной</button>
      </div>
    `;
    elements.invoiceDetailLines.appendChild(item);
  });

  elements.invoiceDetailLines.querySelectorAll("[data-remove-line]").forEach((button) => {
    button.addEventListener("click", () => {
      SkladStore.removeLine(invoice.id, button.dataset.removeLine);
      syncAfterChange();
    });
  });

  elements.invoiceErrors.classList.add("hidden");
  elements.invoiceErrors.textContent = "";
}

function renderPcInvoices() {
  const pending = SkladStore.pendingInvoices();
  renderInvoiceList(elements.pcInvoiceList, pending, {
    onClick: (invoiceId) => {
      state.selectedInvoiceId = invoiceId;
      renderInvoiceDetail();
      renderPcInvoices();
    },
  });
  renderInvoiceDetail();
}

function renderStock() {
  const query = elements.stockSearch.value.trim().toLowerCase();
  const summary = SkladStore.stockSummary().filter((item) => {
    if (!query) {
      return true;
    }

    const haystack = `${item.title} ${item.model} ${item.colorCode} ${item.typeCode}`.toLowerCase();
    return haystack.includes(query);
  });

  elements.stockList.innerHTML = "";
  if (!summary.length) {
    elements.stockList.innerHTML = '<li class="muted small">Нет остатков.</li>';
  } else {
    summary.forEach((item) => {
      const node = document.createElement("li");
      node.className = "stock-item";
      node.innerHTML = `<strong>${item.title || `${item.typeCode}-${item.model}-${item.colorCode}`}</strong><span class="muted small">${item.count} шт.</span>`;
      elements.stockList.appendChild(node);
    });
  }

  const units = SkladStore.listUnitsOnStock().filter((unit) => {
    if (!query) {
      return true;
    }
    return unit.labelCode.toLowerCase().includes(query) || unit.title.toLowerCase().includes(query);
  });

  elements.unitList.innerHTML = "";
  units.slice(0, 100).forEach((unit) => {
    const node = document.createElement("li");
    node.className = "line-item";
    node.innerHTML = `<strong>${unit.title}</strong><span class="muted small">${unit.labelCode}</span>`;
    elements.unitList.appendChild(node);
  });
}

function renderCatalog() {
  const query = elements.catalogSearch.value.trim().toLowerCase();
  const products = SkladStore.read().products.filter((product) => {
    if (!query) {
      return true;
    }

    const haystack = `${product.name} ${product.model} ${product.typeCode} ${product.colorCode}`.toLowerCase();
    return haystack.includes(query);
  });

  elements.catalogList.innerHTML = "";
  products.forEach((product) => {
    const node = document.createElement("li");
    node.className = "catalog-item";
    node.innerHTML = `
      <strong>${product.name}</strong>
      <span class="muted small">${product.typeCode}-${product.model}-${product.colorCode} · ${product.category}</span>
      <div class="line-actions">
        <button type="button" class="ghost-button" data-edit-product="${product.id}">Изменить</button>
        <button type="button" class="ghost-button" data-delete-product="${product.id}">Удалить</button>
      </div>
    `;
    elements.catalogList.appendChild(node);
  });

  elements.catalogList.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = SkladStore.read().products.find((item) => item.id === button.dataset.editProduct);
      if (!product) {
        return;
      }

      elements.productId.value = product.id;
      elements.productType.value = product.typeCode;
      elements.productModel.value = product.model;
      elements.productColor.value = product.colorCode;
      elements.productName.value = product.name;
      elements.productCategory.value = product.category;
    });
  });

  elements.catalogList.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.confirm("Удалить изделие из справочника?")) {
        SkladStore.deleteProduct(button.dataset.deleteProduct);
        syncAfterChange();
      }
    });
  });
}

function renderRules() {
  const rules = SkladStore.read().labelRules;
  elements.ruleSeparator.value = rules.separator || "-";
  elements.ruleTypes.value = JSON.stringify(rules.types || {}, null, 2);
  elements.ruleColors.value = JSON.stringify(rules.colors || {}, null, 2);
  updateRulePreview();
}

function updateRulePreview() {
  const code = elements.rulePreviewCode.value.trim() || "KOM-204-DUB";
  let rules = SkladStore.read().labelRules;

  try {
    rules = {
      ...rules,
      types: JSON.parse(elements.ruleTypes.value || "{}"),
      colors: JSON.parse(elements.ruleColors.value || "{}"),
      separator: elements.ruleSeparator.value || "-",
    };
  } catch {
    elements.rulePreviewResult.textContent = "Ошибка в JSON словаря.";
    return;
  }

  const parsed = SkladLabelParser.parse(code, rules);
  elements.rulePreviewResult.textContent = parsed.title || parsed.raw;
}

function renderHistory() {
  const movements = [...SkladStore.read().movements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  elements.historyList.innerHTML = "";
  if (!movements.length) {
    elements.historyList.innerHTML = '<li class="muted small">История пока пуста.</li>';
    return;
  }

  movements.slice(0, 100).forEach((movement) => {
    const node = document.createElement("li");
    node.className = "history-item";
    const action = movement.type === "in" ? "Приёмка" : "Отгрузка";
    const extra =
      movement.type === "out"
        ? ` · заказ ${movement.orderNumber || "—"} · ${movement.client || "—"}`
        : "";
    node.innerHTML = `<strong>${action}</strong><span class="muted small">${movement.title} (${movement.labelCode})${extra} · ${formatDate(movement.createdAt)}</span>`;
    elements.historyList.appendChild(node);
  });
}

function render() {
  elements.syncStatus.textContent = SkladCloudSync.statusLabel();

  if (state.role === "phone") {
    renderPhone();
    return;
  }

  if (state.role === "pc") {
    renderDashboard();
    renderPcInvoices();
    renderStock();
    renderCatalog();
    renderRules();
    renderHistory();
  }
}

function setRole(role) {
  state.role = role;
  localStorage.setItem(ROLE_KEY, role);
  elements.roleScreen.classList.add("hidden");
  elements.app.classList.remove("hidden");
  elements.phoneLayout.classList.toggle("hidden", role !== "phone");
  elements.pcLayout.classList.toggle("hidden", role !== "pc");
  elements.modeLabel.textContent = role === "phone" ? "телефон · склад" : "ПК · офис";

  if (role === "phone") {
    startScanner();
  } else {
    stopScanner();
  }

  render();
}

function setPcView(viewName) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `view-${viewName}`);
  });
}

function bindEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  elements.switchRole.addEventListener("click", async () => {
    await stopScanner();
    elements.app.classList.add("hidden");
    elements.roleScreen.classList.remove("hidden");
  });

  document.querySelectorAll("[data-invoice-type]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-invoice-type]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      state.invoiceType = button.dataset.invoiceType;
      ensureActiveInvoice();
      render();
    });
  });

  elements.manualScanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleScan(elements.manualCode.value);
    elements.manualCode.value = "";
  });

  elements.newPhoneInvoice.addEventListener("click", () => {
    const invoice = SkladStore.createInvoice(state.invoiceType, "phone");
    state.activeInvoiceId = invoice.id;
    sessionStorage.setItem(`${ACTIVE_INVOICE_KEY}:${state.invoiceType}`, invoice.id);
    syncAfterChange();
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setPcView(button.dataset.view));
  });

  elements.fieldOrder.addEventListener("change", () => {
    if (!state.selectedInvoiceId) {
      return;
    }
    SkladStore.updateInvoice(state.selectedInvoiceId, { orderNumber: elements.fieldOrder.value });
    syncAfterChange();
  });

  elements.fieldClient.addEventListener("change", () => {
    if (!state.selectedInvoiceId) {
      return;
    }
    SkladStore.updateInvoice(state.selectedInvoiceId, { client: elements.fieldClient.value });
    syncAfterChange();
  });

  elements.deleteInvoice.addEventListener("click", () => {
    if (!state.selectedInvoiceId || !window.confirm("Удалить накладную?")) {
      return;
    }

    SkladStore.deleteInvoice(state.selectedInvoiceId);
    state.selectedInvoiceId = null;
    syncAfterChange();
  });

  elements.confirmInvoice.addEventListener("click", () => {
    if (!state.selectedInvoiceId) {
      return;
    }

    const invoice = SkladStore.getInvoice(state.selectedInvoiceId);
    if (invoice?.type === "out") {
      SkladStore.updateInvoice(state.selectedInvoiceId, {
        orderNumber: elements.fieldOrder.value.trim(),
        client: elements.fieldClient.value.trim(),
      });
    }

    const errors = SkladStore.confirmInvoice(state.selectedInvoiceId);
    if (errors.length) {
      elements.invoiceErrors.textContent = errors.join(" ");
      elements.invoiceErrors.classList.remove("hidden");
      renderInvoiceDetail();
      return;
    }

    state.selectedInvoiceId = null;
    syncAfterChange();
  });

  elements.stockSearch.addEventListener("input", renderStock);
  elements.catalogSearch.addEventListener("input", renderCatalog);

  elements.productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    SkladStore.upsertProduct({
      id: elements.productId.value || undefined,
      typeCode: elements.productType.value.trim().toUpperCase(),
      model: elements.productModel.value.trim().toUpperCase(),
      colorCode: elements.productColor.value.trim().toUpperCase(),
      name: elements.productName.value.trim(),
      category: elements.productCategory.value,
    });
    elements.productForm.reset();
    elements.productId.value = "";
    syncAfterChange();
  });

  elements.productReset.addEventListener("click", () => {
    elements.productForm.reset();
    elements.productId.value = "";
  });

  elements.rulesForm.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      SkladStore.saveLabelRules({
        separator: elements.ruleSeparator.value || "-",
        types: JSON.parse(elements.ruleTypes.value || "{}"),
        colors: JSON.parse(elements.ruleColors.value || "{}"),
      });
      syncAfterChange();
    } catch {
      window.alert("Проверьте JSON в словарях типов и цветов.");
    }
  });

  elements.rulePreviewCode.addEventListener("input", updateRulePreview);
  elements.ruleTypes.addEventListener("input", updateRulePreview);
  elements.ruleColors.addEventListener("input", updateRulePreview);
  elements.ruleSeparator.addEventListener("input", updateRulePreview);

  window.addEventListener("sklad:change", () => render());
  window.addEventListener("storage", (event) => {
    if (event.key === "sklad:db:v1") {
      render();
    }
  });
}

async function init() {
  bindEvents();

  SkladCloudSync.setOnRemoteChange(() => render());
  await SkladCloudSync.init();

  const savedRole = localStorage.getItem(ROLE_KEY);
  if (savedRole === "phone" || savedRole === "pc") {
    setRole(savedRole);
  }

  window.addEventListener("sklad:change", () => {
    if (SkladCloudSync.isEnabled()) {
      SkladCloudSync.pushLocal();
    }
  });
}

init();
